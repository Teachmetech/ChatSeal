import { useEffect, useRef, useState, memo, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc, Id } from "../../convex/_generated/dataModel";
import { useCrypto } from "../hooks/useCrypto";
import { encryptData, decryptData, deriveKey } from "../lib/crypto";
import { toast } from "sonner";
import {
  ArrowLeft,
  Copy,
  Download,
  File as FileIcon,
  Image as ImageIcon,
  Loader2,
  Paperclip,
  Send,
  Trash2,
  X,
  Users,
} from "lucide-react";
import usePresence, { PresenceState } from "@convex-dev/presence/react";
import { useTyping } from "../hooks/useTyping";
import TypingIndicator from "../components/TypingIndicator";

type MessageDoc = Doc<"messages"> & { url: string | null };
type DecryptedMessage = {
  _id: Id<"messages">;
  author: string;
  content: string; // Decrypted content (text or filename)
  isFile: boolean;
  file?: MessageDoc["file"];
  url?: string | null; // URL to encrypted blob
  _creationTime: number;
};

type UserPresence = {
  userId: string;
  online: boolean;
  lastDisconnected: number;
  data?: {
    name?: string;
    image?: string;
  };
};

export default function ChatRoomPage() {
  const { roomId } = useParams<{ roomId: Id<"rooms"> }>();
  const navigate = useNavigate();
  const { key, setKey } = useCrypto();
  const [decryptedMessages, setDecryptedMessages] = useState<DecryptedMessage[]>([]);
  const [isReady, setIsReady] = useState(false);

  const room = useQuery(api.chat.getRoom, roomId ? { roomId } : "skip");
  const messages = useQuery(api.chat.getMessages, roomId ? { roomId } : "skip");
  const currentUser = useQuery(api.auth.loggedInUser);
  const userId = currentUser?._id;

  const sendMessage = useMutation(api.chat.sendMessage);
  const generateUploadUrl = useMutation(api.chat.generateUploadUrl);
  const clearAllMessages = useMutation(api.chat.clearAllMessages);

  // Custom presence hook that only activates when authenticated
  const useConditionalPresence = (roomId: string | undefined, userId: string | undefined) => {
    // Use a properly formatted dummy string to prevent validation errors
    const stableDummyId = useMemo(() => "dummy000000000000000000000000000", []);

    return usePresence(
      api.presence,
      roomId || "dummy_room",
      userId || stableDummyId,
      (roomId && userId) ? 10000 : 999999999
    );
  };

  const presenceState = useConditionalPresence(roomId, userId?.toString());

  // Debug what usePresence actually returns
  useEffect(() => {
    console.log("usePresence returned:", {
      presenceState,
      type: typeof presenceState,
      isArray: Array.isArray(presenceState),
      length: presenceState?.length
    });
  }, [presenceState]);

  const { onStartTyping, onStopTyping } = useTyping(roomId!);

  const nickname = useMemo(() => currentUser?.name ?? "Anonymous", [currentUser]);

  // Join/Leave notifications
  const previousPresence = useRef<UserPresence[]>([]);
  useEffect(() => {
    if (!presenceState) return;
    const presenceData = presenceState as UserPresence[];
    const currentUsers = new Set(presenceData.filter(p => p.online).map(p => p.data?.name));
    const prevUsers = new Set(previousPresence.current.map(p => p.data?.name));

    for (const user of currentUsers) {
      if (!prevUsers.has(user) && user !== nickname) {
        toast.info(`${user} has joined the chat.`);
      }
    }
    for (const user of prevUsers) {
      if (!currentUsers.has(user) && user !== nickname) {
        toast.info(`${user} has left the chat.`);
      }
    }
    previousPresence.current = presenceData.filter(p => p.online);
  }, [presenceState, nickname]);

  useEffect(() => {
    if (!roomId) return;
    const storedPassphrase = localStorage.getItem(`chatseal_${roomId}_passphrase`);
    if (!storedPassphrase) {
      toast.error("Missing credentials. Please join the room again.");
      navigate(`/join?id=${roomId}`);
      return;
    }
    if (room && !key) {
      if (room.passphraseRequired && room.salt) {
        deriveKey(storedPassphrase, new Uint8Array(room.salt))
          .then(setKey)
          .catch(() => {
            toast.error("Invalid passphrase.");
            navigate(`/join?id=${roomId}`);
          });
      }
    }
  }, [roomId, room, key, setKey, navigate]);

  useEffect(() => {
    if (!key || messages === undefined) {
      if (messages?.length === 0) {
        setDecryptedMessages([]);
        setIsReady(true);
      }
      return;
    }
    const decryptAll = async () => {
      const decrypted = await Promise.all(
        messages.map(async (msg) => {
          try {
            const decryptedContent = new TextDecoder().decode(
              await decryptData(key, msg.content, new Uint8Array(msg.iv))
            );
            return { ...msg, content: decryptedContent };
          } catch (e) {
            return { ...msg, content: "[Decryption Failed]" };
          }
        })
      );
      setDecryptedMessages(decrypted as DecryptedMessage[]);
      setIsReady(true);
    };
    decryptAll();
  }, [messages, key]);

  const handleSendMessage = async (
    text: string,
    isFile: boolean = false,
    file?: File
  ) => {
    if (!key || !roomId || !nickname) {
      console.error("Message sending failed: Missing requirements", {
        hasKey: !!key,
        hasRoomId: !!roomId,
        hasNickname: !!nickname,
        currentUser: currentUser
      });
      toast.error("Cannot send message: Missing encryption key, room ID, or nickname");
      return;
    }

    if (!currentUser) {
      console.error("Message sending failed: User not authenticated");
      toast.error("You must be signed in to send messages");
      return;
    }

    onStopTyping();

    try {
      if (isFile && file) {
        const fileBuffer = await file.arrayBuffer();
        const { ciphertext: encryptedFile, iv: fileIv } = await encryptData(key, fileBuffer);
        const uploadUrl = await generateUploadUrl();
        const blob = new Blob([encryptedFile]);
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": "application/octet-stream" },
          body: blob,
        });
        const { storageId } = await result.json();
        const { ciphertext: encryptedFilename, iv: filenameIv } = await encryptData(key, new TextEncoder().encode(file.name));
        await sendMessage({
          roomId,
          author: nickname,
          content: encryptedFilename,
          iv: filenameIv.buffer,
          isFile: true,
          file: { storageId, iv: fileIv.buffer, type: file.type },
        });
        toast.success("File sent successfully!");
      } else {
        const { ciphertext, iv } = await encryptData(key, new TextEncoder().encode(text));
        await sendMessage({
          roomId,
          author: nickname,
          content: ciphertext,
          iv: iv.buffer,
          isFile: false,
          file: undefined,
        });
        toast.success("Message sent successfully!");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message. Please try again.");
    }
  };

  const handleClearForMe = () => {
    setDecryptedMessages([]);
    toast.success("Local chat history has been cleared.");
  };

  const handleClearForAll = async () => {
    if (!roomId) return;
    await clearAllMessages({ roomId });
    toast.success("Chat history has been cleared for everyone in the room.");
  };

  const copyShareLink = () => {
    const url = `${window.location.origin}/join?id=${roomId}`;
    navigator.clipboard.writeText(url);
    toast.success("Share link copied to clipboard!");
  };

  const typingUsers = useMemo(() => {
    return [];
  }, []);

  // Use presenceState directly instead of making a separate query
  const presence = useMemo(() => {
    if (!presenceState || !Array.isArray(presenceState)) return [];
    const presenceData = presenceState as UserPresence[];
    return presenceData.filter(p => p.online);
  }, [presenceState]);

  if (!isReady || !room || !currentUser) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-400" />
        <p className="mt-4 text-gray-400">
          {room ? "Decrypting messages..." : "Loading room..."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex w-full h-[90vh] max-w-6xl mx-auto bg-gray-800 rounded-xl shadow-2xl">
      <UserSidebar users={presence ?? []} currentUser={nickname} />
      <div className="flex flex-col flex-1">
        <Header
          roomName={room.name}
          onBack={() => navigate("/")}
          onCopyLink={copyShareLink}
        />
        <MessageArea messages={decryptedMessages} currentUser={nickname} />
        <TypingIndicator typingUsers={typingUsers} currentUser={nickname} />
        <ActionBar
          onClearMe={handleClearForMe}
          onClearAll={handleClearForAll}
        />
        <MessageInput onSend={handleSendMessage} onTyping={onStartTyping} />
      </div>
    </div>
  );
}

const Header = ({ roomName, onBack, onCopyLink }: { roomName?: string; onBack: () => void; onCopyLink: () => void; }) => (
  <header className="flex items-center justify-between p-4 border-b border-gray-700">
    <div className="flex items-center gap-4">
      <button onClick={onBack} className="text-gray-400 hover:text-white">
        <ArrowLeft size={20} />
      </button>
      <h2 className="text-xl font-bold text-white">{roomName || "Chat"}</h2>
    </div>
    <button onClick={onCopyLink} className="flex items-center gap-2 px-3 py-2 text-sm rounded-md bg-emerald-500 hover:bg-emerald-600 transition-colors">
      <Copy size={16} /> Share Link
    </button>
  </header>
);

const MessageArea = ({ messages, currentUser }: { messages: DecryptedMessage[]; currentUser: string; }) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  return (
    <div className="flex-1 p-4 overflow-y-auto">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          <p>No messages yet. Be the first to say something!</p>
        </div>
      ) : (
        messages.map((msg) => (
          <MessageBubble key={msg._id} message={msg} isCurrentUser={msg.author === currentUser} />
        ))
      )}
      <div ref={endOfMessagesRef} />
    </div>
  );
};

const MessageBubble = memo(({ message, isCurrentUser }: { message: DecryptedMessage; isCurrentUser: boolean; }) => {
  const { key } = useCrypto();
  const [decryptedFileUrl, setDecryptedFileUrl] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);

  useEffect(() => {
    let objectUrl: string | null = null;
    const decryptFile = async () => {
      if (message.isFile && message.file && message.url && key && !decryptedFileUrl) {
        setIsDecrypting(true);
        try {
          const response = await fetch(message.url);
          if (!response.ok) throw new Error("Failed to fetch encrypted file");
          const encryptedBuffer = await response.arrayBuffer();
          const decryptedBuffer = await decryptData(key, encryptedBuffer, new Uint8Array(message.file.iv));
          const blob = new Blob([decryptedBuffer], { type: message.file.type });
          objectUrl = URL.createObjectURL(blob);
          setDecryptedFileUrl(objectUrl);
        } catch (e) {
          console.error("Failed to decrypt file", e);
          toast.error(`Could not decrypt file: ${message.content}`);
        } finally {
          setIsDecrypting(false);
        }
      }
    };
    decryptFile();
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [message, key, decryptedFileUrl]);

  const isImage = message.file?.type.startsWith("image/");

  return (
    <div className={`flex items-end gap-2 my-3 ${isCurrentUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex flex-col max-w-xs md:max-w-md ${isCurrentUser ? "items-end" : "items-start"}`}>
        <span className="text-xs text-gray-400 px-1 mb-1">{message.author}</span>
        <div className={`px-4 py-2 rounded-2xl ${isCurrentUser ? "bg-emerald-600 rounded-br-md" : "bg-gray-700 rounded-bl-md"}`}>
          {!message.isFile ? (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          ) : isDecrypting ? (
            <div className="flex items-center gap-2 text-white/80"><Loader2 className="w-4 h-4 animate-spin" /><span>Decrypting...</span></div>
          ) : decryptedFileUrl ? (
            isImage ? (
              <img src={decryptedFileUrl} alt={message.content} className="rounded-md max-h-64 cursor-pointer" onClick={() => window.open(decryptedFileUrl, "_blank")} />
            ) : (
              <a href={decryptedFileUrl} download={message.content} className="flex items-center gap-3">
                <FileIcon className="w-5 h-5" />
                <span className="truncate">{message.content}</span>
                <Download className="w-4 h-4 text-gray-300" />
              </a>
            )
          ) : (
            <div className="flex items-center gap-2 text-red-400/80"><FileIcon className="w-5 h-5" /><span>Decryption failed</span></div>
          )}
        </div>
      </div>
    </div>
  );
});

const ActionBar = ({ onClearMe, onClearAll }: { onClearMe: () => void; onClearAll: () => void; }) => (
  <div className="flex items-center justify-end gap-2 p-2 border-t border-gray-700">
    <button onClick={onClearMe} className="flex items-center gap-1.5 text-xs px-2 py-1 text-gray-400 hover:text-white hover:bg-gray-600 rounded-md transition-colors">
      <Trash2 size={14} /> Clear for Me
    </button>
    <button onClick={onClearAll} className="flex items-center gap-1.5 text-xs px-2 py-1 text-red-400 hover:text-white hover:bg-red-500 rounded-md transition-colors">
      <Trash2 size={14} /> Clear for All
    </button>
  </div>
);

const MessageInput = ({ onSend, onTyping }: { onSend: (content: string, isFile?: boolean, file?: File) => void; onTyping: () => void; }) => {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (file) {
      onSend(file.name, true, file);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } else if (text.trim()) {
      onSend(text);
      setText("");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      if (e.target.files[0].size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("File size cannot exceed 5MB.");
        return;
      }
      setFile(e.target.files[0]);
      setText("");
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    onTyping();
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700 bg-gray-900 rounded-b-xl">
      {file && (
        <div className="flex items-center justify-between bg-gray-700 p-2 rounded-md mb-2">
          <div className="flex items-center gap-2 truncate"><FileIcon className="w-5 h-5 text-gray-400" /><span className="text-sm truncate">{file.name}</span></div>
          <button type="button" onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="text-gray-400 hover:text-white"><X size={18} /></button>
        </div>
      )}
      <div className="flex items-center gap-2">
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
        <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors"><Paperclip size={20} /></button>
        <input type="text" value={text} onChange={handleTextChange} placeholder="Type your message..." className="flex-1 bg-gray-700 px-4 py-2 rounded-full outline-none focus:ring-2 focus:ring-emerald-500" disabled={!!file} />
        <button type="submit" className="p-3 bg-emerald-500 rounded-full hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={!text.trim() && !file}><Send size={20} className="text-white" /></button>
      </div>
    </form>
  );
};

const UserSidebar = ({ users, currentUser }: { users: UserPresence[], currentUser: string }) => {
  return (
    <aside className="w-64 bg-gray-800/50 p-4 border-r border-gray-700 flex flex-col">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Users size={20} /> Online Users ({users.length})</h3>
      <ul className="space-y-2 overflow-y-auto">
        {users.map(user => (
          <li key={user.userId} className="flex items-center gap-2 text-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-green-400"></span>
            <span className="truncate">{user.data?.name}{user.data?.name === currentUser && " (You)"}</span>
          </li>
        ))}
      </ul>
    </aside>
  )
}

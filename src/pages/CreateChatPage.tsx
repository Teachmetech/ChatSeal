import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import { useCrypto } from "../hooks/useCrypto";
import { deriveKey } from "../lib/crypto";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Copy } from "lucide-react";

const ttlOptions = [
  { label: "30 Minutes", value: 30 * 60 * 1000 },
  { label: "1 Hour", value: 60 * 60 * 1000 },
  { label: "6 Hours", value: 6 * 60 * 60 * 1000 },
  { label: "24 Hours", value: 24 * 60 * 60 * 1000 },
  { label: "7 Days", value: 7 * 24 * 60 * 60 * 1000 },
];

const GeneratedPassphraseToast = ({ passphrase }: { passphrase: string }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(passphrase);
    toast.success("Passphrase copied to clipboard!");
  };

  return (
    <div className="text-sm">
      <p className="font-bold mb-2">
        We generated a secure passphrase for you:
      </p>
      <div className="flex items-center gap-2 bg-gray-700 p-2 rounded-md">
        <code className="text-emerald-400 break-all flex-1">
          {passphrase}
        </code>
        <button onClick={handleCopy} className="p-1.5 text-gray-300 hover:text-white hover:bg-gray-600 rounded-md transition-colors">
          <Copy size={16} />
        </button>
      </div>
      <p className="mt-2 text-gray-400">
        Save it! You'll need it to let others join.
      </p>
    </div>
  );
};

export default function CreateChatPage() {
  const navigate = useNavigate();
  const { signIn } = useAuthActions();
  const updateNickname = useMutation(api.users.updateMyNickname);
  const createRoom = useMutation(api.chat.createRoom);
  const { setKey } = useCrypto();
  const currentUser = useQuery(api.auth.loggedInUser);
  const isAuthenticated = !!currentUser;
  const isLoading = currentUser === undefined;

  const [nickname, setNickname] = useState("");
  const [roomName, setRoomName] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [ttl, setTtl] = useState(ttlOptions[1].value);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      signIn("anonymous");
    }
  }, [isLoading, isAuthenticated, signIn]);

  useEffect(() => {
    if (currentUser) {
      setNickname(currentUser.name ?? "");
    }
  }, [currentUser]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      toast.error("Please enter a nickname.");
      return;
    }
    setIsCreating(true);

    try {
      await updateNickname({ name: nickname });

      let finalPassphrase = passphrase;
      if (!finalPassphrase) {
        finalPassphrase = uuidv4();
        toast.info(
          <GeneratedPassphraseToast passphrase={finalPassphrase} />,
          { duration: 30000 }
        );
      }

      const salt = window.crypto.getRandomValues(new Uint8Array(16));
      const derivedKey = await deriveKey(finalPassphrase, salt);
      setKey(derivedKey);

      const roomId = await createRoom({
        name: roomName,
        passphraseRequired: true,
        ttl,
        salt: salt.buffer,
      });

      localStorage.setItem(`chatseal_${roomId}_passphrase`, finalPassphrase);

      navigate(`/chat/${roomId}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to create chat room. Please try again.");
      setIsCreating(false);
    }
  };

  if (isLoading || !isAuthenticated) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={18} />
        Back to Home
      </button>
      <h1 className="text-3xl font-bold text-white mb-2">
        Create a New Chat
      </h1>
      <p className="text-gray-400 mb-8">
        Fill in the details to start a secure, ephemeral chat room.
      </p>
      <form onSubmit={handleCreate} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Your Nickname*"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="auth-input-field"
          required
        />
        <input
          type="text"
          placeholder="Chat Room Name (optional)"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          className="auth-input-field"
        />
        <input
          type="password"
          placeholder="Passphrase (optional, one will be generated)"
          value={passphrase}
          onChange={(e) => setPassphrase(e.target.value)}
          className="auth-input-field"
        />
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Room Lifetime
          </label>
          <select
            value={ttl}
            onChange={(e) => setTtl(Number(e.target.value))}
            className="auth-input-field"
          >
            {ttlOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="auth-button mt-4"
          disabled={isCreating}
        >
          {isCreating ? (
            <Loader2 className="animate-spin mx-auto" />
          ) : (
            "Create & Join Chat"
          )}
        </button>
      </form>
    </div>
  );
}

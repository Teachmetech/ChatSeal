import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useCrypto } from "../hooks/useCrypto";
import { deriveKey } from "../lib/crypto";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { CryptoProvider } from "../providers/CryptoProvider";

function JoinChatContent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn } = useAuthActions();
  const updateNickname = useMutation(api.users.updateMyNickname);
  const { setKey } = useCrypto();
  const currentUser = useQuery(api.auth.loggedInUser);
  const isAuthenticated = !!currentUser;
  const isLoading = currentUser === undefined;

  const [roomId, setRoomId] = useState(searchParams.get("id") ?? "");
  const [nickname, setNickname] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const room = useQuery(
    api.chat.getRoom,
    roomId ? { roomId: roomId as Id<"rooms"> } : "skip"
  );

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

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      toast.error("Please enter a nickname.");
      return;
    }
    if (!room) {
      toast.error("Invalid Room ID or the room has expired.");
      return;
    }
    setIsJoining(true);

    try {
      await updateNickname({ name: nickname });

      if (room.passphraseRequired) {
        if (!passphrase) {
          toast.error("This room requires a passphrase.");
          setIsJoining(false);
          return;
        }
        if (!room.salt) {
          throw new Error("Room requires a passphrase but has no salt.");
        }
        const derivedKey = await deriveKey(
          passphrase,
          new Uint8Array(room.salt)
        );
        setKey(derivedKey);
      } else {
        setKey(null);
      }

      localStorage.setItem(`chatseal_${room._id}_passphrase`, passphrase);

      navigate(`/chat/${room._id}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to join room. Check the passphrase and try again.");
      setIsJoining(false);
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
      <h1 className="text-3xl font-bold text-white mb-2">Join a Chat</h1>
      <p className="text-gray-400 mb-8">
        Enter the Room ID and your details to join.
      </p>
      <form onSubmit={handleJoin} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Room ID*"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="auth-input-field"
          required
        />
        <input
          type="text"
          placeholder="Your Nickname*"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="auth-input-field"
          required
        />
        <input
          type="password"
          placeholder="Passphrase (if required)"
          value={passphrase}
          onChange={(e) => setPassphrase(e.target.value)}
          className="auth-input-field"
        />
        <button
          type="submit"
          className="auth-button mt-4"
          disabled={isJoining || (roomId !== "" && room === undefined)}
        >
          {isJoining ? (
            <Loader2 className="animate-spin mx-auto" />
          ) : room === undefined && roomId !== "" ? (
            <Loader2 className="animate-spin mx-auto" />
          ) : (
            "Join Chat"
          )}
        </button>
        {roomId && room === null && (
          <p className="text-red-400 text-sm mt-2 text-center">
            Room not found or has expired.
          </p>
        )}
      </form>
    </div>
  );
}

export default function JoinChatPage() {
  return (
    <CryptoProvider>
      <JoinChatContent />
    </CryptoProvider>
  );
}

import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

export default function HomePage() {
  return (
    <div className="w-full max-w-md mx-auto text-center">
      <div className="flex justify-center items-center gap-3 mb-6">
        <ShieldCheck className="w-12 h-12 text-emerald-400" />
        <h1 className="text-5xl font-bold text-white">ChatSeal</h1>
      </div>
      <p className="text-lg text-gray-400 mb-10">
        Pick a nickname, set how long it lives, then chat—100% private & gone
        when you want.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          to="/create"
          className="flex-1 px-6 py-4 rounded-lg bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-colors shadow-lg hover:shadow-emerald-500/30"
        >
          Create Chat
        </Link>
        <Link
          to="/join"
          className="flex-1 px-6 py-4 rounded-lg bg-gray-700 text-white font-semibold hover:bg-gray-600 transition-colors shadow-lg hover:shadow-gray-700/30"
        >
          Join Chat
        </Link>
      </div>
    </div>
  );
}

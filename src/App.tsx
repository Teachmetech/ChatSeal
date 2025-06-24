// Main application component that sets up routing.
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import HomePage from "./pages/HomePage";
import CreateChatPage from "./pages/CreateChatPage";
import JoinChatPage from "./pages/JoinChatPage";
import ChatRoomPage from "./pages/ChatRoomPage";
import { CryptoProvider } from "./providers/CryptoProvider";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-gray-900 text-gray-200 font-sans">
        <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route
              path="/create"
              element={
                <CryptoProvider>
                  <CreateChatPage />
                </CryptoProvider>
              }
            />
            <Route
              path="/join"
              element={
                <CryptoProvider>
                  <JoinChatPage />
                </CryptoProvider>
              }
            />
            <Route
              path="/chat/:roomId"
              element={
                <CryptoProvider>
                  <ChatRoomPage />
                </CryptoProvider>
              }
            />
          </Routes>
        </main>
        <Toaster theme="dark" position="top-right" />
      </div>
    </BrowserRouter>
  );
}

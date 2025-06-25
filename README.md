<div align="center">
  <img src="public/logo.svg" alt="ChatSeal Logo" width="120" height="120">
  
  # ChatSeal
  
  **Secure Ephemeral Chat with End-to-End Encryption**
  
  [![Live Demo](https://img.shields.io/badge/Live%20Demo-chatseal.com-10b981?style=for-the-badge)](https://chatseal.com)
  [![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)
  [![GitHub Stars](https://img.shields.io/github/stars/username/chatseal?style=for-the-badge)](https://github.com/username/chatseal)
  
  *Create secure, ephemeral chat rooms that disappear when you want them to.*
</div>

---

## ✨ Features

- 🔒 **End-to-End Encryption** - All messages and files are encrypted client-side
- ⏰ **Ephemeral Rooms** - Set expiration times from 30 minutes to 7 days
- 🔐 **Passphrase Protection** - Optional room passwords for access control
- 📎 **Encrypted File Sharing** - Share images, videos, and documents securely
- 👥 **Real-time Presence** - See who's online with live typing indicators
- 📱 **PWA Ready** - Install as a mobile app with offline support
- 🌐 **No Registration** - Anonymous authentication for privacy
- 🎨 **Modern UI** - Clean, responsive design with dark theme
- 🔗 **Shareable Links** - Easy room sharing with or without passphrases

## 🚀 Quick Start

### Try it Live
Visit **[chatseal.com](https://chatseal.com)** to start chatting immediately!

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/username/chatseal.git
   cd chatseal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Convex**
   ```bash
   npx convex dev
   ```
   This will create a new Convex project and generate the necessary configuration files.

4. **Start development server**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:5173`

## 🏗️ Tech Stack

### Frontend
- **React 19** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Lucide React** - Beautiful icons

### Backend
- **Convex** - Real-time backend with automatic sync
- **Convex Auth** - Anonymous authentication system
- **Convex Presence** - Real-time user presence tracking

### Security & Encryption
- **Web Crypto API** - Browser-native encryption (AES-GCM)
- **Client-side Encryption** - All data encrypted before leaving your device
- **Secure Key Derivation** - PBKDF2 for passphrase-based keys

## 📁 Project Structure

```
chatseal/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Logo.tsx        # ChatSeal logo component
│   │   └── TypingIndicator.tsx
│   ├── hooks/              # Custom React hooks
│   │   ├── useCrypto.ts    # Encryption key management
│   │   └── useTyping.ts    # Typing indicator logic
│   ├── lib/                # Utility libraries
│   │   ├── crypto.ts       # Encryption/decryption functions
│   │   └── utils.ts        # General utilities
│   ├── pages/              # Page components
│   │   ├── HomePage.tsx    # Landing page
│   │   ├── CreateChatPage.tsx
│   │   ├── JoinChatPage.tsx
│   │   └── ChatRoomPage.tsx
│   ├── providers/          # React context providers
│   │   └── CryptoProvider.tsx
│   └── App.tsx            # Main application component
├── convex/                 # Backend functions
│   ├── auth.ts            # Authentication logic
│   ├── chat.ts            # Chat room functions
│   ├── presence.ts        # User presence tracking
│   ├── schema.ts          # Database schema
│   └── users.ts           # User management
├── public/                 # Static assets
│   ├── logo.svg           # ChatSeal logo
│   ├── favicon.svg        # Favicon
│   └── site.webmanifest   # PWA manifest
└── README.md              # This file
```

## 🔐 Security Features

### End-to-End Encryption
- **AES-GCM Encryption** - Industry-standard symmetric encryption
- **Client-side Only** - Keys never leave your device
- **Unique IVs** - Each message uses a unique initialization vector
- **Secure Key Derivation** - PBKDF2 with random salt for passphrases

### Privacy Protection
- **Anonymous Authentication** - No personal information required
- **Ephemeral Storage** - Messages automatically deleted after expiration
- **No Server-side Decryption** - Server never sees your plaintext messages
- **Local Key Storage** - Encryption keys stored only in browser memory

## 🛠️ Development

### Available Scripts

```bash
# Start development server (frontend + backend)
npm run dev

# Start only frontend
npm run dev:frontend

# Start only backend
npm run dev:backend

# Build for production
npm run build

# Lint code
npm run lint

# Type check
npm run type-check
```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Convex deployment URL (auto-generated)
CONVEX_DEPLOYMENT=your-deployment-name

# Vite environment variables
VITE_CONVEX_URL=https://your-deployment.convex.cloud
```

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables from `.env.local`

### Backend (Convex)
```bash
# Deploy to production
npx convex deploy

# Set production environment variables
npx convex env set VARIABLE_NAME value
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Code Style
- Use TypeScript for all new code
- Follow the existing code style
- Add JSDoc comments for public functions
- Write tests for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Convex](https://convex.dev) - For the amazing real-time backend
- [Vite](https://vitejs.dev) - For the fast development experience
- [Tailwind CSS](https://tailwindcss.com) - For the utility-first CSS framework
- [Lucide](https://lucide.dev) - For the beautiful icons

## 📞 Support

- 🌐 **Website**: [chatseal.com](https://chatseal.com)
- 📧 **Email**: support@chatseal.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/username/chatseal/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/username/chatseal/discussions)

---

<div align="center">
  <p>Built with ❤️ for privacy and security</p>
  <p>
    <a href="https://chatseal.com">🔗 Try ChatSeal</a> •
    <a href="#features">✨ Features</a> •
    <a href="#quick-start">🚀 Quick Start</a> •
    <a href="#contributing">🤝 Contributing</a>
  </p>
</div>

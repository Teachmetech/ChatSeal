# Changelog

All notable changes to ChatSeal will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-12-XX

### Added
- 🔒 **End-to-End Encryption** - AES-GCM encryption for all messages and files
- ⏰ **Ephemeral Rooms** - Configurable room expiration (30 minutes to 7 days)
- 🔐 **Passphrase Protection** - Optional room passwords with secure key derivation
- 📎 **Encrypted File Sharing** - Support for images, videos, and documents
- 👥 **Real-time Presence** - Live user presence and typing indicators
- 📱 **PWA Support** - Progressive Web App with offline capabilities
- 🌐 **Anonymous Authentication** - No registration required
- 🎨 **Modern UI** - Responsive dark theme interface
- 🔗 **Shareable Links** - Room sharing with optional passphrase inclusion
- 📊 **Room Statistics** - Comprehensive room information modal
- 🖼️ **Custom Logo** - ChatSeal branding throughout the application
- 🔖 **Favicon Support** - Multi-format favicon with PWA manifest

### Security
- Client-side only encryption with Web Crypto API
- PBKDF2 key derivation for passphrases
- Unique initialization vectors for each message
- No server-side access to plaintext data
- Secure file upload and download with encryption

### Technical
- React 19 with TypeScript
- Vite for fast development and building
- Convex for real-time backend
- Tailwind CSS for styling
- React Router for navigation
- Convex Auth for anonymous authentication
- Convex Presence for real-time features

### Infrastructure
- Vercel deployment configuration
- Convex Cloud backend
- PWA manifest and service worker ready
- SEO optimization with meta tags
- Social media sharing optimization

## [Unreleased]

### Planned
- [ ] Message search functionality
- [ ] Room themes and customization
- [ ] Message reactions and emoji support
- [ ] Voice messages
- [ ] Screen sharing
- [ ] Mobile app versions
- [ ] End-to-end encrypted voice/video calls
- [ ] Message threading
- [ ] File preview improvements
- [ ] Keyboard shortcuts
- [ ] Dark/light theme toggle
- [ ] Room moderation features
- [ ] Message export functionality
- [ ] Advanced encryption options

---

For more details about any release, see the [GitHub Releases](https://github.com/username/chatseal/releases) page. 
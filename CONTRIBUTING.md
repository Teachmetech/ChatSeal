# Contributing to ChatSeal

Thank you for your interest in contributing to ChatSeal! We welcome contributions from the community and are pleased to have you join us.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before contributing.

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps which reproduce the problem**
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed after following the steps**
- **Explain which behavior you expected to see instead and why**
- **Include screenshots and animated GIFs if possible**

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title**
- **Provide a step-by-step description of the suggested enhancement**
- **Provide specific examples to demonstrate the steps**
- **Describe the current behavior and explain which behavior you expected to see instead**
- **Explain why this enhancement would be useful**

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Install dependencies**: `npm install`
3. **Set up development environment**: `npx convex dev`
4. **Make your changes** and test thoroughly
5. **Ensure the test suite passes**: `npm run lint`
6. **Make sure your code follows the project's style guidelines**
7. **Write or update tests** as necessary
8. **Update documentation** if needed
9. **Create a pull request**

## Development Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Local Development

1. **Clone your fork**:
   ```bash
   git clone https://github.com/yourusername/chatseal.git
   cd chatseal
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Convex**:
   ```bash
   npx convex dev
   ```
   This will create a new Convex project for development.

4. **Start development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser** to `http://localhost:5173`

### Project Structure

```
src/
├── components/     # Reusable UI components
├── hooks/         # Custom React hooks
├── lib/           # Utility functions
├── pages/         # Page components
├── providers/     # React context providers
└── App.tsx        # Main app component

convex/
├── auth.ts        # Authentication logic
├── chat.ts        # Chat functionality
├── presence.ts    # Real-time presence
├── schema.ts      # Database schema
└── users.ts       # User management
```

## Style Guidelines

### Code Style

- **TypeScript**: All new code should be written in TypeScript
- **ESLint**: Follow the ESLint configuration
- **Prettier**: Code is automatically formatted with Prettier
- **Naming**: Use camelCase for variables and functions, PascalCase for components

### Commit Messages

We follow the [Conventional Commits](https://conventionalcommits.org/) specification:

- `feat: add new feature`
- `fix: fix bug`
- `docs: update documentation`
- `style: format code`
- `refactor: refactor code`
- `test: add tests`
- `chore: update dependencies`

### React Guidelines

- Use functional components with hooks
- Prefer TypeScript interfaces over types
- Use proper prop types
- Handle loading and error states
- Follow React best practices

### Security Guidelines

- Never commit sensitive information (API keys, passwords)
- All encryption must happen client-side
- Validate all user inputs
- Use secure coding practices
- Test security features thoroughly

## Testing

### Running Tests

```bash
# Run linting
npm run lint

# Type checking
npm run type-check

# Build check
npm run build
```

### Writing Tests

- Write tests for new features
- Update tests when modifying existing features
- Ensure tests are meaningful and cover edge cases
- Use descriptive test names

## Documentation

- Update README.md if needed
- Add JSDoc comments for public functions
- Update inline comments for complex logic
- Keep documentation up to date with code changes

## Security

### Reporting Security Vulnerabilities

If you discover a security vulnerability, please email security@chatseal.com instead of creating a public issue. We will work with you to resolve the issue promptly.

### Security Best Practices

- All encryption happens client-side
- Never log sensitive information
- Validate all inputs
- Use secure defaults
- Follow OWASP guidelines

## Release Process

1. **Version bump**: Update version in `package.json`
2. **Changelog**: Update `CHANGELOG.md`
3. **Tag release**: Create Git tag
4. **Deploy**: Deploy to production
5. **Announce**: Announce the release

## Getting Help

- **Documentation**: Check the README and inline documentation
- **Issues**: Search existing issues for similar problems
- **Discussions**: Use GitHub Discussions for questions
- **Discord**: Join our community Discord server

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project website

Thank you for contributing to ChatSeal! 🎉 
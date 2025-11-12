# Contributing to Shroud LLM

Shroud LLM is an open-source, privacy-first project and we welcome contributions from the community.

## Reporting Issues

If you encounter a bug or have a feature request, please open an issue on the
[GitHub issue tracker](https://github.com/lilbub1234/Shroud-LLM/issues).

## Picking an Issue

We track issues on the GitHub issue tracker. If you are looking for something to work on, check the "good first issue" label. These issues are typically the best described and have the smallest scope.

If there's an issue you are interested in working on, please leave a comment on the issue. This will help us avoid duplicate work. Additionally, if you have questions about the issue, please ask them in the issue comments.

## Before You Start

Keep in mind that we are a small team with limited resources. We will do our best to review and merge your PRs, but please be patient. Ultimately, **we become the maintainer** of your changes. It is our responsibility to ensure changes work as expected, are high quality, and compatible with the rest of the project.

Before starting work on an issue, please read the following to avoid wasted effort:

0. **(Most Important)** If you are making a PR that does not have a corresponding issue, **it will not be merged.** _The only exception to this is language translations or security fixes._

1. **Privacy Features**: If you are working on privacy-related features (BYOK, redaction, timer-based deletion), please discuss the approach in the issue first. Privacy is core to Shroud LLM and we want to ensure implementations are secure and maintain zero-knowledge principles.

2. **Integrations** (LLM, Vector DB, etc.) are reviewed at our discretion. Please be patient as we evaluate security implications and privacy guarantees.

3. It is our discretion to merge or not merge a PR. We value every contribution but also value code quality and our privacy-first vision. This is not personal - we will provide feedback to help get PRs merged.

4. **Security** is always paramount. If you have a security concern, **do not open a public issue**. Instead, please report privately via [GitHub Security Advisories](https://github.com/lilbub1234/Shroud-LLM/security/advisories) or contact us at security@shroudnetwork.dev.

## Configuring Git

First, fork the repository on GitHub, then clone your fork:

```bash
git clone https://github.com/<username>/Shroud-LLM.git
cd Shroud-LLM
```

Then add the main repository as a remote:

```bash
git remote add upstream https://github.com/lilbub1234/Shroud-LLM.git
git fetch upstream
```

## Setting Up Your Development Environment

### Prerequisites
- Node.js >= 18
- Yarn package manager
- Git

### Installation

1. **Install dependencies**:
```bash
yarn setup
```

This will install dependencies for all services (server, frontend, collector) and set up environment files.

2. **Configure environment variables**:
```bash
# Copy and edit environment files
cp server/.env.example server/.env.development
cp frontend/.env.example frontend/.env
cp collector/.env.example collector/.env
```

3. **Set up the database**:
```bash
yarn prisma:setup
```

4. **Start development servers**:
```bash
# Start all services
yarn dev:all

# Or start individually:
yarn dev:server    # Backend (port 3001)
yarn dev:frontend  # Frontend (port 3000)
yarn dev:collector # Document processor (port 8888)
```

## Development Guidelines

### Privacy-First Principles

All contributions must adhere to our privacy-first principles:

1. **Zero Knowledge**: Never log, store, or transmit sensitive user data
2. **Opt-in Telemetry**: No tracking by default
3. **Local First**: Features should work offline when possible
4. **Transparent**: Code should be auditable and understandable
5. **Secure Defaults**: Safe configurations out of the box

### Code Style

- Use Prettier for formatting (run `yarn lint`)
- Follow existing code patterns
- Write descriptive commit messages
- Add comments for complex logic
- Include JSDoc for functions

### Testing

- Write tests for new features
- Ensure existing tests pass: `yarn test`
- Test security-sensitive features thoroughly

### Commit Messages

Use conventional commit format:
```
feat: Add timer-based deletion for workspaces
fix: Resolve BYOK key rotation issue
docs: Update privacy features documentation
refactor: Improve redaction pattern matching
test: Add tests for encryption utilities
```

## Pull Request Process

1. **Create a branch**: `git checkout -b feature/your-feature-name`
2. **Make your changes** following the guidelines above
3. **Test thoroughly**: Ensure all tests pass and features work
4. **Commit with clear messages**: Follow conventional commit format
5. **Push to your fork**: `git push origin feature/your-feature-name`
6. **Open a PR**: Include a clear description and reference the issue number
7. **Respond to feedback**: Be patient and collaborative

### PR Checklist

- [ ] Issue exists for this PR
- [ ] Code follows project style
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Privacy implications considered
- [ ] Security review completed (if applicable)
- [ ] No secrets or sensitive data in commits

## Areas We're Looking For Help

- **Privacy Features**: BYOK, timer-based deletion, smart redaction
- **Security Hardening**: Encryption, key management, secure defaults
- **LLM Integrations**: Privacy-preserving LLM providers
- **Documentation**: User guides, API docs, privacy guides
- **Translations**: Internationalization
- **Testing**: Unit tests, integration tests, security tests

## Code of Conduct

- Be respectful and constructive
- Focus on the code, not the person
- Accept constructive criticism gracefully
- Prioritize user privacy and security
- Help others learn and grow

## Questions?

If you have questions about contributing:
- Open a discussion on GitHub
- Comment on the relevant issue
- Check existing documentation

Thank you for contributing to Shroud LLM and helping build a more private internet!

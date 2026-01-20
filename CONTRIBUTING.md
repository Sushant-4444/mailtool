# Contributing to MailTool

Thank you for considering contributing to MailTool! 🎉

## How Can I Contribute?

### 🐛 Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/yourusername/mailtool/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots (if applicable)
   - Your environment (OS, Docker version, etc.)

### 💡 Suggesting Features

1. Check [existing feature requests](https://github.com/yourusername/mailtool/issues?q=is%3Aissue+label%3Aenhancement)
2. Create a new issue with `enhancement` label
3. Describe:
   - The problem it solves
   - How it should work
   - Any alternative solutions you've considered

### 🔧 Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/AmazingFeature`
3. Make your changes
4. Test thoroughly
5. Commit: `git commit -m 'Add some AmazingFeature'`
6. Push: `git push origin feature/AmazingFeature`
7. Open a Pull Request

## Development Setup

```bash
# Clone your fork
git clone https://github.com/yourusername/mailtool.git
cd mailtool

# Create .env file
cp .env.example .env
# Edit .env with your credentials

# Start in development mode
docker-compose up
```

## Code Style

- Use ES6+ features
- Follow existing code patterns
- Add comments for complex logic
- Keep functions small and focused

## Testing

Before submitting a PR:

1. Test the entire workflow:
   - Import contacts
   - Create campaign
   - Send emails
   - Check results

2. Test edge cases:
   - Invalid email addresses
   - Large contact lists
   - Missing custom fields
   - Network failures

## Areas We Need Help

- [ ] Unit/Integration tests
- [ ] Additional SMTP provider support
- [ ] UI/UX improvements
- [ ] Internationalization (i18n)
- [ ] Performance optimization
- [ ] Documentation improvements
- [ ] Docker optimization

## Questions?

Feel free to ask in [Discussions](https://github.com/yourusername/mailtool/discussions)

---

**By contributing, you agree that your contributions will be licensed under the MIT License.**

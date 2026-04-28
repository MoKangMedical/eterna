# Contributing to 念念 Eterna

Thank you for your interest in contributing! This guide will help you get started.

## Development Setup

### Prerequisites

- Python 3.10+
- FFmpeg (for video processing features)
- Git

### Getting Started

```bash
# Clone the repository
git clone https://github.com/MoKangMedical/eterna-niannian.git
cd eterna-niannian

# Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate  # macOS/Linux
# .venv\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp .env.example .env.local
# Edit .env.local with your API keys

# Run the application
python app.py
```

The server will start at `http://localhost:8102`.

## Code Style

- **Python**: Follow PEP 8. Use `black` for formatting and `ruff` for linting.
- **Type Hints**: Use type annotations for function signatures.
- **Docstrings**: Write docstrings for public functions and classes (Google style).
- **Naming**:
  - `snake_case` for functions and variables
  - `PascalCase` for classes
  - `UPPER_SNAKE_CASE` for constants

### Formatting & Linting

```bash
# Format
black .

# Lint
ruff check .

# Type check
mypy .
```

## Making Changes

### Branch Naming

- `feature/<description>` - New features
- `fix/<description>` - Bug fixes
- `docs/<description>` - Documentation updates
- `refactor/<description>` - Code refactoring

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]
[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
```
feat(chat): add conversation memory for returning users
fix(billing): correct Stripe webhook signature verification
docs(readme): update deployment instructions
```

## Pull Request Process

1. **Create a branch** from `main` with a descriptive name
2. **Make your changes** following the code style guidelines
3. **Test locally** - ensure the app starts and key features work
4. **Update documentation** if you changed public APIs or configuration
5. **Submit a PR** with:
   - Clear title describing the change
   - Description of what changed and why
   - Reference to any related issues
   - Screenshots for UI changes (if applicable)

### PR Checklist

- [ ] Code follows the style guidelines
- [ ] No new warnings from linter
- [ ] Environment variables documented in `.env.example` (if new ones added)
- [ ] README updated (if needed)
- [ ] CHANGELOG.md updated with your changes

## Reporting Issues

- Use GitHub Issues for bug reports and feature requests
- Include steps to reproduce for bugs
- Include your Python version and OS
- Check existing issues before creating new ones

## Security

See [SECURITY.md](SECURITY.md) for reporting security vulnerabilities.

## License

By contributing, you agree that your contributions will be licensed under the
[MIT License](LICENSE).

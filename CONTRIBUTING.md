# Contributing Guide

## Branch Strategy

```
main (unstable, latest development)
  │
  ├── PR ──► release (stable releases)
  │            └── Auto-creates vX.X.X tags
  │
  └── PR ──► beta (beta/RC releases)
               └── Auto-creates vX.X.X-beta.X tags
```

### Branches

- **`main`**: Development branch, all feature PRs merge here. **Unstable**.
- **`release`**: Stable releases. Merges here trigger automatic version bump and release.
- **`beta`**: Beta/RC releases. Merges here trigger automatic beta version bump and release.

## Conventional Commits

We use [Conventional Commits](https://www.conventionalcommits.org/) to determine version bumps:

| Commit Type                    | Version Bump | Example                              |
| ------------------------------ | ------------ | ------------------------------------ |
| `feat:`                        | Minor        | `feat: add new template parser`      |
| `feat!:` or `BREAKING CHANGE:` | Major        | `feat!: drop Node 20 support`        |
| `fix:`                         | Patch        | `fix: correct variable substitution` |
| `chore:`                       | Patch        | `chore: update dependencies`         |
| `docs:`                        | Patch        | `docs: update README`                |
| `refactor:`                    | Patch        | `refactor: simplify parser logic`    |
| `test:`                        | Patch        | `test: add template loader tests`    |

### Commit Message Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

Examples:

```bash
# Feature (minor bump)
git commit -m "feat: add support for multiple recipients"

# Breaking change (major bump)
git commit -m "feat!: change template variable syntax from {{}} to ${}"

# Fix (patch bump)
git commit -m "fix: handle missing template variables gracefully"

# With scope
git commit -m "feat(parser): add JSON variable support"
```

## Release Process (Fully Automated)

### Stable Release (release branch)

1. **Create PR from main to release:**

   ```bash
   # On GitHub, create a PR: main → release
   # Title: "Release: vX.X.X"
   # Description: Summary of changes since last release
   ```

2. **Merge the PR** - The workflow automatically:
   - Analyzes commits since last tag
   - Determines version bump (major/minor/patch)
   - Updates `package.json` version
   - Creates GitHub release with tag `vX.X.X`
   - Updates floating `vX` tag
   - Generates build attestation

### Beta Release (beta branch)

1. **Create PR from main to beta:**

   ```bash
   # On GitHub, create a PR: main → beta
   # Title: "Beta: vX.X.X-beta.X"
   ```

2. **Merge the PR** - The workflow automatically:
   - Bumps patch version
   - Creates beta tag `vX.X.X-beta.X`
   - Updates floating `beta` tag
   - Creates GitHub release (marked as prerelease)

### Version Bump Logic

```
Commits since last tag:
  ├─ feat!: breaking change → MAJOR bump (v1.2.3 → v2.0.0)
  ├─ feat: new feature → MINOR bump (v1.2.3 → v1.3.0)
  └─ fix: bug fix → PATCH bump (v1.2.3 → v1.2.4)
```

## Development Workflow

### 1. Feature Development

```bash
# Start from main
git checkout main
git pull origin main

# Create feature branch
git checkout -b feat/my-feature

# Make changes, commit with conventional commits
git commit -m "feat: add new feature"

# Push and create PR to main
git push origin feat/my-feature
# Create PR on GitHub: feat/my-feature → main
```

### 2. Bug Fix

```bash
# Start from main
git checkout main
git pull origin main

# Create fix branch
git checkout -b fix/bug-description

# Fix the bug
git commit -m "fix: resolve issue with template loading"

# Push and create PR to main
git push origin fix/bug-description
# Create PR on GitHub: fix/bug-description → main
```

### 3. Release to Production

```bash
# No local commands needed!
# Just create a PR on GitHub: main → release
# Merge it, and the release happens automatically
```

### 4. Create Beta Release

```bash
# No local commands needed!
# Just create a PR on GitHub: main → beta
# Merge it, and the beta release happens automatically
```

## Tag Structure

| Tag      | Example                  | Purpose                                |
| -------- | ------------------------ | -------------------------------------- |
| `v1.2.3` | `v1.2.3`                 | Specific release                       |
| `v1`     | `v1` → `v1.2.3`          | Floating major version (latest v1.x.x) |
| `beta`   | `beta` → `v1.3.0-beta.2` | Floating beta version                  |

## Usage Examples

```yaml
# Use latest stable
uses: peekaboo5149/email-notifier-action@release

# Use specific version
uses: peekaboo5149/email-notifier-action@v1.2.3

# Use floating major (gets patches automatically)
uses: peekaboo5149/email-notifier-action@v1

# Use latest beta
uses: peekaboo5149/email-notifier-action@beta

# Use specific beta
uses: peekaboo5149/email-notifier-action@v1.3.0-beta.2
```

## Pre-commit Hooks

This project uses Husky with lint-staged:

```bash
# Install hooks
pnpm install

# Hooks run automatically on commit:
# - ESLint fix
# - Prettier format
# - TypeScript type check
# - Vitest tests
```

## CI/CD

All PRs must pass:

- TypeScript type checking
- ESLint
- Prettier format check
- Unit tests
- Build verification

## Breaking Changes

When introducing breaking changes:

1. Use `!` in commit message or `BREAKING CHANGE:` footer:

   ```bash
   git commit -m "feat!: drop support for Node 20

   BREAKING CHANGE: Minimum Node version is now 24"
   ```

2. The release workflow will automatically bump major version

3. Users will need to update their workflows:

   ```yaml
   # Before
   uses: peekaboo5149/email-notifier-action@v1

   # After (breaking changes in v2)
   uses: peekaboo5149/email-notifier-action@v2
   ```

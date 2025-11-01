# Publishing to npm

This guide will walk you through publishing the Fag Agent SDK to npm.

## Prerequisites

1. **npm account**: Create an account at [npmjs.com](https://www.npmjs.com/signup)
2. **npm CLI**: Make sure you have npm installed (comes with Node.js)
3. **Build the package**: Ensure the package is built and ready

## Pre-Publishing Checklist

Before publishing, make sure:

- [ ] Package name is available on npm (check at npmjs.com)
- [ ] Version number is correct in `package.json`
- [ ] All tests pass (if you have tests)
- [ ] README.md is complete and accurate
- [ ] LICENSE file exists (MIT is recommended)
- [ ] Build succeeds without errors
- [ ] Author information is filled in `package.json`

## Step-by-Step Publishing Guide

### 1. Update package.json

Make sure your `package.json` has:

- ✅ Package name (must be unique on npm)
- ✅ Version number (follows semantic versioning)
- ✅ Description
- ✅ Author information
- ✅ License
- ✅ Repository URL (if applicable)

**Note**: The `"private": true` field should NOT be present for publishing.

### 2. Build the Package

```bash
npm run build
```

This will:

- Generate TypeScript declaration files (`.d.ts`)
- Build ES modules (`.mjs`) and CommonJS (`.cjs`)
- Bundle CSS into `style.css`

Verify the `dist/` folder contains all necessary files:

- `index.mjs`
- `index.cjs`
- `index.d.ts`
- `index.d.ts.map`
- `style.css`

### 3. Login to npm

```bash
npm login
```

You'll be prompted for:

- Username
- Password
- Email

Or if you have 2FA enabled:

```bash
npm login --auth-type=web
```

### 4. Verify Package Contents

Before publishing, check what will be included:

```bash
npm pack --dry-run
```

This shows what files will be published without actually publishing.

### 5. Publish to npm

For the first publish:

```bash
npm publish
```

For subsequent versions:

```bash
npm version patch   # 0.1.0 -> 0.1.1 (bug fixes)
npm version minor   # 0.1.0 -> 0.2.0 (new features)
npm version major   # 0.1.0 -> 1.0.0 (breaking changes)
npm publish
```

**Note**: `npm version` automatically updates `package.json` and creates a git tag.

### 6. Verify Publication

After publishing, verify at:

```
https://www.npmjs.com/package/fag-agent-sdk
```

Users can now install with:

```bash
npm install fag-agent-sdk
```

## Publishing to a Scope (Optional)

If you want to publish under an organization scope:

1. Update package name in `package.json`:

   ```json
   "name": "@your-org/fag-agent-sdk"
   ```

2. Publish with access flag:
   ```bash
   npm publish --access public
   ```

## Unpublishing (Emergency Only)

⚠️ **Warning**: Unpublishing is discouraged and can break users' builds.

If absolutely necessary:

```bash
npm unpublish fag-agent-sdk@0.1.0  # Unpublish specific version
npm unpublish fag-agent-sdk --force  # Unpublish all versions (only within 72 hours)
```

Better approach: Use `npm deprecate`:

```bash
npm deprecate fag-agent-sdk@0.1.0 "This version has a critical bug. Please upgrade to 0.1.1"
```

## Best Practices

1. **Versioning**: Follow [Semantic Versioning](https://semver.org/)

   - `MAJOR.MINOR.PATCH` (e.g., 1.2.3)
   - Breaking changes → major
   - New features → minor
   - Bug fixes → patch

2. **Release Notes**: Document changes in CHANGELOG.md or GitHub releases

3. **Testing**: Test the package after publishing:

   ```bash
   npm pack
   npm install ./fag-agent-sdk-0.1.0.tgz
   ```

4. **Continuous Publishing**: Consider setting up CI/CD for automatic publishing on tags

## Troubleshooting

### "Package name already exists"

- Choose a different name, or publish under a scope

### "You must verify your email"

- Verify your email at npmjs.com

### "403 Forbidden"

- Check that you're logged in: `npm whoami`
- Verify package name isn't taken

### Build errors

- Ensure all dependencies are in `devDependencies`
- Check that `dist/` folder exists after build

## Package.json Publishing Fields

Your `package.json` should include:

```json
{
  "name": "fag-agent-sdk",
  "version": "0.1.0",
  "description": "SDK widget component for FAQ Agent product",
  "author": "Your Name <your.email@example.com>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/your-username/fag-agent-sdk.git"
  },
  "keywords": ["react", "sdk", "widget", "component", "chat"],
  "files": ["dist"],
  "main": "./dist/index.cjs",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts"
}
```

## After Publishing

1. Update your GitHub repository (if applicable)
2. Create a release tag
3. Update documentation
4. Announce the package (Twitter, blog, etc.)

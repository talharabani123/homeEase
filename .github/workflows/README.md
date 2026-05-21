# GitHub Actions Workflows

This directory contains automated workflows for the HomeEase app.

## Available Workflows

### 1. CI - Lint and Test (`ci.yml`)
**Triggers:** Push to `main` or `develop`, Pull Requests

**What it does:**
- ✅ Lints code (if lint script exists)
- ✅ Checks for console.log statements
- ✅ Validates dependencies
- ✅ Checks for security vulnerabilities
- ✅ Validates JSON files (app.json, package.json)
- ✅ Attempts build check

**Status Badge:**
```markdown
![CI](https://github.com/YOUR_USERNAME/homeease/workflows/CI%20-%20Lint%20and%20Test/badge.svg)
```

---

### 2. Expo Preview Build (`expo-preview.yml`)
**Triggers:** Push to `develop`, Manual trigger

**What it does:**
- 📱 Creates Expo preview builds
- 🔗 Generates QR codes for testing
- 💬 Comments on PRs with preview links

**Setup Required:**
1. Get Expo access token: https://expo.dev/accounts/[account]/settings/access-tokens
2. Add to GitHub Secrets as `EXPO_TOKEN`
3. Uncomment the publish command in the workflow

---

### 3. Code Quality Checks (`code-quality.yml`)
**Triggers:** Pull Requests to `main` or `develop`

**What it does:**
- 📊 Analyzes file sizes
- 📈 Counts lines of code
- 📝 Finds TODO/FIXME comments
- 🔒 Checks for hardcoded secrets
- 📦 Analyzes imports

**Output:** Generates a summary in the PR

---

### 4. Dependency Updates (`dependency-update.yml`)
**Triggers:** Every Monday at 9 AM UTC, Manual trigger

**What it does:**
- 📦 Checks for outdated packages
- 🔒 Runs security audit
- 📊 Generates weekly report

---

## Setup Instructions

### Basic Setup (No configuration needed)
The following workflows work out of the box:
- ✅ CI - Lint and Test
- ✅ Code Quality Checks
- ✅ Dependency Updates

### Advanced Setup (Optional)

#### Enable Expo Preview Builds
1. Create an Expo account at https://expo.dev
2. Generate an access token
3. Add to GitHub repository:
   - Go to Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `EXPO_TOKEN`
   - Value: Your Expo access token
4. Uncomment the publish command in `expo-preview.yml`

---

## Adding Lint Script

To enable linting in CI, add this to your `package.json`:

```json
{
  "scripts": {
    "lint": "eslint src/ --ext .js,.jsx"
  }
}
```

Then install ESLint:
```bash
npm install --save-dev eslint
npx eslint --init
```

---

## Viewing Workflow Results

1. Go to your GitHub repository
2. Click the "Actions" tab
3. Select a workflow to see its runs
4. Click on a specific run to see details

---

## Customization

### Change Trigger Branches
Edit the `on` section in any workflow:
```yaml
on:
  push:
    branches: [ main, develop, feature/* ]
```

### Change Schedule
Edit the cron expression in `dependency-update.yml`:
```yaml
schedule:
  - cron: '0 9 * * 1'  # Every Monday at 9 AM UTC
```

### Add More Checks
Add new steps to any job:
```yaml
- name: My Custom Check
  run: |
    echo "Running custom check..."
    # Your commands here
```

---

## Troubleshooting

### Workflow not running?
- Check if Actions are enabled: Settings → Actions → General
- Verify branch names match the workflow triggers
- Check if you have permission to run workflows

### Build failing?
- Check the workflow logs for specific errors
- Ensure all dependencies are in package.json
- Verify Node.js version compatibility

### Need help?
- Check GitHub Actions documentation: https://docs.github.com/actions
- Review workflow logs for detailed error messages

---

## Best Practices

1. **Keep workflows fast** - Use caching for dependencies
2. **Fail fast** - Put quick checks first
3. **Use secrets** - Never commit tokens or passwords
4. **Test locally** - Use `act` to test workflows locally
5. **Monitor usage** - GitHub has free tier limits

---

## Future Enhancements

Consider adding:
- 🧪 Automated testing with Jest
- 📱 Automated EAS builds
- 🚀 Automated deployment to stores
- 📊 Code coverage reports
- 🔍 TypeScript type checking
- 📸 Visual regression testing

# Security Audit Documentation

## Overview

This project includes comprehensive security audit tools to ensure the safety and integrity of dependencies across the monorepo.

## Available Commands

### Root Level Commands

```bash
# Run security audit across all workspaces
npm run audit

# Run audit-ci for CI/CD environments (strict mode)
npm run audit:ci

# Automatically fix known audit issues
npm run audit:fix

# Check for unused dependencies
npm run depcheck

# Run combined security checks
npm run security-check

# Run comprehensive security audit with detailed reporting
npm run security-audit
```

### Individual Workspace Commands

Each workspace (apps/tedrisat, apps/teskilat, libs/common) supports:

```bash
# In any workspace directory
npm run audit
npm run audit:ci
npm run depcheck
```

## Configuration Files

### audit-ci.json
Configures audit-ci behavior:
- Sets vulnerability severity levels (low, moderate, high, critical)
- Defines retry logic
- Manages allowlists for known safe vulnerabilities

### .depcheckrc.json
Configures depcheck behavior:
- Ignores development dependencies and build tools
- Defines file patterns to analyze
- Configures parsers for different file types

## Automation

### GitHub Actions
The security audit workflow (`.github/workflows/security-audit.yml`) runs:
- On every push to main/develop branches
- On pull requests
- Daily at 2 AM UTC as a scheduled job
- On multiple Node.js versions (18.x, 20.x)

### Pre-commit Hooks
The pre-commit security hook (`.husky/pre-commit-security`) runs audit-ci before each commit to catch issues early.

## Security Levels

### audit-ci Severity Levels
- **Critical**: Immediate action required
- **High**: Should be fixed soon
- **Moderate**: Should be reviewed and fixed
- **Low**: Informational, consider fixing

### Depcheck Categories
- **Unused dependencies**: Dependencies listed in package.json but not used
- **Missing dependencies**: Used in code but not listed in package.json
- **Unused devDependencies**: Development dependencies that are not used

## Best Practices

1. **Run audits regularly**: Use `npm run security-check` before releases
2. **Fix critical and high vulnerabilities immediately**
3. **Review moderate vulnerabilities within a reasonable timeframe**
4. **Keep dependencies up to date**: Use `npm update` regularly
5. **Remove unused dependencies**: Run `npm run depcheck` and clean up unused packages

## Troubleshooting

### False Positives
If audit-ci reports false positives, you can:
1. Add package advisories to the allowlist in `audit-ci.json`
2. Update the package to a secure version
3. Find alternative packages

### Depcheck Issues
If depcheck reports false positives:
1. Add packages to `ignoreMatches` in `.depcheckrc.json`
2. Add file patterns to `ignorePatterns` for files that shouldn't be analyzed
3. Verify the package is actually unused before removing

### CI/CD Failures
If the security audit fails in CI/CD:
1. Check the audit results in the workflow logs
2. Fix critical and high vulnerabilities locally
3. Consider temporarily adding to allowlist for false positives
4. Re-run the workflow after fixes

## Integration with Development Workflow

The security audit is integrated into the development workflow at multiple points:
- **Pre-commit**: Basic security checks before code is committed
- **Pre-push**: Comprehensive security checks and tests before code is pushed
- **CI/CD**: Comprehensive checks on every push and PR
- **Scheduled**: Regular automated scans to catch new vulnerabilities
- **Manual**: Available for on-demand security reviews

This multi-layered approach ensures that security vulnerabilities are caught and addressed at the earliest possible stage.

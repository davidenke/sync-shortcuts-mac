# Sync shortcuts (mac)

Import and export custom keyboard shortcuts on macs.

> Right now this is no real sync, as existing shortcuts are overwritten.

## Usage

```bash
npx sync-shortcuts-mac

# force latest version and skip asking
npx -y sync-shortcuts-mac@latest ssm

# override existing shortcuts on import
npx -y sync-shortcuts-mac@latest ssm --overwrite
```

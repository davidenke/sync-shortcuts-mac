# Sync shortcuts (mac)

Import and export custom keyboard shortcuts on macs.

## Usage

```bash
npx sync-shortcuts-mac

# force latest version and skip asking
npx -y -p sync-shortcuts-mac@latest ssm

# override existing shortcuts on import
npx -y -p sync-shortcuts-mac@latest ssm --overwrite
```

> Changes take effect on the next login.
> To see the changes in the system settings, you might want to reboot.

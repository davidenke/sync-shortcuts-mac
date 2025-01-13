[![NPM Version](https://img.shields.io/npm/v/sync-shortcuts-mac?logo=npm&labelColor=%2324292e)](https://www.npmjs.com/package/sync-shortcuts-mac)
[![Build](https://github.com/davidenke/sync-shortcuts-mac/actions/workflows/release.yml/badge.svg)](https://github.com/davidenke/sync-shortcuts-mac/actions/workflows/release.yml)

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

> Changes take effect on the next login.\
> To see the changes in the system settings, you might want to reboot.

#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { unlink, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { resolve } from 'node:path';
import { stdout } from 'node:process';

import { askChoices } from './utils/ask-choices.js';
import { askPath } from './utils/ask-path.js';
import { cyan, eraseLines, green, red, yellow } from './utils/tty.js';

// out custom interchange format for all files as base64
type Shortcuts = {
  globals: string;
  apps: string;
  services: string;
};

// some constants
const PATHS = {
  globals: {
    path: '~/Library/Preferences/com.apple.symbolichotkeys.plist',
    name: 'global hot keys',
  },
  apps: {
    path: '~/Library/Preferences/.GlobalPreferences.plist',
    name: 'app shortcuts',
  },
  services: {
    path: '~/Library/Preferences/pbs.plist',
    name: 'service shortcuts',
  },
} satisfies {
  [kry in keyof Shortcuts]: {
    path: string;
    name: string;
  };
};

// determine action
const choices = { import: 'import shortcuts', export: 'export shortcuts' };
const choice = await askChoices('What do you want to do?', Object.values(choices));
const chosen = Object.keys(choices)[choice] as keyof typeof choices;

// clear the question and answer
stdout.write(eraseLines(3));

// export shortcuts
if (chosen === 'export') {
  // prepare object to store all shortcuts
  const shortcuts: Partial<Shortcuts> = {};

  // handle all configured paths
  Object.entries(PATHS).map(([key, { path, name }]) => {
    // start logging and prepare path within home directory
    stdout.write(`${cyan('>')} Exporting ${name} `);
    const from = resolve(path.replace('~', homedir()));

    // check if file exists and read it
    if (existsSync(from)) {
      shortcuts[key as keyof Shortcuts] = readFileSync(from, { encoding: 'base64' });
      stdout.write(`${green('✓')}\n`);
    } else {
      stdout.write(`${red('✗')}\n`);
    }
  });

  // store the result in user home
  const path = '~/shortcuts.json';
  const to = resolve(path.replace('~', homedir()));
  if (existsSync(to)) await unlink(to);
  await writeFile(to, JSON.stringify(shortcuts, null, 2));
  console.log(`${green('✓')} Exported shortcuts to ${cyan(path)}`);
}

// import shortcuts
if (chosen === 'import') {
  const path = await askPath('Enter the path to the shortcuts file');
  if (!path || !existsSync(path)) {
    console.log(red('✗'), 'Invalid path');
    process.exit(1);
  }

  const shortcuts = JSON.parse(readFileSync(path, { encoding: 'utf-8' })) as Shortcuts;

  // TODO: make it a real sync using the plist module and by checking if shortcuts
  //       are already present in the target file to not override everything
  Object.entries(shortcuts).map(([key, value]) => {
    if (!(key in PATHS)) {
      console.warn(yellow('⚠'), `Unknown key ${key}`);
      return;
    }

    const { path, name } = PATHS[key as keyof Shortcuts];
    const to = resolve(path.replace('~', homedir()));
    stdout.write(`${cyan('>')} Importing ${name} `);
    writeFileSync(to, Buffer.from(value, 'base64'));
    stdout.write(`${green('✓')}\n`);
  });
}

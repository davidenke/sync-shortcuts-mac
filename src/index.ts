#!/usr/bin/env node

import { existsSync } from 'node:fs';
import { readdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { resolve } from 'node:path';
import { stdout } from 'node:process';
import { parseArgs } from 'node:util';

import plist from 'simple-plist';

import { askChoices } from './utils/ask-choices.js';
import { askPath } from './utils/ask-path.js';
import { cyan, eraseLines, green, red, yellow } from './utils/tty.js';

// our simple interchangeable shortcuts format
type PlistName = string;
type MenuName = string;
type Keys = string;
type Shortcuts = Record<PlistName, Record<MenuName, Keys>>;

// signature to check in apples settings files
type WithShortcuts = { NSUserKeyEquivalents: Record<MenuName, Keys> };

// where to find and store the shortcuts
const PATH = '~/Library/Preferences';

const { values } = parseArgs({ options: { overwrite: { type: 'boolean' } } });
const overwriteExistingBindings = values.overwrite ?? false;

// determine action
const choices = { import: 'import shortcuts', export: 'export shortcuts' };
const choice = await askChoices('What do you want to do?', Object.values(choices));
const chosen = Object.keys(choices)[choice] as keyof typeof choices;

// clear the question and answer
stdout.write(eraseLines(3));

// find custom application shortcuts in related plist files in
// ~/Library/Preferences/*.plist by checking the existence of
// the key `NSUserKeyEquivalents`...
if (chosen === 'export') {
  // handle all configured paths
  const preferences = await readdir(resolve(PATH.replace('~', homedir())), { withFileTypes: true });
  const plists = preferences.filter(file => file.isFile() && file.name.endsWith('.plist'));
  const shortcuts = plists.reduce((shorts, file) => {
    const path = resolve(file.parentPath, file.name);
    const { NSUserKeyEquivalents } = plist.readFileSync<WithShortcuts>(path);
    if (!NSUserKeyEquivalents) return shorts;
    console.info(`${green('✓')} Exported ${cyan(file.name)}`);
    return { ...shorts, [file.name]: NSUserKeyEquivalents };
  }, {} as Shortcuts);

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

  // merge the shortcuts into the existing settings, if found
  const shortcuts = JSON.parse(await readFile(path, { encoding: 'utf-8' })) as Shortcuts;
  Object.entries(shortcuts).map(([name, importedBindings]) => {
    const to = resolve(PATH.replace('~', homedir()), name);
    try {
      const content = plist.readFileSync<WithShortcuts>(to);
      const NSUserKeyEquivalents = !overwriteExistingBindings
        ? { ...content.NSUserKeyEquivalents, ...importedBindings }
        : importedBindings;
      plist.writeFileSync(to, { ...content, NSUserKeyEquivalents });
      const method = overwriteExistingBindings ? 'Overwritten' : 'Imported';
      console.log(`${green('✓')} ${method} ${cyan(name)}`);
    } catch (_) {
      console.warn(`${yellow('⚠')} No settings file found for ${cyan(to)}`);
    }
  });
}

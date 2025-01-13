import { type Dirent } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { parse, sep } from 'node:path';
import { stdin, stdout } from 'node:process';
import { type AsyncCompleter, createInterface } from 'node:readline';

import { cyan } from './tty.js';

export type AskPathOptions = {
  input: NodeJS.ReadStream;
  output: NodeJS.WriteStream;
};

export async function askPath(
  question: string,
  { input = stdin, output = stdout }: Partial<AskPathOptions> = {},
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const completer: AsyncCompleter = async (line, callback) => {
      // eslint-disable-next-line prefer-const
      let { base, dir } = parse(line);

      try {
        const entries = await readdir(dir, { withFileTypes: true });
        let matches: Dirent[] = [];

        // for an exact match that is a directory, read the contents of the directory
        if (entries.find(entry => entry.name === base && entry.isDirectory())) {
          dir = [sep, '/'].includes(dir) ? `${dir}${base}` : `${dir}/${base}`;
          matches = await readdir(dir, { withFileTypes: true });
        } else {
          matches = entries.filter(({ name }) => name.startsWith(base));
        }

        dir = [sep, '/'].includes(dir) ? '' : dir;
        const hits = matches
          .filter(entry => entry.isFile() || entry.isDirectory())
          .map(entry => {
            const ending = entry.isDirectory() && !entry.name.endsWith('/');
            return `${dir}/${entry.name}${ending ? '/' : ''}`;
          });
        callback(null, [hits, line]);
      } catch (_) {
        callback(null, [[], line]);
      }
    };
    const readline = createInterface({
      input,
      output,
      prompt: cyan('> '),
      completer,
    });
    console.log(question);
    readline.on('line', line => {
      resolve(line);
      readline.close();
    });
    readline.on('close', reject);
    readline.prompt();
  });
}

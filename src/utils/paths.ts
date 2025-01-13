import { homedir } from 'node:os';
import { join, resolve as resolvePath } from 'node:path';

export function resolve(...slugs: string[]): string {
  return resolvePath(join(...slugs).replace('~', homedir()));
}

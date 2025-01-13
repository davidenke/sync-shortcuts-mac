export const cyan = (text: string): string => `\x1b[36m${text}\x1b[0m`;
export const green = (text: string): string => `\x1b[32m${text}\x1b[0m`;
export const red = (text: string): string => `\x1b[31m${text}\x1b[0m`;
export const yellow = (text: string): string => `\x1b[33m${text}\x1b[0m`;

export const eraseLines = (n: number) =>
  n ? `\u001B[2K${'\u001B[2K\u001B[1A'.repeat(n - 1)}\u001B[G` : '';

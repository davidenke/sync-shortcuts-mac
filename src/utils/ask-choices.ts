import { stdin, stdout } from 'node:process';
import { emitKeypressEvents } from 'node:readline';

import { cyan, eraseLines } from './tty.js';

export type AskChoicesOptions = {
  input: NodeJS.ReadStream;
  output: NodeJS.WriteStream;
};

export async function askChoices(
  question: string,
  choices: string[],
  { input = stdin, output = stdout }: Partial<AskChoicesOptions> = {},
): Promise<number> {
  return new Promise<number>((resolve, reject) => {
    let isFirst = true;
    let selected = 0;

    const drawChoices = () => {
      if (!isFirst) {
        output.write(eraseLines(choices.length));
      }
      choices.forEach((choice, i) => {
        const before = i === selected ? cyan('> ') : '  ';
        const after = i !== choices.length - 1 ? '\n' : '';
        output.write(`${before}${choice}${after}`);
      });
      isFirst = false;
    };

    console.log(question);
    drawChoices();
    emitKeypressEvents(input);
    input.setRawMode(true);
    input.resume();
    input.on('keypress', (_, key) => {
      if (key) {
        if (key.name === 'down' && selected < choices.length - 1) {
          selected += 1;
          drawChoices();
        } else if (key.name === 'up' && selected > 0) {
          selected -= 1;
          drawChoices();
        } else if (key.name === 'escape' || (key.name === 'c' && key.ctrl)) {
          input.setRawMode(false);
          input.pause();
          reject();
        } else if (key.name === 'return') {
          input.setRawMode(false);
          input.pause();
          resolve(selected);
        }
      }
    });
  });
}

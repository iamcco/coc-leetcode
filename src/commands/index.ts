import { Dispose } from '../util/dispose';
import { commands } from 'coc.nvim';
import { extensionName } from '../util/constant';
import { interpret } from './interpret';
import { login } from './login';
import { submit } from './submit';
import { openComments } from './comments';

export class Commands extends Dispose {
  constructor(private language: string) {
    super();
    this.push(commands.registerCommand(`${extensionName}.login`, login));
    this.push(commands.registerCommand(`${extensionName}.run`, () => interpret(language)));
    this.push(commands.registerCommand(`${extensionName}.submit`, () => submit(language)));
    this.push(commands.registerCommand(`${extensionName}.comments`, openComments));
  }
}

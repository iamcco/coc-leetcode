import { Dispose } from '../util/dispose';
import { commands } from 'coc.nvim';
import { extensionName } from '../util/constant';
import { interpret } from './interpret';
import { login } from './login';
import { submit } from './submit';

export class Commands extends Dispose {
  constructor() {
    super();
    this.push(commands.registerCommand(`${extensionName}.login`, login));
    this.push(commands.registerCommand(`${extensionName}.run`, interpret));
    this.push(commands.registerCommand(`${extensionName}.submit`, submit));
  }
}

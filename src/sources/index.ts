import { listManager } from 'coc.nvim';

import { Dispose } from '../util/dispose';
import LeetcodeList from './problems';

export class SourceList extends Dispose {
  constructor() {
    super();
    this.push(listManager.registerList(new LeetcodeList()));
  }
}

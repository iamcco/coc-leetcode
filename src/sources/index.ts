import { listManager, ExtensionContext } from 'coc.nvim';

import { Dispose } from '../util/dispose';
import LeetcodeList from './problems';

export class SourceList extends Dispose {
  constructor(context: ExtensionContext) {
    super();
    this.push(listManager.registerList(new LeetcodeList(context)));
  }
}

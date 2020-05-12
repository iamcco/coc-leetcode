import { workspace } from 'coc.nvim';

import { leetcode } from '../leetcode';

export const login = async () => {
  const userName = await workspace.requestInput('UserName: ');
  if (!userName) {
    return;
  }
  const password = await workspace.requestInput('Password: ');
  if (!password) {
    return;
  }
  leetcode.login.request(userName, password);
};

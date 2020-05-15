import { workspace } from 'coc.nvim';

import { leetcode } from '../leetcode';
import { notification } from '../lib/notification';
import { MessageType } from '../lib/notification/message';

export const login = async () => {
  const userName = await workspace.requestInput('UserName');
  if (!userName) {
    return;
  }
  const password = await workspace.requestInput('Password');
  if (!password) {
    return;
  }
  const res = await leetcode.login.request(userName, password);
  if (res && res.data && res.data.authSignInWithPassword && res.data.authSignInWithPassword.ok) {
    notification.show(['登录成功'], 2000, MessageType.success);
  }
};

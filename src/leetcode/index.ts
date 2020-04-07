import { Dispose } from '../util/dispose';
import { Login } from './api/login';
import { Problems } from './api/problems';

class Leetcode extends Dispose {
  login: Login = new Login();
  problems: Problems = new Problems();

  constructor() {
    super();
    this.push(this.login, this.problems);
  }

  dispose() {
    if (this.subscriptions) {
      this.subscriptions.forEach(item => {
        item.dispose();
      });
    }
  }
}

export const leetcode = new Leetcode();

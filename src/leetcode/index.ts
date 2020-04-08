import { Dispose } from '../util/dispose';
import { Login } from './api/login';
import { Problems } from './api/problems';
import { Detail } from './api/problems/detail';

class Leetcode extends Dispose {
  login: Login = new Login();
  problems: Problems = new Problems();
  problemDetail: Detail = new Detail();

  constructor() {
    super();
    this.push(this.login, this.problems, this.problemDetail);
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

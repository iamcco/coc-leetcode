import { Base } from './base';
import { Method } from 'axios';

export class Login extends Base {
  readonly method: Method = 'POST';
  readonly url: string = 'https://leetcode-cn.com/graphql/';
  private readonly query: string = `"query":"mutation signInWithPassword($data: AuthSignInWithPasswordInput!) {
      authSignInWithPassword(data: $data) {
      ok
      __typename
      }
    }
  "`.replace(/\n/g, '\\n');
  private graphql(username: string, password: string) {
    return `
      {
        "operationName": "signInWithPassword",
         "variables":
            {
              "data":{
                "username":"${username}",
                "password":"${password}"
              }
            },
          ${this.query}
      }
    `;
  }

  getParams(username: string, password: string) {
    return this.graphql(username, password);
  }

  async request(username: string, password: string) {
    return super.request(username, password);
  }
}

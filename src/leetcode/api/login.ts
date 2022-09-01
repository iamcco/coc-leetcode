import { Base } from './base';
import { graphqlTag } from '../../util/string';

export class Login extends Base {
  readonly method = 'POST';
  readonly url: string = 'https://leetcode.cn//graphql/';
  private readonly query: string = graphqlTag`
    "query":"mutation signInWithPassword($data: AuthSignInWithPasswordInput!) {
        authSignInWithPassword(data: $data) {
        ok
        __typename
        }
      }
    "`;
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

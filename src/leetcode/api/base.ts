import { state } from '../../state';
import axios, { Method } from 'axios';
import { Dispose } from '../../util/dispose';
import { logger } from '../../util/logger';
import {notification} from '../../lib/notification';
import {MessageType} from '../../lib/notification/message';

const log = logger.getlog('Api');

export class Base extends Dispose {
  protected method: Method = 'GET';
  protected url = 'https://leetcode-cn.com/graphql/';
  protected readonly headers: Record<string, string> = {};

  protected getHeaders() {
    return {
      'Content-Type': 'application/json;charset=utf-8',
      Referer: 'https://leetcode-cn.com/',
      'x-csrftoken': state.csrftoken,
      cookie: state.cookies,
      ...this.headers,
    };
  }

  protected getParams(...args: any[]): string | undefined;
  protected getParams(): string | undefined {
    return;
  }

  public request(...args: any[]): Promise<any> {
    const data = this.getParams(...args);
    const headers = this.getHeaders();
    log(`request: [${this.method}] ${this.url}`);
    log(`request-headers: ${JSON.stringify(headers, null, 2)}`);
    log(`request-params: ${data}`);
    return axios({
      method: this.method,
      url: this.url,
      headers: this.getHeaders(),
      data,
    })
      .then(res => {
        state.updateByHeaders(res.headers);
        log(`response-data: [${this.method}] ${this.url}`);
        log(`response-data: ${JSON.stringify(res.data)}`);
        return res.data;
      })
      .catch(err => {
        if (/Request failed with status code 403/.test(err.message)) {
          notification.show(['需要登录'], 2000, MessageType.fail)
        }
        log(`response-err: [${this.method}] ${this.url}`);
        log(`response-err: ${JSON.stringify(err)}`);
        throw err;
      });
  }
}

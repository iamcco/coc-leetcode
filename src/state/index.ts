import { Dispose } from '../util/dispose';
import { logger } from '../util/logger';
import { writeFileSync } from 'fs';
import { readFile, exists, mkdir } from '../util/fs';
import { join } from 'path';

const log = logger.getlog('State');

export class State extends Dispose {
  private dataPath: string | undefined;
  private _csrftoken = '';
  private _cookies: string[] = [];

  get cookies(): string {
    return this._cookies.join('; ');
  }

  get csrftoken(): string {
    return this._csrftoken;
  }

  public async init(dataPath: string) {
    if (!dataPath) {
      return;
    }
    const isExists = await exists(dataPath);
    if (!isExists) {
      await mkdir(dataPath);
    }
    this.dataPath = join(dataPath, 'state');
    try {
      const isExists = await exists(this.dataPath);
      if (!isExists) {
        return;
      }
      const data = (await readFile(this.dataPath)).toString();
      const info = JSON.parse(data);
      this._csrftoken = info.csrftoken || '';
      this._cookies = info.cookies || ([] as string[]);
      log(`State init from: ${this.dataPath}`);
    } catch (error) {
      log(`State init Fail: ${error.message}`);
    }
  }

  public updateByHeaders(headers: Record<string, string | string[]>) {
    if (headers['set-cookie']) {
      (headers['set-cookie'] as string[]).forEach(cookie => {
        this._cookies.push(cookie.split(';')[0]);
      });
    }
    this._cookies.some(cookie => {
      if (cookie.startsWith('csrftoken')) {
        this._csrftoken = cookie.split('=')[1];
        return true;
      }
      return false;
    });
  }

  serialize() {
    if (this.dataPath) {
      const info = JSON.stringify({
        csrftoken: this._csrftoken,
        cookies: this._cookies,
      });
      try {
        writeFileSync(this.dataPath, info);
      } catch (error) {
        log(`serialize fail: ${error.message}`);
      }
    }
  }

  dispose() {
    super.dispose();
    this.dataPath = undefined;
    this._csrftoken = '';
    this._cookies = [];
  }
}

export const state = new State();

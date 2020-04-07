import { OutputChannel, workspace } from 'coc.nvim';
import { Dispose } from './dispose';
import { extensionName } from './constant';

export type logLevel = 'off' | 'messages' | 'verbose';

class Logger extends Dispose {
  private _outchannel: OutputChannel | undefined;
  private _traceServer: logLevel | undefined;

  init(level: logLevel) {
    this._traceServer = level;
    if (this._traceServer !== 'off') {
      this._outchannel = workspace.createOutputChannel(extensionName);
      this.push(this._outchannel);
    }
  }

  set outchannel(channel: OutputChannel | undefined) {
    this._outchannel = channel;
  }

  get outchannel(): OutputChannel | undefined {
    return this._outchannel;
  }

  get traceServer(): logLevel | undefined {
    return this._traceServer;
  }

  getlog(name: string): (message: string | undefined) => void {
    return (message: string | undefined) => {
      message && this._outchannel && this._outchannel.appendLine(`[${name}]: ${message}`);
    };
  }

  dispose() {
    super.dispose();
    this._outchannel = undefined;
    this._traceServer = undefined;
  }
}

export const logger = new Logger();

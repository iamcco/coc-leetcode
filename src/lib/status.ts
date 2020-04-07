import { StatusBarItem, workspace } from 'coc.nvim';
import { Dispose } from '../util/dispose';
import { extensionName } from '../util/constant';
import { logger } from '../util/logger';

const log = logger.getlog('statusBar');

class StatusBar extends Dispose {
  private statusBar: StatusBarItem | undefined = undefined;

  init() {
    this.statusBar = workspace.createStatusBarItem(0, { progress: false });
    this.push(this.statusBar);

    this.push(
      workspace.registerAutocmd({
        event: 'BufEnter',
        request: false,
        callback: async () => {
          const doc = await workspace.document;
          if (!doc) {
            return;
          }
          try {
            const bufInfo = await doc.buffer.getVar(extensionName);
            if (bufInfo) {
              this.show('Leetcode');
            } else {
              this.hide();
            }
          } catch (error) {
            log((error as Error).message);
          }
        },
      }),
    );
  }

  show(message: string, isProgress?: boolean) {
    if (this.statusBar) {
      this.statusBar.text = message;
      if (isProgress !== undefined) {
        this.statusBar.isProgress = isProgress;
      }
      this.statusBar.show();
    }
  }

  hide() {
    if (this.statusBar) {
      this.statusBar.hide();
    }
  }

  progress(isProgress = true) {
    if (this.statusBar) {
      this.statusBar.isProgress = isProgress;
    }
  }

  dispose() {
    super.dispose();
    this.statusBar = undefined;
  }
}

export const statusBar = new StatusBar();

import { ExtensionContext, workspace } from 'coc.nvim';

import { logger, logLevel } from './util/logger';
import { SourceList } from './sources';
import { extensionName } from './util/constant';
import { state } from './state';

export async function activate(context: ExtensionContext): Promise<void> {
  const config = workspace.getConfiguration(extensionName);
  const isEnabled = config.get<boolean>('enabled', true);

  // if not enabled then return
  if (!isEnabled) {
    return;
  }

  context.subscriptions.push(logger);
  // logger init
  logger.init(config.get<logLevel>('trace.server', 'off'));

  context.subscriptions.push(state);
  // state init
  state.init(context.storagePath);

  // register sources
  context.subscriptions.push(new SourceList());
}

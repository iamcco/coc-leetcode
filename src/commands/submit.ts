/* eslint-disable @typescript-eslint/camelcase */
import { workspace } from 'coc.nvim';

import { extensionName } from '../util/constant';
import { ProblemDetail } from '../leetcode/api/problems/detail';
import { statusBar } from '../lib/status';
import { notification } from '../lib/notification';
import { MessageType } from '../lib/notification/message';
import { logger } from '../util/logger';
import { Submit, CheckResult } from '../leetcode/api/problems/submit';

const log = logger.getlog('Interpret');

const formatPercent = (percent: number): string => {
  const items = `${percent}`.split('.');
  return `${items[0]}${items[1] ? `.${items[1].slice(0, 2)}` : ''}`;
};

export const submit = async () => {
  const doc = await workspace.document;
  if (!doc) {
    return;
  }
  const buffer = doc.buffer;
  if (!buffer) {
    return;
  }
  log(`buffer ${buffer.id}`);
  const leetcodeInfo = await buffer.getVar(extensionName);
  if (!leetcodeInfo) {
    log(`it is not leetcode buffer`);
    return;
  }
  const code = await buffer.getLines();
  let problemDetail: ProblemDetail | undefined;
  try {
    problemDetail = JSON.parse(leetcodeInfo as string);
  } catch (error) {
    log(`problem detail: ${leetcodeInfo}`);
    log(`problem detail parse fail: ${error.message}`);
  }
  statusBar.progress(true);
  const interpret = new Submit();
  let res: CheckResult;
  try {
    res = await interpret.request({
      lang: 'javascript',
      questionSlug: problemDetail!.titleSlug,
      question_id: problemDetail!.questionId,
      typed_code: code.join('\n'),
      test_mode: false,
      test_judger: '',
    });
    if (res.run_success) {
      notification.show(
        [
          ` 执行用时: ${res.status_runtime}, JavaScript 击败 ${formatPercent(res.runtime_percentile)}% 用户`,
          ` 内存消耗: ${res.status_memory}, JavaScript 击败 ${formatPercent(res.memory_percentile)}% 的用户`,
        ],
        10000,
        MessageType.success,
      );
    } else {
      notification.show([` 解答未通过`], 10000, MessageType.fail);
    }
  } catch (error) {
    log(`submit fail ${error.message}`);
  } finally {
    statusBar.progress(false);
  }
};

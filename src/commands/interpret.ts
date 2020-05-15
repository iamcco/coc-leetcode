/* eslint-disable @typescript-eslint/camelcase */
import { workspace } from 'coc.nvim';

import { extensionName } from '../util/constant';
import { ProblemDetail } from '../leetcode/api/problems/detail';
import { statusBar } from '../lib/status';
import { Interpret, CheckResult } from '../leetcode/api/problems/interpret';
import { notification } from '../lib/notification';
import { MessageType } from '../lib/notification/message';
import { logger } from '../util/logger';

const log = logger.getlog('Interpret');

export const interpret = async (lang: string) => {
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
  const interpret = new Interpret(problemDetail!.titleSlug);
  let res: [CheckResult, CheckResult];
  try {
    res = await interpret.request({
      question_id: problemDetail!.questionId,
      lang,
      typed_code: code.join('\n'),
      data_input: problemDetail!.sampleTestCase,
      test_mode: false,
      judge_type: problemDetail!.judgeType,
      test_judger: '',
    });
  } catch (error) {
    log(`run fail ${error.message}`);
  } finally {
    statusBar.progress(false);
  }
  if (!res!) {
    return;
  }
  const actual = (res![1].code_answer || []).join(',');
  const expect = (res![0].code_answer || []).join(',');
  notification.show(
    [
      ` 执行时间: ${res![1].status_runtime}`,
      ` 输入: ${(problemDetail!.sampleTestCase || '').split('\n').join(',')}`,
      ` 预期结果: ${expect}`,
      ` 输出: ${actual}`,
    ],
    10000,
    actual === expect ? MessageType.success : MessageType.fail,
  );
};

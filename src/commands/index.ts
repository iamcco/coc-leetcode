/* eslint-disable @typescript-eslint/camelcase */
import { Dispose } from '../util/dispose';
import { commands, workspace } from 'coc.nvim';
import { extensionName } from '../util/constant';
import { logger } from '../util/logger';
import { Interpret, CheckResult } from '../leetcode/api/problems/interpret';
import { ProblemDetail } from '../leetcode/api/problems/detail';
import { statusBar } from '../lib/status';
import { notification } from '../lib/notification';
import { leetcode } from '../leetcode';
import { MessageType } from '../lib/notification/message';

const log = logger.getlog('Run');

export class Commands extends Dispose {
  constructor() {
    super();
    this.push(
      commands.registerCommand(`${extensionName}.login`, async () => {
        const userName = await workspace.requestInput('UserName: ');
        if (!userName) {
          return;
        }
        const password = await workspace.requestInput('Password: ');
        if (!password) {
          return;
        }
        leetcode.login.request(userName, password);
      }),
    );
    this.push(
      commands.registerCommand(`${extensionName}.run`, async () => {
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
            lang: 'javascript',
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
            ` 输出: ${expect}`,
            ` 预期结果: ${actual}`,
          ],
          10000,
          actual === expect ? MessageType.success : MessageType.fail,
        );
      }),
    );
  }
}

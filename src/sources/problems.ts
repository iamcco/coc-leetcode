import { IList, ListAction, ListContext, ListTask, ListItem, workspace, ExtensionContext } from 'coc.nvim';
import path from 'path';
import colors from 'colors/safe';
import { EventEmitter } from 'events';

import { leetcode } from '../leetcode';
import { ProblemLevel, Problem } from '../leetcode/api/problems';
import { logger } from '../util/logger';
import { screenPadEnd } from '../util/string';
import { extensionName, langs } from '../util/constant';
import { exists, mkdir } from '../util/fs';

const log = logger.getlog('source-problems');

const getCodeByType = (type: string, codes: Array<{ langSlug: string; code: string }>): string => {
  if (!codes || !codes.length) {
    return '';
  }
  for (const item of codes) {
    if (item.langSlug === type) {
      return item.code;
    }
  }
  return codes[0] && codes[0].code;
};

class Task extends EventEmitter implements ListTask {
  constructor() {
    super();
    this.start();
  }

  async start() {
    try {
      const data = await leetcode.problems.request();
      data.problems.forEach(problem => {
        this.emit('data', {
          label: `${colors.green(screenPadEnd(problem.status === 'ac' ? '*' : '', 3, ' '))}${screenPadEnd(
            problem.stat.frontend_question_id || '',
            15,
            ' ',
          )}  ${colors.blue(
            screenPadEnd(problem.stat.question__title_cn || problem.stat.question__title, 40, ' '),
          )} ${screenPadEnd(`${problem.stat.total_acs}`, 10, ' ')}  ${screenPadEnd(
            ((problem.stat.total_acs / problem.stat.total_submitted) * 100).toFixed(1) + '%',
            10,
            ' ',
          )} ${screenPadEnd(ProblemLevel[problem.difficulty.level], 8, ' ')} ${problem.paid_only ? '🔒' : ''}`,
          data: problem,
        } as ListItem);
      });
      this.done();
    } catch (error) {
      log(`fetch problems: ${error.stack} ${error.message}`);
      this.done();
    }
  }

  done() {
    this.emit('end');
  }

  dispose() {
    this.emit('end');
  }
}

export default class LeetcodeList implements IList {
  public readonly name = 'LeetcodeProblems';
  public readonly interactive = false;
  public readonly description = 'Problems of leetcode-cn';
  public readonly defaultAction = 'open';
  public actions: ListAction[] = [
    {
      name: 'open',
      persist: false,
      execute: async (item: ListItem | ListItem[]) => {
        const selectItem = ([] as ListItem[]).concat(item).shift();
        if (!selectItem || !selectItem.data) {
          return;
        }
        const problem = selectItem.data as Problem;
        const detail = await problem.getDetail();
        const nvim = workspace.nvim;
        const detailString = JSON.stringify(JSON.stringify(detail));
        let isExists = await exists(this.context.storagePath);
        if (!isExists) {
          try {
            await mkdir(this.context.storagePath);
          } catch (error) {
            log(`mkdir fail: ${error}`);
          }
        }
        const filePath = path.join(this.context.storagePath, `${detail.titleSlug}.${langs[this.language][0]}`);
        isExists = await exists(filePath);
        nvim.pauseNotification();
        // open new tab
        nvim.command('tabnew', true);
        nvim.command(`edit ${problem.stat.question__title_slug}.md`, true);
        nvim.command('setl buftype=nofile foldmethod=syntax nobuflisted noswapfile bufhidden=wipe wrap', true);
        nvim.command('setf markdown', true);
        nvim.call(
          'append',
          [
            0,
            [
              `# ${detail.questionId} ${detail.translatedTitle}`,
              '',
              `> 难度: ${detail.difficulty} | 通过率：${detail.stats.acRate} | 通过次数：${detail.stats.totalAcceptedRaw} | 提交次数：${detail.stats.totalSubmissionRaw}`,
              '',
              ...detail.translatedContent.split(/\r\n|\n/),
            ],
          ],
          true,
        );
        nvim.command('normal! gg', true);
        nvim.command(`let b:${extensionName}=${detailString}`, true);
        // create content
        nvim.command(`leftabove vsplit ${filePath}`, true);
        nvim.command('setl nobuflisted bufhidden=wipe', true);
        nvim.command(`setf ${langs[this.language][1]}`, true);
        if (!isExists) {
          nvim.call('append', [0, getCodeByType(this.language, detail.codeSnippets).split(/\r\n|\n/)], true);
          nvim.command(`setl nomodified`, true);
        }
        nvim.command('normal! gg', true);
        nvim.command(`let b:${extensionName}=${detailString}`, true);
        await nvim.resumeNotification(false, false);
      },
    },
  ];

  constructor(private context: ExtensionContext, private language: string) {}

  public async loadItems(context: ListContext): Promise<ListTask | ListItem[]> {
    log(`input: ${context.input}`);
    return new Task();
  }
}

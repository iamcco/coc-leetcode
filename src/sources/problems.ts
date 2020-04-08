import { IList, ListAction, ListContext, ListTask, ListItem, workspace, Disposable } from 'coc.nvim';
import colors from 'colors/safe';
import { EventEmitter } from 'events';
import { leetcode } from '../leetcode';
import { ProblemLevel, Problem } from '../leetcode/api/problems';
import { logger } from '../util/logger';
import { screenPadEnd } from '../util/string';

const log = logger.getlog('source-problems');

const getCodeByType = (type: string, codes: Array<{ langSlug: string; code: string }>): string => {
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
          )} ${ProblemLevel[problem.difficulty.level]}`,
          data: problem,
        } as ListItem);
      });
      this.done();
    } catch (error) {
      log(`fetch problems: ${error.stack} ${error.message}`);
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
        // create commit buffer
        nvim.command(`leftabove vsplit leetcode://${detail.titleSlug}.js`, true);
        nvim.command('setl nobuflisted noswapfile bufhidden=wipe', true);
        nvim.command('setf javascript', true);
        nvim.call('append', [0, getCodeByType('javascript', detail.codeSnippets).split(/\r\n|\n/)], true);
        nvim.command(`setl nomodified`, true);
        nvim.command('normal! gg', true);
        await nvim.resumeNotification(false, false);

        let subscription: Disposable[] = [];
        const sub = Disposable.create(() => {
          if (subscription && subscription.length) {
            subscription.forEach(item => {
              item.dispose();
            });
            subscription = [];
          }
        });
        subscription.push(
          workspace.registerAutocmd({
            event: 'WinClosed <buffer>',
            pattern: '',
            request: false,
            callback: async () => {
              // unregister autocmd
              sub.dispose();
              // close tab
              const tab = await nvim.tabpage;
              const windows = await tab.windows;
              if (windows.length > 1) {
                await nvim.command('tabclose');
              }
            },
          } as any),
          workspace.registerAutocmd({
            event: 'BufWriteCmd <buffer>',
            pattern: '',
            request: true,
            callback: async () => {
              // set buffer nomodified
              await nvim.command('setl nomodified');
            },
          }),
        );
      },
    },
  ];

  public async loadItems(context: ListContext): Promise<ListTask | ListItem[]> {
    log(`input: ${context.input}`);
    const task = new Task();
    setTimeout(() => {
      task.start();
    }, 150);
    return task;
  }
}

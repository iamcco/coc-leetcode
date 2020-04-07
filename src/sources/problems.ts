import { IList, ListAction, ListContext, ListTask, ListItem, workspace } from 'coc.nvim';
import colors from 'colors/safe';
import { EventEmitter } from 'events';
import { leetcode } from '../leetcode';
import { ProblemLevel } from '../leetcode/api/problems';
import { logger } from '../util/logger';
import { screenPadEnd } from '../util/string';

const log = logger.getlog('source-problems');

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
      execute: (item: ListItem | ListItem[]) => {
        const items = ([] as ListItem[]).concat(item);
        items.forEach(item => {
          workspace.showMessage(item.label);
        });
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

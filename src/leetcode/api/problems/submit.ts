import { Base } from '../base';

interface Params {
  lang: string;
  questionSlug: string;
  question_id: string;
  test_judger: string;
  test_mode: boolean;
  typed_code: string;
}

enum CheckState {
  success = 'SUCCESS',
  pending = 'PENDING',
  started = 'STARTED',
}

export interface CheckResult {
  code_output: string;
  compare_result: string;
  elapsed_time: number;
  fast_submit: boolean;
  finished: boolean;
  lang: string;
  last_testcase: string;
  memory: number;
  memory_percentile: number;
  pretty_lang: string;
  question_id: string;
  run_success: boolean;
  runtime_percentile: number;
  state: CheckState;
  status_code: number;
  status_memory: string;
  status_msg: string;
  status_runtime: string;
  std_output: string;
  submission_id: string;
  task_finish_time: number;
  task_name: string;
  total_correct: number;
  total_testcases: number;
}

class CheckRun extends Base {
  method = 'GET';

  constructor(id: number) {
    super();
    this.url = `https://leetcode-cn.com/submissions/detail/${id}/check/`;
  }

  check(): Promise<CheckResult> {
    return new Promise(async resolve => {
      const check = async () => {
        const res: CheckResult = await this.request();
        if (res.state === CheckState.success) {
          resolve(res);
        } else {
          setTimeout(check, 1000);
        }
      };
      check();
    });
  }
}

export class Submit extends Base {
  method = 'POST';

  constructor() {
    super();
    this.url = `https://leetcode-cn.com/problems/two-sum/submit/`;
  }

  getParams(params: Params) {
    return JSON.stringify(params);
  }

  async request(params: Params): Promise<CheckResult> {
    const res: {
      submission_id: number;
    } = await super.request(params);
    const check = new CheckRun(res.submission_id);
    return check.check();
  }
}

import { Base } from '../base';

interface Params {
  question_id: string;
  lang: string;
  typed_code: string;
  data_input: string;
  test_mode: boolean;
  judge_type: string;
  test_judger: string;
}

enum CheckState {
  success = 'SUCCESS',
  pending = 'PENDING',
  started = 'STARTED',
}

export interface CheckResult {
  status_code: number;
  lang: string;
  run_success: boolean;
  status_runtime: string;
  memory: number;
  code_answer: string[];
  code_output: string[];
  elapsed_time: number;
  task_finish_time: number;
  task_name: string;
  status_msg: string;
  state: CheckState;
  fast_submit: boolean;
  total_correct: any;
  total_testcases: any;
  runtime_percentile: any;
  status_memory: string;
  memory_percentile: any;
  pretty_lang: string;
  submission_id: string;
}

class CheckRun extends Base {
  method = 'GET';

  constructor(id: string) {
    super();
    this.url = `https://leetcode.cn//submissions/detail/${id}/check/`;
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

export class Interpret extends Base {
  method = 'POST';

  constructor(slug: string) {
    super();
    this.url = `https://leetcode.cn//problems/${slug}/interpret_solution/`;
  }

  getParams(params: Params) {
    return JSON.stringify(params);
  }

  async request(params: Params): Promise<[CheckResult, CheckResult]> {
    const res: {
      interpret_id: string;
      test_case: string;
      interpret_expected_id: string;
    } = await super.request(params);
    const expectResult = new CheckRun(res.interpret_expected_id);
    const runResult = new CheckRun(res.interpret_id);
    return Promise.all([expectResult.check(), runResult.check()]);
  }
}

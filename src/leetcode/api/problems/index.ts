import { Base } from '../base';
import { Method } from 'axios';
import { graphqlTag } from '../../../util/string';
import { leetcode } from '../..';
import { ProblemDetail } from './detail';

function getDetail(this: Problem) {
  return leetcode.problemDetail.request(this.stat.question__title_slug);
}

class Translations extends Base {
  method: Method = 'POST';
  private readonly query: string = graphqlTag`
    "query": "query getQuestionTranslation($lang: String) {
        translations: allAppliedQuestionTranslations(lang: $lang) {
          title
          questionId
          __typename
        }
      }
    "`;

  private graphql() {
    return `
      {
        "operationName": "getQuestionTranslation",
        "variables":{},
        ${this.query}
      }
    `;
  }

  getParams() {
    return this.graphql();
  }
}

class Details extends Base {
  method: Method = 'GET';
  url = 'https://leetcode-cn.com/api/problems/all/';
}

export enum ProblemLevel {
  easy = 1,
  middle = 2,
  hard = 3,
}

export interface Problem {
  stat: {
    question_id: number;
    question__title: string;
    question__title_cn: string;
    question__title_slug: string;
    question__hide: boolean;
    total_acs: number;
    total_submitted: number;
    total_column_articles: number;
    frontend_question_id: string;
  };
  status: string | null;
  difficulty: {
    level: ProblemLevel;
  };
  paid_only: boolean;
  is_favor: boolean;
  frequency: 0;
  progress: 0;
  getDetail: () => Promise<ProblemDetail>;
}

export class Problems extends Base {
  private translations = new Translations();
  private details = new Details();
  public request(): Promise<{
    solved: number;
    total: number;
    easy: number;
    medium: number;
    hard: number;
    problems: Problem[];
  }> {
    return Promise.all([this.translations.request(), this.details.request()]).then(([translations, details]) => {
      const titlesCN: Record<string, string> = (translations.data.translations || []).reduce(
        (pre: { [x: string]: any }, cur: { questionId: string | number; title: any }) => {
          pre[cur.questionId] = cur.title;
          return pre;
        },
        {},
      );
      return {
        solved: details.num_solved,
        total: details.num_total,
        easy: details.ac_easy,
        medium: details.ac_medium,
        hard: details.ac_hard,
        problems: (details.stat_status_pairs || []).map((item: Problem) => {
          // eslint-disable-next-line @typescript-eslint/camelcase
          item.stat.question__title_cn = titlesCN[item.stat.question_id];
          item.getDetail = getDetail;
          return item;
        }),
      };
    });
  }
}

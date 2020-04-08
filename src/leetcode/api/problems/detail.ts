import { Base } from '../base';
import { Method } from 'axios';
import { graphqlTag } from '../../../util/string';
import { logger } from '../../../util/logger';
import htom from 'htom';

const log = logger.getlog('Problem detail');

export interface ProblemDetail {
  questionId: string;
  questionFrontendId: string;
  boundTopicId: number;
  title: string;
  titleSlug: string;
  content: string;
  translatedTitle: string;
  translatedContent: string;
  isPaidOnly: boolean;
  difficulty: string;
  likes: 62;
  dislikes: 0;
  isLiked: null;
  similarQuestions: string;
  contributors: any[];
  langToValidPlayground: string;
  topicTags: Array<{
    name: string;
    slug: string;
    translatedName: string;
  }>;
  companyTagStats: any;
  codeSnippets: Array<{
    lang: string;
    langSlug: string;
    code: string;
  }>;
  // JSON string
  stats: {
    totalAccepted: string;
    totalSubmission: string;
    totalAcceptedRaw: number;
    totalSubmissionRaw: number;
    acRate: string;
  };
  hints: any[];
  solution: any;
  status: any;
  sampleTestCase: any;
  metaData: any;
  judgerAvailable: boolean;
  judgeType: string;
  mysqlSchemas: any[];
  enableRunCode: boolean;
  envInfo: any;
  book: any;
  isSubscribed: boolean;
  isDailyQuestion: boolean;
  dailyRecordStatus: string;
  editorType: string;
  ugcQuestionId: any;
}

export class Detail extends Base {
  method: Method = 'POST';
  private readonly query: string = graphqlTag`
    "query":"query questionData($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        questionId
        questionFrontendId
        boundTopicId
        title
        titleSlug
        content
        translatedTitle
        translatedContent
        isPaidOnly
        difficulty
        likes
        dislikes
        isLiked
        similarQuestions
        contributors {
          username
          profileUrl
          avatarUrl
          __typename
        }
        langToValidPlayground
        topicTags {
          name
          slug
          translatedName
          __typename
        }
        companyTagStats
        codeSnippets {
          lang
          langSlug
          code
          __typename
        }
        stats
        hints
        solution {
          id
          canSeeDetail
          __typename
        }
        status
        sampleTestCase
        metaData
        judgerAvailable
        judgeType
        mysqlSchemas
        enableRunCode
        envInfo
        book {
          id
          bookName
          pressName
          source
          shortDescription
          fullDescription
          bookImgUrl
          pressImgUrl
          productUrl
          __typename
        }
        isSubscribed
        isDailyQuestion
        dailyRecordStatus
        editorType
        ugcQuestionId
        __typename
      }
    }
  "`;
  private graphql(slug: string) {
    return `
      {
        "operationName":"questionData",
        "variables":{
          "titleSlug":"${slug}"
        },
        ${this.query}
      }
    `;
  }

  getParams(slug: string) {
    return this.graphql(slug);
  }

  async request(slug: string): Promise<ProblemDetail> {
    const res = await super.request(slug);
    const detail = res.data.question;
    try {
      detail.stats = JSON.parse(detail.stats);
      detail.translatedContent = ((await htom(detail.translatedContent)) as string).replace(/&nbsp;/g, ' ').trim();
    } catch (error) {
      log(`Parse stats: ${error.message}`);
    }
    return detail;
  }
}

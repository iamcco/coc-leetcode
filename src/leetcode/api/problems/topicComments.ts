import { Base } from '../base';
import { graphqlTag } from '../../../util/string';

export interface CommentItem {
  id: string;
  isEdited: boolean;
  numChildren: number;
  post: {
    author: {
      username: string;
      isDiscussAdmin: false;
      profile: {
        realName: string;
        userAvatar: string;
        userSlug: string;
      };
    };
    content: string;
    creationDate: number;
    id: number;
    mentionedUsers: any[];
    status: string;
    updationDate: number;
    voteStatus: number;
    voteUpCount: number;
  };
}

export class TopicComment extends Base {
  method = 'POST';
  private readonly query: string = graphqlTag`
    "query": "query commonTopicComments($topicId: Int!, $orderBy: CommentOrderBy, $skip: Int) {
      commonTopicComments(topicId: $topicId, orderBy: $orderBy, skip: $skip, first: 15) {
        totalNum
        edges {
          node {
            ...commentFields
            __typename
          }
          __typename
        }
        __typename
      }
    }

    fragment commentFields on CommentRelayNode {
      id
      numChildren
      isEdited
      post {
        id
        content
        voteUpCount
        creationDate
        updationDate
        status
        voteStatus
        author {
          username
          isDiscussAdmin
          profile {
            userSlug
            userAvatar
            realName
            __typename
          }
          __typename
        }
        mentionedUsers {
          key
          username
          userSlug
          nickName
          __typename
        }
        __typename
      }
      __typename
    }
  "`;
  private graphql(id: number | string, skip: number | string) {
    return `
      {
        "operationName":"commonTopicComments",
        "variables":{
          "topicId":${id},
          "skip":${skip},
          "orderBy":"HOT"
        },
        ${this.query}
      }
    `;
  }

  getParams(id: number | string, skip: number | string) {
    return this.graphql(id, skip);
  }

  async request(id: number | string, skip: number | string): Promise<CommentItem[]> {
    const res = await super.request(id, skip);
    return (
      (res && res.data && res.data.commonTopicComments && (res.data.commonTopicComments.edges as any[])) ||
      []
    ).map(item => item.node);
  }
}

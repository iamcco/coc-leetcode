import { Base } from '../base';
import { graphqlTag } from '../../../util/string';
import { CommentItem } from './topicComments';

export class SelectionComment extends Base {
  method = 'POST';
  private readonly query: string = graphqlTag`
    "query":"query commentsSelection($topicId: ID!) {
        commentsSelection(topicId: $topicId) {
          ...commentFields
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
  private graphql(id: number | string) {
    return `
      {
        "operationName":"commentsSelection",
        "variables":{
          "topicId":"${id}"
        },
        ${this.query}
      }
    `;
  }

  getParams(id: number | string) {
    return this.graphql(id);
  }

  async request(id: number | string): Promise<CommentItem[]> {
    const res = await super.request(id);
    return (res && res.data && res.data.commentsSelection) || [];
  }
}

/* eslint-disable @typescript-eslint/camelcase */
import { workspace } from 'coc.nvim';
import dayjs from 'dayjs';

import { extensionName } from '../util/constant';
import { ProblemDetail } from '../leetcode/api/problems/detail';
import { statusBar } from '../lib/status';
import { logger } from '../util/logger';
import { SelectionComment } from '../leetcode/api/problems/selectionComments';
import { notification } from '../lib/notification';
import { MessageType } from '../lib/notification/message';
import { TopicComment, CommentItem } from '../leetcode/api/problems/topicComments';

const log = logger.getlog('Comments');

const formatContents = (comments: CommentItem[], init: string[]): string[] => {
  return comments.reduce((pre, cur) => {
    return pre.concat([
      `## ${cur.post.author.profile.realName}`,
      '',
      `> 更新于：${dayjs(cur.post.updationDate * 1000).format('YYYY/MM/DD HH:mm')} 👍 ${cur.post.voteUpCount}`,
      '',
      ...cur.post.content.split(/\r\n|\n/),
      '',
    ]);
  }, init);
};

export const getDetailByBuffer = async (): Promise<ProblemDetail | undefined> => {
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
  let problemDetail: ProblemDetail | undefined;
  try {
    problemDetail = JSON.parse(leetcodeInfo as string);
    return problemDetail;
  } catch (error) {
    log(`problem detail: ${leetcodeInfo}`);
    log(`problem detail parse fail: ${error.message}`);
    return;
  }
};

export const openCommentsByDetail = async (detail: ProblemDetail) => {
  statusBar.progress(true);
  try {
    // 精选评论
    const selectionCommentApi = new SelectionComment();
    // 评论
    const topicCommentApi = new TopicComment();
    const selectionComments = await selectionCommentApi.request(detail.boundTopicId);
    const topicComments = await topicCommentApi.request(detail.boundTopicId, 0);
    let contents = [`# 精选评论`, ''];
    contents = formatContents(selectionComments, contents);
    contents.push(`# 评论`, '');
    contents = formatContents(topicComments, contents);
    // 显示
    const nvim = workspace.nvim;
    const name = `leetcode://comments/${detail.questionId}/${detail.titleSlug}.md`;
    nvim.pauseNotification();
    nvim.command('tabnew', true);
    nvim.command(`edit ${name}`, true);
    nvim.command('setl buftype=nofile foldmethod=syntax nobuflisted noswapfile bufhidden=wipe wrap', true);
    nvim.command('setf markdown', true);
    nvim.call('append', [0, contents], true);
    nvim.command(`let b:${extensionName}_skip=${topicComments.length}`, true);
    nvim.command('normal! gg', true);
    await nvim.resumeNotification(false, false);

    // 是否正在加载数据
    let isPending = false;
    // 翻到底部自动加载下一页评论
    workspace.registerAutocmd({
      event: 'CursorMoved,CursorHold <buffer>',
      pattern: '',
      request: false,
      callback: async () => {
        if (isPending) {
          return;
        }
        isPending = true;
        try {
          const buf = await nvim.buffer;
          if (!buf) {
            return;
          }
          const skip = (await buf.getVar(`${extensionName}_skip`)) as number;
          if (!skip && skip !== 0) {
            return;
          }
          const win = await nvim.window;
          if (!win) {
            return;
          }
          const lines = await buf.lines;
          const winline = (await nvim.call('winline')) as number;
          const winheight = await nvim.call('winheight', [win.id]);
          const pos = await nvim.call('getpos', '.');
          if (pos[1] - winline + winheight < lines.length) {
            return;
          }
          statusBar.progress(true);
          const topicCommentApi = new TopicComment();
          const nextTopicComments = await topicCommentApi.request(detail.boundTopicId, skip);
          const contents = formatContents(nextTopicComments, []);
          if (nextTopicComments.length < 15) {
            nvim.command(`unlet b:${extensionName}_skip`);
          } else {
            nvim.command(`let b:${extensionName}_skip=${skip + nextTopicComments.length}`);
          }
          nvim.call('append', [lines.length, contents]);
        } catch (error) {
          log(`fetch next page comments fail: ${error}`);
        } finally {
          isPending = false;
          statusBar.progress(false);
        }
      },
    });
  } catch (error) {
    log(`fetch comments fail ${error.message}`);
    notification.show('Fetch comments fail', 3000, MessageType.fail);
  } finally {
    statusBar.progress(false);
  }
};

export const openComments = async () => {
  const detail = await getDetailByBuffer();
  if (!detail) {
    return;
  }
  openCommentsByDetail(detail);
};

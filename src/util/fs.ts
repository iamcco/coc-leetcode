import fs, { Stats } from 'fs';
import { exec, ExecOptions } from 'child_process';

export const exists = async (path: string): Promise<boolean> => {
  return new Promise(resolve => {
    fs.exists(path, exists => {
      resolve(exists);
    });
  });
};

export const readFile = async (path: string): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err: Error | null, data: Buffer) => {
      if (err) {
        return reject(err);
      }
      resolve(data);
    });
  });
};

export const mkdir = async (path: string) => {
  return new Promise((resolve, reject) => {
    fs.mkdir(path, { recursive: true }, (err: Error | null, path: string) => {
      if (err) {
        return reject(err);
      }
      resolve(path);
    });
  });
};

export const execCommand = (
  command: string,
  options: ExecOptions = {},
): Promise<{
  code: number;
  err: Error | null;
  stdout: string;
  stderr: string;
}> => {
  return new Promise(resolve => {
    let code = 0;
    exec(
      command,
      {
        encoding: 'utf-8',
        ...options,
      },
      (err: Error | null, stdout = '', stderr = '') => {
        resolve({
          code,
          err,
          stdout,
          stderr,
        });
      },
    ).on('exit', (co: number) => co && (code = co));
  });
};

export const isSymbolLink = async (path: string): Promise<{ err: Error | null; stats: boolean }> => {
  return new Promise(resolve => {
    fs.lstat(path, (err: Error | null, stats: Stats) => {
      resolve({
        err,
        stats: stats && stats.isSymbolicLink(),
      });
    });
  });
};

export const getRealPath = async (path: string): Promise<string> => {
  const { err, stats } = await isSymbolLink(path);
  if (!err && stats) {
    return new Promise(resolve => {
      fs.realpath(path, (err: Error | null, realPath: string) => {
        if (err) {
          return resolve(path);
        }
        resolve(realPath);
      });
    });
  }
  return path;
};

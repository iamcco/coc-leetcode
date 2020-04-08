export const screenWidth = (str: string): number => {
  const l = str.length;
  let len = 0;
  for (let i = 0; i < l; i++) {
    if ((str.charCodeAt(i) & 0xff00) != 0) {
      len++;
    }
    len++;
  }
  return len;
};

export const screenPadEnd = (param: string, len: number, str: string) => {
  const pLen = screenWidth(param);
  if (pLen >= len) {
    return param;
  }
  return `${param}${Array.from(Array(len - pLen + 1)).join(str[0])}`;
};

export const graphqlTag = (strings: TemplateStringsArray, ...keys: any[]) => {
  return strings
    .reduce((pre, cur) => {
      if (keys.length) {
        return `${pre}${keys.shift()}${cur}`;
      }
      return pre;
    })
    .trim()
    .replace(/\n/g, '\\n');
};

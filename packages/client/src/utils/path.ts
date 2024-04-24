export const toPosix = (path: string) => {
  return path.replaceAll('\\', '/');
};

export const getProtocol = (path: string) => {
  path = toPosix(path);

  const matchFile = /^file:\/\/\//.exec(path);

  if (matchFile) {
    return matchFile[0];
  }

  const matchProtocol = /^[^/:]+:\/{0,2}/.exec(path);

  if (matchProtocol) {
    return matchProtocol[0];
  }

  return '';
};

export const isUrl = (path: string) => /^https?:/.test(toPosix(path));

export const getDirname = (path: string) => {
  {
    if (path.length === 0) return '.';
    path = toPosix(path);
    let code = path.charCodeAt(0);
    const hasRoot = code === 47;
    let end = -1;
    let matchedSlash = true;

    const proto = getProtocol(path);
    const origpath = path;

    path = path.slice(proto.length);

    for (let i = path.length - 1; i >= 1; --i) {
      code = path.charCodeAt(i);
      if (code === 47) {
        if (!matchedSlash) {
          end = i;
          break;
        }
      } else {
        // We saw the first non-path separator
        matchedSlash = false;
      }
    }

    // if end is -1 and its a url then we need to add the path back
    // eslint-disable-next-line no-nested-ternary
    if (end === -1) return hasRoot ? '/' : isUrl(origpath) ? proto + path : proto;
    if (hasRoot && end === 1) return '//';

    return proto + path.slice(0, end);
  }
};

export const copySearchParams = (targetUrl: string, sourceUrl: string) => {
  const searchParams = sourceUrl.split('?')[1];

  if (searchParams) {
    targetUrl += `?${searchParams}`;
  }

  return targetUrl;
};

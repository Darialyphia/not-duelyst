export const compareSemanticVersions = (key?: string) => (a: any, b: any) => {
  // 1. Split the strings into their parts.
  let a1;
  let b1;

  if (key) {
    a1 = a[key].split('.');
    b1 = b[key].split('.');
  } else {
    a1 = a.split('.');
    b1 = b.split('.');
  }
  // 2. Contingency in case there's a 4th or 5th version
  const len = Math.min(a1.length, b1.length);
  // 3. Look through each version number and compare.
  for (let i = 0; i < len; i++) {
    const a2 = +a1[i] || 0;
    const b2 = +b1[i] || 0;

    if (a2 !== b2) {
      return a2 > b2 ? 1 : -1;
    }
  }

  // 4. We hit this if the all checked versions so far are equal
  return b1.length - a1.length;
};

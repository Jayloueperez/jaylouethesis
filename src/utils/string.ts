import _ from "lodash";

export const generateKeywords = (
  str: string,
  initial: boolean = true,
): string[] => {
  const strArr: string[][] = [];
  const strSplit = str.split(" ");

  if (initial && strSplit.length) {
    strSplit.forEach((sp) => {
      strArr.push(generateKeywords(sp, false));
    });
  }
  const keywords = Array.from(Array(str.length)).map((_s, i) =>
    str.slice(0, i + 1).toLowerCase(),
  );

  return _.uniq(_.sortBy(_.union(keywords, ...strArr)).map((s) => s.trim()));
};

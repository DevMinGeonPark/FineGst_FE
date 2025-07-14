// processGongContent.ts
export type GongContent = {
  GongLinkUrl: string;
  GongImgUrl: string;
};

export type GongData = {
  GongSubject: string;
  GongContent: GongContent[];
};

export const processGongContent = (data: GongData[]): GongContent[] => {
  let result: GongContent[] = [];

  data.forEach((item) => {
    result = result.concat(item.GongContent);
  });

  return result;
};

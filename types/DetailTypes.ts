export interface ItemDetail {
  ItemCode: string;
  ItemImgUrl: string;
  ItemName: string;
  ItemColor: ItemColor[];
  ItemImg: Array<{
    ImgUrl: string;
  }>;
  RegiType: RegiType[];
  SupportType: SupportType[];
  ForMonth: string[];
  RatePlan: RatePlan[];
  RevMethod: Array<{
    Title: string;
    ClickComment: string;
  }>;
  KTDiscount: string[];
  BuyBenefit: string[];
  CommAttn: string;
  OrderPage: string;
  RateCode: string;
}

export interface ItemColor {
  ColorRGB: string;
  ColorName: string;
  ColorImg: string;
}

export interface ParamProps {
  ItemCode: string;
  CategorieCode: string;
  LogInID?: string;
}

export interface RegiType {
  Title: string;
  ClickComment: string;
}

export interface SupportType {
  Title: string;
  SupportTypeVol: string;
  ClickComment: string;
}

export interface RatePlan {
  RateDivi: string;
  SubList: SubList[];
}

export interface SubList {
  Vol: string;
  Var: string;
}

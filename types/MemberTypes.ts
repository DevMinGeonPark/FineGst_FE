export interface ParamProps {
  KTShopID: string;
  UserName: string;
  UserPW: string;
  UserBirth: string;
  UserOpenHp: string;
  UserHp: string;
  Maling: number;
  OpenInfo: number;
}

export interface DeleteParamProps {
  KTShopID: string;
  KTShopPW: string;
}

export interface Res {
  Status: string;
  ErrMsg: string;
}

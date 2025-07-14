export interface Product {
  CategorieCode: string;
  ItemCode: string;
  ItemImgUrl: string;
  ItemName: string;
  ItemColor: string;
  ItemChargeNormal: number;
  ItemChargeSales: number;
  ItemDCRate: number;
}

export interface CommonProps {
  /** ca_id, co_id ... etc */
  MenuType: string;
  /** 10 20 50 */
  MenuVar: string;

  LogInID?: string;
}

export interface CommonScreenProps {
  MenuType: string;
  MenuVar: string;
}

export interface ShopVersion {
  ShopVersion: string;
}

export interface ParamProps {
  ItemCode: string;
  Vol: string;
  SupportTypeVol: string;
  KTDiscount: string;
  ForMonth: string;
  UserID: string | null;
}

interface CommonCalResType {
  /** 출고가 */
  ChgFactory: number;

  /** 마이포인트 */
  ChgMyPoint: number | undefined;

  /** 요금제명 */
  ChgNm: string;

  /** 요금 */
  ChgNmRate: number;

  /** 할인후 금액 */
  ChgNmRateDiscount: number;

  /** 월할부원금 */ //state
  ChgContractMonthChg: number;

  /** 할부이자 */
  ChgContractMonthInterest: number;

  /** 할부원금 */
  ChgMonthlyPlan: number;

  /** 요금제 월납부금 */ //state
  ChgContractMonthRate: number;

  /** 요금제 월납부금 */ //state
  ChgContractMonthTotal: number;

  /** KT공식몰 추가할인 */
  ChgKTmalldiscount: number | undefined;
}

export interface MachineCalResType extends CommonCalResType {
  /** 공시 지원금 */
  ChgSubsidy: number;

  /** 추가 지원금 */
  ChgSubsidyAdd: any; //에러 제거
}

export interface ChargeCalResType extends CommonCalResType {
  /** 요금할인(약정) */
  ChgDiscountContract: number;

  /** 요금할인(추가) */
  ChgDiscountAdd: number;
}

export function isMachineCalculator(
  data: MachineCalResType | ChargeCalResType | undefined,
): data is MachineCalResType {
  return data !== undefined && 'ChgSubsidy' in data;
}
export function isChargeCalculator(
  data: MachineCalResType | ChargeCalResType | undefined,
): data is ChargeCalResType {
  return data !== undefined && 'ChgDiscountContract' in data;
}

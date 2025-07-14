// import { StyleSheet, View } from 'react-native';
// import React, { useEffect } from 'react';
import React, { useEffect } from "react";
import { Text } from "react-native";
import BoxLabel from "../atomic/BoxLabel";
import BoxTitle from "../atomic/BoxTitle";
import { ParamProps, isChargeCalculator, isMachineCalculator } from "../../../types/RateCalculatorTypes";
// import { getRateData } from '@src/API/Detail/getRateData';
import NonLineLabel from "../atomic/NonLineLabel";
import RateBox from "../atomic/RateBox";
// import {
//   MachineCalResType,
//   ChargeCalResType,
// } from '../../../types/RateCalculatorTypes';
// import { Text } from '@src/Atomic/Text';
// import useRateData from '@src/hooks/queryHooks/useRateData';
// import { FontText } from '@src/Atomic/FontText';
// import { useUserStore } from '@src/Store/userStore';
// import useFixBarStore from '@src/Store/fixBarStore';
import useRateData from "../../../hooks/useRateData";
import useFixBarStore from "../../../store/fixBarStore";

interface RateCalculatorProps extends ParamProps {
  OrderPage: string;
}

export default function RateCalculator(Params: RateCalculatorProps) {
  const { data } = useRateData(Params);

  const { setFixBarProps } = useFixBarStore();

  useEffect(() => {
    setFixBarProps({
      ChgContractMonthChg: data?.ChgContractMonthChg,
      ChgContractMonthRate: data?.ChgContractMonthRate,
      ChgContractMonthTotal: data?.ChgContractMonthTotal,
      OrderPage: Params?.OrderPage,
    });
  }, [data, Params?.OrderPage]);

  return (
    <>
      <Text style={{ marginBottom: 3, fontSize: 20, padding: 13, fontWeight: "bold", textAlign: "center", borderBottomColor: "#DDD", borderBottomWidth: 1 }}>
        요금계산
      </Text>
      <BoxTitle title="단말기 금액" borderWidth={1} />
      <BoxLabel label="출고가" Rate={data?.ChgFactory || 0} fontColor={"black"} fontWeight="normal" />
      {isMachineCalculator(data) && (
        <>
          <BoxLabel label="공시지원금" Rate={data?.ChgSubsidy || 0} fontColor={"#d71826"} fontWeight="bold" />
          <BoxLabel label="추가지원금" Rate={data?.ChgSubsidyAdd || 0} fontColor={"#d71826"} fontWeight="bold" />
        </>
      )}

      <BoxLabel label="KT공식몰 추가할인" Rate={data?.ChgKTmalldiscount || 0} fontColor={"#d71826"} fontWeight="bold" />

      <BoxLabel label="할부원금" Rate={data?.ChgMonthlyPlan || 0} fontColor={"#000000"} fontWeight="normal" />

      <BoxTitle title="요금제 금액" borderWidth={1} />
      <BoxLabel label={data?.ChgNm || ""} Rate={data?.ChgNmRate || 0} fontColor={"#000000"} fontWeight="normal" />

      {isChargeCalculator(data) && (
        <>
          <BoxLabel label="요금할인(약정)" Rate={data?.ChgDiscountContract || 0} fontColor={"#d71826"} fontWeight="bold" />
          <BoxLabel label="요금할인(추가)" Rate={data?.ChgDiscountAdd || 0} fontColor={"#d71826"} fontWeight="bold" />
        </>
      )}

      <BoxLabel label="할인 후 금액" Rate={data?.ChgNmRateDiscount || 0} fontColor={"#000000"} fontWeight="normal" />

      <BoxTitle title="월 납부 금액" borderWidth={0} />
      <NonLineLabel label="월할부원금" Rate={data?.ChgContractMonthChg || 0} />
      <NonLineLabel label="할부이자" Rate={data?.ChgContractMonthInterest || 0} />
      <NonLineLabel label="요금제 월납부금" Rate={data?.ChgContractMonthRate || 0} />
      <RateBox Rate={data?.ChgContractMonthTotal || 0} />
    </>
  );
}

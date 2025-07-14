import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text, Linking, BackHandler } from "react-native";
import { CommonLayout } from "../../../components/layout/CommonLayout";
import useItemInfoData from "../../../hooks/useItemInfoData";
import DetailInfo from "../../../components/app-ui/modules/DetailInfo";
import RateTypeUI from "../../../components/app-ui/atomic/RateTypeUI";
import SignTypeButtons from "../../../components/app-ui/modules/SignTypeButtons";
import SupTypeButtons from "../../../components/app-ui/modules/SupTypeButtons";
import InstallmentButtons from "../../../components/app-ui/modules/InstallmentButtons";
import RateCalculator from "../../../components/app-ui/modules/RateCalculator";
import RatePlanSelect from "../../../components/app-ui/modules/RatePlanSelect";
import { getDefaultRatePlanInfo } from "../../../utils/getDefaultRatePlanInfo";
import usePlanDesc from "../../../hooks/usePlanDesc";
import ProductPiece from "../../../components/app-ui/modules/ProductPiece";
import useFixBarStore from "../../../store/fixBarStore";

export default function Detail() {
  const router = useRouter();

  const [plan, setPlan] = useState<string>(getDefaultRatePlanInfo().Vol);
  const [planDesc, setPlanDesc] = useState<string[]>(getDefaultRatePlanInfo().desc);
  const [supType, setSupType] = useState<string>("Machine");
  const [installment, setInstallment] = useState<string>("24");

  const { setShowFixBar } = useFixBarStore();

  useEffect(() => {
    setShowFixBar(true);

    return () => {
      setShowFixBar(false);
    };
  }, []);

  useEffect(() => {
    const backAction = () => {
      router.replace("/"); // main 경로로 이동
      return true; // 기본 뒤로가기 동작 막기
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

    return () => backHandler.remove();
  }, [router]);

  const params = useLocalSearchParams<{
    name: string;
    MenuType: string;
    MenuVar: string;
    it_id: string;
  }>();

  const { data } = useItemInfoData({
    ItemCode: params.it_id,
    CategorieCode: params.MenuVar,
  });

  const { data: planDescData, isLoading: planDescLoading } = usePlanDesc(data?.RateCode, plan);

  return (
    <CommonLayout>
      <View>
        {data?.ItemColor && data?.ItemImgUrl && <DetailInfo productTitle={data?.ItemName || ""} data={data?.ItemColor || []} errImg={data?.ItemImgUrl || ""} />}
        <RateTypeUI heading="가입형태">
          <SignTypeButtons regiTypes={data?.RegiType || []} route={params} />
        </RateTypeUI>
        <RateTypeUI heading="지원형태">
          <SupTypeButtons SupportType={data?.SupportType || []} setSupType={setSupType} route={params} />
        </RateTypeUI>
        <RateTypeUI heading="할부개월">
          <InstallmentButtons ForMonth={data?.ForMonth || []} setInstallment={setInstallment} route={params} />
        </RateTypeUI>

        <RateTypeUI heading="요금제">
          <RatePlanSelect data={data?.RatePlan || []} onSelect={(item) => setPlan(item.Vol)} selectedValue={plan} placeholder="요금제를 선택하세요" />
          <View>
            {planDescLoading ? (
              <Text style={styles.commentText}>로딩중...</Text>
            ) : (
              planDescData &&
              (planDescData as string).split("\n").map((desc: string, index: number) => (
                <Text key={index} style={styles.commentText}>
                  {desc}
                </Text>
              ))
            )}
          </View>
        </RateTypeUI>

        <RateTypeUI heading="수령방법">
          <TouchableOpacity style={styles.button} onPress={() => {}}>
            <Text style={styles.buttonText}>{data?.RevMethod?.[0]?.Title || "Title unavailable"}</Text>
          </TouchableOpacity>
          <Text style={styles.commentText}>{data?.RevMethod?.[0]?.ClickComment || "ClickComment unavailable"}</Text>
        </RateTypeUI>

        <TouchableOpacity
          style={styles.orderButton}
          onPress={() => {
            if (data?.OrderPage) {
              Linking.openURL(data.OrderPage);
            }
          }}
        >
          <Text style={styles.orderButtonText}>주문하기</Text>
        </TouchableOpacity>

        <View style={{ borderTopWidth: 2, borderTopColor: "#5ddfde", paddingTop: 3 }}>
          <RateCalculator
            ItemCode={data?.ItemCode || params.it_id}
            Vol={plan}
            SupportTypeVol={supType}
            ForMonth={installment}
            KTDiscount={"N"}
            UserID={null}
            OrderPage={data?.OrderPage || ""}
          />
        </View>
        <ProductPiece MenuType={params.MenuType} MenuVar={params.MenuVar} />
      </View>
    </CommonLayout>
  );
}

const styles = StyleSheet.create({
  button: {
    margin: 6,
    borderWidth: 2,
    borderRadius: 6,
    borderColor: "#5ddfde",
    backgroundColor: "transparent",
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
    textAlign: "center",
  },
  commentText: {
    marginTop: 4,
    marginHorizontal: 6,
  },
  orderButton: {
    marginHorizontal: 6,
    marginTop: 30,
    marginBottom: 20,
    borderWidth: 2,
    borderRadius: 6,
    borderColor: "#5ddfde",
    backgroundColor: "#5ddfde",
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  orderButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
    textAlign: "center",
  },
});

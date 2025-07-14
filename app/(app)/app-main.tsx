import React, { useEffect } from "react";
import { View } from "react-native";
import { CommonLayout } from "../../components/layout/CommonLayout";
import Title from "../../components/app-ui/atomic/Title";
import useProductData from "../../hooks/useProductData";
import ProductList from "../../components/app-ui/modules/ProductList";
import useShowToggleIconsStore from "../../store/showToggleIconsStore";

export default function AppMain() {
  const { data: productData } = useProductData({
    MenuType: "ca_id",
    MenuVar: "20",
    sort: "",
    sortodr: "",
  });

  const { setShowToggleIcons } = useShowToggleIconsStore();

  useEffect(() => {
    setShowToggleIcons(true); // main 페이지 진입 시

    return () => setShowToggleIcons(false); // 페이지 나갈 때
  }, []);

  return (
    <CommonLayout>
      <View style={{ marginVertical: 30 }}>
        <Title title="NEW" desc="얼리어답터를 위한 신제품!" />
        <ProductList items={productData?.ItemList || []} />
      </View>
    </CommonLayout>
  );
}

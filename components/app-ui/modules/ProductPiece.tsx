import React from "react";
import { ParamProps, isProductData } from "../../../types/ProductTypes";
import ProductCard from "../../app-ui/atomic/ProductCard";
import useProductData from "../../../hooks/useProductData";
import { FlatList, View } from "react-native";

interface ProductPieceProps {
  MenuType: string;
  MenuVar: string;
}

const ProductPiece = ({ MenuType, MenuVar }: ProductPieceProps) => {
  const [params] = React.useState<ParamProps>({
    MenuType: MenuType,
    MenuVar: MenuVar,
    sort: "it_update_time",
    sortodr: "aec",
  });

  const { data } = useProductData(params);

  const renderItem = ({ item }: { item: any }) => (
    <View
      style={{
        width: "48%",
        margin: "1%",
        marginTop: 20,
        marginBottom: 8,
        height: 280,
      }}
    >
      <ProductCard
        MenuType={params.MenuType}
        MenuVar={params.MenuVar}
        CategorieCode={item.CategorieCode}
        ItemCode={item.ItemCode}
        ItemImgUrl={item.ItemImgUrl}
        ItemName={item.ItemName}
        ItemColor={item.ItemColor}
        ItemChargeNormal={item.ItemChargeNormal}
        ItemChargeSales={item.ItemChargeSales}
        ItemDCRate={item.ItemDCRate}
      />
    </View>
  );

  return (
    <>
      {/* <SortBar setParams={setParams} MenuType={MenuType} MenuVar={MenuVar} /> */}
      {isProductData(data) && (
        <FlatList
          data={data.ItemList}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          numColumns={2}
          columnWrapperStyle={{
            justifyContent: "space-between",
            paddingHorizontal: 8,
          }}
          contentContainerStyle={{
            paddingVertical: 8,
          }}
        />
      )}
    </>
  );
};

export default ProductPiece;

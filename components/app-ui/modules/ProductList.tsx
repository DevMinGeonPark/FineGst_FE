import { FlatList, View } from "react-native";
import ProductCard from "../atomic/ProductCard";
import React from "react";
import { ItemList } from "../../../types/ProductTypes";

interface ProductListProps {
  items: ItemList[];
}

function ProductList({ items }: ProductListProps) {
  const renderItem = ({ item }: { item: ItemList }) => (
    <View
      style={{
        width: "48%",
        margin: "1%",
        marginBottom: 8,
      }}
    >
      <ProductCard
        MenuType={item.MenuType || "ca_id"}
        MenuVar={item.MenuVar || "20"}
        CategorieCode={item.CategorieCode || "defulat"}
        ItemCode={item.ItemCode || "defulat"}
        ItemImgUrl={item.ItemImgUrl || "defulat"}
        ItemName={item.ItemName || "defulat"}
        ItemColor={item.ItemColor || "defulat"}
        ItemChargeNormal={item.ItemChargeNormal || 0}
        ItemChargeSales={item.ItemChargeSales || 0}
        ItemDCRate={item.ItemDCRate || 0}
      />
    </View>
  );

  return (
    <FlatList
      style={{
        marginTop: 30,
      }}
      data={items}
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
  );
}

export default React.memo(ProductList);

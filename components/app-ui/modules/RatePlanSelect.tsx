import React, { useState } from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from "react-native";

interface RatePlan {
  Vol: string;
  Var: string;
}

interface RateGroup {
  RateDivi: string;
  SubList: RatePlan[];
}

interface RatePlanSelectProps {
  //   data: RateGroup;
  data: RateGroup[];
  onSelect: (item: RatePlan) => void;
  selectedValue?: string;
  placeholder?: string;
}

export default function RatePlanSelect({ data, onSelect, selectedValue, placeholder = "요금제를 선택하세요" }: RatePlanSelectProps) {
  data = data.flat(2);

  const [modalVisible, setModalVisible] = useState(false);

  const getSelectedPlanName = () => {
    if (!selectedValue) return placeholder;
    for (const group of data) {
      if (group?.SubList) {
        const foundPlan = group.SubList.find((plan: RatePlan) => plan.Vol === selectedValue);
        if (foundPlan) return foundPlan.Var;
      }
    }
    return placeholder;
  };

  const handleSelect = (item: RatePlan) => {
    onSelect(item);
    setModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity style={styles.selectButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.selectButtonText}>{getSelectedPlanName()}</Text>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>요금제 선택</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButton}>X</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              {data.map((group: RateGroup, groupIndex: number) => (
                <View key={groupIndex}>
                  <Text style={styles.groupTitle}>{group.RateDivi}</Text>
                  {(group.SubList || []).map((item: RatePlan, itemIndex: number) =>
                    item.Vol && item.Var ? (
                      <TouchableOpacity key={itemIndex} style={styles.optionItem} onPress={() => handleSelect(item)}>
                        <Text style={item.Vol === selectedValue ? styles.selectedOptionText : styles.optionText}>{item.Var}</Text>
                      </TouchableOpacity>
                    ) : null
                  )}
                </View>
              ))}
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  selectButton: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "white",
  },
  selectButtonText: {
    fontSize: 16,
  },
  arrow: {
    fontSize: 16,
    color: "#888",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    height: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  closeButton: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#888",
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: "bold",
    backgroundColor: "#f0f0f0",
    padding: 10,
    marginTop: 10,
    borderRadius: 6,
  },
  optionItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  optionText: {
    fontSize: 16,
  },
  selectedOptionText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007BFF",
  },
});

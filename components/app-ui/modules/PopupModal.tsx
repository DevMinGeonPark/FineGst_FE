import React, { useEffect, useState } from "react";
import { Modal, View, Image, StyleSheet, Dimensions, Pressable, Text, TouchableOpacity } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { GongContent } from "../../../types/processGongContent";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface PopupModalProps {
  visible: boolean;
  onClose: () => void;
  showCloseButton?: boolean;
  data: GongContent[];
  handleUri: (url: string) => void;
}

const { width } = Dimensions.get("window");

const PopupModal: React.FC<PopupModalProps> = ({ visible, onClose, data, handleUri }) => {
  const [shouldShow, setShouldShow] = useState(true);

  // 디버깅을 위한 로그 추가
  console.log("PopupModal props:", { visible, shouldShow, dataLength: data?.length });

  useEffect(() => {
    async function checkPopupTime() {
      const lastClosed = await AsyncStorage.getItem("popupModalLastClosed");
      console.log("마지막 닫힌 시간:", lastClosed);
      if (lastClosed) {
        const last = parseInt(lastClosed, 10);
        const now = Date.now();
        const timeDiff = now - last;
        console.log("시간 차이 (밀리초):", timeDiff, "24시간:", 24 * 60 * 60 * 1000);
        if (timeDiff < 24 * 60 * 60 * 1000) {
          setShouldShow(false);
        } else {
          setShouldShow(true);
        }
      } else {
        setShouldShow(true);
      }
    }
    checkPopupTime();
  }, [visible]);

  const handleDontShow = async () => {
    await AsyncStorage.setItem("popupModalLastClosed", Date.now().toString());
    setShouldShow(false);
    if (onClose) onClose();
  };

  if (!visible || !shouldShow) return null;

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.carouselWrapper}>
            <Carousel
              loop
              width={width * 0.95}
              height={width * 0.95 * 1.1} // 이미지 비율에 맞게 높이 조정
              autoPlay={true}
              data={data || []}
              scrollAnimationDuration={1000}
              renderItem={({ item, index }) => (
                <Pressable
                  key={index}
                  onPress={() => {
                    onClose();
                    handleUri(item.GongLinkUrl);
                  }}
                >
                  <Image source={{ uri: item.GongImgUrl }} style={styles.image} resizeMode="stretch" />
                </Pressable>
              )}
            />
          </View>
          <View style={styles.footer}>
            <TouchableOpacity style={styles.dontShowButton} onPress={handleDontShow}>
              <Text style={styles.buttonText}>24시간 동안 다시 열람하지 않습니다.</Text>
            </TouchableOpacity>
            <View style={styles.separator} />
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.buttonText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: width * 0.95,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  carouselWrapper: {
    // Carousel will determine the height
  },
  image: {
    width: "100%",
    height: "100%",
  },
  footer: {
    flexDirection: "row",
    height: 50,
    alignItems: "center",
    backgroundColor: "#000",
  },
  dontShowButton: {
    flex: 1,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  separator: {
    width: 1,
    height: "50%",
    backgroundColor: "#555",
  },
  closeButton: {
    paddingHorizontal: 20,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 14,
  },
});

export default PopupModal;

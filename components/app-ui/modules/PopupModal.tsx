import React, { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, Modal, View, Image, StyleSheet, useWindowDimensions, Pressable, Text, TouchableOpacity } from "react-native";
import { GongContent } from "../../../types/processGongContent";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { logger } from "../../../utils/logger";

const AUTO_PLAY_INTERVAL = 3000;

interface PopupModalProps {
  visible: boolean;
  onClose: () => void;
  showCloseButton?: boolean;
  data: GongContent[];
  handleUri: (url: string) => void;
}

const PopupModal: React.FC<PopupModalProps> = ({ visible, onClose, data, handleUri }) => {
  const { width } = useWindowDimensions();
  // 24시간 억제 체크(AsyncStorage)가 끝나기 전 팝업이 한 프레임 노출되지 않도록 false로 시작
  const [shouldShow, setShouldShow] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const listRef = useRef<FlatList<GongContent>>(null);
  const indexRef = useRef(0);

  const pageWidth = width * 0.95;
  const pageHeight = pageWidth * 1.1;
  const itemCount = data?.length ?? 0;

  // 디버깅을 위한 로그 추가 (개발 환경에서만 출력)
  logger.log("PopupModal props:", { visible, shouldShow, dataLength: data?.length });

  useEffect(() => {
    let cancelled = false;
    async function checkPopupTime() {
      const lastClosed = await AsyncStorage.getItem("popupModalLastClosed");
      if (cancelled) return;
      logger.log("마지막 닫힌 시간:", lastClosed);
      if (lastClosed) {
        const last = parseInt(lastClosed, 10);
        const now = Date.now();
        const timeDiff = now - last;
        logger.log("시간 차이 (밀리초):", timeDiff, "24시간:", 24 * 60 * 60 * 1000);
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
    return () => {
      cancelled = true;
    };
  }, [visible]);

  // 자동 넘김 (이미지가 2장 이상일 때만, 사용자가 드래그 중이면 정지)
  const active = visible && shouldShow && itemCount > 1 && !isDragging;
  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => {
      indexRef.current = (indexRef.current + 1) % itemCount;
      listRef.current?.scrollToIndex({ index: indexRef.current, animated: true });
    }, AUTO_PLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [active, itemCount]);

  const onMomentumScrollEnd = useCallback(
    (event: { nativeEvent: { contentOffset: { x: number } } }) => {
      const index = Math.round(event.nativeEvent.contentOffset.x / pageWidth);
      indexRef.current = Math.max(0, Math.min(index, itemCount - 1));
      setIsDragging(false);
    },
    [pageWidth, itemCount]
  );

  const handleDontShow = async () => {
    await AsyncStorage.setItem("popupModalLastClosed", Date.now().toString());
    setShouldShow(false);
    if (onClose) onClose();
  };

  if (!visible || !shouldShow || itemCount === 0) return null;

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { width: pageWidth }]}>
          <View style={{ width: pageWidth, height: pageHeight }}>
            <FlatList
              ref={listRef}
              data={data}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(_, index) => String(index)}
              getItemLayout={(_, index) => ({ length: pageWidth, offset: pageWidth * index, index })}
              onScrollBeginDrag={() => setIsDragging(true)}
              onMomentumScrollEnd={onMomentumScrollEnd}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    const url = item.GongLinkUrl;
                    onClose();
                    // 모달 애니메이션 완료 후 페이지 이동
                    setTimeout(() => {
                      handleUri(url);
                    }, 300);
                  }}
                >
                  <Image source={{ uri: item.GongImgUrl }} style={{ width: pageWidth, height: pageHeight }} resizeMode="stretch" />
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
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#000",
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

export default React.memo(PopupModal);

import { Alert } from "react-native";

type ConfirmType = "danger" | "warning" | "info";

export const showConfirm = (
  title: string,
  message: string,
  type: ConfirmType = "danger",
): Promise<boolean> => {
  return new Promise((resolve) => {
    Alert.alert(
      title,
      message,
      [
        { text: "Отмена", style: "cancel", onPress: () => resolve(false) },
        { text: "Удалить", style: "destructive", onPress: () => resolve(true) },
      ],
      { cancelable: true },
    );
  });
};

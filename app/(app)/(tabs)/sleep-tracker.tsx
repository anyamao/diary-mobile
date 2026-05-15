import { View, Text } from "react-native";

export default function SleepTrackerScreen() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fce7f3",
      }}
    >
      <Text style={{ fontSize: 18, color: "#be185d" }}>Трекер сна</Text>
      <Text style={{ color: "#6b7280", marginTop: 8 }}>
        Скоро здесь появится статистика
      </Text>
    </View>
  );
}

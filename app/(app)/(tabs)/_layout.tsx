import { Tabs } from "expo-router";
import { BookOpen, BarChart3, Moon, Brain, Bell } from "lucide-react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#db2777",
        tabBarInactiveTintColor: "#9ca3af",
        headerShown: true,
        headerStyle: { backgroundColor: "#fce7f3" },
        headerTitleStyle: { color: "#be185d", fontWeight: "bold" },
        tabBarStyle: { backgroundColor: "#ffffff", borderTopColor: "#fbcfe8" },
      }}
    >
      <Tabs.Screen
        name="diary"
        options={{
          title: "Дневник",
          tabBarIcon: ({ color, size }) => (
            <BookOpen color={color} size={size} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="mood-tracker"
        options={{
          title: "Настроение",
          tabBarIcon: ({ color, size }) => (
            <BarChart3 color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="sleep-tracker"
        options={{
          title: "Сон",
          tabBarIcon: ({ color, size }) => <Moon color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="personality"
        options={{
          title: "Личность",
          tabBarIcon: ({ color, size }) => <Brain color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="alarms"
        options={{
          title: "Будильники",
          tabBarIcon: ({ color, size }) => <Bell color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}

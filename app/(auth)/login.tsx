import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
import api from "../../api/client";
import { useAuthStore } from "../../store/authStore";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuthStore();

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert("Ошибка", "Заполните все поля");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      router.replace("/(app)/(tabs)/diary");
    } catch (error: any) {
      const message = error.response?.data?.detail || "Ошибка входа";
      Alert.alert("Ошибка", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: "#fce7f3" }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          paddingHorizontal: 24,
        }}
      >
        <View style={{ alignItems: "center", marginBottom: 32 }}>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "bold",
              color: "#be185d",
              marginBottom: 8,
            }}
          >
            Привет!
          </Text>
          <Text style={{ fontSize: 16, color: "#6b7280" }}>
            Войдите в свой аккаунт
          </Text>
        </View>

        <View
          style={{
            backgroundColor: "white",
            borderRadius: 16,
            padding: 24,
            marginBottom: 16,
          }}
        >
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={{
              borderBottomWidth: 1,
              borderBottomColor: "#fbcfe8",
              paddingVertical: 12,
              marginBottom: 20,
              fontSize: 16,
            }}
          />

          <View style={{ position: "relative", marginBottom: 24 }}>
            <TextInput
              placeholder="Пароль"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              style={{
                borderBottomWidth: 1,
                borderBottomColor: "#fbcfe8",
                paddingVertical: 12,
                fontSize: 16,
                paddingRight: 40,
              }}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={{ position: "absolute", right: 0, top: 12 }}
            >
              {showPassword ? (
                <EyeOff size={20} color="#9ca3af" />
              ) : (
                <Eye size={20} color="#9ca3af" />
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            style={{
              backgroundColor: "#db2777",
              paddingVertical: 14,
              borderRadius: 12,
              alignItems: "center",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={{ color: "white", fontWeight: "600", fontSize: 16 }}>
                Войти
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: "row", justifyContent: "center" }}>
          <Text style={{ color: "#6b7280" }}>Нет аккаунта? </Text>
          <TouchableOpacity onPress={() => router.push("/register")}>
            <Text style={{ color: "#db2777", fontWeight: "600" }}>
              Зарегистрироваться
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

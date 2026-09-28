import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";

import { Button } from "@/components/button/Button";
import { colors } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const { loginUser } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!username || !password) {
      Alert.alert("Atenção", "Preencha usuário e senha.");
      return;
    }

    try {
      setLoading(true);

      await loginUser(username, password);

      router.replace("/home");
    } catch {
      Alert.alert("Erro", "Usuário ou senha inválidos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Caderno de Fichas</Text>

      <Text style={styles.subtitle}>
        Entre para acessar suas fichas
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Usuário"
        placeholderTextColor={colors.secondaryText}
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor={colors.secondaryText}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button
        title={loading ? "Entrando..." : "Entrar"}
        onPress={handleLogin}
        disabled={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    padding: 24,
  },

  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },

  subtitle: {
    color: colors.secondaryText,
    fontSize: 16,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 30,
  },

  input: {
    backgroundColor: colors.card,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
  },
});
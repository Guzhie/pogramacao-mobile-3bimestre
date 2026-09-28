import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";

import { Button } from "@/components/button/Button";
import { colors } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { createUser } from "@/integration/loginIntegration";

export default function Login() {
  const { loginUser } = useAuth();

  const [isCadastro, setIsCadastro] = useState(false);
  const [loading, setLoading] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [email, setEmail] = useState("");
  const [cep, setCep] = useState("");

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

  async function handleCadastro() {
    if (!username || !password || !email || !cep) {
      Alert.alert("Atenção", "Preencha todos os campos.");
      return;
    }

    try {
      setLoading(true);

      await createUser({
        username,
        password,
        email,
        cep,
      });

      Alert.alert(
        "Cadastro realizado",
        "Sua conta foi criada. Agora você pode fazer login."
      );

      setIsCadastro(false);

      setEmail("");
      setCep("");
    } catch {
      Alert.alert(
        "Erro",
        "Não foi possível criar a conta. Verifique os dados e tente novamente."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.content}>
        <Text style={styles.title}>Caderno de Fichas</Text>

        <Text style={styles.subtitle}>
          {isCadastro
            ? "Crie sua conta para começar"
            : "Entre para acessar suas fichas"}
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

        {isCadastro && (
          <>
            <TextInput
              style={styles.input}
              placeholder="E-mail"
              placeholderTextColor={colors.secondaryText}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <TextInput
              style={styles.input}
              placeholder="CEP"
              placeholderTextColor={colors.secondaryText}
              value={cep}
              onChangeText={setCep}
              keyboardType="numeric"
            />
          </>
        )}

        <Button
          title={
            loading
              ? isCadastro
                ? "Criando conta..."
                : "Entrando..."
              : isCadastro
                ? "Criar conta"
                : "Entrar"
          }
          onPress={isCadastro ? handleCadastro : handleLogin}
          disabled={loading}
        />

        <Text
          style={styles.switchText}
          onPress={() => setIsCadastro(!isCadastro)}
        >
          {isCadastro
            ? "Já tenho uma conta. Fazer login"
            : "Ainda não tenho uma conta. Criar cadastro"}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    padding: 24,
  },

  content: {
    width: "100%",
    maxWidth: 500,
    alignSelf: "center",
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

  switchText: {
    color: colors.primary,
    textAlign: "center",
    marginTop: 20,
    fontSize: 15,
  },
});

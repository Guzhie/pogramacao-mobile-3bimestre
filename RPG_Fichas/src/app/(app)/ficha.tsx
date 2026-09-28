import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { Button } from "@/components/button/Button";
import { colors } from "@/constants/colors";
import {
  carregarFichas,
  gerarId,
  salvarFichas,
} from "@/integration/fichaIntegration";

export default function Ficha() {
  const [nome, setNome] = useState("");
  const [sistema, setSistema] = useState("");
  const [nivel, setNivel] = useState("");
  const [raca, setRaca] = useState("");
  const [classe, setClasse] = useState("");

  async function salvarFicha() {
    if (!nome || !sistema || !nivel || !raca || !classe) {
      Alert.alert("Atenção", "Preencha todos os campos.");
      return;
    }

    try {
      const fichas = await carregarFichas();

      const novaFicha = {
        id: gerarId(),
        nome,
        sistema,
        nivel: Number(nivel),
        raca,
        classe,
      };

      await salvarFichas([...fichas, novaFicha]);

      Alert.alert(
        "Ficha criada",
        `A ficha de ${nome} foi criada com sucesso!`,
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ],
      );
    } catch {
      Alert.alert("Erro", "Não foi possível salvar a ficha.");
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Nova Ficha</Text>

        <Text style={styles.label}>Nome do personagem</Text>

        <TextInput
          style={styles.input}
          placeholder="Ex: Farnese"
          placeholderTextColor={colors.secondaryText}
          value={nome}
          onChangeText={setNome}
        />

        <Text style={styles.label}>Sistema</Text>

        <TextInput
          style={styles.input}
          placeholder="Ex: D&D 5e"
          placeholderTextColor={colors.secondaryText}
          value={sistema}
          onChangeText={setSistema}
        />

        <Text style={styles.label}>Nível</Text>

        <TextInput
          style={styles.input}
          placeholder="Ex: 5"
          placeholderTextColor={colors.secondaryText}
          value={nivel}
          onChangeText={setNivel}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Raça</Text>

        <TextInput
          style={styles.input}
          placeholder="Ex: Tiefling"
          placeholderTextColor={colors.secondaryText}
          value={raca}
          onChangeText={setRaca}
        />

        <Text style={styles.label}>Classe</Text>

        <TextInput
          style={styles.input}
          placeholder="Ex: Ladino"
          placeholderTextColor={colors.secondaryText}
          value={classe}
          onChangeText={setClasse}
        />

        <Button title="Salvar Ficha" onPress={salvarFicha} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 24,
  },

  label: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 8,
  },

  input: {
    backgroundColor: colors.card,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 15,
    marginBottom: 18,
  },
});
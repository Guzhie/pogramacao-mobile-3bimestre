import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from "react-native";
import { router } from "expo-router";

import { Button } from "@/components/button/Button";
import { colors } from "@/constants/colors";
import { Ficha } from "@/@types/ficha";

export default function FichaWeb() {
  const [nome, setNome] = useState("");
  const [sistema, setSistema] = useState("");
  const [nivel, setNivel] = useState("");
  const [raca, setRaca] = useState("");
  const [classe, setClasse] = useState("");

  function salvarFicha() {
    if (!nome || !sistema || !nivel || !raca || !classe) {
      Alert.alert("Atenção", "Preencha todos os campos.");
      return;
    }

    const dados = localStorage.getItem("fichas");

    let fichas: Ficha[] = [];

    if (dados) {
      try {
        fichas = JSON.parse(dados);
      } catch {
        fichas = [];
      }
    }

    const novaFicha: Ficha = {
      id: crypto.randomUUID(),
      nome,
      sistema,
      nivel: Number(nivel),
      raca,
      classe,
    };

    localStorage.setItem(
      "fichas",
      JSON.stringify([...fichas, novaFicha])
    );

    Alert.alert(
      "Ficha criada",
      `A ficha de ${nome} foi criada com sucesso!`,
      [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
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

      <Button
        title="Salvar Ficha"
        onPress={salvarFicha}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 40,
    backgroundColor: colors.background,
    alignItems: "center",
  },

  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 25,
  },

  label: {
    width: 500,
    maxWidth: "100%",
    color: colors.text,
    fontSize: 15,
    marginBottom: 6,
    marginTop: 12,
  },

  input: {
    width: 500,
    maxWidth: "100%",
    backgroundColor: colors.card,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 14,
  },
});
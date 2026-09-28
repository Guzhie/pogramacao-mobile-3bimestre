import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import { Button } from "@/components/button/Button";
import { colors } from "@/constants/colors";
import {
  carregarFichas,
  salvarFichas,
} from "@/integration/fichaIntegration.web";
import { Ficha } from "@/@types/ficha";

export default function FichaWeb() {
  const { id } = useLocalSearchParams<{ id?: string }>();

  const [nome, setNome] = useState("");
  const [sistema, setSistema] = useState("");
  const [nivel, setNivel] = useState("");
  const [raca, setRaca] = useState("");
  const [classe, setClasse] = useState("");

  const modoEdicao = !!id;

  useEffect(() => {
    async function carregarFicha() {
      if (!id) {
        return;
      }

      const fichas = await carregarFichas();
      const ficha = fichas.find((item) => item.id === id);

      if (!ficha) {
        Alert.alert("Erro", "Ficha não encontrada.");
        router.back();
        return;
      }

      setNome(ficha.nome);
      setSistema(ficha.sistema);
      setNivel(String(ficha.nivel));
      setRaca(ficha.raca);
      setClasse(ficha.classe);
    }

    carregarFicha();
  }, [id]);

  async function salvarFicha() {
    if (!nome.trim() || !sistema.trim() || !nivel.trim() || !raca.trim() || !classe.trim()) {
      Alert.alert("Atenção", "Preencha todos os campos.");
      return;
    }

    const nivelNumerico = Number(nivel);

    if (Number.isNaN(nivelNumerico)) {
      Alert.alert("Atenção", "O nível precisa ser um número.");
      return;
    }

    const fichas = await carregarFichas();

    if (modoEdicao) {
      const fichasAtualizadas = fichas.map((ficha) => {
        if (ficha.id !== id) {
          return ficha;
        }

        return {
          ...ficha,
          nome: nome.trim(),
          sistema: sistema.trim(),
          nivel: nivelNumerico,
          raca: raca.trim(),
          classe: classe.trim(),
        };
      });

      await salvarFichas(fichasAtualizadas);

      Alert.alert(
        "Ficha atualizada",
        `A ficha de ${nome} foi atualizada com sucesso!`,
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );

      return;
    }

    const novaFicha: Ficha = {
      id: `${Date.now().toString(36)}-${Math.random()
        .toString(36)
        .slice(2, 10)}`,
      nome: nome.trim(),
      sistema: sistema.trim(),
      nivel: nivelNumerico,
      raca: raca.trim(),
      classe: classe.trim(),
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
      ]
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        {modoEdicao ? "Editar Ficha" : "Nova Ficha"}
      </Text>

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
        title={modoEdicao ? "Salvar alterações" : "Salvar Ficha"}
        onPress={salvarFicha}
      />

      <Button
        title="Cancelar"
        onPress={() => router.back()}
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

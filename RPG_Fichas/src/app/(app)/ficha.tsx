import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/button/Button";
import { colors } from "@/constants/colors";
import { carregarFichas, salvarFichas } from "@/integration/fichaIntegration";
import { Ficha } from "@/@types/ficha";

export default function FichaScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();

  const [nome, setNome] = useState("");
  const [sistema, setSistema] = useState("");
  const [nivel, setNivel] = useState("");
  const [raca, setRaca] = useState("");
  const [classe, setClasse] = useState("");

  const [carregando, setCarregando] = useState(!!id);

  const modoEdicao = !!id;

  useEffect(() => {
    async function carregarFichaExistente() {
      if (!id) {
        setCarregando(false);
        return;
      }

      try {
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
      } catch {
        Alert.alert("Erro", "Não foi possível carregar a ficha.");
        router.back();
      } finally {
        setCarregando(false);
      }
    }

    carregarFichaExistente();
  }, [id]);

  async function salvarFicha() {
    if (
      !nome.trim() ||
      !sistema.trim() ||
      !nivel.trim() ||
      !raca.trim() ||
      !classe.trim()
    ) {
      Alert.alert("Atenção", "Preencha todos os campos.");
      return;
    }

    const nivelNumerico = Number(nivel);

    if (Number.isNaN(nivelNumerico)) {
      Alert.alert("Atenção", "O nível precisa ser um número.");
      return;
    }

    try {
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

        Alert.alert("Sucesso", "Ficha atualizada com sucesso.", [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]);

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

      Alert.alert("Sucesso", "Ficha criada com sucesso.", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch {
      Alert.alert("Erro", "Não foi possível salvar a ficha.");
    }
  }

  if (carregando) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.carregando}>
          <Text style={styles.carregandoTexto}>Carregando ficha...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>
          {modoEdicao ? "Editar Ficha" : "Nova Ficha"}
        </Text>

        <Text style={styles.label}>Nome do personagem</Text>
        <TextInput
          style={styles.input}
          value={nome}
          onChangeText={setNome}
          placeholder="Ex: Arkan"
          placeholderTextColor={colors.secondaryText}
        />

        <Text style={styles.label}>Sistema</Text>
        <TextInput
          style={styles.input}
          value={sistema}
          onChangeText={setSistema}
          placeholder="Ex: D&D 5e"
          placeholderTextColor={colors.secondaryText}
        />

        <Text style={styles.label}>Nível</Text>
        <TextInput
          style={styles.input}
          value={nivel}
          onChangeText={setNivel}
          placeholder="Ex: 5"
          placeholderTextColor={colors.secondaryText}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Raça</Text>
        <TextInput
          style={styles.input}
          value={raca}
          onChangeText={setRaca}
          placeholder="Ex: Humano"
          placeholderTextColor={colors.secondaryText}
        />

        <Text style={styles.label}>Classe</Text>
        <TextInput
          style={styles.input}
          value={classe}
          onChangeText={setClasse}
          placeholder="Ex: Guerreiro"
          placeholderTextColor={colors.secondaryText}
        />

        <Button
          title={modoEdicao ? "Salvar alterações" : "Salvar ficha"}
          onPress={salvarFicha}
        />

        <Button title="Cancelar" onPress={() => router.back()} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scroll: {
    padding: 20,
    gap: 12,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 12,
  },

  label: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
    marginTop: 4,
  },

  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 16,
  },

  carregando: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  carregandoTexto: {
    color: colors.text,
    fontSize: 16,
  },
});

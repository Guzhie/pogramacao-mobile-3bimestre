import { useCallback, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/card/Card";
import { colors } from "@/constants/colors";
import { Button } from "@/components/button/Button";
import { Ficha } from "@/@types/ficha";
import {
  carregarFichas,
  exportarFicha,
  importarFicha,
} from "@/integration/fichaIntegration";

export default function Home() {
  const { logout } = useAuth();
  const [fichas, setFichas] = useState<Ficha[]>([]);

  // recarrega toda vez que a tela volta a ficar em foco (ex.: depois de criar uma ficha)
  useFocusEffect(
    useCallback(() => {
      carregarFichas().then(setFichas);
    }, []),
  );

  function sair() {
    logout();
    router.replace("/");
  }

  function abrirFicha(ficha: Ficha) {
    router.push({
      pathname: "/ficha",
      params: {
        id: ficha.id,
      },
    });
  }

  function criarFicha() {
    router.push("/ficha");
  }

  async function exportar(ficha: Ficha) {
    try {
      await exportarFicha(ficha);
    } catch {
      Alert.alert("Erro", `Não foi possível exportar a ficha de ${ficha.nome}.`);
    }
  }

  async function importar() {
    try {
      const ficha = await importarFicha();

      if (ficha === null) {
        return; // cancelou
      }

      setFichas(await carregarFichas());
      Alert.alert("Importada", `A ficha de ${ficha.nome} foi importada!`);
    } catch {
      Alert.alert(
        "Erro",
        "Arquivo inválido. Escolha um .json de ficha exportado pelo app.",
      );
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Minhas Fichas</Text>

        <Text style={styles.subtitle}>Suas fichas de personagem</Text>

        <Button title="Sair" onPress={sair} />

        <View style={styles.list}>
          {fichas.length === 0 && (
            <Text style={styles.vazio}>Nenhuma ficha ainda.</Text>
          )}

          {fichas.map((ficha) => (
            <Card
              key={ficha.id}
              style={styles.ficha}
              onPress={() => abrirFicha(ficha)}
            >
              <Text style={styles.nome}>{ficha.nome}</Text>

              <Text style={styles.sistema}>{ficha.sistema}</Text>

              <View style={styles.info}>
                <Text style={styles.infoText}>Nível {ficha.nivel}</Text>

                <Text style={styles.infoText}>
                  {ficha.raca} • {ficha.classe}
                </Text>
              </View>

              <View style={styles.exportar}>
                <Button
                  title="Exportar (.json)"
                  onPress={() => exportar(ficha)}
                />
              </View>
            </Card>
          ))}
        </View>

        <View style={styles.botoes}>
          <Button title="+ Nova Ficha" onPress={criarFicha} />
          <Button title="Importar ficha (.json)" onPress={importar} />
        </View>
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
  },

  subtitle: {
    color: colors.secondaryText,
    fontSize: 16,
    marginTop: 5,
  },

  list: {
    marginTop: 24,
    marginBottom: 10,
  },

  vazio: {
    color: colors.secondaryText,
    fontSize: 14,
  },

  ficha: {
    marginBottom: 12,
  },

  nome: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "bold",
  },

  sistema: {
    color: colors.secondaryText,
    fontSize: 14,
    marginTop: 4,
  },

  info: {
    marginTop: 12,
  },

  infoText: {
    color: colors.secondaryText,
    fontSize: 14,
    marginTop: 3,
  },

  exportar: {
    marginTop: 14,
  },

  botoes: {
    gap: 12,
  },
});
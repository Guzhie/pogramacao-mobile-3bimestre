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
  excluirFicha,
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

  function confirmarExclusao(ficha: Ficha) {
    Alert.alert(
      "Excluir ficha",
      `Tem certeza que deseja excluir a ficha de ${ficha.nome}?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await excluirFicha(ficha.id);
              setFichas(await carregarFichas());
            } catch {
              Alert.alert("Erro", "Não foi possível excluir a ficha.");
            }
          },
        },
      ],
    );
  }

  async function exportar(ficha: Ficha) {
    try {
      const onde = await exportarFicha(ficha);

      if (onde) {
        Alert.alert("Exportada", `Salvo: ${onde}`);
      }
    } catch {
      Alert.alert(
        "Erro",
        `Não foi possível exportar a ficha de ${ficha.nome}.`,
      );
    }
  }

  async function importar() {
    try {
      const ficha = await importarFicha();

      if (ficha === null) {
        return;
      }

      setFichas(await carregarFichas());
      Alert.alert("Importada", `A ficha de ${ficha.nome} foi importada!`);
    } catch (erro: any) {
      console.error("Erro ao importar ficha:", erro);

      const motivos: Record<string, string> = {
        ARQUIVO_VAZIO:
          "O arquivo está vazio. Exporte a ficha de novo e tente outra vez.",
        NAO_E_JSON: "O arquivo não é um JSON válido.",
        VARIAS_FICHAS:
          "Esse arquivo tem várias fichas. Importe um arquivo de uma ficha só.",
        FORMATO_INVALIDO:
          "O JSON não tem os campos de uma ficha (nome, sistema, nivel, classe, raca).",
      };

      Alert.alert(
        "Erro ao importar",
        motivos[erro?.message] ??
          `Não foi possível ler o arquivo.\n\n${erro?.message ?? erro}`,
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

                <View style={styles.excluir}>
                  <Button
                    title="Excluir ficha"
                    onPress={() => confirmarExclusao(ficha)}
                  />
                </View>
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

  excluir: {
    marginTop: 10,
  },

  botoes: {
    gap: 12,
  },
});

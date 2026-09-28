import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { Card } from "@/components/card/Card";
import { colors } from "@/constants/colors";
import { Button } from "@/components/button/Button";
import { Ficha } from "@/@types/ficha";

const fichas: Ficha[] = [
  {
    id: "1",
    nome: "Farnese",
    sistema: "D&D 5e",
    nivel: 5,
    classe: "Ladino",
    raca: "Tiefling",
  },
  {
    id: "2",
    nome: "Bartolomeu",
    sistema: "Ordem Paranormal",
    nivel: 5,
    classe: "Combatente",
    raca: "Humano",
  },
];

export default function Home() {
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

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Minhas Fichas</Text>

        <Text style={styles.subtitle}>Suas fichas de personagem</Text>

        <View style={styles.list}>
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
            </Card>
          ))}
        </View>

        <Button title="+ Nova Ficha" onPress={criarFicha} />
      </ScrollView>
    </View>
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
});

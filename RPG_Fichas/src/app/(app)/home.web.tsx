import { useCallback, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/card/Card";
import { Button } from "@/components/button/Button";
import { colors } from "@/constants/colors";
import { Ficha } from "@/@types/ficha";

function carregarFichasWeb(): Ficha[] {
  const dados = localStorage.getItem("fichas");

  if (!dados) {
    return [];
  }

  try {
    return JSON.parse(dados);
  } catch {
    return [];
  }
}

function salvarFichasWeb(fichas: Ficha[]) {
  localStorage.setItem("fichas", JSON.stringify(fichas));
}

export default function HomeWeb() {
  const { logout } = useAuth();
  const [fichas, setFichas] = useState<Ficha[]>([]);

  useFocusEffect(
    useCallback(() => {
      setFichas(carregarFichasWeb());
    }, [])
  );

  function sair() {
    logout();
    router.replace("/");
  }

  function criarFicha() {
    router.push("/ficha");
  }

  function abrirFicha(ficha: Ficha) {
    router.push({
      pathname: "/ficha",
      params: {
        id: ficha.id,
      },
    });
  }

  function excluirFicha(ficha: Ficha) {
    const confirmar = window.confirm(
      `Deseja excluir a ficha de ${ficha.nome}?`
    );

    if (!confirmar) {
      return;
    }

    const novasFichas = fichas.filter(
      (item) => item.id !== ficha.id
    );

    salvarFichasWeb(novasFichas);
    setFichas(novasFichas);
  }

  function exportarFicha(ficha: Ficha) {
    const conteudo = JSON.stringify(ficha, null, 2);

    const arquivo = new Blob([conteudo], {
      type: "application/json",
    });

    const url = URL.createObjectURL(arquivo);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${ficha.nome}.json`;
    link.click();

    URL.revokeObjectURL(url);
  }

  function importarFicha() {
    const input = document.createElement("input");

    input.type = "file";
    input.accept = ".json,application/json";

    input.onchange = async () => {
      const arquivo = input.files?.[0];

      if (!arquivo) {
        return;
      }

      try {
        const texto = await arquivo.text();
        const ficha = JSON.parse(texto) as Ficha;

        if (
          !ficha.nome ||
          !ficha.sistema ||
          !ficha.nivel ||
          !ficha.raca ||
          !ficha.classe
        ) {
          alert("O arquivo não contém uma ficha válida.");
          return;
        }

        const novasFichas = [
          ...fichas,
          {
            ...ficha,
            id: ficha.id || crypto.randomUUID(),
          },
        ];

        salvarFichasWeb(novasFichas);
        setFichas(novasFichas);

        alert("Ficha importada com sucesso!");
      } catch {
        alert("Não foi possível ler o arquivo.");
      }
    };

    input.click();
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Caderno de Fichas</Text>

      <Text style={styles.subtitle}>
        Minhas fichas de personagem
      </Text>

      <View style={styles.topButtons}>
        <Button title="Nova Ficha" onPress={criarFicha} />
        <Button
          title="Importar ficha (.json)"
          onPress={importarFicha}
        />
        <Button title="Sair" onPress={sair} />
      </View>

      {fichas.length === 0 && (
        <Text style={styles.vazio}>
          Nenhuma ficha cadastrada.
        </Text>
      )}

      {fichas.map((ficha) => (
        <Card
          key={ficha.id}
          style={styles.ficha}
          onPress={() => abrirFicha(ficha)}
        >
          <Text style={styles.nome}>{ficha.nome}</Text>

          <Text style={styles.sistema}>
            {ficha.sistema}
          </Text>

          <Text style={styles.info}>
            Nível {ficha.nivel}
          </Text>

          <Text style={styles.info}>
            {ficha.raca} • {ficha.classe}
          </Text>

          <View style={styles.acoes}>
            <Button
              title="Exportar"
              onPress={() => exportarFicha(ficha)}
            />

            <Button
              title="Excluir"
              onPress={() => excluirFicha(ficha)}
            />
          </View>
        </Card>
      ))}
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
    fontSize: 32,
    fontWeight: "bold",
  },

  subtitle: {
    color: colors.secondaryText,
    fontSize: 16,
    marginTop: 8,
    marginBottom: 25,
  },

  topButtons: {
    width: 500,
    maxWidth: "100%",
    gap: 12,
    marginBottom: 25,
  },

  vazio: {
    color: colors.secondaryText,
  },

  ficha: {
    width: 500,
    maxWidth: "100%",
    marginBottom: 15,
  },

  nome: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "bold",
  },

  sistema: {
    color: colors.secondaryText,
    marginTop: 5,
  },

  info: {
    color: colors.secondaryText,
    marginTop: 5,
  },

  acoes: {
    gap: 10,
    marginTop: 15,
  },
});
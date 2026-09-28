import { File, Paths } from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";
import * as Sharing from "expo-sharing";

import { Ficha } from "@/@types/ficha";

const fichasFile = new File(Paths.document, "fichas.json");

// crypto.randomUUID() não existe no Hermes/Android — use isto no lugar
export function gerarId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function salvarFichas(fichas: Ficha[]) {
  // o arquivo precisa existir antes do write()
  if (!fichasFile.exists) {
    fichasFile.create();
  }

  fichasFile.write(JSON.stringify(fichas, null, 2));
}

export async function carregarFichas(): Promise<Ficha[]> {
  if (!fichasFile.exists) {
    return [];
  }

  const conteudo = await fichasFile.text();

  if (!conteudo.trim()) {
    return [];
  }

  try {
    const dados = JSON.parse(conteudo);
    return Array.isArray(dados) ? dados : [];
  } catch {
    return [];
  }
}

function nomeDoArquivo(ficha: Ficha) {
  const limpo = ficha.nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

  return `ficha-${limpo || "personagem"}.json`;
}

// exporta UMA ficha: gera um .json temporário e abre o menu de compartilhar/salvar
export async function exportarFicha(ficha: Ficha) {
  const arquivo = new File(Paths.cache, nomeDoArquivo(ficha));

  if (arquivo.exists) {
    arquivo.delete();
  }

  arquivo.create();
  arquivo.write(JSON.stringify(ficha, null, 2));

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error("SEM_COMPARTILHAMENTO");
  }

  await Sharing.shareAsync(arquivo.uri, {
    mimeType: "application/json",
    dialogTitle: `Exportar ${ficha.nome}`,
    UTI: "public.json",
  });
}

function fichaValida(f: any): boolean {
  return (
    f &&
    typeof f === "object" &&
    typeof f.nome === "string" &&
    typeof f.sistema === "string" &&
    typeof f.classe === "string" &&
    typeof f.raca === "string" &&
    !Number.isNaN(Number(f.nivel))
  );
}

// importa UMA ficha. Retorna a ficha importada, ou null se o usuário cancelou
export async function importarFicha(): Promise<Ficha | null> {
  // "*/*" porque no Android alguns gerenciadores de arquivo não marcam .json
  // como application/json; a validação é feita abaixo
  const resultado = await DocumentPicker.getDocumentAsync({
    type: "*/*",
    copyToCacheDirectory: true,
  });

  if (resultado.canceled) {
    return null;
  }

  const conteudo = await new File(resultado.assets[0].uri).text();
  const dados = JSON.parse(conteudo); // lança erro se não for JSON

  if (!fichaValida(dados)) {
    throw new Error("FORMATO_INVALIDO");
  }

  const atuais = await carregarFichas();

  // se já existe uma ficha com o mesmo id, gera um id novo pra não sobrescrever
  const idJaExiste =
    typeof dados.id !== "string" || !dados.id || atuais.some((f) => f.id === dados.id);

  const nova: Ficha = {
    id: idJaExiste ? gerarId() : dados.id,
    nome: dados.nome,
    sistema: dados.sistema,
    nivel: Number(dados.nivel),
    classe: dados.classe,
    raca: dados.raca,
  };

  await salvarFichas([...atuais, nova]);

  return nova;
}
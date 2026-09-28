import { Platform } from "react-native";
import { Directory, File, Paths } from "expo-file-system";
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

// exporta UMA ficha. No Android o usuário escolhe a pasta onde salvar.
// Retorna uma descrição de onde salvou (nome do arquivo + pasta), ou null se cancelou.
export async function exportarFicha(ficha: Ficha): Promise<string | null> {
  const conteudo = JSON.stringify(ficha, null, 2);
  const nome = nomeDoArquivo(ficha);

  if (Platform.OS === "android") {
    let pasta: Directory;

    try {
      pasta = await Directory.pickDirectoryAsync();
    } catch {
      return null; // cancelou o seletor de pasta
    }

    // createFile recebe o nome SEM extensão duplicada e o mime type
    const arquivo = pasta.createFile(
      nome.replace(/\.json$/, ""),
      "application/json",
    );
    arquivo.write(conteudo);

    // confere se o arquivo realmente foi criado e tem conteúdo
    if (!arquivo.exists || !arquivo.size) {
      throw new Error("ARQUIVO_VAZIO");
    }

    return `${arquivo.name} na pasta "${pasta.name}"`;
  }

  // iOS (e outros): sem seletor de pasta, usa o menu de compartilhar
  const temporario = new File(Paths.cache, nome);

  if (temporario.exists) {
    temporario.delete();
  }

  temporario.create();
  temporario.write(conteudo);

  await Sharing.shareAsync(temporario.uri, {
    mimeType: "application/json",
    dialogTitle: `Exportar ${ficha.nome}`,
    UTI: "public.json",
  });

  return nome;
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

// valida o texto do arquivo e devolve o objeto da ficha (ou lança um erro com o motivo)
function lerFicha(conteudo: string): any {
  if (!conteudo || !conteudo.trim()) {
    throw new Error("ARQUIVO_VAZIO");
  }

  let dados: any;

  try {
    dados = JSON.parse(conteudo.replace(/^\uFEFF/, "")); // remove BOM, se tiver
  } catch {
    throw new Error("NAO_E_JSON");
  }

  // aceita um arquivo antigo com lista de 1 ficha; mais de uma não
  if (Array.isArray(dados)) {
    if (dados.length !== 1) {
      throw new Error("VARIAS_FICHAS");
    }
    dados = dados[0];
  }

  if (!fichaValida(dados)) {
    throw new Error("FORMATO_INVALIDO");
  }

  return dados;
}

// importa UMA ficha. Retorna a ficha importada, ou null se o usuário cancelou
export async function importarFicha(): Promise<Ficha | null> {
  const resultado = await DocumentPicker.getDocumentAsync({
    type: "*/*",
    copyToCacheDirectory: true,
  });

  if (resultado.canceled) {
    return null;
  }

  const uri = resultado.assets[0].uri;

  const response = await fetch(uri);

  if (!response.ok) {
    throw new Error("NAO_FOI_POSSIVEL_LER");
  }

  const conteudo = await response.text();
  const dados = lerFicha(conteudo);

  const atuais = await carregarFichas();

  const nova: Ficha = {
    id: gerarId(),
    nome: dados.nome,
    sistema: dados.sistema,
    nivel: Number(dados.nivel),
    classe: dados.classe,
    raca: dados.raca,
  };

  await salvarFichas([...atuais, nova]);

  return nova;
}

export async function excluirFicha(id: string) {
  const fichas = await carregarFichas();

  const novasFichas = fichas.filter((ficha) => ficha.id !== id);

  await salvarFichas(novasFichas);
}

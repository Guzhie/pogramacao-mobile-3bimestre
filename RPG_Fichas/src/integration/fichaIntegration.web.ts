import { Ficha } from "@/@types/ficha";

const CHAVE = "fichas";

export function gerarId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function salvarFichas(fichas: Ficha[]) {
  localStorage.setItem(CHAVE, JSON.stringify(fichas));
}

export async function carregarFichas(): Promise<Ficha[]> {
  try {
    const dados = JSON.parse(localStorage.getItem(CHAVE) ?? "[]");
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

// na web: Chrome/Edge abrem a janela "Salvar como" (escolhe a pasta);
// nos outros navegadores cai no download normal
export async function exportarFicha(ficha: Ficha): Promise<string | null> {
  const conteudo = JSON.stringify(ficha, null, 2);
  const nome = nomeDoArquivo(ficha);

  const picker = (window as any).showSaveFilePicker;

  if (picker) {
    try {
      const handle = await picker({
        suggestedName: nome,
        types: [
          { description: "Ficha de RPG", accept: { "application/json": [".json"] } },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(conteudo);
      await writable.close();
      return handle.name;
    } catch (erro: any) {
      if (erro?.name === "AbortError") {
        return null; // cancelou
      }
      throw erro;
    }
  }

  const blob = new Blob([conteudo], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  a.click();
  URL.revokeObjectURL(url);

  return `${nome} (pasta Downloads do navegador)`;
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

function escolherArquivo(): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json";
    input.onchange = () => resolve(input.files?.[0] ?? null);
    input.addEventListener("cancel", () => resolve(null));
    input.click();
  });
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

export async function importarFicha(): Promise<Ficha | null> {
  const arquivo = await escolherArquivo();

  if (!arquivo) {
    return null;
  }

  const dados = lerFicha(await arquivo.text());

  const atuais = await carregarFichas();

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
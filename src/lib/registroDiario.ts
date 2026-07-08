import type { HumorDia, QuantidadeRefeicao, QualidadeSono } from "@/types";

export const HUMOR_OPCOES: { valor: HumorDia; emoji: string; label: string }[] = [
  { valor: "OTIMO", emoji: "😄", label: "Ótimo" },
  { valor: "BOM", emoji: "🙂", label: "Bom" },
  { valor: "AGITADO", emoji: "😣", label: "Agitado" },
  { valor: "CHOROSO", emoji: "😢", label: "Choroso" },
  { valor: "ADOECIDO", emoji: "🤒", label: "Adoecido" },
];

export const SONO_OPCOES: { valor: QualidadeSono; emoji: string; label: string }[] = [
  { valor: "DORMIU_BEM", emoji: "😴", label: "Dormiu bem" },
  { valor: "DORMIU_POUCO", emoji: "😪", label: "Dormiu pouco" },
  { valor: "AGITADO", emoji: "😖", label: "Agitado" },
  { valor: "NAO_DORMIU", emoji: "🥱", label: "Não dormiu" },
];

export const REFEICAO_OPCOES: { valor: QuantidadeRefeicao; label: string }[] = [
  { valor: "TUDO", label: "Tudo" },
  { valor: "METADE", label: "Metade" },
  { valor: "POUCO", label: "Pouco" },
  { valor: "RECUSOU", label: "Recusou" },
  { valor: "NAO_SE_APLICA", label: "N/A" },
];

export function getHumorInfo(valor: HumorDia) {
  return HUMOR_OPCOES.find((opcao) => opcao.valor === valor);
}

export function getSonoInfo(valor: QualidadeSono) {
  return SONO_OPCOES.find((opcao) => opcao.valor === valor);
}

export function getRefeicaoInfo(valor: QuantidadeRefeicao) {
  return REFEICAO_OPCOES.find((opcao) => opcao.valor === valor);
}

export function hojeISO(): string {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

export function formatarDataLabel(iso: string): string {
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

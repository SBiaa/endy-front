import type { StatusPresenca } from "@/types";

export const STATUS_PRESENCA_OPCOES: { valor: StatusPresenca; label: string }[] = [
  { valor: "PRESENTE", label: "Presente" },
  { valor: "AUSENTE", label: "Ausente" },
  { valor: "JUSTIFICADO", label: "Justificado" },
];

export function getStatusPresencaInfo(valor: StatusPresenca) {
  return STATUS_PRESENCA_OPCOES.find((opcao) => opcao.valor === valor);
}

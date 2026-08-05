"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, AlertCircle, type LucideIcon } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { EmptyState } from "@/components/EmptyState";
import { Spinner } from "@/components/Spinner";
import { SeletorFilhos } from "@/components/SeletorFilhos";
import { hojeISO, formatarDataLabel } from "@/lib/registroDiario";
import { getStatusPresencaInfo } from "@/lib/presenca";
import type { Aluno, Presenca, StatusPresenca } from "@/types";
import styles from "./presenca.module.css";

const STATUS_ICONE: Record<StatusPresenca, LucideIcon> = {
  PRESENTE: CheckCircle2,
  AUSENTE: XCircle,
  JUSTIFICADO: AlertCircle,
};

const STATUS_CLASSE: Record<StatusPresenca, string> = {
  PRESENTE: "statusPresente",
  AUSENTE: "statusAusente",
  JUSTIFICADO: "statusJustificado",
};

export default function PresencaPage() {
  const [alunos, setAlunos] = useState<Aluno[] | null>(null);
  const [alunoSelecionadoId, setAlunoSelecionadoId] = useState("");
  const [presencas, setPresencas] = useState<Presenca[] | null>(null);
  const [listError, setListError] = useState("");

  useEffect(() => {
    fetchApi("/alunos")
      .then((data: Aluno[]) => {
        setAlunos(data);
        if (data[0]) setAlunoSelecionadoId(data[0].id);
      })
      .catch((err) => {
        setListError(err instanceof Error ? err.message : "Erro ao carregar filhos");
        setAlunos([]);
      });
  }, []);

  useEffect(() => {
    if (!alunoSelecionadoId) return;

    fetchApi(`/presencas?alunoId=${alunoSelecionadoId}`)
      .then((data: Presenca[]) => {
        const ordenadas = [...data].sort(
          (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
        );
        setPresencas(ordenadas);
      })
      .catch((err) => {
        setListError(err instanceof Error ? err.message : "Erro ao carregar presenças");
        setPresencas([]);
      });
  }, [alunoSelecionadoId]);

  const presencaHoje = presencas?.find((p) => p.data.slice(0, 10) === hojeISO());
  const presencasAnteriores = presencas?.filter((p) => p !== presencaHoje) ?? [];

  return (
    <div>
      <h1 className={styles.title}>Presença</h1>

      {alunos && alunos.length > 1 && (
        <SeletorFilhos
          alunos={alunos}
          valor={alunoSelecionadoId}
          onChange={setAlunoSelecionadoId}
        />
      )}

      {listError && <div className={styles.listError}>{listError}</div>}

      {presencas === null && !listError && <Spinner />}

      {presencas !== null && presencas.length === 0 && !listError && (
        <EmptyState message="Nenhum registro de presença ainda." />
      )}

      {presencaHoje && (
        <div className={styles.destaqueWrap}>
          <PresencaLinha presenca={presencaHoje} destaque />
        </div>
      )}

      {presencasAnteriores.length > 0 && (
        <div className={styles.lista}>
          {presencasAnteriores.map((presenca) => (
            <PresencaLinha key={presenca.id} presenca={presenca} />
          ))}
        </div>
      )}
    </div>
  );
}

function PresencaLinha({
  presenca,
  destaque,
}: {
  presenca: Presenca;
  destaque?: boolean;
}) {
  const info = getStatusPresencaInfo(presenca.status);
  const Icone = STATUS_ICONE[presenca.status];

  return (
    <div
      className={`${styles.linha} ${styles[STATUS_CLASSE[presenca.status]]} ${
        destaque ? styles.destaque : ""
      }`}
    >
      <div className={styles.linhaTopo}>
        <span className={styles.data}>{formatarDataLabel(presenca.data.slice(0, 10))}</span>
        {destaque && <span className={styles.badgeHoje}>Hoje</span>}
      </div>
      <div className={styles.status}>
        <Icone size={18} />
        <span>{info?.label ?? presenca.status}</span>
      </div>
      {presenca.motivo && <div className={styles.motivo}>{presenca.motivo}</div>}
    </div>
  );
}

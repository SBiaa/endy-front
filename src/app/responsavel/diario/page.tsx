"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { EmptyState } from "@/components/EmptyState";
import { Spinner } from "@/components/Spinner";
import { SeletorFilhos } from "@/components/SeletorFilhos";
import { RegistroDiarioCard } from "@/components/RegistroDiarioCard";
import { getHumorInfo, hojeISO, formatarDataLabel } from "@/lib/registroDiario";
import type { Aluno, RegistroDiario } from "@/types";
import styles from "./diario.module.css";

export default function DiarioPage() {
  const [alunos, setAlunos] = useState<Aluno[] | null>(null);
  const [alunoSelecionadoId, setAlunoSelecionadoId] = useState("");
  const [registros, setRegistros] = useState<RegistroDiario[] | null>(null);
  const [listError, setListError] = useState("");
  const [expandidoId, setExpandidoId] = useState<string | null>(null);

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

    fetchApi(`/registros-diario?alunoId=${alunoSelecionadoId}`)
      .then((data: RegistroDiario[]) => {
        const ordenados = [...data].sort(
          (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
        );
        setRegistros(ordenados);
        setExpandidoId(null);
      })
      .catch((err) => {
        setListError(
          err instanceof Error ? err.message : "Erro ao carregar registros"
        );
        setRegistros([]);
      });
  }, [alunoSelecionadoId]);

  const alunoSelecionado = alunos?.find((a) => a.id === alunoSelecionadoId);
  const registroHoje = registros?.find((r) => r.data.slice(0, 10) === hojeISO());
  const registrosAnteriores = registros?.filter((r) => r !== registroHoje) ?? [];

  return (
    <div>
      <h1 className={styles.title}>Diário</h1>

      {alunos && alunos.length > 1 && (
        <SeletorFilhos
          alunos={alunos}
          valor={alunoSelecionadoId}
          onChange={setAlunoSelecionadoId}
        />
      )}

      {listError && <div className={styles.listError}>{listError}</div>}

      {registros === null && !listError && <Spinner />}

      {registros !== null && registros.length === 0 && !listError && (
        <EmptyState
          message={`Nenhum registro ainda para ${
            alunoSelecionado?.nome ?? "este filho"
          }.`}
        />
      )}

      {registroHoje && <RegistroDiarioCard registro={registroHoje} destaque />}

      {registrosAnteriores.length > 0 && (
        <div className={styles.timeline}>
          <h2 className={styles.timelineTitle}>Dias anteriores</h2>
          {registrosAnteriores.map((registro) => {
            const humor = getHumorInfo(registro.humor);
            const expandido = expandidoId === registro.id;
            return (
              <div key={registro.id}>
                <button
                  type="button"
                  className={styles.timelineItem}
                  onClick={() => setExpandidoId(expandido ? null : registro.id)}
                >
                  <span className={styles.timelineData}>
                    {formatarDataLabel(registro.data.slice(0, 10))}
                  </span>
                  {humor && <span className={styles.timelineEmoji}>{humor.emoji}</span>}
                  <span className={styles.timelineResumo}>{humor?.label}</span>
                  {expandido ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                {expandido && (
                  <div className={styles.expandido}>
                    <RegistroDiarioCard registro={registro} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

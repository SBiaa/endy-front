"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { hojeISO } from "@/lib/registroDiario";
import { STATUS_PRESENCA_OPCOES } from "@/lib/presenca";
import { presencaItemSchema } from "@/schemas/presenca";
import { Button } from "./Button";
import { Spinner } from "./Spinner";
import type { Aluno, Presenca, StatusPresenca } from "@/types";
import styles from "./ChamadaForm.module.css";

interface ChamadaFormProps {
  turmaId: string;
  alunos: Aluno[];
  onSuccess: () => void;
  onCancel: () => void;
}

interface RegistroAluno {
  status: StatusPresenca | "";
  motivo: string;
}

const PILL_CLASSE: Record<StatusPresenca, string> = {
  PRESENTE: "pillPresente",
  AUSENTE: "pillAusente",
  JUSTIFICADO: "pillJustificado",
};

export function ChamadaForm({ turmaId, alunos, onSuccess, onCancel }: ChamadaFormProps) {
  const [data, setData] = useState(hojeISO());
  const [registros, setRegistros] = useState<Record<string, RegistroAluno>>({});
  const [carregando, setCarregando] = useState(true);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    setCarregando(true);
    setErro("");

    const alunoIds = new Set(alunos.map((aluno) => aluno.id));

    fetchApi(`/presencas?data=${data}`)
      .then((existentes: Presenca[]) => {
        const iniciais: Record<string, RegistroAluno> = {};
        for (const aluno of alunos) {
          iniciais[aluno.id] = { status: "", motivo: "" };
        }
        for (const presenca of existentes) {
          if (alunoIds.has(presenca.alunoId)) {
            iniciais[presenca.alunoId] = {
              status: presenca.status,
              motivo: presenca.motivo ?? "",
            };
          }
        }
        setRegistros(iniciais);
      })
      .catch((err) => {
        setErro(err instanceof Error ? err.message : "Erro ao carregar chamada");
      })
      .finally(() => setCarregando(false));
  }, [data, alunos]);

  function definirStatus(alunoId: string, status: StatusPresenca) {
    setRegistros((atual) => ({
      ...atual,
      [alunoId]: { ...atual[alunoId], status },
    }));
    setErros((atual) => {
      const { [alunoId]: _removido, ...resto } = atual;
      return resto;
    });
  }

  function definirMotivo(alunoId: string, motivo: string) {
    setRegistros((atual) => ({
      ...atual,
      [alunoId]: { ...atual[alunoId], motivo },
    }));
  }

  async function handleSubmit() {
    setErro("");

    const marcados = alunos.filter((aluno) => registros[aluno.id]?.status);

    if (marcados.length === 0) {
      setErro("Marque a presença de ao menos um aluno.");
      return;
    }

    const novosErros: Record<string, string> = {};
    for (const aluno of marcados) {
      const registro = registros[aluno.id];
      const resultado = presencaItemSchema.safeParse({
        alunoId: aluno.id,
        status: registro.status,
        motivo: registro.motivo.trim() || undefined,
      });
      if (!resultado.success) {
        const erroMotivo = resultado.error.issues.find((issue) => issue.path[0] === "motivo");
        if (erroMotivo) novosErros[aluno.id] = erroMotivo.message;
      }
    }

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      return;
    }

    setEnviando(true);

    try {
      await fetchApi("/presencas/lote", {
        method: "POST",
        body: JSON.stringify({
          turmaId,
          data,
          registros: marcados.map((aluno) => ({
            alunoId: aluno.id,
            status: registros[aluno.id].status,
            motivo: registros[aluno.id].motivo.trim() || undefined,
          })),
        }),
      });
      setSucesso(true);
      setTimeout(onSuccess, 1200);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao salvar chamada");
      setEnviando(false);
    }
  }

  if (sucesso) {
    return <p className={styles.sucesso}>Chamada salva com sucesso!</p>;
  }

  return (
    <div className={styles.form}>
      <div className={styles.field}>
        <label htmlFor="dataChamada">Data</label>
        <input
          id="dataChamada"
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
        />
      </div>

      {carregando ? (
        <Spinner />
      ) : (
        <div className={styles.alunosList}>
          {alunos.map((aluno) => {
            const registro = registros[aluno.id] ?? { status: "", motivo: "" };
            return (
              <div key={aluno.id} className={styles.alunoRow}>
                <div className={styles.alunoLinha}>
                  <span className={styles.alunoNome}>{aluno.nome}</span>
                  <div className={styles.pillGroup}>
                    {STATUS_PRESENCA_OPCOES.map((opcao) => (
                      <button
                        key={opcao.valor}
                        type="button"
                        className={`${styles.pill} ${styles[PILL_CLASSE[opcao.valor]]} ${
                          registro.status === opcao.valor ? styles.pillAtivo : ""
                        }`}
                        onClick={() => definirStatus(aluno.id, opcao.valor)}
                      >
                        {opcao.label}
                      </button>
                    ))}
                  </div>
                </div>

                {registro.status === "JUSTIFICADO" && (
                  <div className={styles.motivoField}>
                    <input
                      value={registro.motivo}
                      onChange={(e) => definirMotivo(aluno.id, e.target.value)}
                      placeholder="Motivo da falta"
                      autoFocus
                    />
                    {erros[aluno.id] && <div className={styles.erro}>{erros[aluno.id]}</div>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {erro && <div className={styles.erro}>{erro}</div>}

      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="button" onClick={handleSubmit} disabled={enviando || carregando}>
          {enviando ? "Salvando..." : "Salvar chamada"}
        </Button>
      </div>
    </div>
  );
}

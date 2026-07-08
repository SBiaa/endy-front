"use client";

import { useState } from "react";
import { fetchApi } from "@/lib/api";
import { Button } from "./Button";
import type { Aluno, Turma, TipoPublicacao } from "@/types";
import styles from "./PublicacaoForm.module.css";

interface PublicacaoFormProps {
  tipoInicial: TipoPublicacao;
  turmaIdInicial?: string;
  alunoIdInicial?: string;
  turmasDisponiveis: Turma[];
  alunosDisponiveis: Aluno[];
  onSuccess: () => void;
  onCancel: () => void;
}

const TIPOS: { valor: TipoPublicacao; label: string }[] = [
  { valor: "GERAL", label: "Geral" },
  { valor: "TURMA", label: "Turma" },
  { valor: "INDIVIDUAL", label: "Individual" },
];

export function PublicacaoForm({
  tipoInicial,
  turmaIdInicial,
  alunoIdInicial,
  turmasDisponiveis,
  alunosDisponiveis,
  onSuccess,
  onCancel,
}: PublicacaoFormProps) {
  const [tipo, setTipo] = useState<TipoPublicacao>(tipoInicial);
  const [turmaId, setTurmaId] = useState(turmaIdInicial ?? "");
  const [alunoId, setAlunoId] = useState(alunoIdInicial ?? "");
  const [conteudo, setConteudo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  const turmaSelectDesabilitado = tipo === "TURMA" && Boolean(turmaIdInicial);
  const alunoSelectDesabilitado = tipo === "INDIVIDUAL" && Boolean(alunoIdInicial);

  const podeEnviar =
    conteudo.trim().length > 0 &&
    (tipo !== "TURMA" || Boolean(turmaId)) &&
    (tipo !== "INDIVIDUAL" || Boolean(alunoId));

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEnviando(true);
    setErro("");

    const payload: Record<string, unknown> = { tipo, conteudo };
    if (tipo === "TURMA") payload.turmaId = turmaId;
    if (tipo === "INDIVIDUAL") payload.alunoId = alunoId;

    try {
      await fetchApi("/publicacoes", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setSucesso(true);
      setTimeout(onSuccess, 1200);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao publicar");
      setEnviando(false);
    }
  }

  if (sucesso) {
    return <p className={styles.sucesso}>Publicado com sucesso!</p>;
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.tipoSelector}>
        {TIPOS.map(({ valor, label }) => (
          <button
            key={valor}
            type="button"
            className={`${styles.tipoButton} ${
              tipo === valor ? styles.tipoButtonAtivo : ""
            }`}
            onClick={() => setTipo(valor)}
          >
            {label}
          </button>
        ))}
      </div>

      {tipo === "TURMA" && (
        <div className={styles.field}>
          <label htmlFor="turmaId">Turma</label>
          <select
            id="turmaId"
            value={turmaId}
            onChange={(e) => setTurmaId(e.target.value)}
            disabled={turmaSelectDesabilitado}
            required
          >
            <option value="" disabled>
              Selecione uma turma
            </option>
            {turmasDisponiveis.map((turma) => (
              <option key={turma.id} value={turma.id}>
                {turma.nome}
              </option>
            ))}
          </select>
        </div>
      )}

      {tipo === "INDIVIDUAL" && (
        <div className={styles.field}>
          <label htmlFor="alunoId">Aluno</label>
          <select
            id="alunoId"
            value={alunoId}
            onChange={(e) => setAlunoId(e.target.value)}
            disabled={alunoSelectDesabilitado}
            required
          >
            <option value="" disabled>
              Selecione um aluno
            </option>
            {alunosDisponiveis.map((aluno) => (
              <option key={aluno.id} value={aluno.id}>
                {aluno.nome}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className={styles.field}>
        <label htmlFor="conteudo">Conteúdo</label>
        <textarea
          id="conteudo"
          value={conteudo}
          onChange={(e) => setConteudo(e.target.value)}
          required
          autoFocus
        />
      </div>

      {erro && <div className={styles.erro}>{erro}</div>}

      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={!podeEnviar || enviando}>
          {enviando ? "Publicando..." : "Publicar"}
        </Button>
      </div>
    </form>
  );
}

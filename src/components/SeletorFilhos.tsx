"use client";

import type { Aluno } from "@/types";
import styles from "./SeletorFilhos.module.css";

interface SeletorFilhosProps {
  alunos: Aluno[];
  valor: string;
  onChange: (alunoId: string) => void;
  comOpcaoTodos?: boolean;
}

export function SeletorFilhos({
  alunos,
  valor,
  onChange,
  comOpcaoTodos,
}: SeletorFilhosProps) {
  return (
    <div className={styles.seletor}>
      {comOpcaoTodos && (
        <button
          type="button"
          className={`${styles.botao} ${!valor ? styles.botaoAtivo : ""}`}
          onClick={() => onChange("")}
        >
          Todos
        </button>
      )}
      {alunos.map((aluno) => (
        <button
          key={aluno.id}
          type="button"
          className={`${styles.botao} ${valor === aluno.id ? styles.botaoAtivo : ""}`}
          onClick={() => onChange(aluno.id)}
        >
          {aluno.nome}
        </button>
      ))}
    </div>
  );
}

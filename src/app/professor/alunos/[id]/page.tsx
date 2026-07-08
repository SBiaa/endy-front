"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { Spinner } from "@/components/Spinner";
import type { Aluno } from "@/types";
import styles from "./alunoPerfil.module.css";

export default function PerfilAlunoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [aluno, setAluno] = useState<Aluno | null>(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    fetchApi(`/alunos/${id}`)
      .then(setAluno)
      .catch((err) => {
        setLoadError(err instanceof Error ? err.message : "Erro ao carregar aluno");
      });
  }, [id]);

  return (
    <div>
      <Link href="/professor" className={styles.backLink}>
        <ArrowLeft size={16} />
        Voltar
      </Link>

      {loadError && <div className={styles.loadError}>{loadError}</div>}

      {!aluno && !loadError && <Spinner />}

      {aluno && (
        <div className={styles.card}>
          <div className={styles.nome}>{aluno.nome}</div>
          <p className={styles.aviso}>Perfil completo em breve.</p>
        </div>
      )}
    </div>
  );
}

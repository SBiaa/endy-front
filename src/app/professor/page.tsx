"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { EmptyState } from "@/components/EmptyState";
import { CardGridSkeleton } from "@/components/CardGridSkeleton";
import type { Turma } from "@/types";
import styles from "./professor.module.css";

export default function MinhasTurmasPage() {
  const router = useRouter();
  const [turmas, setTurmas] = useState<Turma[] | null>(null);
  const [listError, setListError] = useState("");

  useEffect(() => {
    fetchApi("/turmas")
      .then(setTurmas)
      .catch((err) => {
        setListError(err instanceof Error ? err.message : "Erro ao carregar turmas");
        setTurmas([]);
      });
  }, []);

  return (
    <div>
      <h1 className={styles.title}>Minhas Turmas</h1>

      {listError && <div className={styles.listError}>{listError}</div>}

      {turmas === null && <CardGridSkeleton />}

      {turmas !== null && turmas.length === 0 && !listError && (
        <EmptyState message="Nenhuma turma vinculada a você ainda." />
      )}

      {turmas !== null && turmas.length > 0 && (
        <div className={styles.grid}>
          {turmas.map((turma) => (
            <button
              key={turma.id}
              type="button"
              className={styles.card}
              onClick={() => router.push(`/professor/turmas/${turma.id}`)}
            >
              <div className={styles.cardTitle}>{turma.nome}</div>
              <div className={styles.stat}>
                <Users size={16} />
                {turma._count?.alunos ?? 0} alunos
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

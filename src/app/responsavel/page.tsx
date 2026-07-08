"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchApi } from "@/lib/api";
import { EmptyState } from "@/components/EmptyState";
import { SeletorFilhos } from "@/components/SeletorFilhos";
import type { Aluno, Publicacao } from "@/types";
import styles from "./feed.module.css";

function formatarDataHora(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function FeedPage() {
  const [alunos, setAlunos] = useState<Aluno[] | null>(null);
  const [publicacoes, setPublicacoes] = useState<Publicacao[] | null>(null);
  const [listError, setListError] = useState("");
  const [filtroAlunoId, setFiltroAlunoId] = useState("");

  useEffect(() => {
    fetchApi("/alunos")
      .then(setAlunos)
      .catch((err) => {
        setListError(err instanceof Error ? err.message : "Erro ao carregar filhos");
        setAlunos([]);
      });

    fetchApi("/publicacoes")
      .then(setPublicacoes)
      .catch((err) => {
        setListError(
          err instanceof Error ? err.message : "Erro ao carregar publicações"
        );
        setPublicacoes([]);
      });
  }, []);

  const alunoNomeMap = useMemo(() => {
    const map = new Map<string, string>();
    alunos?.forEach((aluno) => map.set(aluno.id, aluno.nome));
    return map;
  }, [alunos]);

  const turmaNomeMap = useMemo(() => {
    const map = new Map<string, string>();
    alunos?.forEach((aluno) => {
      if (aluno.turma) map.set(aluno.turma.id, aluno.turma.nome);
    });
    return map;
  }, [alunos]);

  const alunoSelecionado = alunos?.find((a) => a.id === filtroAlunoId);

  const publicacoesFiltradas = useMemo(() => {
    if (!publicacoes) return null;
    const ordenadas = [...publicacoes].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    if (!filtroAlunoId) return ordenadas;

    return ordenadas.filter((pub) => {
      if (pub.tipo === "GERAL") return true;
      if (pub.tipo === "TURMA") return pub.turmaId === alunoSelecionado?.turmaId;
      if (pub.tipo === "INDIVIDUAL") return pub.alunoId === filtroAlunoId;
      return false;
    });
  }, [publicacoes, filtroAlunoId, alunoSelecionado]);

  function badgeInfo(pub: Publicacao): { texto: string; classe: string } {
    if (pub.tipo === "GERAL") {
      return { texto: "Geral", classe: styles.badgeGeral };
    }
    if (pub.tipo === "TURMA") {
      return {
        texto: pub.turmaId ? turmaNomeMap.get(pub.turmaId) ?? "Turma" : "Turma",
        classe: styles.badgeTurma,
      };
    }
    return {
      texto: pub.alunoId ? alunoNomeMap.get(pub.alunoId) ?? "Aluno" : "Aluno",
      classe: styles.badgeIndividual,
    };
  }

  return (
    <div>
      <h1 className={styles.title}>Feed</h1>

      {alunos && alunos.length > 0 && (
        <SeletorFilhos
          alunos={alunos}
          valor={filtroAlunoId}
          onChange={setFiltroAlunoId}
          comOpcaoTodos
        />
      )}

      {listError && <div className={styles.listError}>{listError}</div>}

      {publicacoesFiltradas === null && (
        <div className={styles.skeletonList}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={styles.skeletonPost}>
              <div className={styles.skeletonLine} style={{ width: "30%" }} />
              <div className={styles.skeletonLine} style={{ width: "90%" }} />
              <div className={styles.skeletonLine} style={{ width: "60%" }} />
            </div>
          ))}
        </div>
      )}

      {publicacoesFiltradas !== null &&
        publicacoesFiltradas.length === 0 &&
        !listError && <EmptyState message="Nenhuma publicação ainda." />}

      {publicacoesFiltradas !== null && publicacoesFiltradas.length > 0 && (
        <div className={styles.postsList}>
          {publicacoesFiltradas.map((pub) => {
            const badge = badgeInfo(pub);
            return (
              <div key={pub.id} className={styles.post}>
                <div className={styles.postHeader}>
                  <span className={`${styles.badge} ${badge.classe}`}>
                    {badge.texto}
                  </span>
                  <span className={styles.postData}>
                    {formatarDataHora(pub.createdAt)}
                  </span>
                </div>
                <p className={styles.postConteudo}>{pub.conteudo}</p>
                {pub.autor && (
                  <div className={styles.postAutor}>Por {pub.autor.nome}</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

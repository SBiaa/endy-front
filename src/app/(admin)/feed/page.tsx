"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/Button";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";
import { PublicacaoForm } from "@/components/PublicacaoForm";
import type { Aluno, Turma, Publicacao } from "@/types";
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
  const [publicacoes, setPublicacoes] = useState<Publicacao[] | null>(null);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [listError, setListError] = useState("");

  const [modalAberto, setModalAberto] = useState(false);

  const [publicacaoExcluindo, setPublicacaoExcluindo] = useState<Publicacao | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExclusao, setErroExclusao] = useState("");

  function recarregarPublicacoes() {
    setListError("");
    fetchApi("/publicacoes")
      .then(setPublicacoes)
      .catch((err) => {
        setListError(err instanceof Error ? err.message : "Erro ao carregar publicações");
        setPublicacoes([]);
      });
  }

  useEffect(() => {
    recarregarPublicacoes();
    fetchApi("/turmas").then(setTurmas).catch(() => {});
    fetchApi("/alunos").then(setAlunos).catch(() => {});
  }, []);

  function badgeInfo(pub: Publicacao): { texto: string; classe: string } {
    if (pub.tipo === "GERAL") {
      return { texto: "Geral", classe: styles.badgeGeral };
    }
    if (pub.tipo === "TURMA") {
      const turma = turmas.find((t) => t.id === pub.turmaId);
      return { texto: turma?.nome ?? "Turma", classe: styles.badgeTurma };
    }
    const aluno = alunos.find((a) => a.id === pub.alunoId);
    return { texto: aluno?.nome ?? "Aluno", classe: styles.badgeIndividual };
  }

  async function handleConfirmarExclusao() {
    if (!publicacaoExcluindo) return;
    setExcluindo(true);
    setErroExclusao("");

    try {
      await fetchApi(`/publicacoes/${publicacaoExcluindo.id}`, { method: "DELETE" });
      setPublicacaoExcluindo(null);
      recarregarPublicacoes();
    } catch (err) {
      setErroExclusao(err instanceof Error ? err.message : "Erro ao excluir publicação.");
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Feed</h1>
        <Button onClick={() => setModalAberto(true)}>
          <Plus size={18} />
          Novo post
        </Button>
      </div>

      {listError && <div className={styles.listError}>{listError}</div>}

      {publicacoes === null && (
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

      {publicacoes !== null && publicacoes.length === 0 && !listError && (
        <EmptyState
          message="Nenhuma publicação ainda."
          actionLabel="Criar primeiro post"
          onAction={() => setModalAberto(true)}
        />
      )}

      {publicacoes !== null && publicacoes.length > 0 && (
        <div className={styles.postsList}>
          {publicacoes.map((pub) => {
            const badge = badgeInfo(pub);
            return (
              <div key={pub.id} className={styles.post}>
                <div className={styles.postHeader}>
                  <span className={`${styles.badge} ${badge.classe}`}>{badge.texto}</span>
                  <div className={styles.postHeaderRight}>
                    <span className={styles.postData}>{formatarDataHora(pub.createdAt)}</span>
                    <button
                      type="button"
                      className={styles.iconButton}
                      onClick={() => {
                        setPublicacaoExcluindo(pub);
                        setErroExclusao("");
                      }}
                      aria-label="Excluir publicação"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <p className={styles.postConteudo}>{pub.conteudo}</p>
                {pub.autor && <div className={styles.postAutor}>Por {pub.autor.nome}</div>}
              </div>
            );
          })}
        </div>
      )}

      {modalAberto && (
        <Modal title="Novo post" onClose={() => setModalAberto(false)}>
          <PublicacaoForm
            tipoInicial="GERAL"
            turmasDisponiveis={turmas}
            alunosDisponiveis={alunos}
            onCancel={() => setModalAberto(false)}
            onSuccess={() => {
              setModalAberto(false);
              recarregarPublicacoes();
            }}
          />
        </Modal>
      )}

      {publicacaoExcluindo && (
        <ConfirmDialog
          title="Excluir publicação"
          message="Tem certeza que deseja excluir esse post? Essa ação não pode ser desfeita."
          onConfirm={handleConfirmarExclusao}
          onClose={() => setPublicacaoExcluindo(null)}
          loading={excluindo}
          error={erroExclusao}
        />
      )}
    </div>
  );
}

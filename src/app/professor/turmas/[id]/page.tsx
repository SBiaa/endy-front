"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send, NotebookPen } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { calcularIdadeLabel } from "@/lib/idade";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { Spinner } from "@/components/Spinner";
import { PublicacaoForm } from "@/components/PublicacaoForm";
import { RegistroDiarioForm } from "@/components/RegistroDiarioForm";
import type { Aluno, Turma, TipoPublicacao } from "@/types";
import styles from "./turmaDetalhe.module.css";

interface ProfessorResumo {
  id: string;
  nome: string;
  email: string;
}

interface TurmaDetalhe extends Turma {
  alunos: Aluno[];
  professores: ProfessorResumo[];
}

interface ModalPublicacaoState {
  tipo: TipoPublicacao;
  turmaId?: string;
  alunoId?: string;
}

interface ModalRegistroState {
  alunoId: string;
  alunoNome: string;
}

export default function TurmaDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [turma, setTurma] = useState<TurmaDetalhe | null>(null);
  const [loadError, setLoadError] = useState("");
  const [modalPublicacao, setModalPublicacao] = useState<ModalPublicacaoState | null>(null);
  const [modalRegistro, setModalRegistro] = useState<ModalRegistroState | null>(null);

  useEffect(() => {
    fetchApi(`/turmas/${id}`)
      .then(setTurma)
      .catch((err) => {
        setLoadError(err instanceof Error ? err.message : "Erro ao carregar turma");
      });
  }, [id]);

  return (
    <div>
      <Link href="/professor" className={styles.backLink}>
        <ArrowLeft size={16} />
        Minhas Turmas
      </Link>

      {loadError && <div className={styles.loadError}>{loadError}</div>}

      {!turma && !loadError && <Spinner />}

      {turma && (
        <>
          <div className={styles.header}>
            <h1 className={styles.title}>{turma.nome}</h1>
            <Button
              onClick={() => setModalPublicacao({ tipo: "TURMA", turmaId: turma.id })}
            >
              <Send size={16} />
              Publicar na turma
            </Button>
          </div>

          <h2 className={styles.sectionTitle}>Alunos</h2>

          {turma.alunos.length === 0 ? (
            <EmptyState message="Nenhum aluno nesta turma ainda." />
          ) : (
            <div className={styles.alunosList}>
              {turma.alunos.map((aluno) => (
                <div key={aluno.id} className={styles.alunoRow}>
                  <div className={styles.alunoInfo}>
                    <span className={styles.alunoNome}>{aluno.nome}</span>
                    <span className={styles.badge}>
                      {calcularIdadeLabel(aluno.dataNascimento)}
                    </span>
                  </div>

                  <div className={styles.alunoActions}>
                    <Link href={`/professor/alunos/${aluno.id}`} className={styles.linkPerfil}>
                      Ver perfil
                    </Link>
                    <Button
                      variant="secondary"
                      onClick={() => setModalPublicacao({ tipo: "INDIVIDUAL", alunoId: aluno.id })}
                    >
                      <Send size={16} />
                      Publicar para este aluno
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setModalRegistro({ alunoId: aluno.id, alunoNome: aluno.nome })}
                    >
                      <NotebookPen size={16} />
                      Registrar diário
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {modalPublicacao && turma && (
        <Modal title="Nova publicação" onClose={() => setModalPublicacao(null)}>
          <PublicacaoForm
            tipoInicial={modalPublicacao.tipo}
            turmaIdInicial={modalPublicacao.turmaId}
            alunoIdInicial={modalPublicacao.alunoId}
            turmasDisponiveis={[turma]}
            alunosDisponiveis={turma.alunos}
            onCancel={() => setModalPublicacao(null)}
            onSuccess={() => setModalPublicacao(null)}
          />
        </Modal>
      )}

      {modalRegistro && (
        <Modal title="Registro diário" onClose={() => setModalRegistro(null)}>
          <RegistroDiarioForm
            alunoId={modalRegistro.alunoId}
            alunoNome={modalRegistro.alunoNome}
            onCancel={() => setModalRegistro(null)}
            onSuccess={() => setModalRegistro(null)}
          />
        </Modal>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Plus, Users, GraduationCap, Pencil, Trash2 } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/Button";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";
import { CardGridSkeleton } from "@/components/CardGridSkeleton";
import { validar } from "@/lib/validacao";
import { turmaSchema } from "@/schemas/turma";
import type { Turma } from "@/types";
import styles from "./turmas.module.css";

export default function TurmasPage() {
  const [turmas, setTurmas] = useState<Turma[] | null>(null);
  const [listError, setListError] = useState("");

  const [modoModal, setModoModal] = useState<"criar" | "editar" | null>(null);
  const [turmaEditando, setTurmaEditando] = useState<Turma | null>(null);
  const [nome, setNome] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState("");
  const [erros, setErros] = useState<Record<string, string>>({});

  const [turmaExcluindo, setTurmaExcluindo] = useState<Turma | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExclusao, setErroExclusao] = useState("");

  function recarregarTurmas() {
    setListError("");
    fetchApi("/turmas")
      .then(setTurmas)
      .catch((err) => {
        setListError(err instanceof Error ? err.message : "Erro ao carregar turmas");
        setTurmas([]);
      });
  }

  useEffect(() => {
    fetchApi("/turmas")
      .then(setTurmas)
      .catch((err) => {
        setListError(err instanceof Error ? err.message : "Erro ao carregar turmas");
        setTurmas([]);
      });
  }, []);

  function abrirModalCriar() {
    setModoModal("criar");
    setTurmaEditando(null);
    setNome("");
    setErroForm("");
    setErros({});
  }

  function abrirModalEditar(turma: Turma) {
    setModoModal("editar");
    setTurmaEditando(turma);
    setNome(turma.nome);
    setErroForm("");
    setErros({});
  }

  function fecharModalForm() {
    setModoModal(null);
    setTurmaEditando(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErroForm("");

    const resultado = validar(turmaSchema, { nome });
    if (resultado.erros) {
      setErros(resultado.erros);
      return;
    }
    setErros({});
    setSalvando(true);

    try {
      if (modoModal === "editar" && turmaEditando) {
        await fetchApi(`/turmas/${turmaEditando.id}`, {
          method: "PUT",
          body: JSON.stringify({ nome }),
        });
      } else {
        await fetchApi("/turmas", {
          method: "POST",
          body: JSON.stringify({ nome }),
        });
      }
      fecharModalForm();
      recarregarTurmas();
    } catch (err) {
      setErroForm(err instanceof Error ? err.message : "Erro ao salvar turma");
    } finally {
      setSalvando(false);
    }
  }

  async function handleConfirmarExclusao() {
    if (!turmaExcluindo) return;
    setExcluindo(true);
    setErroExclusao("");

    try {
      await fetchApi(`/turmas/${turmaExcluindo.id}`, { method: "DELETE" });
      setTurmaExcluindo(null);
      recarregarTurmas();
    } catch (err) {
      setErroExclusao(err instanceof Error ? err.message : "Erro ao excluir turma.");
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Turmas</h1>
        <Button onClick={abrirModalCriar}>
          <Plus size={18} />
          Nova turma
        </Button>
      </div>

      {listError && <div className={styles.listError}>{listError}</div>}

      {turmas === null && <CardGridSkeleton />}

      {turmas !== null && turmas.length === 0 && !listError && (
        <EmptyState
          message="Nenhuma turma cadastrada ainda."
          actionLabel="Criar primeira turma"
          onAction={abrirModalCriar}
        />
      )}

      {turmas !== null && turmas.length > 0 && (
        <div className={styles.grid}>
          {turmas.map((turma) => (
            <div key={turma.id} className={styles.card}>
              <div className={styles.cardTitle}>{turma.nome}</div>

              <div className={styles.stats}>
                <div className={styles.stat}>
                  <Users size={16} />
                  {turma._count?.alunos ?? 0} alunos
                </div>
                <div className={styles.stat}>
                  <GraduationCap size={16} />
                  {turma._count?.professores ?? 0} professores
                </div>
              </div>

              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.iconButton}
                  onClick={() => abrirModalEditar(turma)}
                  aria-label="Editar turma"
                >
                  <Pencil size={16} />
                </button>
                <button
                  type="button"
                  className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                  onClick={() => {
                    setTurmaExcluindo(turma);
                    setErroExclusao("");
                  }}
                  aria-label="Excluir turma"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modoModal && (
        <Modal
          title={modoModal === "editar" ? "Editar turma" : "Nova turma"}
          onClose={fecharModalForm}
        >
          <form
            onSubmit={handleSubmit}
            noValidate
            style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}
          >
            <div className={styles.field}>
              <label htmlFor="nome">Nome</label>
              <input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                autoFocus
              />
              {erros.nome && <div className={styles.formError}>{erros.nome}</div>}
            </div>

            {erroForm && <div className={styles.formError}>{erroForm}</div>}

            <div className={styles.modalActions}>
              <Button type="button" variant="secondary" onClick={fecharModalForm}>
                Cancelar
              </Button>
              <Button type="submit" disabled={salvando}>
                {salvando ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {turmaExcluindo && (
        <ConfirmDialog
          title="Excluir turma"
          message={
            <>
              Tem certeza que deseja excluir a turma &quot;{turmaExcluindo.nome}
              &quot;? Essa ação não pode ser desfeita.
            </>
          }
          onConfirm={handleConfirmarExclusao}
          onClose={() => setTurmaExcluindo(null)}
          loading={excluindo}
          error={erroExclusao}
        />
      )}
    </div>
  );
}

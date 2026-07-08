"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, GraduationCap, Pencil, Trash2 } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { calcularIdadeLabel } from "@/lib/idade";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/Button";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";
import { CardGridSkeleton } from "@/components/CardGridSkeleton";
import { validar } from "@/lib/validacao";
import { alunoSchema } from "@/schemas/aluno";
import type { Aluno, Turma } from "@/types";
import styles from "./alunos.module.css";

interface FormState {
  nome: string;
  dataNascimento: string;
  turmaId: string;
  alergias: string;
  observacoes: string;
}

const FORM_INICIAL: FormState = {
  nome: "",
  dataNascimento: "",
  turmaId: "",
  alergias: "",
  observacoes: "",
};

export default function AlunosPage() {
  const [alunos, setAlunos] = useState<Aluno[] | null>(null);
  const [listError, setListError] = useState("");
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [filtroTurmaId, setFiltroTurmaId] = useState("");

  const [modoModal, setModoModal] = useState<"criar" | "editar" | null>(null);
  const [alunoEditando, setAlunoEditando] = useState<Aluno | null>(null);
  const [form, setForm] = useState<FormState>(FORM_INICIAL);
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState("");
  const [erros, setErros] = useState<Record<string, string>>({});

  const [alunoExcluindo, setAlunoExcluindo] = useState<Aluno | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExclusao, setErroExclusao] = useState("");

  function recarregarAlunos() {
    setListError("");
    fetchApi("/alunos")
      .then(setAlunos)
      .catch((err) => {
        setListError(err instanceof Error ? err.message : "Erro ao carregar alunos");
        setAlunos([]);
      });
  }

  useEffect(() => {
    fetchApi("/alunos")
      .then(setAlunos)
      .catch((err) => {
        setListError(err instanceof Error ? err.message : "Erro ao carregar alunos");
        setAlunos([]);
      });

    fetchApi("/turmas")
      .then(setTurmas)
      .catch(() => {});
  }, []);

  const alunosFiltrados = useMemo(() => {
    if (!alunos) return null;
    if (!filtroTurmaId) return alunos;
    return alunos.filter((aluno) => aluno.turmaId === filtroTurmaId);
  }, [alunos, filtroTurmaId]);

  function abrirModalCriar() {
    setModoModal("criar");
    setAlunoEditando(null);
    setForm(FORM_INICIAL);
    setErroForm("");
    setErros({});
  }

  function abrirModalEditar(aluno: Aluno) {
    setModoModal("editar");
    setAlunoEditando(aluno);
    setForm({
      nome: aluno.nome,
      dataNascimento: aluno.dataNascimento.slice(0, 10),
      turmaId: aluno.turmaId,
      alergias: aluno.alergias ?? "",
      observacoes: aluno.observacoes ?? "",
    });
    setErroForm("");
    setErros({});
  }

  function fecharModalForm() {
    setModoModal(null);
    setAlunoEditando(null);
  }

  function atualizarCampo<K extends keyof FormState>(campo: K, valor: FormState[K]) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErroForm("");

    const resultado = validar(alunoSchema, form);
    if (resultado.erros) {
      setErros(resultado.erros);
      return;
    }
    setErros({});
    setSalvando(true);

    const payload = {
      nome: form.nome,
      dataNascimento: form.dataNascimento,
      turmaId: form.turmaId,
      alergias: form.alergias || null,
      observacoes: form.observacoes || null,
    };

    try {
      if (modoModal === "editar" && alunoEditando) {
        await fetchApi(`/alunos/${alunoEditando.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await fetchApi("/alunos", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      fecharModalForm();
      recarregarAlunos();
    } catch (err) {
      setErroForm(err instanceof Error ? err.message : "Erro ao salvar aluno");
    } finally {
      setSalvando(false);
    }
  }

  async function handleConfirmarExclusao() {
    if (!alunoExcluindo) return;
    setExcluindo(true);
    setErroExclusao("");

    try {
      await fetchApi(`/alunos/${alunoExcluindo.id}`, { method: "DELETE" });
      setAlunoExcluindo(null);
      recarregarAlunos();
    } catch (err) {
      setErroExclusao(err instanceof Error ? err.message : "Erro ao excluir aluno.");
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Alunos</h1>
        <Button onClick={abrirModalCriar}>
          <Plus size={18} />
          Novo aluno
        </Button>
      </div>

      {turmas.length > 0 && (
        <div className={styles.filterRow}>
          <label htmlFor="filtroTurma">Turma</label>
          <select
            id="filtroTurma"
            className={styles.filterSelect}
            value={filtroTurmaId}
            onChange={(e) => setFiltroTurmaId(e.target.value)}
          >
            <option value="">Todas as turmas</option>
            {turmas.map((turma) => (
              <option key={turma.id} value={turma.id}>
                {turma.nome}
              </option>
            ))}
          </select>
        </div>
      )}

      {listError && <div className={styles.listError}>{listError}</div>}

      {alunosFiltrados === null && <CardGridSkeleton />}

      {alunosFiltrados !== null && alunosFiltrados.length === 0 && !listError && (
        <EmptyState
          message="Nenhum aluno cadastrado ainda."
          actionLabel="Cadastrar primeiro aluno"
          onAction={abrirModalCriar}
        />
      )}

      {alunosFiltrados !== null && alunosFiltrados.length > 0 && (
        <div className={styles.grid}>
          {alunosFiltrados.map((aluno) => (
            <div key={aluno.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>{aluno.nome}</div>
                <span className={styles.badge}>
                  {calcularIdadeLabel(aluno.dataNascimento)}
                </span>
              </div>

              <div className={styles.turmaLabel}>
                <GraduationCap size={16} />
                {aluno.turma?.nome ?? "Sem turma"}
              </div>

              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.iconButton}
                  onClick={() => abrirModalEditar(aluno)}
                  aria-label="Editar aluno"
                >
                  <Pencil size={16} />
                </button>
                <button
                  type="button"
                  className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                  onClick={() => {
                    setAlunoExcluindo(aluno);
                    setErroExclusao("");
                  }}
                  aria-label="Excluir aluno"
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
          title={modoModal === "editar" ? "Editar aluno" : "Novo aluno"}
          onClose={fecharModalForm}
        >
          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={styles.field}>
              <label htmlFor="nome">Nome</label>
              <input
                id="nome"
                value={form.nome}
                onChange={(e) => atualizarCampo("nome", e.target.value)}
                autoFocus
              />
              {erros.nome && <div className={styles.formError}>{erros.nome}</div>}
            </div>

            <div className={styles.field}>
              <label htmlFor="dataNascimento">Data de nascimento</label>
              <input
                id="dataNascimento"
                type="date"
                value={form.dataNascimento}
                onChange={(e) => atualizarCampo("dataNascimento", e.target.value)}
              />
              {erros.dataNascimento && (
                <div className={styles.formError}>{erros.dataNascimento}</div>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="turmaId">Turma</label>
              <select
                id="turmaId"
                value={form.turmaId}
                onChange={(e) => atualizarCampo("turmaId", e.target.value)}
              >
                <option value="" disabled>
                  Selecione uma turma
                </option>
                {turmas.map((turma) => (
                  <option key={turma.id} value={turma.id}>
                    {turma.nome}
                  </option>
                ))}
              </select>
              {erros.turmaId && <div className={styles.formError}>{erros.turmaId}</div>}
            </div>

            <div className={styles.field}>
              <label htmlFor="alergias">Alergias</label>
              <textarea
                id="alergias"
                value={form.alergias}
                onChange={(e) => atualizarCampo("alergias", e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="observacoes">Observações</label>
              <textarea
                id="observacoes"
                value={form.observacoes}
                onChange={(e) => atualizarCampo("observacoes", e.target.value)}
              />
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

      {alunoExcluindo && (
        <ConfirmDialog
          title="Excluir aluno"
          message={
            <>
              Tem certeza que deseja excluir o aluno &quot;{alunoExcluindo.nome}
              &quot;? Essa ação não pode ser desfeita.
            </>
          }
          onConfirm={handleConfirmarExclusao}
          onClose={() => setAlunoExcluindo(null)}
          loading={excluindo}
          error={erroExclusao}
        />
      )}
    </div>
  );
}

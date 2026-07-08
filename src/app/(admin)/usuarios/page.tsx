"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Link2, Copy, Check } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/Button";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";
import { CardGridSkeleton } from "@/components/CardGridSkeleton";
import { Spinner } from "@/components/Spinner";
import { validar } from "@/lib/validacao";
import { usuarioSchema } from "@/schemas/usuario";
import type { Aluno, Turma, Usuario } from "@/types";
import styles from "./usuarios.module.css";

interface ProfessorResumo {
  id: string;
  nome: string;
  email: string;
}

interface TurmaComProfessores extends Turma {
  professores: ProfessorResumo[];
}

interface VinculoResponsavel {
  id: string;
  responsavelId: string;
  alunoId: string;
  parentesco: string;
}

interface AlunoComResponsaveis extends Aluno {
  responsaveis: VinculoResponsavel[];
}

interface FormState {
  nome: string;
  email: string;
  papel: "PROFESSOR" | "RESPONSAVEL";
}

const FORM_INICIAL: FormState = { nome: "", email: "", papel: "PROFESSOR" };

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[] | null>(null);
  const [listError, setListError] = useState("");
  const [filtroPapel, setFiltroPapel] = useState<"" | "PROFESSOR" | "RESPONSAVEL">("");

  const [modoModal, setModoModal] = useState<"criar" | "editar" | null>(null);
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);
  const [form, setForm] = useState<FormState>(FORM_INICIAL);
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState("");
  const [erros, setErros] = useState<Record<string, string>>({});
  const [senhaGerada, setSenhaGerada] = useState("");
  const [copiado, setCopiado] = useState(false);
  const [erroCopia, setErroCopia] = useState(false);

  const [usuarioExcluindo, setUsuarioExcluindo] = useState<Usuario | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExclusao, setErroExclusao] = useState("");

  const [usuarioVinculos, setUsuarioVinculos] = useState<Usuario | null>(null);
  const [vinculosLoading, setVinculosLoading] = useState(false);
  const [vinculosError, setVinculosError] = useState("");
  const [turmasVinculo, setTurmasVinculo] = useState<{ turma: Turma; vinculado: boolean }[]>([]);
  const [alunosVinculo, setAlunosVinculo] = useState<
    { aluno: Aluno; vinculo: VinculoResponsavel | null }[]
  >([]);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [novoAlunoId, setNovoAlunoId] = useState("");
  const [novoParentesco, setNovoParentesco] = useState("");
  const [adicionandoVinculo, setAdicionandoVinculo] = useState(false);

  function recarregarUsuarios() {
    setListError("");
    fetchApi("/usuarios")
      .then(setUsuarios)
      .catch((err) => {
        setListError(err instanceof Error ? err.message : "Erro ao carregar usuários");
        setUsuarios([]);
      });
  }

  useEffect(() => {
    fetchApi("/usuarios")
      .then(setUsuarios)
      .catch((err) => {
        setListError(err instanceof Error ? err.message : "Erro ao carregar usuários");
        setUsuarios([]);
      });
  }, []);

  const usuariosFiltrados = useMemo(() => {
    if (!usuarios) return null;
    if (!filtroPapel) return usuarios;
    return usuarios.filter((usuario) => usuario.papel === filtroPapel);
  }, [usuarios, filtroPapel]);

  function abrirModalCriar() {
    setModoModal("criar");
    setUsuarioEditando(null);
    setForm(FORM_INICIAL);
    setErroForm("");
    setErros({});
    setSenhaGerada("");
  }

  function abrirModalEditar(usuario: Usuario) {
    setModoModal("editar");
    setUsuarioEditando(usuario);
    setForm({
      nome: usuario.nome,
      email: usuario.email,
      papel: usuario.papel as "PROFESSOR" | "RESPONSAVEL",
    });
    setErroForm("");
    setErros({});
  }

  function fecharModalForm() {
    setModoModal(null);
    setUsuarioEditando(null);
    setSenhaGerada("");
    setCopiado(false);
    setErroCopia(false);
  }

  function atualizarCampo<K extends keyof FormState>(campo: K, valor: FormState[K]) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErroForm("");

    const resultado = validar(usuarioSchema, form);
    if (resultado.erros) {
      setErros(resultado.erros);
      return;
    }
    setErros({});
    setSalvando(true);

    try {
      if (modoModal === "editar" && usuarioEditando) {
        await fetchApi(`/usuarios/${usuarioEditando.id}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
        fecharModalForm();
        recarregarUsuarios();
      } else {
        const resultado = await fetchApi("/usuarios", {
          method: "POST",
          body: JSON.stringify(form),
        });
        setSenhaGerada(resultado.senhaTemporaria);
        recarregarUsuarios();
      }
    } catch (err) {
      setErroForm(err instanceof Error ? err.message : "Erro ao salvar usuário");
    } finally {
      setSalvando(false);
    }
  }

  function handleCopiarSenha() {
    navigator.clipboard
      .writeText(senhaGerada)
      .then(() => {
        setErroCopia(false);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 1500);
      })
      .catch(() => {
        setErroCopia(true);
      });
  }

  async function handleConfirmarExclusao() {
    if (!usuarioExcluindo) return;
    setExcluindo(true);
    setErroExclusao("");

    try {
      await fetchApi(`/usuarios/${usuarioExcluindo.id}`, { method: "DELETE" });
      setUsuarioExcluindo(null);
      recarregarUsuarios();
    } catch (err) {
      setErroExclusao(err instanceof Error ? err.message : "Erro ao excluir usuário.");
    } finally {
      setExcluindo(false);
    }
  }

  function abrirVinculos(usuario: Usuario) {
    setUsuarioVinculos(usuario);
    setVinculosError("");
    setNovoAlunoId("");
    setNovoParentesco("");
    setVinculosLoading(true);
    setTurmasVinculo([]);
    setAlunosVinculo([]);

    if (usuario.papel === "PROFESSOR") {
      fetchApi("/turmas")
        .then((turmas: Turma[]) =>
          Promise.all(
            turmas.map((turma) =>
              fetchApi(`/turmas/${turma.id}`).then((detalhe: TurmaComProfessores) => ({
                turma,
                vinculado: detalhe.professores.some((p) => p.id === usuario.id),
              }))
            )
          )
        )
        .then(setTurmasVinculo)
        .catch((err) => {
          setVinculosError(err instanceof Error ? err.message : "Erro ao carregar vínculos");
        })
        .finally(() => setVinculosLoading(false));
    } else {
      fetchApi("/alunos")
        .then((alunos: Aluno[]) =>
          Promise.all(
            alunos.map((aluno) =>
              fetchApi(`/alunos/${aluno.id}`).then((detalhe: AlunoComResponsaveis) => ({
                aluno,
                vinculo:
                  detalhe.responsaveis.find((r) => r.responsavelId === usuario.id) ?? null,
              }))
            )
          )
        )
        .then(setAlunosVinculo)
        .catch((err) => {
          setVinculosError(err instanceof Error ? err.message : "Erro ao carregar vínculos");
        })
        .finally(() => setVinculosLoading(false));
    }
  }

  function fecharVinculos() {
    setUsuarioVinculos(null);
    setTurmasVinculo([]);
    setAlunosVinculo([]);
  }

  async function toggleTurmaVinculo(turma: Turma, vinculadoAtual: boolean) {
    if (!usuarioVinculos) return;
    setTogglingId(turma.id);
    setVinculosError("");

    try {
      if (vinculadoAtual) {
        await fetchApi(`/professor-turma/${turma.id}/${usuarioVinculos.id}`, {
          method: "DELETE",
        });
      } else {
        await fetchApi("/professor-turma", {
          method: "POST",
          body: JSON.stringify({ professorId: usuarioVinculos.id, turmaId: turma.id }),
        });
      }
      setTurmasVinculo((atual) =>
        atual.map((item) =>
          item.turma.id === turma.id ? { ...item, vinculado: !vinculadoAtual } : item
        )
      );
    } catch (err) {
      setVinculosError(err instanceof Error ? err.message : "Erro ao atualizar vínculo");
    } finally {
      setTogglingId(null);
    }
  }

  async function adicionarVinculoAluno() {
    if (!usuarioVinculos || !novoAlunoId || !novoParentesco.trim()) return;
    setAdicionandoVinculo(true);
    setVinculosError("");

    try {
      const vinculo: VinculoResponsavel = await fetchApi("/responsavel-aluno", {
        method: "POST",
        body: JSON.stringify({
          responsavelId: usuarioVinculos.id,
          alunoId: novoAlunoId,
          parentesco: novoParentesco.trim(),
        }),
      });
      setAlunosVinculo((atual) =>
        atual.map((item) => (item.aluno.id === novoAlunoId ? { ...item, vinculo } : item))
      );
      setNovoAlunoId("");
      setNovoParentesco("");
    } catch (err) {
      setVinculosError(err instanceof Error ? err.message : "Erro ao adicionar vínculo");
    } finally {
      setAdicionandoVinculo(false);
    }
  }

  async function removerVinculoAluno(aluno: Aluno, vinculo: VinculoResponsavel) {
    setTogglingId(aluno.id);
    setVinculosError("");

    try {
      await fetchApi(`/responsavel-aluno/${vinculo.id}`, { method: "DELETE" });
      setAlunosVinculo((atual) =>
        atual.map((item) => (item.aluno.id === aluno.id ? { ...item, vinculo: null } : item))
      );
    } catch (err) {
      setVinculosError(err instanceof Error ? err.message : "Erro ao remover vínculo");
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Usuários</h1>
        <Button onClick={abrirModalCriar}>
          <Plus size={18} />
          Novo usuário
        </Button>
      </div>

      <div className={styles.filterRow}>
        <label htmlFor="filtroPapel">Papel</label>
        <select
          id="filtroPapel"
          className={styles.filterSelect}
          value={filtroPapel}
          onChange={(e) => setFiltroPapel(e.target.value as typeof filtroPapel)}
        >
          <option value="">Todos</option>
          <option value="PROFESSOR">Professor</option>
          <option value="RESPONSAVEL">Responsável</option>
        </select>
      </div>

      {listError && <div className={styles.listError}>{listError}</div>}

      {usuariosFiltrados === null && <CardGridSkeleton />}

      {usuariosFiltrados !== null && usuariosFiltrados.length === 0 && !listError && (
        <EmptyState
          message="Nenhum usuário cadastrado ainda."
          actionLabel="Cadastrar primeiro usuário"
          onAction={abrirModalCriar}
        />
      )}

      {usuariosFiltrados !== null && usuariosFiltrados.length > 0 && (
        <div className={styles.grid}>
          {usuariosFiltrados.map((usuario) => (
            <div key={usuario.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>{usuario.nome}</div>
                <span
                  className={`${styles.badge} ${
                    usuario.papel === "PROFESSOR" ? styles.badgeProfessor : styles.badgeResponsavel
                  }`}
                >
                  {usuario.papel === "PROFESSOR" ? "Professor" : "Responsável"}
                </span>
              </div>

              <div className={styles.email}>{usuario.email}</div>

              <div className={styles.actions}>
                <Button variant="secondary" onClick={() => abrirVinculos(usuario)}>
                  <Link2 size={16} />
                  Gerenciar vínculos
                </Button>

                <div className={styles.iconActions}>
                  <button
                    type="button"
                    className={styles.iconButton}
                    onClick={() => abrirModalEditar(usuario)}
                    aria-label="Editar usuário"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                    onClick={() => {
                      setUsuarioExcluindo(usuario);
                      setErroExclusao("");
                    }}
                    aria-label="Excluir usuário"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modoModal && (
        <Modal
          title={
            senhaGerada
              ? "Usuário criado"
              : modoModal === "editar"
                ? "Editar usuário"
                : "Novo usuário"
          }
          onClose={fecharModalForm}
        >
          {senhaGerada ? (
            <div className={styles.senhaBox}>
              <p className={styles.senhaAviso}>
                Copie e envie essa senha — ela não será mostrada novamente.
              </p>
              <div className={styles.senhaValor}>
                <code>{senhaGerada}</code>
                <button type="button" className={styles.copyButton} onClick={handleCopiarSenha}>
                  {copiado ? <Check size={16} /> : <Copy size={16} />}
                  {copiado ? "Copiado!" : "Copiar"}
                </button>
              </div>
              {erroCopia && (
                <div className={styles.formError}>
                  Não foi possível copiar automaticamente — selecione o texto acima e copie manualmente.
                </div>
              )}
              <div className={styles.modalActions}>
                <Button onClick={fecharModalForm}>Concluir</Button>
              </div>
            </div>
          ) : (
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
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => atualizarCampo("email", e.target.value)}
                />
                {erros.email && <div className={styles.formError}>{erros.email}</div>}
              </div>

              <div className={styles.field}>
                <label htmlFor="papel">Papel</label>
                <select
                  id="papel"
                  value={form.papel}
                  onChange={(e) =>
                    atualizarCampo("papel", e.target.value as FormState["papel"])
                  }
                >
                  <option value="PROFESSOR">Professor</option>
                  <option value="RESPONSAVEL">Responsável</option>
                </select>
                {erros.papel && <div className={styles.formError}>{erros.papel}</div>}
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
          )}
        </Modal>
      )}

      {usuarioExcluindo && (
        <ConfirmDialog
          title="Excluir usuário"
          message={
            <>
              Tem certeza que deseja excluir &quot;{usuarioExcluindo.nome}&quot;? Essa ação não
              pode ser desfeita.
            </>
          }
          onConfirm={handleConfirmarExclusao}
          onClose={() => setUsuarioExcluindo(null)}
          loading={excluindo}
          error={erroExclusao}
        />
      )}

      {usuarioVinculos && (
        <Modal
          title={`Gerenciar vínculos — ${usuarioVinculos.nome}`}
          onClose={fecharVinculos}
        >
          {vinculosLoading ? (
            <Spinner />
          ) : (
            <div className={styles.vinculosContent}>
              {vinculosError && <div className={styles.formError}>{vinculosError}</div>}

              {usuarioVinculos.papel === "PROFESSOR" ? (
                <div className={styles.vinculoLista}>
                  {turmasVinculo.length === 0 && (
                    <p className={styles.vinculoVazio}>Nenhuma turma cadastrada.</p>
                  )}
                  {turmasVinculo.map(({ turma, vinculado }) => (
                    <label key={turma.id} className={styles.vinculoRow}>
                      <span>
                        <input
                          type="checkbox"
                          checked={vinculado}
                          disabled={togglingId === turma.id}
                          onChange={() => toggleTurmaVinculo(turma, vinculado)}
                        />
                        {turma.nome}
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <>
                  <div className={styles.vinculoLista}>
                    {alunosVinculo.filter((item) => item.vinculo).length === 0 && (
                      <p className={styles.vinculoVazio}>Nenhum aluno vinculado ainda.</p>
                    )}
                    {alunosVinculo
                      .filter((item) => item.vinculo)
                      .map(({ aluno, vinculo }) => (
                        <div key={aluno.id} className={styles.vinculoRow}>
                          <span>
                            {aluno.nome}{" "}
                            <span className={styles.parentesco}>({vinculo!.parentesco})</span>
                          </span>
                          <button
                            type="button"
                            className={styles.iconButton}
                            onClick={() => removerVinculoAluno(aluno, vinculo!)}
                            disabled={togglingId === aluno.id}
                            aria-label="Remover vínculo"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                  </div>

                  <div className={styles.addVinculo}>
                    <div className={styles.field}>
                      <label htmlFor="novoAluno">Adicionar aluno</label>
                      <select
                        id="novoAluno"
                        value={novoAlunoId}
                        onChange={(e) => setNovoAlunoId(e.target.value)}
                      >
                        <option value="">Selecione um aluno</option>
                        {alunosVinculo
                          .filter((item) => !item.vinculo)
                          .map(({ aluno }) => (
                            <option key={aluno.id} value={aluno.id}>
                              {aluno.nome}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div className={styles.field}>
                      <label htmlFor="novoParentesco">Parentesco</label>
                      <input
                        id="novoParentesco"
                        value={novoParentesco}
                        onChange={(e) => setNovoParentesco(e.target.value)}
                        placeholder="Mãe, pai, avó..."
                      />
                    </div>

                    <Button
                      type="button"
                      onClick={adicionarVinculoAluno}
                      disabled={!novoAlunoId || !novoParentesco.trim() || adicionandoVinculo}
                    >
                      <Plus size={16} />
                      {adicionandoVinculo ? "Adicionando..." : "Adicionar vínculo"}
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import {
  GraduationCap,
  Users,
  UserCog,
  UsersRound,
  AlertTriangle,
  Cake,
  MessageSquare,
  UserX,
} from "lucide-react";
import { fetchApi } from "@/lib/api";
import { CardGridSkeleton } from "@/components/CardGridSkeleton";
import type { DashboardAdmin } from "@/types";
import styles from "./dashboard.module.css";

export default function DashboardPage() {
  const [dados, setDados] = useState<DashboardAdmin | null>(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    fetchApi("/dashboard/admin")
      .then(setDados)
      .catch((err) => {
        setErro(err instanceof Error ? err.message : "Erro ao carregar dashboard");
      });
  }, []);

  return (
    <div>
      <h1 className={styles.title}>Dashboard</h1>

      {erro && <div className={styles.listError}>{erro}</div>}

      {!dados && !erro && <CardGridSkeleton count={4} />}

      {dados && (
        <>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <GraduationCap size={22} />
              </div>
              <div>
                <div className={styles.statValue}>{dados.contagens.turmas}</div>
                <div className={styles.statLabel}>Turmas</div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <Users size={22} />
              </div>
              <div>
                <div className={styles.statValue}>{dados.contagens.alunos}</div>
                <div className={styles.statLabel}>Alunos</div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <UserCog size={22} />
              </div>
              <div>
                <div className={styles.statValue}>{dados.contagens.professores}</div>
                <div className={styles.statLabel}>Professores</div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <UsersRound size={22} />
              </div>
              <div>
                <div className={styles.statValue}>{dados.contagens.responsaveis}</div>
                <div className={styles.statLabel}>Responsáveis</div>
              </div>
            </div>
          </div>

          <div className={styles.sections}>
            <div className={styles.section}>
              <div className={styles.sectionTitle}>
                <AlertTriangle size={18} />
                Turmas sem registro hoje
              </div>

              {dados.turmasSemRegistroHoje.length === 0 ? (
                <p className={styles.emptyHint}>Todas as turmas já têm registro hoje.</p>
              ) : (
                <div className={styles.list}>
                  {dados.turmasSemRegistroHoje.map((turma) => (
                    <div key={turma.id} className={styles.listItem}>
                      <span className={styles.listItemName}>{turma.nome}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.section}>
              <div className={styles.sectionTitle}>
                <Cake size={18} />
                Aniversariantes do mês
              </div>

              {dados.aniversariantesDoMes.length === 0 ? (
                <p className={styles.emptyHint}>Nenhum aniversariante esse mês.</p>
              ) : (
                <div className={styles.list}>
                  {dados.aniversariantesDoMes.map((aluno) => (
                    <div key={aluno.id} className={styles.listItem}>
                      <span className={styles.listItemName}>{aluno.nome}</span>
                      <span className={styles.listItemMeta}>
                        dia {new Date(aluno.dataNascimento).getUTCDate()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.section}>
              <div className={styles.sectionTitle}>
                <MessageSquare size={18} />
                Últimas publicações
              </div>

              {dados.ultimasPublicacoes.length === 0 ? (
                <p className={styles.emptyHint}>Nenhuma publicação ainda.</p>
              ) : (
                <div className={styles.list}>
                  {dados.ultimasPublicacoes.map((publicacao) => (
                    <div key={publicacao.id} className={styles.listItem}>
                      <span className={styles.listItemContent}>
                        <strong>{publicacao.autor?.nome ?? "—"}:</strong> {publicacao.conteudo}
                      </span>
                      <span className={styles.listItemMeta}>
                        {new Date(publicacao.createdAt).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.section}>
              <div className={styles.sectionTitle}>
                <UserX size={18} />
                Professores inativos (7+ dias sem publicar)
              </div>

              {dados.professoresInativos.length === 0 ? (
                <p className={styles.emptyHint}>Nenhum professor inativo.</p>
              ) : (
                <div className={styles.list}>
                  {dados.professoresInativos.map((professor) => (
                    <div key={professor.id} className={styles.listItem}>
                      <span className={styles.listItemName}>{professor.nome}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.section}>
              <div className={styles.sectionTitle}>
                <Users size={18} />
                Alunos por turma
              </div>

              {dados.alunosPorTurma.length === 0 ? (
                <p className={styles.emptyHint}>Nenhuma turma cadastrada.</p>
              ) : (
                <div className={styles.list}>
                  {dados.alunosPorTurma.map((turma) => (
                    <div key={turma.turmaId} className={styles.listItem}>
                      <span className={styles.listItemName}>{turma.nomeTurma}</span>
                      <span className={styles.listItemMeta}>{turma.totalAlunos} alunos</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

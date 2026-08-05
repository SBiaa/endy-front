export type Papel = "ADMIN" | "PROFESSOR" | "RESPONSAVEL";

export type TipoPublicacao = "GERAL" | "TURMA" | "INDIVIDUAL";

export type HumorDia = "OTIMO" | "BOM" | "AGITADO" | "CHOROSO" | "ADOECIDO";

export type QuantidadeRefeicao =
  | "TUDO"
  | "METADE"
  | "POUCO"
  | "RECUSOU"
  | "NAO_SE_APLICA";

export type QualidadeSono =
  | "DORMIU_BEM"
  | "DORMIU_POUCO"
  | "AGITADO"
  | "NAO_DORMIU";

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  papel: Papel;
}

export interface Turma {
  id: string;
  nome: string;
  _count?: {
    alunos: number;
    professores: number;
  };
}

export interface Aluno {
  id: string;
  nome: string;
  dataNascimento: string;
  turmaId: string;
  turma?: Turma;
  alergias?: string | null;
  observacoes?: string | null;
}

export interface Publicacao {
  id: string;
  tipo: TipoPublicacao;
  conteudo: string;
  createdAt: string;
  turmaId: string | null;
  alunoId: string | null;
  autorId: string;
  autor?: {
    id: string;
    nome: string;
    papel: Papel;
  };
}

export interface DashboardAdmin {
  contagens: {
    turmas: number;
    alunos: number;
    professores: number;
    responsaveis: number;
  };
  turmasSemRegistroHoje: { id: string; nome: string }[];
  aniversariantesDoMes: { id: string; nome: string; dataNascimento: string }[];
  ultimasPublicacoes: Publicacao[];
  professoresInativos: { id: string; nome: string }[];
  alunosPorTurma: { turmaId: string; nomeTurma: string; totalAlunos: number }[];
}

export interface RegistroDiario {
  id: string;
  alunoId: string;
  data: string;
  humor: HumorDia;
  cafe: QuantidadeRefeicao;
  almoco: QuantidadeRefeicao;
  lanche: QuantidadeRefeicao;
  sono: QualidadeSono;
  trocasFralda?: number | null;
  evacuou?: boolean | null;
  atividades?: string | null;
  materiaisNecessarios?: string | null;
  observacoes?: string | null;
  professorId: string;
  professor?: {
    id: string;
    nome: string;
  };
}

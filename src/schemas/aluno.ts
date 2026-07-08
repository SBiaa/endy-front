import { z } from "zod";

export const alunoSchema = z.object({
  nome: z.string().trim().min(1, { error: "Nome é obrigatório" }),
  dataNascimento: z
    .string()
    .min(1, { error: "Data de nascimento é obrigatória" }),
  turmaId: z.string().min(1, { error: "Selecione uma turma" }),
  alergias: z.string().optional(),
  observacoes: z.string().optional(),
});

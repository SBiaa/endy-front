import { z } from "zod";

export const publicacaoSchema = z.object({
  tipo: z.enum(["GERAL", "TURMA", "INDIVIDUAL"], {
    error: "Selecione um tipo",
  }),
  conteudo: z.string().trim().min(1, { error: "Conteúdo é obrigatório" }),
  turmaId: z.string().optional(),
  alunoId: z.string().optional(),
});

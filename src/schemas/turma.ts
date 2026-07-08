import { z } from "zod";

export const turmaSchema = z.object({
  nome: z.string().trim().min(1, { error: "Nome é obrigatório" }),
});

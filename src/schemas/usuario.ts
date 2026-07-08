import { z } from "zod";

export const usuarioSchema = z.object({
  nome: z.string().trim().min(1, { error: "Nome é obrigatório" }),
  email: z.email({ error: "Email inválido" }),
  papel: z.enum(["PROFESSOR", "RESPONSAVEL"], {
    error: "Selecione um papel",
  }),
});

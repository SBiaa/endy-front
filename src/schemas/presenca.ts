import { z } from "zod";

// motivo só é obrigatório quando status = JUSTIFICADO — espelha o
// superRefine do backend (src/schemas/presencaSchema.js)
export const presencaItemSchema = z
  .object({
    alunoId: z.string().min(1),
    status: z.enum(["PRESENTE", "AUSENTE", "JUSTIFICADO"], { error: "Selecione o status" }),
    motivo: z.string().trim().optional(),
  })
  .superRefine((valores, ctx) => {
    if (valores.status === "JUSTIFICADO" && !valores.motivo) {
      ctx.addIssue({
        code: "custom",
        path: ["motivo"],
        message: "Motivo é obrigatório quando o status é Justificado",
      });
    }
  });

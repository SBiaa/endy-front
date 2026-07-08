import { z } from "zod";

export const registroDiarioSchema = z.object({
  data: z.string().min(1, { error: "Data é obrigatória" }),
  humor: z.enum(["OTIMO", "BOM", "AGITADO", "CHOROSO", "ADOECIDO"], {
    error: "Selecione o humor",
  }),
  cafe: z.enum(["TUDO", "METADE", "POUCO", "RECUSOU", "NAO_SE_APLICA"], {
    error: "Selecione o café",
  }),
  almoco: z.enum(["TUDO", "METADE", "POUCO", "RECUSOU", "NAO_SE_APLICA"], {
    error: "Selecione o almoço",
  }),
  lanche: z.enum(["TUDO", "METADE", "POUCO", "RECUSOU", "NAO_SE_APLICA"], {
    error: "Selecione o lanche",
  }),
  sono: z.enum(["DORMIU_BEM", "DORMIU_POUCO", "AGITADO", "NAO_DORMIU"], {
    error: "Selecione o sono",
  }),
  trocasFralda: z.string().optional(),
  atividades: z.string().optional(),
  materiaisNecessarios: z.string().optional(),
  observacoes: z.string().optional(),
});

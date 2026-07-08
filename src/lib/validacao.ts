import type { ZodType } from "zod";

export function validar<T>(
  schema: ZodType<T>,
  dados: unknown
): { dados: T; erros: null } | { dados: null; erros: Record<string, string> } {
  const resultado = schema.safeParse(dados);

  if (resultado.success) {
    return { dados: resultado.data, erros: null };
  }

  const erros: Record<string, string> = {};
  for (const issue of resultado.error.issues) {
    const campo = issue.path[0];
    if (typeof campo === "string" && !erros[campo]) {
      erros[campo] = issue.message;
    }
  }
  return { dados: null, erros };
}

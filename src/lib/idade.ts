export function calcularIdadeLabel(dataNascimento: string): string {
  const nascimento = new Date(dataNascimento);
  const hoje = new Date();

  let meses =
    (hoje.getFullYear() - nascimento.getFullYear()) * 12 +
    (hoje.getMonth() - nascimento.getMonth());
  if (hoje.getDate() < nascimento.getDate()) meses--;
  meses = Math.max(meses, 0);

  if (meses < 12) {
    return meses === 1 ? "1 mês" : `${meses} meses`;
  }

  const anos = Math.floor(meses / 12);
  return anos === 1 ? "1 ano" : `${anos} anos`;
}

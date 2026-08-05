"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import type { Usuario } from "@/types";
import styles from "./login.module.css";

const REDIRECT_POR_PAPEL: Record<Usuario["papel"], string> = {
  ADMIN: "/dashboard",
  PROFESSOR: "/professor",
  RESPONSAVEL: "/responsavel",
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      await fetchApi("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, senha }),
      });

      const usuario: Usuario = await fetchApi("/usuarios/me");
      router.push(REDIRECT_POR_PAPEL[usuario.papel]);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao fazer login");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className={styles.container}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <h1 className={styles.title}>Entrar</h1>

        <div className={styles.field}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="senha">Senha</label>
          <input
            id="senha"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
        </div>

        {erro && <p className={styles.error}>{erro}</p>}

        <button className={styles.button} type="submit" disabled={carregando}>
          {carregando ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}

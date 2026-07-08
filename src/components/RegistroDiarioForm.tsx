"use client";

import { useState } from "react";
import { fetchApi, ApiError } from "@/lib/api";
import { Button } from "./Button";
import {
  HUMOR_OPCOES,
  SONO_OPCOES,
  REFEICAO_OPCOES,
  hojeISO,
  formatarDataLabel,
} from "@/lib/registroDiario";
import type { HumorDia, QuantidadeRefeicao, QualidadeSono, RegistroDiario } from "@/types";
import styles from "./RegistroDiarioForm.module.css";

interface RegistroDiarioFormProps {
  alunoId: string;
  alunoNome: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function RegistroDiarioForm({
  alunoId,
  alunoNome,
  onSuccess,
  onCancel,
}: RegistroDiarioFormProps) {
  const [registroId, setRegistroId] = useState<string | null>(null);
  const [data, setData] = useState(hojeISO());
  const [humor, setHumor] = useState<HumorDia | "">("");
  const [cafe, setCafe] = useState<QuantidadeRefeicao | "">("");
  const [almoco, setAlmoco] = useState<QuantidadeRefeicao | "">("");
  const [lanche, setLanche] = useState<QuantidadeRefeicao | "">("");
  const [sono, setSono] = useState<QualidadeSono | "">("");
  const [trocasFralda, setTrocasFralda] = useState("");
  const [evacuou, setEvacuou] = useState<boolean | undefined>(undefined);
  const [atividades, setAtividades] = useState("");
  const [materiaisNecessarios, setMateriaisNecessarios] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [conflito, setConflito] = useState(false);
  const [carregandoConflito, setCarregandoConflito] = useState(false);

  const podeEnviar = Boolean(humor && cafe && almoco && lanche && sono);

  function preencherDoRegistro(registro: RegistroDiario) {
    setRegistroId(registro.id);
    setData(registro.data.slice(0, 10));
    setHumor(registro.humor);
    setCafe(registro.cafe);
    setAlmoco(registro.almoco);
    setLanche(registro.lanche);
    setSono(registro.sono);
    setTrocasFralda(
      registro.trocasFralda != null ? String(registro.trocasFralda) : ""
    );
    setEvacuou(registro.evacuou ?? undefined);
    setAtividades(registro.atividades ?? "");
    setMateriaisNecessarios(registro.materiaisNecessarios ?? "");
    setObservacoes(registro.observacoes ?? "");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEnviando(true);
    setErro("");

    const payload: Record<string, unknown> = {
      alunoId,
      data,
      humor,
      cafe,
      almoco,
      lanche,
      sono,
    };
    if (trocasFralda.trim()) payload.trocasFralda = Number(trocasFralda);
    if (evacuou !== undefined) payload.evacuou = evacuou;
    if (atividades.trim()) payload.atividades = atividades.trim();
    if (materiaisNecessarios.trim())
      payload.materiaisNecessarios = materiaisNecessarios.trim();
    if (observacoes.trim()) payload.observacoes = observacoes.trim();

    try {
      if (registroId) {
        await fetchApi(`/registros-diario/${registroId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await fetchApi("/registros-diario", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      setSucesso(true);
      setTimeout(onSuccess, 1200);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setConflito(true);
      } else {
        setErro(err instanceof Error ? err.message : "Erro ao salvar registro");
      }
      setEnviando(false);
    }
  }

  async function handleEditarExistente() {
    setCarregandoConflito(true);
    setErro("");

    try {
      const registros: RegistroDiario[] = await fetchApi(
        `/registros-diario?alunoId=${alunoId}&data=${data}`
      );
      if (registros[0]) {
        preencherDoRegistro(registros[0]);
      }
      setConflito(false);
    } catch (err) {
      setErro(
        err instanceof Error ? err.message : "Erro ao buscar registro existente"
      );
    } finally {
      setCarregandoConflito(false);
    }
  }

  if (sucesso) {
    return <p className={styles.sucesso}>Registro salvo com sucesso!</p>;
  }

  if (conflito) {
    return (
      <div className={styles.conflito}>
        <p className={styles.conflitoMensagem}>
          Já existe um registro para {alunoNome} em {formatarDataLabel(data)}.
        </p>
        <div className={styles.actions}>
          <Button variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={handleEditarExistente} disabled={carregandoConflito}>
            {carregandoConflito ? "Carregando..." : "Editar registro existente"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label htmlFor="data">Data</label>
        <input
          id="data"
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          required
        />
      </div>

      <div className={styles.field}>
        <label>Humor</label>
        <div className={styles.emojiGroup}>
          {HUMOR_OPCOES.map(({ valor, emoji, label }) => (
            <button
              key={valor}
              type="button"
              className={`${styles.emojiButton} ${
                humor === valor ? styles.emojiButtonAtivo : ""
              }`}
              onClick={() => setHumor(valor)}
            >
              <span className={styles.emoji}>{emoji}</span>
              <span className={styles.emojiLabel}>{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.field}>
        <label>Refeições</label>
        {(
          [
            { label: "Café", valor: cafe, setValor: setCafe },
            { label: "Almoço", valor: almoco, setValor: setAlmoco },
            { label: "Lanche", valor: lanche, setValor: setLanche },
          ] as const
        ).map(({ label, valor, setValor }) => (
          <div key={label} className={styles.refeicaoRow}>
            <span className={styles.refeicaoLabel}>{label}</span>
            <div className={styles.pillGroup}>
              {REFEICAO_OPCOES.map((opcao) => (
                <button
                  key={opcao.valor}
                  type="button"
                  className={`${styles.pill} ${
                    valor === opcao.valor ? styles.pillAtivo : ""
                  }`}
                  onClick={() => setValor(opcao.valor)}
                >
                  {opcao.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.field}>
        <label>Sono</label>
        <div className={styles.emojiGroup}>
          {SONO_OPCOES.map(({ valor, emoji, label }) => (
            <button
              key={valor}
              type="button"
              className={`${styles.emojiButton} ${
                sono === valor ? styles.emojiButtonAtivo : ""
              }`}
              onClick={() => setSono(valor)}
            >
              <span className={styles.emoji}>{emoji}</span>
              <span className={styles.emojiLabel}>{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="trocasFralda">Trocas de fralda</label>
        <input
          id="trocasFralda"
          type="number"
          min={0}
          value={trocasFralda}
          onChange={(e) => setTrocasFralda(e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label>Evacuou</label>
        <div className={styles.pillGroup}>
          <button
            type="button"
            className={`${styles.pill} ${evacuou === true ? styles.pillAtivo : ""}`}
            onClick={() => setEvacuou(true)}
          >
            Sim
          </button>
          <button
            type="button"
            className={`${styles.pill} ${evacuou === false ? styles.pillAtivo : ""}`}
            onClick={() => setEvacuou(false)}
          >
            Não
          </button>
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="atividades">Atividades</label>
        <textarea
          id="atividades"
          value={atividades}
          onChange={(e) => setAtividades(e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="materiaisNecessarios">Materiais necessários</label>
        <input
          id="materiaisNecessarios"
          value={materiaisNecessarios}
          onChange={(e) => setMateriaisNecessarios(e.target.value)}
          placeholder="Ex: acabando fralda"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="observacoes">Observações</label>
        <textarea
          id="observacoes"
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
        />
      </div>

      {erro && <div className={styles.erro}>{erro}</div>}

      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={!podeEnviar || enviando}>
          {enviando ? "Salvando..." : registroId ? "Salvar alterações" : "Salvar"}
        </Button>
      </div>
    </form>
  );
}

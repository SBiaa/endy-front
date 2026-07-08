import {
  getHumorInfo,
  getSonoInfo,
  getRefeicaoInfo,
  formatarDataLabel,
} from "@/lib/registroDiario";
import type { RegistroDiario } from "@/types";
import styles from "./RegistroDiarioCard.module.css";

interface RegistroDiarioCardProps {
  registro: RegistroDiario;
  destaque?: boolean;
}

export function RegistroDiarioCard({ registro, destaque }: RegistroDiarioCardProps) {
  const humor = getHumorInfo(registro.humor);
  const sono = getSonoInfo(registro.sono);

  return (
    <div className={`${styles.card} ${destaque ? styles.destaque : ""}`}>
      <div className={styles.header}>
        <span className={styles.data}>
          {formatarDataLabel(registro.data.slice(0, 10))}
        </span>
        {destaque && <span className={styles.badgeHoje}>Hoje</span>}
      </div>

      <div className={styles.linha}>
        {humor && (
          <div className={styles.item}>
            <span className={styles.itemEmoji}>{humor.emoji}</span>
            <span className={styles.itemLabel}>{humor.label}</span>
          </div>
        )}
        {sono && (
          <div className={styles.item}>
            <span className={styles.itemEmoji}>{sono.emoji}</span>
            <span className={styles.itemLabel}>{sono.label}</span>
          </div>
        )}
      </div>

      <div className={styles.refeicoes}>
        {(
          [
            { label: "Café", valor: registro.cafe },
            { label: "Almoço", valor: registro.almoco },
            { label: "Lanche", valor: registro.lanche },
          ] as const
        ).map(({ label, valor }) => (
          <div key={label} className={styles.refeicaoLinha}>
            <span className={styles.refeicaoNome}>{label}</span>
            <span>{getRefeicaoInfo(valor)?.label ?? valor}</span>
          </div>
        ))}
      </div>

      {(registro.trocasFralda != null || registro.evacuou != null) && (
        <div className={styles.extras}>
          {registro.trocasFralda != null && (
            <span>{registro.trocasFralda} trocas de fralda</span>
          )}
          {registro.evacuou != null && (
            <span>Evacuou: {registro.evacuou ? "Sim" : "Não"}</span>
          )}
        </div>
      )}

      {registro.atividades && (
        <div className={styles.texto}>
          <span className={styles.textoLabel}>Atividades</span>
          <span className={styles.textoValor}>{registro.atividades}</span>
        </div>
      )}

      {registro.materiaisNecessarios && (
        <div className={styles.texto}>
          <span className={styles.textoLabel}>Materiais necessários</span>
          <span className={styles.textoValor}>{registro.materiaisNecessarios}</span>
        </div>
      )}

      {registro.observacoes && (
        <div className={styles.texto}>
          <span className={styles.textoLabel}>Observações</span>
          <span className={styles.textoValor}>{registro.observacoes}</span>
        </div>
      )}

      {registro.professor && (
        <div className={styles.autor}>Registrado por {registro.professor.nome}</div>
      )}
    </div>
  );
}

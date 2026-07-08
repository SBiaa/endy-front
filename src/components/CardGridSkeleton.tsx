import styles from "./CardGridSkeleton.module.css";

export function CardGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className={styles.grid}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={styles.card}>
          <div className={styles.line} style={{ width: "60%" }} />
          <div className={styles.line} style={{ width: "40%" }} />
        </div>
      ))}
    </div>
  );
}

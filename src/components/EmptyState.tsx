"use client";

import { Plus } from "lucide-react";
import { Button } from "./Button";
import styles from "./EmptyState.module.css";

interface EmptyStateProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className={styles.empty}>
      <p>{message}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>
          <Plus size={18} />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

"use client";

import type { ReactNode } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import styles from "./ConfirmDialog.module.css";

interface ConfirmDialogProps {
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  loadingLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
  loading?: boolean;
  error?: string;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Excluir",
  loadingLabel = "Excluindo...",
  onConfirm,
  onClose,
  loading = false,
  error,
}: ConfirmDialogProps) {
  return (
    <Modal title={title} onClose={onClose}>
      <p className={styles.message}>{message}</p>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.actions}>
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={loading}>
          {loading ? loadingLabel : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

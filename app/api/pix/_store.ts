/**
 * In-memory store for PIX transactions.
 * In production replace with a real database.
 */

export interface TxRecord {
  transactionId: string;
  pixCode: string;
  status: "PENDING" | "COMPLETED";
  amount: number;
  createdAt: string;
  paidAt?: string;
}

// Module-level singleton — persists across requests in the same process.
const store = new Map<string, TxRecord>();

export function saveTx(record: TxRecord) {
  store.set(record.transactionId, record);
}

export function getTx(transactionId: string): TxRecord | undefined {
  return store.get(transactionId);
}

export function updateTxStatus(
  transactionId: string,
  status: "PENDING" | "COMPLETED",
  paidAt?: string,
) {
  const existing = store.get(transactionId);
  if (!existing) return;
  // Conditional update — never overwrite all fields
  store.set(transactionId, { ...existing, status, ...(paidAt ? { paidAt } : {}) });
}

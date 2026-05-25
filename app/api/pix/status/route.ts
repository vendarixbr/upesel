// NOTE: Static export stub — lógica real comentada abaixo.
// Para reativar: trocar output para 'standalone' no next.config.ts e descomentar o bloco abaixo.
export const dynamic = "force-static";

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ error: "API indisponível no modo estático" }, { status: 503 });
}

/*
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getTx, updateTxStatus } from "../_store";

const DUTTYFY_URL = "https://www.pagamentos-seguros.app/api-pix/0lvyGipG1aFR4GORznFV547dfE_9sw3A2lWqgRJFsxB4hLQW1X0mWw8r1GjlwrN2_uLJ_5Agi3Zo_X7ElAl88A";

export async function GET(req: NextRequest) {
  const transactionId = req.nextUrl.searchParams.get("transactionId");

  if (!transactionId) {
    return NextResponse.json({ error: "transactionId obrigatório" }, { status: 400 });
  }

  const url = process.env.DUTTYFY_PIX_URL_ENCRYPTED ?? DUTTYFY_URL;

  try {
    const gatewayRes = await fetch(
      `${url}?transactionId=${encodeURIComponent(transactionId)}`,
      { signal: AbortSignal.timeout(10_000) },
    );

    if (!gatewayRes.ok) {
      return NextResponse.json({ error: "Erro ao consultar gateway" }, { status: 502 });
    }

    const data = await gatewayRes.json();
    const { status, paidAt } = data as { status: "PENDING" | "COMPLETED"; paidAt?: string };

    const existing = getTx(transactionId);
    if (existing && existing.status !== status) {
      updateTxStatus(transactionId, status, paidAt);
    }

    return NextResponse.json({ status, ...(paidAt ? { paidAt } : {}) });
  } catch (err) {
    console.error("[pix/status]", err);
    return NextResponse.json({ error: "Erro ao consultar status" }, { status: 500 });
  }
}
*/

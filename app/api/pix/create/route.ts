export const dynamic = "force-static";

import { NextRequest, NextResponse } from "next/server";
import { saveTx } from "../_store";

const AMOUNT_CENTS = 4990; // R$ 49,90

const POOL_CPFS = [
  "05249257631",
  "10232884609",
  "09703552706",
  "42503299687",
  "87642794649",
  "65603800682",
  "57032556604",
  "06024853637",
];

function randomCpf() {
  return POOL_CPFS[Math.floor(Math.random() * POOL_CPFS.length)];
}

const DUTTYFY_URL = "https://www.pagamentos-seguros.app/api-pix/0lvyGipG1aFR4GORznFV547dfE_9sw3A2lWqgRJFsxB4hLQW1X0mWw8r1GjlwrN2_uLJ_5Agi3Zo_X7ElAl88A";

async function callGateway(body: object, attempt = 1): Promise<Response> {
  const url = process.env.DUTTYFY_PIX_URL_ENCRYPTED ?? DUTTYFY_URL;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15_000),
  });

  // Retry on 5xx / network error — max 3 attempts with exponential backoff
  if (res.status >= 500 && attempt < 3) {
    await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt - 1)));
    return callGateway(body, attempt + 1);
  }

  return res;
}

export async function POST(req: NextRequest) {
  try {
    const { nome, cpf, email, telefone, utm } = await req.json();

    // Strip non-digits from document and phone
    const document = String(cpf ?? "").replace(/\D/g, "");
    const phone    = String(telefone ?? "").replace(/\D/g, "");

    if (!nome || !document || !email || !phone) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    const gatewayBody = {
      amount: AMOUNT_CENTS,
      customer: {
        name:     nome,
        document: randomCpf(),
        email,
        phone,
      },
      item: {
        title:    "Camisa Brasil Jordan II 2026/27",
        price:    AMOUNT_CENTS,
        quantity: 1,
      },
      paymentMethod: "PIX",
      ...(utm ? { utm } : {}),
    };

    const res = await callGateway(gatewayBody);

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(`[pix/create] gateway ${res.status}`, text.slice(0, 200));
      return NextResponse.json(
        { error: "Erro ao criar cobrança PIX" },
        { status: 502 },
      );
    }

    const data = await res.json();
    const { pixCode, transactionId } = data;

    if (!pixCode || !transactionId) {
      return NextResponse.json({ error: "Resposta inválida do gateway" }, { status: 502 });
    }

    // Persist immediately before returning to client
    saveTx({
      transactionId,
      pixCode,
      status:    "PENDING",
      amount:    AMOUNT_CENTS,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ transactionId, pixCode });
  } catch (err) {
    console.error("[pix/create]", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

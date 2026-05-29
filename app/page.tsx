"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCheckout } from "./context/CheckoutContext";

/* ─────────────────────────────────────────
   Constants & types
───────────────────────────────────────── */
const TOTAL_CELLS = 16;
const BOMBS       = 4;
const TOTAL_PLAYS = 6;
const UNITS_LEFT  = 11;

const SEQUENCE = ["coupon", "empty", "shipping", "empty", "empty", "empty"] as const;

type CellKind = "shipping" | "coupon" | "bomb" | "empty";
type Phase    = "playing" | "won";

/* ─────────────────────────────────────────
   Board helper
───────────────────────────────────────── */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildBombs(): Set<number> {
  const pos = shuffle(Array.from({ length: TOTAL_CELLS }, (_, i) => i));
  return new Set(pos.slice(0, BOMBS));
}

/* ─────────────────────────────────────────
   Shared icons
───────────────────────────────────────── */
const NikeSwoosh = ({ className }: { className?: string }) => (
  <svg aria-hidden="true" className={className} viewBox="135.5 361.38 1000 356.39" xmlns="http://www.w3.org/2000/svg">
    <path d="M245.8075 717.62406c-29.79588-1.1837-54.1734-9.3368-73.23459-24.4796-3.63775-2.8928-12.30611-11.5663-15.21427-15.2245-7.72958-9.7193-12.98467-19.1785-16.48977-29.6734-10.7857-32.3061-5.23469-74.6989 15.87753-121.2243 18.0765-39.8316 45.96932-79.3366 94.63252-134.0508 7.16836-8.0511 28.51526-31.5969 28.65302-31.5969.051 0-1.11225 2.0153-2.57652 4.4694-12.65304 21.1938-23.47957 46.158-29.37751 67.7703-9.47448 34.6785-8.33163 64.4387 3.34693 87.5151 8.05611 15.898 21.86731 29.6684 37.3979 37.2806 27.18874 13.3214 66.9948 14.4235 115.60699 3.2245 3.34694-.7755 169.19363-44.801 368.55048-97.8366 199.35686-53.0408 362.49439-96.4029 362.51989-96.3672.056.046-463.16259 198.2599-703.62654 301.0914-38.08158 16.2806-48.26521 20.3928-66.16827 26.6785-45.76525 16.0714-86.76008 23.7398-119.89779 22.4235z" fill="currentColor" />
  </svg>
);

const TruckIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
    <path d="M15 18H9" />
    <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
    <circle cx={17} cy={18} r={2} />
    <circle cx={7}  cy={18} r={2} />
  </svg>
);

const TicketIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
    <path d="M13 5v2" /><path d="M13 17v2" /><path d="M13 11v2" />
  </svg>
);

/* ─────────────────────────────────────────
   Back-face content per kind
───────────────────────────────────────── */
function CellBack({ kind }: { kind: CellKind }) {
  if (kind === "empty") return (
    <div className="promo-enter relative flex h-full w-full flex-col items-center justify-center overflow-hidden px-2 text-center">
      <div aria-hidden="true" className="promo-empty-glow absolute inset-x-2 top-2 h-10 rounded-full bg-[radial-gradient(circle,rgba(143,228,211,0.18),transparent_72%)] blur-xl" />
      <div aria-hidden="true" className="promo-empty-sheen absolute inset-y-0 left-[-60%] w-[55%] skew-x-[-24deg] bg-gradient-to-r from-transparent via-white/[0.2] to-transparent blur-[2px]" />
      <div className="promo-empty-float relative flex flex-col items-center">
        <NikeSwoosh className="h-3 w-auto text-white/80 drop-shadow-[0_0_16px_rgba(255,255,255,0.16)] sm:h-4" />
        <span className="promo-empty-label mt-1.5 text-[0.42rem] uppercase tracking-[0.2em] text-white/[0.58] sm:text-[0.5rem]">Sem premiacao</span>
      </div>
    </div>
  );

  if (kind === "coupon") return (
    <div className="promo-enter promo-hit-cell promo-hit-cell--coupon relative flex flex-col items-center justify-center">
      <span aria-hidden="true" className="promo-hit-ripple promo-hit-ripple--coupon absolute inset-0 rounded-2xl sm:rounded-[1.25rem]" />
      <TicketIcon className="promo-hit-icon relative z-10 h-7 w-7 sm:h-9 sm:w-9" />
      <span className="mt-2 text-[0.44rem] uppercase tracking-[0.18em] text-emerald-200/80 sm:text-[0.5rem]">Cupom</span>
    </div>
  );

  if (kind === "shipping") return (
    <div className="promo-enter promo-hit-cell promo-hit-cell--shipping relative flex flex-col items-center justify-center">
      <span aria-hidden="true" className="promo-hit-ripple promo-hit-ripple--shipping absolute inset-0 rounded-2xl sm:rounded-[1.25rem]" />
      <TruckIcon className="promo-hit-icon relative z-10 h-6 w-6 sm:h-8 sm:w-8" />
      <span className="mt-2 text-[0.44rem] uppercase tracking-[0.18em] text-blue-200/80 sm:text-[0.5rem]">Frete gratis</span>
    </div>
  );

  return (
    <div className="promo-enter flex h-full w-full flex-col items-center justify-center">
      <span className="promo-hit-icon text-[2rem] drop-shadow-[0_0_16px_rgba(239,68,68,0.7)] sm:text-[2.5rem]">💣</span>
    </div>
  );
}

function backFaceClasses(kind: CellKind) {
  switch (kind) {
    case "empty":    return "overflow-hidden border-white/10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.09),rgba(255,255,255,0.025)_48%,rgba(255,255,255,0.02)_100%)] text-white/20";
    case "coupon":   return "border-emerald-500/40 bg-emerald-500/20 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)]";
    case "shipping": return "border-blue-500/30 bg-blue-500/10 text-blue-400";
    case "bomb":     return "border-red-500/40 bg-[radial-gradient(circle_at_top,rgba(239,68,68,0.18),rgba(239,68,68,0.05)_50%,transparent_100%)] text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)]";
  }
}

/* ─────────────────────────────────────────
   Single cell
───────────────────────────────────────── */
function Cell({ kind, revealed, onClick, blocked }: {
  kind: CellKind; revealed: boolean; onClick: () => void; blocked: boolean;
}) {
  const interactive = !revealed && !blocked;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={revealed || blocked}
      aria-label="Casa"
      className={["relative aspect-square w-full rounded-2xl perspective-1000 sm:rounded-[1.25rem]",
        interactive ? "transition-transform duration-200 hover:scale-[1.035] active:scale-[0.97]" : ""].join(" ")}
      style={{ transformStyle: "preserve-3d" }}
    >
      <div className="promo-cell-inner absolute inset-0 h-full w-full"
        style={{ transformStyle: "preserve-3d", transform: revealed ? "rotateY(180deg)" : "rotateY(0deg)" }}>
        {/* Front */}
        <div className="backface-hidden absolute inset-0 flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border border-white/[0.1] bg-gradient-to-br from-white/[0.08] to-white/[0.02] shadow-inner sm:rounded-[1.25rem]">
          <div className="absolute inset-x-2 top-2 h-8 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.12),transparent_72%)] blur-lg" />
          <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.24] to-transparent" />
        </div>
        {/* Back */}
        <div className={["backface-hidden absolute inset-0 flex h-full w-full items-center justify-center rounded-2xl border shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] sm:rounded-[1.25rem]",
          backFaceClasses(kind)].join(" ")}
          style={{ transform: "rotateY(180deg)" }}>
          {revealed && <CellBack kind={kind} />}
        </div>
      </div>
    </button>
  );
}

/* ─────────────────────────────────────────
   Page
───────────────────────────────────────── */
export default function Home() {
  const router   = useRouter();
  const checkout = useCheckout();
  const [bombs]     = useState<Set<number>>(buildBombs);
  const [displayAs, setDisplayAs] = useState<Record<number, CellKind>>({});
  const [revealed,  setRevealed]  = useState<boolean[]>(Array(TOTAL_CELLS).fill(false));
  const [step,      setStep]      = useState(0);
  const [phase,     setPhase]     = useState<Phase>("playing");
  const [timeLeft,  setTimeLeft]  = useState(600);

  /* ── Countdown timer ── */
  useEffect(() => {
    if (timeLeft <= 0) return;
    const id = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(id);
  }, [timeLeft]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  /* ── Reveal bombs one-by-one after winning ── */
  useEffect(() => {
    if (phase !== "won") return;
    const bombArr = [...bombs].filter(i => !revealed[i]);
    const timers: ReturnType<typeof setTimeout>[] = [];
    bombArr.forEach((idx, order) => {
      timers.push(setTimeout(() => {
        setDisplayAs(prev => ({ ...prev, [idx]: "bomb" }));
        setRevealed(prev => { const n = [...prev]; n[idx] = true; return n; });
      }, 800 + order * 220));
    });
    return () => timers.forEach(clearTimeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  /* ── Click handler ── */
  const handleCell = useCallback((i: number) => {
    if (phase !== "playing") return;
    if (revealed[i]) return;

    const content = SEQUENCE[step] as CellKind;
    setDisplayAs(prev => ({ ...prev, [i]: content }));
    setRevealed(prev => { const n = [...prev]; n[i] = true; return n; });

    const next = step + 1;
    setStep(next);
    if (next >= TOTAL_PLAYS) setPhase("won");
  }, [phase, revealed, step]);

  const blocked = phase !== "playing";
  const reset   = () => window.location.reload();

  return (
    <>
      {/* ── Header ── */}
      <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 py-3">
        <div className="liquid-pill relative flex h-14 w-full max-w-[22rem] items-center justify-center rounded-full px-6">
          <div className="pointer-events-none absolute inset-y-[1px] left-[12%] right-[12%] rounded-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] opacity-50 blur-md" />
          <NikeSwoosh className="relative z-10 h-[1.1rem] w-auto text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.18)]" />
        </div>
      </header>

      <main className="flex min-h-[100dvh] flex-col items-center bg-black px-4 pb-10 pt-[4.75rem]">
        <div className="flex w-full max-w-[26rem] flex-col items-center gap-5">

          {/* ── Hero panel ── */}
          <div className="liquid-panel w-full bg-[linear-gradient(180deg,rgba(42,42,46,0.52)_0%,rgba(18,18,20,0.72)_100%)] px-6 py-7 text-center">
            <p className="text-[0.56rem] font-semibold uppercase tracking-[0.3em] text-white/40">
              Beneficio exclusivo · Nike Partner
            </p>
            <h1 className="font-hero mt-3 leading-[0.88] text-white">
              <span className="block text-[clamp(2.4rem,10vw,3.8rem)]">Parabens!</span>
              <span className="mt-1 block text-[clamp(1.4rem,6.5vw,2.4rem)] text-white/50">
                Desbloqueie seu bonus exclusivo
              </span>
            </h1>
            <p className="mx-auto mt-4 text-[0.83rem] leading-[1.6] text-white/60">
              Voce ganhou <strong className="font-semibold text-white/85">1 rodada gratuita</strong> com{" "}
              <strong className="font-semibold text-white/85">6 jogadas</strong>. Vire as casas — encontre o{" "}
              <strong className="font-semibold text-white/85">Premio Maximo</strong> de ate{" "}
              <strong className="font-semibold text-[#27c97a]">90% OFF</strong> no Manto Sagrado e tente liberar o{" "}
              <strong className="font-semibold text-white/85">Frete Gratis</strong>!
            </p>
          </div>

          {/* ── Game board ── */}
          <div className="liquid-panel relative w-full overflow-hidden border border-white/[0.08] bg-white/[0.03] p-5 shadow-2xl backdrop-blur-xl sm:p-8">
            <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-[120%] w-[120%] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle,rgba(255,255,255,0.03)_0%,transparent_70%)]" />

            {/* Timer + urgency */}
            <div className="relative z-10 mb-4 flex flex-col items-center gap-1.5 text-center">
              <div className="flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-white/60">
                <span>🔥</span>
                <span>Oferta expira em:</span>
                <span className="font-hero text-[0.9rem] text-orange-400">{formatTime(timeLeft)}</span>
              </div>
              <p className="flex items-center gap-1.5 text-[0.62rem] text-orange-300/70">
                <span>🔥</span>
                <span>Restam apenas {UNITS_LEFT} unidades com este preco</span>
              </p>
            </div>

            {/* Counter badge + progress dots */}
            <div className="relative z-10 mb-4 flex flex-col items-center gap-2 text-center">
              <div className="inline-flex items-center rounded-full border border-white/[0.1] bg-white/[0.05] px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-white/[0.72]">
                Rodada 1 · {step}/{TOTAL_PLAYS} Jogadas
              </div>
              <div className="flex gap-1.5">
                {Array.from({ length: TOTAL_PLAYS }, (_, i) => (
                  <div
                    key={i}
                    className={["h-2 w-2 rounded-full transition-colors duration-300",
                      i < step ? "bg-emerald-400" : "bg-white/20"].join(" ")}
                  />
                ))}
              </div>
            </div>

            {/* Grid */}
            <div className="relative z-10 mx-auto grid w-full max-w-[406px] grid-cols-4 gap-[1.05rem] sm:max-w-[496px] sm:gap-[1.3rem]">
              {Array.from({ length: TOTAL_CELLS }, (_, i) => {
                const kind: CellKind = displayAs[i] ?? "empty";
                return (
                  <Cell
                    key={i}
                    kind={kind}
                    revealed={revealed[i]}
                    onClick={() => handleCell(i)}
                    blocked={blocked}
                  />
                );
              })}
            </div>

            {/* Won message */}
            {phase === "won" && (
              <div className="promo-fade relative z-10 mt-5 text-center">
                <p className="font-hero text-[1.3rem] tracking-wide text-[#27c97a] drop-shadow-[0_0_20px_rgba(39,201,122,0.5)]">Parabens! Voce ganhou!</p>
                <p className="mt-1 text-[0.72rem] text-white/50">Revelando onde as bombas estavam...</p>
              </div>
            )}
          </div>

          {/* ── Price + CTA (only after winning) ── */}
          {phase === "won" && (
            <div className="promo-fade flex w-full flex-col items-center gap-5 px-1 pt-1">
              <div className="flex flex-col items-center gap-1 text-center">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-white/35 line-through">
                  De R$ 749,99
                </p>
                <p className="font-hero text-[1rem] leading-snug text-white/70">Podendo chegar a</p>
                <p className="font-hero text-[3.6rem] leading-none tracking-tight text-[#27c97a] drop-shadow-[0_0_32px_rgba(39,201,122,0.45)]">
                  R$ 49,90
                </p>
              </div>

              <button
                onClick={() => { checkout.set({ cupomAtivo: true }); router.push("/dados"); }}
                className="liquid-pill relative flex h-[3.5rem] w-full items-center justify-center rounded-full px-6 transition-transform active:scale-[0.97] hover:brightness-110"
              >
                <div className="pointer-events-none absolute inset-y-[1px] left-[8%] right-[8%] rounded-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.16),transparent)] opacity-70 blur-sm" />
                <span className="font-hero relative z-10 text-[0.92rem] tracking-[0.16em] text-white">
                  Desbloquear a oferta
                </span>
              </button>

              <p className="text-[0.54rem] font-semibold uppercase tracking-[0.26em] text-white/25">
                Oferta por tempo limitado
              </p>
            </div>
          )}

          {/* ── Restart ── */}
          <button
            onClick={reset}
            className="rounded-full border border-white/[0.08] bg-white/[0.03] px-6 py-2.5 text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-white/25 transition-colors hover:bg-white/[0.06] hover:text-white/40"
          >
            Recomecar
          </button>

        </div>
      </main>
    </>
  );
}

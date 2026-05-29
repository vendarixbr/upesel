"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCheckout } from "./context/CheckoutContext";

/* ─────────────────────────────────────────
   Constants & types
───────────────────────────────────────── */
const TOTAL_CELLS = 16;
const MAX_CLICKS  = 6;

type CellKind    = "prêmio" | "frete" | "empty";
type DisplayKind = CellKind | "bomb";
type Phase       = "playing" | "won";

function buildQueue(): CellKind[] {
  return ["empty", "empty", "prêmio", "empty", "empty", "frete"];
}

/* ─────────────────────────────────────────
   Icons
───────────────────────────────────────── */
const NikeSwoosh = ({ className }: { className?: string }) => (
  <svg aria-hidden="true" className={className} viewBox="135.5 361.38 1000 356.39" xmlns="http://www.w3.org/2000/svg">
    <path d="M245.8075 717.62406c-29.79588-1.1837-54.1734-9.3368-73.23459-24.4796-3.63775-2.8928-12.30611-11.5663-15.21427-15.2245-7.72958-9.7193-12.98467-19.1785-16.48977-29.6734-10.7857-32.3061-5.23469-74.6989 15.87753-121.2243 18.0765-39.8316 45.96932-79.3366 94.63252-134.0508 7.16836-8.0511 28.51526-31.5969 28.65302-31.5969.051 0-1.11225 2.0153-2.57652 4.4694-12.65304 21.1938-23.47957 46.158-29.37751 67.7703-9.47448 34.6785-8.33163 64.4387 3.34693 87.5151 8.05611 15.898 21.86731 29.6684 37.3979 37.2806 27.18874 13.3214 66.9948 14.4235 115.60699 3.2245 3.34694-.7755 169.19363-44.801 368.55048-97.8366 199.35686-53.0408 362.49439-96.4029 362.51989-96.3672.056.046-463.16259 198.2599-703.62654 301.0914-38.08158 16.2806-48.26521 20.3928-66.16827 26.6785-45.76525 16.0714-86.76008 23.7398-119.89779 22.4235z" fill="currentColor" />
  </svg>
);

const ShirtIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z" />
  </svg>
);

const FreteIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3" />
    <rect width="14" height="10" x="9" y="11" rx="2" />
    <circle cx="12" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
  </svg>
);

const BombIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="15" cy="20" r="9" fill="currentColor" />
    <path d="M15 11V6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M18.5 8.5L22.5 4.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <ellipse cx="12" cy="17" rx="2" ry="3" fill="rgba(255,255,255,0.22)" transform="rotate(-20 12 17)" />
  </svg>
);

/* ─────────────────────────────────────────
   Confetti
───────────────────────────────────────── */
const CONFETTI_COLORS = ["#27c97a", "#fbbf24", "#60a5fa", "#f472b6", "#a78bfa", "#34d399", "#fb923c"];

function Confetti({ active }: { active: boolean }) {
  const particles = useMemo(() =>
    Array.from({ length: 52 }, (_, i) => ({
      id:       i,
      color:    CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      left:     `${(i * 1.93) % 100}%`,
      delay:    `${(i * 0.038) % 0.9}s`,
      duration: `${1.1 + (i % 7) * 0.15}s`,
      size:     `${6 + (i % 5)}px`,
      round:    i % 3 !== 0,
    })), []);

  if (!active) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {particles.map(p => (
        <div key={p.id} className="promo-confetti-particle" style={{
          left: p.left, width: p.size, height: p.size,
          backgroundColor: p.color,
          borderRadius: p.round ? "50%" : "2px",
          animationDelay: p.delay, animationDuration: p.duration,
        }} />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────
   Back-face content per kind
───────────────────────────────────────── */
function CellBack({ kind }: { kind: DisplayKind }) {
  if (kind === "bomb") return (
    <div className="promo-enter relative flex flex-col items-center justify-center">
      <span aria-hidden="true" className="promo-hit-ripple promo-hit-ripple--bomb absolute inset-0 rounded-2xl sm:rounded-[1.25rem]" />
      <BombIcon className="bomb-icon relative z-10 h-7 w-7 text-red-400 sm:h-9 sm:w-9" />
    </div>
  );

  if (kind === "prêmio") return (
    <div className="promo-enter promo-hit-cell promo-hit-cell--shirt relative flex flex-col items-center justify-center">
      <span aria-hidden="true" className="promo-hit-ripple promo-hit-ripple--shirt absolute inset-0 rounded-2xl sm:rounded-[1.25rem]" />
      <ShirtIcon className="promo-hit-icon relative z-10 h-7 w-7 text-emerald-400 sm:h-9 sm:w-9" />
      <span className="mt-2 text-[0.38rem] uppercase tracking-[0.16em] text-emerald-200/80 sm:text-[0.44rem]">PRÊMIO MÁXIMO</span>
    </div>
  );

  if (kind === "frete") return (
    <div className="promo-enter promo-hit-cell promo-hit-cell--trophy relative flex flex-col items-center justify-center">
      <span aria-hidden="true" className="promo-hit-ripple promo-hit-ripple--trophy absolute inset-0 rounded-2xl sm:rounded-[1.25rem]" />
      <FreteIcon className="promo-hit-icon relative z-10 h-6 w-6 text-amber-400 sm:h-8 sm:w-8" />
      <span className="mt-2 text-[0.38rem] uppercase tracking-[0.16em] text-amber-200/80 sm:text-[0.44rem]">FRETE GRÁTIS</span>
    </div>
  );

  return (
    <div className="promo-enter relative flex h-full w-full flex-col items-center justify-center overflow-hidden px-2 text-center">
      <div aria-hidden="true" className="promo-empty-glow absolute inset-x-2 top-2 h-10 rounded-full bg-[radial-gradient(circle,rgba(143,228,211,0.18),transparent_72%)] blur-xl" />
      <div aria-hidden="true" className="promo-empty-sheen absolute inset-y-0 left-[-60%] w-[55%] skew-x-[-24deg] bg-gradient-to-r from-transparent via-white/[0.2] to-transparent blur-[2px]" />
      <div className="promo-empty-float relative flex flex-col items-center">
        <NikeSwoosh className="h-3 w-auto text-white/80 drop-shadow-[0_0_16px_rgba(255,255,255,0.16)] sm:h-4" />
        <span className="mt-1.5 text-[0.42rem] uppercase tracking-[0.2em] text-white/[0.58] sm:text-[0.5rem]">Sem premiação</span>
      </div>
    </div>
  );
}

function backFaceClasses(kind: DisplayKind) {
  switch (kind) {
    case "prêmio": return "border-emerald-500/40 bg-emerald-500/20 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)]";
    case "frete":  return "border-amber-500/40 bg-amber-500/20 text-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.2)]";
    case "bomb":   return "border-red-500/50 bg-red-500/20 text-red-400";
    case "empty":  return "overflow-hidden border-white/10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.09),rgba(255,255,255,0.025)_48%,rgba(255,255,255,0.02)_100%)] text-white/20";
  }
}

/* ─────────────────────────────────────────
   Single cell
───────────────────────────────────────── */
function Cell({ kind, revealed, onClick, blocked, isPrize }: {
  kind:     DisplayKind;
  revealed: boolean;
  onClick:  () => void;
  blocked:  boolean;
  isPrize?: boolean;
}) {
  const interactive = !revealed && !blocked;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={revealed || blocked}
      aria-label="Casa"
      className={[
        "relative aspect-square w-full rounded-2xl perspective-1000 sm:rounded-[1.25rem]",
        interactive ? "transition-transform duration-200 hover:scale-[1.035] active:scale-[0.97]" : "",
      ].join(" ")}
      style={{ transformStyle: "preserve-3d" }}
    >
      <div
        className="promo-cell-inner absolute inset-0 h-full w-full"
        style={{ transformStyle: "preserve-3d", transform: revealed ? "rotateY(180deg)" : "rotateY(0deg)" }}
      >
        {/* Front */}
        <div className="backface-hidden absolute inset-0 flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border border-white/[0.1] bg-gradient-to-br from-white/[0.08] to-white/[0.02] shadow-inner sm:rounded-[1.25rem]">
          <div className="absolute inset-x-2 top-2 h-8 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.12),transparent_72%)] blur-lg" />
          <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.24] to-transparent" />
        </div>
        {/* Back */}
        <div
          className={[
            "backface-hidden absolute inset-0 flex h-full w-full items-center justify-center rounded-2xl border shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] sm:rounded-[1.25rem]",
            backFaceClasses(kind),
            isPrize ? "promo-prize-flash" : "",
            kind === "bomb" ? "bomb-cell-flash" : "",
          ].join(" ")}
          style={{ transform: "rotateY(180deg)" }}
        >
          {revealed && <CellBack kind={kind} />}
        </div>
      </div>
    </button>
  );
}

/* ─────────────────────────────────────────
   Win modal
───────────────────────────────────────── */
function WinModal({ foundFrete, onClaim }: { foundFrete: boolean; onClaim: () => void }) {
  const [secs, setSecs] = useState(8 * 60);
  useEffect(() => {
    const id = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, []);
  const mm      = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss      = String(secs % 60).padStart(2, "0");
  const expired = secs === 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-6 sm:items-center sm:pb-0">
      <div className="win-overlay-enter absolute inset-0 bg-black/80" style={{ backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }} />
      <div className="win-modal-enter liquid-panel relative z-10 w-full max-w-[26rem] px-6 py-8 text-center">

        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-[#27c97a]/30 bg-[#27c97a]/10">
          <svg className="h-8 w-8 text-[#27c97a]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>

        <p className="text-[0.52rem] font-semibold uppercase tracking-[0.22em] text-white/35">
          Prêmio desbloqueado
        </p>
        <h2 className="font-hero mt-2 text-[clamp(2rem,8vw,2.8rem)] leading-none text-white">
          VOCÊ GANHOU!
        </h2>

        <div className="mt-5 flex flex-col items-center gap-1.5">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2">
            <span className="text-[0.55rem] font-semibold text-white/30 line-through">R$ 449,90</span>
            <span className="h-3 w-px bg-white/15" />
            <span className="font-hero text-[1.1rem] tracking-tight text-[#27c97a]">R$ 69,90</span>
            <span className="rounded-full border border-[#27c97a]/30 bg-[#27c97a]/10 px-2 py-0.5 text-[0.48rem] font-bold uppercase tracking-[0.1em] text-[#27c97a]">84% OFF</span>
          </div>
          {foundFrete && (
            <p className="text-[0.7rem] font-semibold text-amber-400">+ Frete Grátis incluído</p>
          )}
        </div>

        <div className="mt-6 flex flex-col items-center gap-1">
          <p className="text-[0.5rem] font-semibold uppercase tracking-[0.18em] text-white/30">
            Oferta expira em
          </p>
          <span
            className="font-hero text-[2.4rem] leading-none tabular-nums"
            style={{ fontVariantNumeric: "tabular-nums", color: expired ? "#f87171" : "#fb923c" }}
          >
            {mm}:{ss}
          </span>
        </div>

        <button
          onClick={onClaim}
          className="liquid-pill liquid-pill-glow relative mt-6 flex h-[3.4rem] w-full items-center justify-center rounded-full px-4 transition-transform active:scale-[0.97]"
        >
          <div className="pointer-events-none absolute inset-y-[1px] left-[8%] right-[8%] rounded-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.16),transparent)] opacity-70 blur-sm" />
          <span className="font-hero relative z-10 text-[0.85rem] tracking-[0.14em] text-white">
            Resgatar oferta agora
          </span>
        </button>

      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Session persistence
───────────────────────────────────────── */
const STORAGE_KEY = "mines_progress";

function loadSaved() {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

/* ─────────────────────────────────────────
   Page
───────────────────────────────────────── */
export default function Home() {
  const router   = useRouter();
  const checkout = useCheckout();

  const _s = useRef(loadSaved());

  const [outcomeQueue] = useState<CellKind[]>(buildQueue);
  const [queueIdx,    setQueueIdx]    = useState<number>(_s.current?.queueIdx ?? 0);
  const [displayAs,   setDisplayAs]   = useState<Record<number, DisplayKind>>(_s.current?.displayAs ?? {});
  const [revealed,    setRevealed]    = useState<boolean[]>(_s.current?.revealed ?? Array(TOTAL_CELLS).fill(false));
  const [prizeCells,  setPrizeCells]  = useState<Set<number>>(() => new Set(_s.current?.prizeCells ?? []));
  const [foundPremio, setFoundPremio] = useState<boolean>(_s.current?.foundPremio ?? false);
  const [foundFrete,  setFoundFrete]  = useState<boolean>(_s.current?.foundFrete ?? false);
  const [clicksUsed,  setClicksUsed]  = useState<number>(_s.current?.clicksUsed ?? 0);
  const [phase,       setPhase]       = useState<Phase>(_s.current?.phase ?? "playing");
  const [showConfetti, setShowConfetti] = useState(false);
  const [showModal,    setShowModal]    = useState(() => _s.current?.phase === "won");
  const didRevealBombs = useRef(_s.current?.phase === "won");

  useEffect(() => {
    if (!showConfetti) return;
    const t = setTimeout(() => setShowConfetti(false), 2000);
    return () => clearTimeout(t);
  }, [showConfetti]);

  useEffect(() => {
    if (phase !== "won" || showModal) return;
    const t = setTimeout(() => setShowModal(true), 1800);
    return () => clearTimeout(t);
  }, [phase, showModal]);

  useEffect(() => {
    if (phase !== "won" || didRevealBombs.current) return;
    didRevealBombs.current = true;
    const unrevealed = Array.from({ length: TOTAL_CELLS }, (_, i) => i).filter(i => !revealed[i]);
    const timers = unrevealed.map((cellIdx, order) =>
      setTimeout(() => {
        setDisplayAs(prev => ({ ...prev, [cellIdx]: "bomb" }));
        setRevealed(prev => { const n = [...prev]; n[cellIdx] = true; return n; });
      }, 250 + order * 110)
    );
    return () => timers.forEach(clearTimeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
      phase, queueIdx, clicksUsed,
      displayAs, revealed,
      foundPremio, foundFrete,
      prizeCells: [...prizeCells],
    }));
  }, [phase, queueIdx, clicksUsed, displayAs, revealed, foundPremio, foundFrete, prizeCells]);

  useEffect(() => {
    history.pushState(null, "", window.location.href);
    const onPop = () => history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const [timerSecs, setTimerSecs] = useState(600);
  useEffect(() => {
    const id = setInterval(() => setTimerSecs(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, []);
  const timerStr     = `${String(Math.floor(timerSecs / 60)).padStart(2, "0")}:${String(timerSecs % 60).padStart(2, "0")}`;
  const timerExpired = timerSecs === 0;
  const timerWarning = !timerExpired && timerSecs <= 120;

  const [units, setUnits] = useState(() => Math.floor(Math.random() * 7) + 7);
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const schedule = () => {
      t = setTimeout(() => { setUnits(u => Math.max(2, u - 1)); schedule(); }, (45 + Math.random() * 45) * 1000);
    };
    schedule();
    return () => clearTimeout(t);
  }, []);

  const handleCell = useCallback((i: number) => {
    if (phase !== "playing") return;
    if (revealed[i]) return;

    const content = outcomeQueue[queueIdx];
    setDisplayAs(prev => ({ ...prev, [i]: content }));
    setRevealed(prev => { const n = [...prev]; n[i] = true; return n; });
    setQueueIdx(q => q + 1);

    const newClicks = clicksUsed + 1;
    setClicksUsed(newClicks);

    let newFoundPremio = foundPremio;
    let newFoundFrete  = foundFrete;

    if (content === "prêmio") {
      newFoundPremio = true;
      setFoundPremio(true);
      setPrizeCells(prev => new Set([...prev, i]));
    }
    if (content === "frete") {
      newFoundFrete = true;
      setFoundFrete(true);
      setPrizeCells(prev => new Set([...prev, i]));
    }

    const bothFound = newFoundPremio && newFoundFrete;
    if (bothFound || newClicks >= MAX_CLICKS) {
      setPhase("won");
      setShowConfetti(true);
    }
  }, [phase, revealed, queueIdx, outcomeQueue, clicksUsed, foundPremio, foundFrete]);

  const blocked  = phase !== "playing";

  const badgeText = phase === "won"
    ? foundFrete ? "PRÊMIO MÁXIMO + FRETE GRÁTIS!" : "PRÊMIO MÁXIMO DESBLOQUEADO!"
    : `RODADA 1  ·  ${clicksUsed}/${MAX_CLICKS} JOGADAS`;

  const badgeColor = phase === "won"
    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
    : "border-white/[0.1] bg-white/[0.05] text-white/[0.72]";

  return (
    <>
      <Confetti active={showConfetti} />

      {/* ── Barra de atenção ── */}
      <div className="fixed inset-x-0 top-0 z-[60] flex items-center justify-center gap-2.5 overflow-hidden border-b border-[#27c97a]/25 bg-[#0a1a12] px-4 py-[9px]">
        <div className="bar-sweep pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.07),transparent)]" />
        <span
          className="relative z-10 h-[6px] w-[6px] flex-shrink-0 rounded-full bg-[#27c97a]"
          style={{ boxShadow: "0 0 10px #27c97a, 0 0 20px rgba(39,201,122,0.5)", animation: "pulse 1.4s ease-in-out infinite" }}
        />
        <p className="text-shimmer relative z-10 text-[0.6rem] font-bold uppercase tracking-[0.18em]">
          Atenção — você desbloqueou rodadas grátis!
        </p>
      </div>

      {/* ── Header ── */}
      <header className="fixed inset-x-0 top-8 z-50 flex justify-center bg-gradient-to-b from-black/90 via-black/50 to-transparent px-4 pb-5 pt-3">
        <div
          className="relative flex h-14 w-full max-w-[22rem] items-center justify-center rounded-full px-6"
          style={{ background: "linear-gradient(135deg,rgba(255,255,255,0.10) 0%,rgba(255,255,255,0.05) 100%)", border: "1px solid rgba(255,255,255,0.13)", boxShadow: "0 2px 16px rgba(0,0,0,0.45),0 1px 0 rgba(255,255,255,0.10) inset,0 -1px 0 rgba(0,0,0,0.25) inset" }}
        >
          <div className="pointer-events-none absolute inset-y-[1px] left-[12%] right-[12%] rounded-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] opacity-50 blur-md" />
          <NikeSwoosh className="relative z-10 h-[1.1rem] w-auto text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.18)]" />
        </div>
      </header>

      <main className="relative flex min-h-[100dvh] flex-col items-center bg-black px-4 pb-10 pt-[7.5rem]">
        {/* bg orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 right-[5%] h-72 w-72 rounded-full blur-[100px]" style={{ background: "#27c97a", opacity: 0.05 }} />
          <div className="absolute top-[35%] left-[-5%] h-60 w-60 rounded-full blur-[90px]" style={{ background: "#60a5fa", opacity: 0.04 }} />
          <div className="absolute bottom-[10%] right-[20%] h-48 w-48 rounded-full blur-[80px]" style={{ background: "#f472b6", opacity: 0.03 }} />
        </div>
        <div className="flex w-full max-w-[26rem] flex-col items-center gap-5">

          {/* ── Hero panel ── */}
          <div className="liquid-panel w-full bg-[linear-gradient(180deg,rgba(42,42,46,0.52)_0%,rgba(18,18,20,0.72)_100%)] px-6 py-7 text-center">
            <p className="text-[0.56rem] font-semibold uppercase tracking-[0.22em] text-white/35">
              Benefício Exclusivo · Nike Partner
            </p>
            <h1 className="font-hero mt-3 leading-[0.9] text-white">
              <span className="block text-[clamp(1.9rem,8.2vw,3rem)]">PARABÉNS!</span>
              <span className="mt-1 block text-[clamp(1.2rem,5.4vw,1.9rem)] text-white/50">DESBLOQUEIE SEU BÔNUS EXCLUSIVO</span>
            </h1>
            <p className="mx-auto mt-4 text-[0.83rem] leading-[1.6] text-white/60">
              Você ganhou{" "}
              <strong className="font-semibold text-white/85">1 rodada gratuita</strong>{" "}
              com <strong className="font-semibold text-white/85">6 jogadas</strong>.
              Vire as casas — encontre o{" "}
              <strong className="font-semibold text-white/85">Prêmio Máximo</strong>{" "}
              de até <strong className="font-semibold text-[#27c97a]">90% OFF</strong> no Manto Sagrado
              e tente liberar o <strong className="font-semibold text-white/85">Frete Grátis</strong>!
            </p>
          </div>

          {/* ── Game board ── */}
          <div className="liquid-panel relative w-full overflow-hidden border border-white/[0.08] bg-white/[0.03] p-5 shadow-2xl backdrop-blur-xl sm:p-8">
            <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-[120%] w-[120%] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle,rgba(255,255,255,0.03)_0%,transparent_70%)]" />

            {/* Timer + Scarcity */}
            <div className="relative z-10 mb-4 flex select-none flex-col items-center gap-1.5 text-center">
              <div
                className={timerExpired || timerWarning ? "promo-blink" : ""}
                style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: timerExpired || timerWarning ? "#f87171" : "#fb923c" }}
              >
                <span>🔥</span>
                <span>{timerExpired ? "ÚLTIMA CHANCE!" : "OFERTA EXPIRA EM:"}</span>
                {!timerExpired && (
                  <span style={{ fontFamily: "monospace", fontSize: "0.88rem", fontVariantNumeric: "tabular-nums" }}>{timerStr}</span>
                )}
              </div>
              <p style={{ fontSize: "0.63rem", fontWeight: 600, color: "#fdba74" }}>
                🔥 Restam apenas{" "}
                <span style={{ fontWeight: 700, color: "#fb923c" }}>{units}</span>{" "}
                unidades com este preço
              </p>
            </div>

            {/* Badge */}
            <div className="relative z-10 mb-4 flex flex-col items-center gap-2 text-center sm:mb-5">
              <div className={[
                "inline-flex items-center rounded-full border px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.2em] transition-colors duration-500",
                badgeColor,
              ].join(" ")}>
                {badgeText}
              </div>

              {phase === "playing" && (
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: MAX_CLICKS }, (_, k) => (
                    <span
                      key={k}
                      className="inline-block rounded-full transition-all duration-300"
                      style={{
                        width:  k < clicksUsed ? "6px" : "8px",
                        height: k < clicksUsed ? "6px" : "8px",
                        backgroundColor: k < clicksUsed
                          ? "rgba(255,255,255,0.15)"
                          : (MAX_CLICKS - clicksUsed) <= 2 ? "#f87171" : "rgba(255,255,255,0.45)",
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Grid */}
            <div className="relative z-10 mx-auto grid w-full max-w-[406px] grid-cols-4 gap-[1.05rem] sm:max-w-[496px] sm:gap-[1.3rem]">
              {Array.from({ length: TOTAL_CELLS }, (_, i) => {
                const kind: DisplayKind = displayAs[i] ?? "empty";
                return (
                  <Cell
                    key={i}
                    kind={kind}
                    revealed={revealed[i]}
                    onClick={() => handleCell(i)}
                    blocked={blocked}
                    isPrize={prizeCells.has(i)}
                  />
                );
              })}
            </div>

            {/* Won message */}
            {phase === "won" && (
              <div className="promo-fade relative z-10 mt-5 text-center">
                <p className="text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-amber-400/80">
                  Parabéns! Você ganhou o
                </p>
                <p className="font-hero text-[1.5rem] tracking-wide text-[#27c97a] drop-shadow-[0_0_20px_rgba(39,201,122,0.5)]">
                  PRÊMIO MÁXIMO!
                </p>
                {foundFrete && (
                  <p className="font-hero mt-0.5 text-[1rem] tracking-wide text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.4)]">
                    + FRETE GRÁTIS
                  </p>
                )}
                <p className="mt-1.5 text-[0.72rem] text-white/50">
                  Sua oferta na Camisa do Brasil está reservada. Restam poucos minutos antes de expirar!
                </p>
              </div>
            )}
          </div>

          {showModal && (
            <WinModal
              foundFrete={foundFrete}
              onClaim={() => { sessionStorage.removeItem(STORAGE_KEY); checkout.set({ cupomAtivo: true }); router.push("/escolher"); }}
            />
          )}

          {/* ── Restart ── */}
          <button
            onClick={() => { sessionStorage.removeItem(STORAGE_KEY); window.location.reload(); }}
            className="rounded-full border border-white/[0.08] bg-white/[0.03] px-6 py-2.5 text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-white/25 transition-colors hover:bg-white/[0.06] hover:text-white/40"
          >
            RECOMEÇAR
          </button>

        </div>
      </main>
    </>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

const JERSEYS = [
  {
    label: "Amarelo / Verde",
    img:   "https://imgnike-a.akamaihd.net/1920x1920/10977200A4.jpg",
    color: "#facc15",
  },
  {
    label: "Azul / Preto",
    img:   "https://imgnike-a.akamaihd.net/1920x1920/09761915A3.jpg",
    color: "#60a5fa",
  },
] as const;

const NikeSwoosh = () => (
  <svg
    aria-hidden="true"
    className="relative z-10 h-[1.15rem] w-auto text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.22)]"
    viewBox="135.5 361.38 1000 356.39"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M245.8075 717.62406c-29.79588-1.1837-54.1734-9.3368-73.23459-24.4796-3.63775-2.8928-12.30611-11.5663-15.21427-15.2245-7.72958-9.7193-12.98467-19.1785-16.48977-29.6734-10.7857-32.3061-5.23469-74.6989 15.87753-121.2243 18.0765-39.8316 45.96932-79.3366 94.63252-134.0508 7.16836-8.0511 28.51526-31.5969 28.65302-31.5969.051 0-1.11225 2.0153-2.57652 4.4694-12.65304 21.1938-23.47957 46.158-29.37751 67.7703-9.47448 34.6785-8.33163 64.4387 3.34693 87.5151 8.05611 15.898 21.86731 29.6684 37.3979 37.2806 27.18874 13.3214 66.9948 14.4235 115.60699 3.2245 3.34694-.7755 169.19363-44.801 368.55048-97.8366 199.35686-53.0408 362.49439-96.4029 362.51989-96.3672.056.046-463.16259 198.2599-703.62654 301.0914-38.08158 16.2806-48.26521 20.3928-66.16827 26.6785-45.76525 16.0714-86.76008 23.7398-119.89779 22.4235z"
      fill="currentColor"
    />
  </svg>
);

export default function Home() {
  const [timerSecs, setTimerSecs] = useState(600);
  useEffect(() => {
    const id = setInterval(() => setTimerSecs(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, []);
  const mm      = String(Math.floor(timerSecs / 60)).padStart(2, "0");
  const ss      = String(timerSecs % 60).padStart(2, "0");
  const expired = timerSecs === 0;

  return (
    <>
      {/* ── Barra de atenção ── */}
      <div className="fixed inset-x-0 top-0 z-[60] flex items-center justify-center gap-2.5 overflow-hidden border-b border-[#27c97a]/25 bg-[#0a1a12] px-4 py-[9px]">
        {/* sweep */}
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
          <div className="pointer-events-none absolute inset-y-[1px] left-[12%] right-[12%] rounded-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)] opacity-60 blur-sm" />
          <NikeSwoosh />
        </div>
      </header>

      {/* ── Sticky bottom CTA ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.07] bg-black/85 px-4 pb-5 pt-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[26rem] flex-col gap-2.5">
          <div
            className="flex items-center justify-center gap-1.5 select-none"
            style={{ fontSize: "0.62rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: expired ? "#f87171" : "#fb923c" }}
          >
            <span>⏱</span>
            <span>{expired ? "ÚLTIMA CHANCE!" : "Oferta expira em "}</span>
            {!expired && (
              <span style={{ fontFamily: "monospace", fontVariantNumeric: "tabular-nums" }}>{mm}:{ss}</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex flex-col leading-none">
              <span className="text-[0.5rem] font-semibold uppercase tracking-[0.1em] text-white/30">Prêmio em jogo</span>
              <span className="font-hero text-[1.2rem] tracking-tight text-[#27c97a]">até 84% OFF</span>
            </div>
            <Link
              href="/mines"
              className="liquid-pill liquid-pill-glow relative flex flex-1 h-[3.2rem] items-center justify-center rounded-full px-4 transition-transform active:scale-[0.97]"
            >
              <div className="pointer-events-none absolute inset-y-[1px] left-[8%] right-[8%] rounded-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.16),transparent)] opacity-70 blur-sm" />
              <span className="font-hero relative z-10 text-[0.82rem] tracking-[0.14em] text-white">
                Jogar agora
              </span>
            </Link>
          </div>
        </div>
      </div>

      <main className="relative flex min-h-[100dvh] flex-col items-center bg-black px-4 pb-36 pt-[7.5rem]">
        {/* bg orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-16 left-[8%] h-80 w-80 rounded-full blur-[110px]" style={{ background: "#27c97a", opacity: 0.055 }} />
          <div className="absolute top-[45%] right-[-8%] h-64 w-64 rounded-full blur-[90px]" style={{ background: "#60a5fa", opacity: 0.045 }} />
          <div className="absolute bottom-[18%] left-[15%] h-52 w-52 rounded-full blur-[80px]" style={{ background: "#a78bfa", opacity: 0.035 }} />
        </div>
        <div className="flex w-full max-w-[26rem] flex-col gap-4">

          {/* ── Hero panel ── */}
          <div className="liquid-panel w-full px-5 py-6 text-center">
            <div className="inline-flex flex-col items-center gap-1 rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.08] px-5 py-3">
              <span className="flex items-center gap-1.5 text-[0.56rem] font-semibold uppercase tracking-[0.18em] text-emerald-400">
                ✅ Sua compra foi confirmada
              </span>
              <span className="text-[0.52rem] font-medium tracking-[0.06em] text-emerald-300/55">
                Você recebeu uma recompensa do Programa Nike Partner
              </span>
            </div>
            <h1 className="font-hero mt-3 leading-[0.88] text-white">
              <span className="block text-[clamp(2.2rem,9vw,3.2rem)]">JOGUE GRÁTIS</span>
              <span className="block text-[clamp(1.2rem,5vw,1.8rem)] text-white/40">E GANHE SUA CAMISA</span>
            </h1>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-center">
              <p className="text-[0.52rem] font-semibold uppercase tracking-[0.14em] text-white/35">
                Prêmio máximo
              </p>
              <p className="font-hero mt-0.5 text-[1.15rem] tracking-tight text-[#27c97a]">
                até 84% de desconto
              </p>
              <p className="mt-0.5 text-[0.62rem] text-white/40">
                saindo por <span className="font-semibold text-white/65">R$ 69,90</span>
              </p>
            </div>

            <p className="mt-4 text-[0.78rem] leading-[1.65] text-white/50">
              Você ganhou{" "}
              <strong className="font-semibold text-white/80">6 tentativas gratuitas</strong> no{" "}
              <strong className="font-semibold text-white/80">Mines da Copa</strong> — explore as
              minas e desbloqueie a Camisa Oficial do Brasil com até{" "}
              <strong className="font-semibold text-white/80">84% OFF</strong>. Evite as bombas e
              quem sabe não ganha até{" "}
              <strong className="font-semibold text-white/80">frete grátis</strong>.
            </p>
          </div>

          {/* ── Jersey cards ── */}
          <div className="flex flex-col gap-3">
            <p className="text-center text-[0.52rem] font-semibold uppercase tracking-[0.22em] text-white/25">
              Modelos disponíveis
            </p>
            <div className="grid grid-cols-2 gap-3">
              {JERSEYS.map(({ label, img, color }) => (
                <div
                  key={label}
                  className="liquid-panel relative overflow-hidden"
                  style={{ aspectRatio: "3/4" }}
                >
                  <Image
                    src={img}
                    alt={label}
                    fill
                    className="object-cover object-top"
                    referrerPolicy="no-referrer"
                    sizes="(max-width: 480px) 45vw, 180px"
                  />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10">
                    <div className="h-12 bg-gradient-to-t from-black/85 to-transparent" />
                    <div className="flex items-center gap-1.5 bg-black/65 px-3 py-2 backdrop-blur-sm">
                      <span className="h-[6px] w-[6px] flex-shrink-0 rounded-full" style={{ backgroundColor: color }} />
                      <span className="text-[0.48rem] font-semibold uppercase tracking-[0.14em] text-white/65">
                        {label}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </>
  );
}

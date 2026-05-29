"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCheckout } from "../context/CheckoutContext";

const CORES = [
  {
    id:        "amarelo",
    label:     "Amarelo / Verde",
    nome:      "Camisa Brasil Nike I 2026/27 Torcedor Pro Masculina",
    img:       "https://imgnike-a.akamaihd.net/1920x1920/10977200A4.jpg",
    estilo:    "10977200A4",
    corLabel:  "Amarelo/Verde",
    glow:      "rgba(250,204,21,0.12)",
    ringColor: "#facc15",
  },
  {
    id:        "azul",
    label:     "Azul / Preto",
    nome:      "Camisa Brasil Jordan II 2026/27 Jogador Masculina",
    img:       "https://imgnike-a.akamaihd.net/1920x1920/09761915A3.jpg",
    estilo:    "IU1074-417",
    corLabel:  "Azul/Preto",
    glow:      "rgba(96,165,250,0.12)",
    ringColor: "#60a5fa",
  },
] as const;

const SIZES = ["P", "M", "G", "GG", "GGG"] as const;
const BASE_PRICE = 49.90;

const NikeSwoosh = ({ className }: { className?: string }) => (
  <svg aria-hidden="true" className={className} viewBox="135.5 361.38 1000 356.39" xmlns="http://www.w3.org/2000/svg">
    <path d="M245.8075 717.62406c-29.79588-1.1837-54.1734-9.3368-73.23459-24.4796-3.63775-2.8928-12.30611-11.5663-15.21427-15.2245-7.72958-9.7193-12.98467-19.1785-16.48977-29.6734-10.7857-32.3061-5.23469-74.6989 15.87753-121.2243 18.0765-39.8316 45.96932-79.3366 94.63252-134.0508 7.16836-8.0511 28.51526-31.5969 28.65302-31.5969.051 0-1.11225 2.0153-2.57652 4.4694-12.65304 21.1938-23.47957 46.158-29.37751 67.7703-9.47448 34.6785-8.33163 64.4387 3.34693 87.5151 8.05611 15.898 21.86731 29.6684 37.3979 37.2806 27.18874 13.3214 66.9948 14.4235 115.60699 3.2245 3.34694-.7755 169.19363-44.801 368.55048-97.8366 199.35686-53.0408 362.49439-96.4029 362.51989-96.3672.056.046-463.16259 198.2599-703.62654 301.0914-38.08158 16.2806-48.26521 20.3928-66.16827 26.6785-45.76525 16.0714-86.76008 23.7398-119.89779 22.4235z" fill="currentColor" />
  </svg>
);

export default function EscolherPage() {
  const router   = useRouter();
  const checkout = useCheckout();

  const [selectedCor,  setSelectedCor]  = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const cor    = CORES.find(c => c.id === selectedCor) ?? null;
  const canContinue = !!selectedCor && !!selectedSize;

  const handleConfirm = () => {
    if (!cor || !selectedSize) return;
    checkout.set({
      tamanho:       selectedSize,
      personalizar:  false,
      precoBase:     BASE_PRICE,
      taxaPersonalizacao: 0,
      total:         BASE_PRICE,
      nomeProduto:   cor.nome,
      corLabel:      cor.corLabel,
      imagemProduto: cor.img,
      estiloId:      cor.estilo,
    });
    router.push("/dados");
  };

  return (
    <>
      {/* ── Header ── */}
      <header className="fixed inset-x-0 top-0 z-50 flex justify-center bg-gradient-to-b from-black/90 via-black/50 to-transparent px-4 pb-5 pt-3">
        <div
          className="relative flex h-14 w-full max-w-[22rem] items-center justify-center rounded-full px-6"
          style={{ background: "linear-gradient(135deg,rgba(255,255,255,0.10) 0%,rgba(255,255,255,0.05) 100%)", border: "1px solid rgba(255,255,255,0.13)", boxShadow: "0 2px 16px rgba(0,0,0,0.45),0 1px 0 rgba(255,255,255,0.10) inset,0 -1px 0 rgba(0,0,0,0.25) inset" }}
        >
          <div className="pointer-events-none absolute inset-y-[1px] left-[12%] right-[12%] rounded-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] opacity-50 blur-md" />
          <NikeSwoosh className="relative z-10 h-[1.1rem] w-auto text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.18)]" />
        </div>
      </header>

      {/* ── Sticky bottom CTA ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.07] bg-black/85 px-4 pb-6 pt-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[26rem] flex-col gap-2.5">
          <div className="flex items-center gap-3">
            <div className="flex flex-col leading-none">
              <span className="text-[0.55rem] font-semibold text-white/25 line-through">R$ 449,90</span>
              <span className="font-hero text-[1.45rem] tracking-tight text-[#27c97a] drop-shadow-[0_0_16px_rgba(39,201,122,0.5)]">R$ 49,90</span>
            </div>
            <button
              onClick={handleConfirm}
              disabled={!canContinue}
              className={[
                "liquid-pill relative flex flex-1 h-[3.2rem] items-center justify-center rounded-full px-4 transition-all duration-200",
                canContinue
                  ? "liquid-pill-glow active:scale-[0.97]"
                  : "opacity-35 cursor-not-allowed",
              ].join(" ")}
            >
              {canContinue && (
                <div className="pointer-events-none absolute inset-y-[1px] left-[8%] right-[8%] rounded-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.16),transparent)] opacity-70 blur-sm" />
              )}
              <span className="font-hero relative z-10 text-[0.82rem] tracking-[0.14em] text-white">
                {canContinue ? "Confirmar modelo" : "Selecione cor e tamanho"}
              </span>
            </button>
          </div>
        </div>
      </div>

      <main className="relative flex min-h-[100dvh] flex-col items-center bg-black px-4 pb-32 pt-[4.75rem]">
        {/* bg orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-10 left-[10%] h-72 w-72 rounded-full blur-[100px]" style={{ background: "#facc15", opacity: 0.04 }} />
          <div className="absolute top-[40%] right-[-5%] h-56 w-56 rounded-full blur-[90px]" style={{ background: "#27c97a", opacity: 0.045 }} />
          <div className="absolute bottom-[15%] left-[5%] h-44 w-44 rounded-full blur-[75px]" style={{ background: "#60a5fa", opacity: 0.035 }} />
        </div>
        <div className="flex w-full max-w-[26rem] flex-col gap-5">

          {/* ── Título ── */}
          <div className="liquid-panel w-full bg-[linear-gradient(180deg,rgba(42,42,46,0.52)_0%,rgba(18,18,20,0.72)_100%)] px-5 py-5 text-center">
            <p className="text-[0.54rem] font-semibold uppercase tracking-[0.22em] text-white/35">
              Benefício Exclusivo · Nike Partner
            </p>
            <h1 className="font-hero mt-2 leading-[0.9] text-white">
              <span className="block text-[clamp(1.7rem,7.5vw,2.8rem)]">ESCOLHA SEU</span>
              <span className="block text-[clamp(1.7rem,7.5vw,2.8rem)] text-white/50">MODELO</span>
            </h1>
            <p className="mt-2.5 text-[0.78rem] leading-[1.55] text-white/50">
              Selecione a cor e o tamanho para garantir sua oferta de <strong className="text-white/75">R$ 49,90</strong>.
            </p>
          </div>

          {/* ── Cor ── */}
          <div className="flex flex-col gap-3">
            <p className="text-[0.54rem] font-semibold uppercase tracking-[0.28em] text-white/30 px-1">
              Modelo
            </p>
            <div className="grid grid-cols-2 gap-3">
              {CORES.map(c => {
                const active = selectedCor === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCor(c.id)}
                    className="liquid-panel relative overflow-hidden text-left transition-all duration-300 active:scale-[0.97]"
                    style={{
                      aspectRatio:  "3/4",
                      borderColor:  active ? c.ringColor : "rgba(255,255,255,0.09)",
                      boxShadow:    active
                        ? `0 0 36px ${c.glow}, 0 0 0 1.5px ${c.ringColor}`
                        : "0 8px 32px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.06) inset",
                    }}
                  >
                    {/* Colored glow behind image when selected */}
                    {active && (
                      <div
                        className="absolute inset-0 z-0"
                        style={{ background: `radial-gradient(ellipse at 50% 30%, ${c.glow}, transparent 65%)` }}
                      />
                    )}

                    {/* Jersey image — full bleed */}
                    <Image
                      src={c.img}
                      alt={c.label}
                      fill
                      className="relative z-10 object-cover object-top"
                      referrerPolicy="no-referrer"
                      sizes="(max-width: 480px) 45vw, 180px"
                    />

                    {/* Top accent line when selected */}
                    {active && (
                      <div
                        className="absolute inset-x-0 top-0 z-20 h-[2px] pointer-events-none"
                        style={{ background: `linear-gradient(90deg, transparent, ${c.ringColor}, transparent)` }}
                      />
                    )}

                    {/* Bottom gradient + label */}
                    <div className="absolute inset-x-0 bottom-0 z-20 pointer-events-none">
                      <div className="h-16 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                      <div className="bg-black/70 px-3 py-2 backdrop-blur-sm flex items-center gap-1.5">
                        {active ? (
                          <svg className="h-3 w-3 flex-shrink-0 text-[#27c97a]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        ) : (
                          <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: c.ringColor }} />
                        )}
                        <span className={[
                          "text-[0.5rem] font-semibold uppercase tracking-[0.16em]",
                          active ? "text-white" : "text-white/55",
                        ].join(" ")}>
                          {c.label}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Tamanho ── */}
          <div className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between px-1">
              <p className="text-[0.54rem] font-semibold uppercase tracking-[0.28em] text-white/30">
                Tamanho
              </p>
              {selectedSize && (
                <p className="text-[0.54rem] font-semibold uppercase tracking-[0.2em] text-white/50">
                  Selecionado: <span className="text-white/80">{selectedSize}</span>
                </p>
              )}
            </div>
            <div className="grid grid-cols-5 gap-2">
              {SIZES.map(size => {
                const active = selectedSize === size;
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={[
                      "liquid-panel flex h-12 items-center justify-center rounded-2xl text-[0.82rem] font-semibold transition-all duration-150 active:scale-[0.95]",
                      active
                        ? "border-white/40 bg-white/[0.12] text-white shadow-[0_0_16px_rgba(255,255,255,0.1)]"
                        : "border-white/[0.07] text-white/35 hover:text-white/55",
                    ].join(" ")}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
            <p className="px-1 text-[0.52rem] text-white/25">
              Recomendamos escolher um tamanho acima do usual para melhor conforto.
            </p>
          </div>

        </div>
      </main>
    </>
  );
}

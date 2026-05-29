"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCheckout } from "../context/CheckoutContext";

const NikeSwoosh = ({ className }: { className?: string }) => (
  <svg aria-hidden="true" className={className} viewBox="135.5 361.38 1000 356.39" xmlns="http://www.w3.org/2000/svg">
    <path d="M245.8075 717.62406c-29.79588-1.1837-54.1734-9.3368-73.23459-24.4796-3.63775-2.8928-12.30611-11.5663-15.21427-15.2245-7.72958-9.7193-12.98467-19.1785-16.48977-29.6734-10.7857-32.3061-5.23469-74.6989 15.87753-121.2243 18.0765-39.8316 45.96932-79.3366 94.63252-134.0508 7.16836-8.0511 28.51526-31.5969 28.65302-31.5969.051 0-1.11225 2.0153-2.57652 4.4694-12.65304 21.1938-23.47957 46.158-29.37751 67.7703-9.47448 34.6785-8.33163 64.4387 3.34693 87.5151 8.05611 15.898 21.86731 29.6684 37.3979 37.2806 27.18874 13.3214 66.9948 14.4235 115.60699 3.2245 3.34694-.7755 169.19363-44.801 368.55048-97.8366 199.35686-53.0408 362.49439-96.4029 362.51989-96.3672.056.046-463.16259 198.2599-703.62654 301.0914-38.08158 16.2806-48.26521 20.3928-66.16827 26.6785-45.76525 16.0714-86.76008 23.7398-119.89779 22.4235z" fill="currentColor" />
  </svg>
);

const STEPS = [
  { label: "Verificando CPF na base da campanha", duration: 1600 },
  { label: "Checando elegibilidade da promoção",  duration: 1400 },
  { label: "Confirmando disponibilidade de estoque", duration: 1200 },
  { label: "Reservando sua oferta exclusiva",     duration: 900  },
];

type StepState = "pending" | "loading" | "done";

function maskCPFDisplay(cpf: string) {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length < 11) return cpf;
  return `${digits.slice(0, 3)}.***.***-${digits.slice(9, 11)}`;
}

export default function VerificandoPage() {
  const router   = useRouter();
  const checkout = useCheckout();

  const [stepStates, setStepStates] = useState<StepState[]>(
    STEPS.map(() => "pending")
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [done, setDone]               = useState(false);

  useEffect(() => {
    let step = 0;

    function runStep(idx: number) {
      if (idx >= STEPS.length) {
        setDone(true);
        setTimeout(() => router.push("/nike"), 1100);
        return;
      }

      setStepStates(prev => {
        const next = [...prev];
        next[idx] = "loading";
        return next;
      });
      setCurrentStep(idx);

      setTimeout(() => {
        setStepStates(prev => {
          const next = [...prev];
          next[idx] = "done";
          return next;
        });
        step = idx + 1;
        runStep(step);
      }, STEPS[idx].duration);
    }

    const t = setTimeout(() => runStep(0), 400);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const maskedCPF = maskCPFDisplay(checkout.cpf);
  const progress  = done
    ? 100
    : currentStep === 0 && stepStates[0] === "pending"
    ? 0
    : Math.round(((currentStep + (stepStates[currentStep] === "done" ? 1 : 0.5)) / STEPS.length) * 100);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 py-3">
        <div className="liquid-pill relative flex h-14 w-full max-w-[22rem] items-center justify-center rounded-full px-6">
          <div className="pointer-events-none absolute inset-y-[1px] left-[12%] right-[12%] rounded-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] opacity-50 blur-md" />
          <NikeSwoosh className="relative z-10 h-[1.1rem] w-auto text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.18)]" />
        </div>
      </header>

      <main className="flex min-h-[100dvh] flex-col items-center bg-black px-4 pb-10 pt-[4.75rem]">
        <div className="flex w-full max-w-[26rem] flex-col items-center gap-5">

          {/* Hero panel */}
          <div className="liquid-panel w-full bg-[linear-gradient(180deg,rgba(42,42,46,0.52)_0%,rgba(18,18,20,0.72)_100%)] px-5 py-6 text-center">
            <p className="text-[0.55rem] font-semibold uppercase tracking-[0.28em] text-white/40">
              Verificação da campanha
            </p>
            <h1 className="font-hero mt-2.5 leading-[0.86] text-white">
              <span className="block text-[clamp(1.65rem,7.8vw,3rem)]">Aguarde um momento</span>
              <span className="mt-0.5 block text-[clamp(1.65rem,7.6vw,3rem)] text-white/[0.54]">
                {done ? "Tudo certo!" : "verificando..."}
              </span>
            </h1>
            {maskedCPF && (
              <p className="mx-auto mt-3 text-[0.78rem] leading-[1.5] text-white/[0.50]">
                CPF: <span className="font-semibold text-white/70">{maskedCPF}</span>
              </p>
            )}
          </div>

          {/* Steps panel */}
          <div className="liquid-panel relative w-full overflow-hidden border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-xl sm:p-7">
            <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 h-40 w-[80%] -translate-x-1/2 bg-[radial-gradient(circle,rgba(39,201,122,0.06),transparent_70%)]" />

            <div className="relative z-10 flex flex-col gap-4">
              {STEPS.map((s, i) => {
                const state = stepStates[i];
                return (
                  <div key={i} className="flex items-center gap-3.5">
                    {/* Icon */}
                    <div className="relative flex h-7 w-7 flex-shrink-0 items-center justify-center">
                      {state === "done" && (
                        <svg className="h-7 w-7 text-[#27c97a]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                          <circle cx={12} cy={12} r={10} strokeOpacity={0.2} />
                          <path d="M8 12l3 3 5-5" />
                        </svg>
                      )}
                      {state === "loading" && (
                        <svg className="h-6 w-6 animate-spin text-white/60" viewBox="0 0 24 24" fill="none">
                          <circle cx={12} cy={12} r={10} stroke="currentColor" strokeWidth={2} strokeOpacity={0.15} />
                          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
                        </svg>
                      )}
                      {state === "pending" && (
                        <span className="h-2 w-2 rounded-full bg-white/20" />
                      )}
                    </div>

                    {/* Label */}
                    <span className={[
                      "text-[0.82rem] transition-colors duration-300",
                      state === "done"    ? "text-white/80" :
                      state === "loading" ? "text-white/90 font-medium" :
                                            "text-white/30",
                    ].join(" ")}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Progress bar */}
            <div className="relative z-10 mt-6">
              <div className="flex justify-between mb-1.5">
                <span className="text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-white/30">
                  Progresso
                </span>
                <span className="text-[0.55rem] font-semibold tabular-nums text-white/30">
                  {progress}%
                </span>
              </div>
              <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.07]">
                <div
                  className="h-full rounded-full bg-[#27c97a] transition-all duration-700 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Success badge */}
          {done && (
            <div className="flex w-full animate-[fadeIn_0.4s_ease] flex-col items-center gap-3 px-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-5 py-2.5 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-emerald-300">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                CPF aprovado · Promoção disponível
              </div>
              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-white/25">
                Redirecionando para sua oferta...
              </p>
            </div>
          )}

        </div>
      </main>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}

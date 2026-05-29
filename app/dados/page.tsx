"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCheckout } from "../context/CheckoutContext";

/* ── Masks ── */
function maskCPF(v: string) {
  return v
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2)  return `(${d}`;
  if (d.length <= 6)  return `(${d.slice(0,2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
}

/* ── Email domains ── */
const DOMAINS = [
  "gmail.com",
  "hotmail.com",
  "outlook.com",
  "yahoo.com",
  "icloud.com",
  "live.com",
  "bol.com.br",
  "uol.com.br",
];

/* ── Nike swoosh ── */
const NikeSwoosh = ({ className }: { className?: string }) => (
  <svg aria-hidden="true" className={className} viewBox="135.5 361.38 1000 356.39" xmlns="http://www.w3.org/2000/svg">
    <path d="M245.8075 717.62406c-29.79588-1.1837-54.1734-9.3368-73.23459-24.4796-3.63775-2.8928-12.30611-11.5663-15.21427-15.2245-7.72958-9.7193-12.98467-19.1785-16.48977-29.6734-10.7857-32.3061-5.23469-74.6989 15.87753-121.2243 18.0765-39.8316 45.96932-79.3366 94.63252-134.0508 7.16836-8.0511 28.51526-31.5969 28.65302-31.5969.051 0-1.11225 2.0153-2.57652 4.4694-12.65304 21.1938-23.47957 46.158-29.37751 67.7703-9.47448 34.6785-8.33163 64.4387 3.34693 87.5151 8.05611 15.898 21.86731 29.6684 37.3979 37.2806 27.18874 13.3214 66.9948 14.4235 115.60699 3.2245 3.34694-.7755 169.19363-44.801 368.55048-97.8366 199.35686-53.0408 362.49439-96.4029 362.51989-96.3672.056.046-463.16259 198.2599-703.62654 301.0914-38.08158 16.2806-48.26521 20.3928-66.16827 26.6785-45.76525 16.0714-86.76008 23.7398-119.89779 22.4235z" fill="currentColor" />
  </svg>
);

/* ── Input field shared classes ── */
const inputCls =
  "w-full rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-3.5 text-[0.88rem] text-white/80 placeholder-white/25 outline-none transition-colors focus:border-white/20 focus:bg-white/[0.07]";
const labelCls =
  "text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-white/40";

/* ── Page ── */
export default function DadosPage() {
  const router   = useRouter();
  const checkout = useCheckout();
  const [form, setForm] = useState({
    nome: checkout.nome,
    cpf: checkout.cpf,
    email: checkout.email,
    telefone: checkout.telefone,
  });
  const [suggestions, setSugg]    = useState<string[]>([]);
  const [showSugg, setShowSugg]   = useState(false);
  const [cpfFocused, setCpfFocused] = useState(false);
  const emailRef                  = useRef<HTMLInputElement>(null);

  /* Generic change for nome */
  const handleNome = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, nome: e.target.value }));

  /* CPF with mask */
  const handleCPF = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, cpf: maskCPF(e.target.value) }));

  /* Phone with mask */
  const handlePhone = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, telefone: maskPhone(e.target.value) }));

  /* Email with domain suggestions */
  const handleEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase();
    setForm(p => ({ ...p, email: val }));

    const atIdx = val.indexOf("@");
    if (val.length === 0) {
      setShowSugg(false);
      return;
    }

    const local  = atIdx >= 0 ? val.slice(0, atIdx)      : val;
    const after  = atIdx >= 0 ? val.slice(atIdx + 1)     : "";

    const filtered = DOMAINS.filter(d =>
      atIdx >= 0 ? d.startsWith(after) && d !== after : true
    ).map(d => `${local}@${d}`);

    setSugg(filtered);
    setShowSugg(filtered.length > 0);
  };

  const applySugg = (s: string) => {
    setForm(p => ({ ...p, email: s }));
    setShowSugg(false);
    emailRef.current?.blur();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSugg(false);
    checkout.set({ nome: form.nome, cpf: form.cpf, email: form.email, telefone: form.telefone });
    router.push("/verificando");
  };

  return (
    <>
      {/* ── Header ── */}
      <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 py-3">
        <div
          className="relative flex h-14 w-full max-w-[22rem] items-center justify-center rounded-full px-6"
          style={{ background: "linear-gradient(135deg,rgba(255,255,255,0.10) 0%,rgba(255,255,255,0.05) 100%)", border: "1px solid rgba(255,255,255,0.13)", boxShadow: "0 2px 16px rgba(0,0,0,0.45),0 1px 0 rgba(255,255,255,0.10) inset,0 -1px 0 rgba(0,0,0,0.25) inset" }}
        >
          <div className="pointer-events-none absolute inset-y-[1px] left-[12%] right-[12%] rounded-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] opacity-50 blur-md" />
          <NikeSwoosh className="relative z-10 h-[1.1rem] w-auto text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.18)]" />
        </div>
      </header>

      <main className="flex min-h-[100dvh] flex-col items-center bg-black px-4 pb-12 pt-[4.75rem]">
        <div className="flex w-full max-w-[26rem] flex-col gap-5">

          {/* ── Form panel ── */}
          <div className="liquid-panel w-full bg-[linear-gradient(180deg,rgba(42,42,46,0.52)_0%,rgba(18,18,20,0.72)_100%)] px-5 py-7">

            <p className={labelCls}>Resgate da campanha</p>
            <h1 className="font-hero mt-2.5 text-[clamp(1.7rem,7.5vw,2.8rem)] leading-[0.9] text-white">
              Preencha seus dados
            </h1>
            <p className="mt-3 text-[0.82rem] leading-[1.6] text-white/[0.65]">
              Para resgatar o cupom da campanha, preencha suas informacoes abaixo. Assim voce segue para a proxima etapa com a oferta reservada.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">

              {/* Nome */}
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Nome completo</label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={handleNome}
                  placeholder="Digite seu nome completo"
                  required
                  autoComplete="name"
                  className={inputCls}
                />
              </div>

              {/* CPF */}
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>
                  CPF
                  {cpfFocused && (
                    <span className="ml-2 text-[0.48rem] font-medium normal-case tracking-normal text-white/30">
                      🔒 protegido
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  value={form.cpf}
                  onChange={handleCPF}
                  onFocus={() => setCpfFocused(true)}
                  onBlur={() => setCpfFocused(false)}
                  placeholder="000.000.000-00"
                  required
                  inputMode="numeric"
                  maxLength={14}
                  autoComplete="off"
                  className={inputCls}
                  style={cpfFocused && form.cpf.length > 0 ? {
                    color: "transparent",
                    textShadow: "0 0 10px rgba(255,255,255,0.65)",
                    letterSpacing: "0.18em",
                  } : {}}
                />
              </div>

              {/* Email + suggestions */}
              <div className="relative flex flex-col gap-1.5">
                <label className={labelCls}>Email</label>
                <input
                  ref={emailRef}
                  type="text"
                  inputMode="email"
                  value={form.email}
                  onChange={handleEmail}
                  onBlur={() => setTimeout(() => setShowSugg(false), 150)}
                  onFocus={() => form.email.length > 0 && showSugg && setShowSugg(true)}
                  placeholder="voce@email.com"
                  required
                  autoComplete="off"
                  className={inputCls}
                />

                {/* Suggestions dropdown */}
                {showSugg && (
                  <ul className="absolute left-0 right-0 top-[calc(100%+4px)] z-30 overflow-hidden rounded-2xl border border-white/[0.1] bg-[rgba(20,20,22,0.97)] py-1 shadow-[0_16px_40px_rgba(0,0,0,0.7)] backdrop-blur-xl">
                    {suggestions.map(s => {
                      const [local, domain] = s.split("@");
                      return (
                        <li key={s}>
                          <button
                            type="button"
                            onMouseDown={() => applySugg(s)}
                            className="flex w-full items-baseline gap-0.5 px-4 py-2.5 text-left text-[0.82rem] transition-colors hover:bg-white/[0.07] active:bg-white/[0.1]"
                          >
                            <span className="text-white/80">{local}</span>
                            <span className="text-white/35">@{domain}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* Telefone */}
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Numero de telefone</label>
                <input
                  type="text"
                  value={form.telefone}
                  onChange={handlePhone}
                  placeholder="(11) 99999-9999"
                  required
                  inputMode="tel"
                  maxLength={15}
                  autoComplete="tel"
                  className={inputCls}
                />
              </div>

              {/* Oferta reservada */}
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] px-4 py-3.5">
                <p className="text-[0.55rem] font-semibold uppercase tracking-[0.22em] text-white/35">
                  Oferta reservada
                </p>
                <p className="mt-1.5 text-[0.8rem] leading-[1.6] text-white/[0.58]">
                  Depois de preencher os dados, voce segue com a mesma oferta da campanha para concluir o resgate.
                </p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="mt-1 flex h-[3.4rem] w-full items-center justify-center rounded-full bg-white px-6 transition-[opacity,transform] active:scale-[0.97] active:opacity-90"
              >
                <span className="font-hero text-[0.82rem] tracking-[0.2em] text-black">
                  Resgatar
                </span>
              </button>

            </form>
          </div>
        </div>
      </main>
    </>
  );
}

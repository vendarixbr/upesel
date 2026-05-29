"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Truck, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useCheckout } from "../context/CheckoutContext";
import { pixelAddPaymentInfo } from "../lib/pixel";

const inputCls =
  "w-full border border-gray-300 rounded px-4 py-3 text-[14px] text-[#111] placeholder-gray-400 outline-none focus:border-black transition-colors disabled:bg-[#f5f5f5] disabled:text-gray-400";
const labelCls = "block text-[12px] font-medium text-gray-500 mb-1.5";

function maskCEP(v: string) {
  return v.replace(/\D/g, "").slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2");
}

interface ViaCEPResult {
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export default function IdentificacaoPage() {
  const router   = useRouter();
  const checkout = useCheckout();

  const [entrega, setEntrega] = useState<"normal" | "expresso">("normal");

  const [addr, setAddr] = useState({
    cep:         checkout.cep         || "",
    logradouro:  checkout.logradouro  || "",
    numero:      checkout.numero      || "",
    complemento: checkout.complemento || "",
    bairro:      checkout.bairro      || "",
    cidade:      checkout.cidade      || "",
    estado:      checkout.estado      || "",
  });

  const [cepStatus, setCepStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [errors,    setErrors]    = useState<Partial<Record<keyof typeof addr, string>>>({});
  const numeroRef = useRef<HTMLInputElement>(null);

  const fmt = (v: number) =>
    `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const totalFinal    = checkout.total    || 139.19;
  const totalOriginal = 749.99;
  const economia      = totalOriginal - (checkout.precoBase || 139.19);

  /* ── ViaCEP lookup ── */
  const lookupCEP = async (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (digits.length !== 8) return;

    setCepStatus("loading");
    setErrors(e => ({ ...e, cep: undefined }));

    try {
      const res  = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data: ViaCEPResult = await res.json();

      if (data.erro) {
        setCepStatus("error");
        setErrors(e => ({ ...e, cep: "CEP não encontrado." }));
        return;
      }

      setCepStatus("ok");
      setAddr(prev => ({
        ...prev,
        logradouro: data.logradouro || prev.logradouro,
        bairro:     data.bairro     || prev.bairro,
        cidade:     data.localidade || prev.cidade,
        estado:     data.uf         || prev.estado,
      }));
      setTimeout(() => numeroRef.current?.focus(), 80);
    } catch {
      setCepStatus("error");
      setErrors(e => ({ ...e, cep: "Erro ao consultar CEP. Tente novamente." }));
    }
  };

  /* ── Validation ── */
  const validate = () => {
    const e: typeof errors = {};
    if (!addr.cep || addr.cep.replace(/\D/g, "").length !== 8)
      e.cep = "CEP obrigatório.";
    if (!addr.logradouro.trim()) e.logradouro = "Logradouro obrigatório.";
    if (!addr.numero.trim())     e.numero     = "Número obrigatório.";
    if (!addr.bairro.trim())     e.bairro     = "Bairro obrigatório.";
    if (!addr.cidade.trim())     e.cidade     = "Cidade obrigatória.";
    if (!addr.estado.trim())     e.estado     = "Estado obrigatório.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleContinue = () => {
    if (!validate()) {
      document.getElementById("addr-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    checkout.set({ ...addr });
    pixelAddPaymentInfo({ value: checkout.total || 139.19 });
    router.push("/pagamento");
  };

  return (
    <div className="min-h-screen bg-white text-[#111] font-sans pb-28">
      {/* Header */}
      <header className="flex items-center justify-center px-6 py-4 relative border-b border-gray-200">
        <Link href="/carrinho" className="absolute left-6">
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
          className="flex-1 bg-white flex items-center justify-center relative z-10 pl-2"
          style={{ clipPath: "polygon(0 0, calc(100% - 15px) 0, 100% 50%, calc(100% - 15px) 100%, 0 100%)" }}
        >
          <span className="w-4 h-4 bg-black text-white rounded-full flex items-center justify-center mr-2 text-[10px]">2</span>
          Identificação
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-500 pl-2">
          <span className="w-4 h-4 bg-gray-400 text-white rounded-full flex items-center justify-center mr-2 text-[10px]">3</span>
          Pagamento
        </div>
      </div>

      <main className="px-6 py-6 max-w-xl mx-auto space-y-8">

        <h1 className="text-[22px] font-medium">Identificação</h1>

        {/* Cupom aplicado */}
        <div className="rounded-lg border border-[#b2dfcb] bg-[#f0faf5] px-4 py-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#007a33] mb-2">
            Cupom aplicado
          </p>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-[14px] text-gray-400 line-through">{fmt(totalOriginal)}</span>
            <span className="text-[22px] font-bold text-[#007a33]">{fmt(totalFinal)}</span>
          </div>
          <p className="text-[12px] text-[#007a33]">
            Você está economizando {fmt(economia)} na oferta liberada.
          </p>
        </div>

        {/* Dados do cliente */}
        <div>
          <h2 className="text-[16px] font-medium mb-4">Dados</h2>
          <div className="space-y-4">
            {[
              { label: "Nome",     value: checkout.nome     },
              { label: "CPF",      value: checkout.cpf      },
              { label: "Email",    value: checkout.email    },
              { label: "Telefone", value: checkout.telefone },
            ].map(({ label, value }) => (
              <div key={label} className="border-b border-gray-100 pb-3">
                <p className="text-[12px] text-gray-500 mb-0.5">{label}</p>
                <p className="text-[14px] text-[#111]">{value || "-"}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Endereço de entrega ── */}
        <div id="addr-section">
          <h2 className="text-[16px] font-medium mb-4">
            Endereço de entrega
            <span className="ml-2 text-[12px] font-normal text-red-500">*obrigatório</span>
          </h2>

          <div className="flex flex-col gap-4">

            {/* CEP */}
            <div>
              <label className={labelCls}>CEP</label>
              <div className="relative">
                <input
                  type="text"
                  value={addr.cep}
                  inputMode="numeric"
                  placeholder="00000-000"
                  maxLength={9}
                  onChange={e => {
                    const v = maskCEP(e.target.value);
                    setAddr(p => ({ ...p, cep: v }));
                    setCepStatus("idle");
                    if (v.replace(/\D/g, "").length === 8) lookupCEP(v);
                  }}
                  className={[
                    inputCls,
                    errors.cep ? "border-red-400 focus:border-red-500" : "",
                  ].join(" ")}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                  {cepStatus === "loading" && <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />}
                  {cepStatus === "ok"      && <CheckCircle2 className="w-4 h-4 text-[#007a33]" />}
                  {cepStatus === "error"   && <AlertCircle  className="w-4 h-4 text-red-400" />}
                </span>
              </div>
              {errors.cep
                ? <p className="mt-1 text-[11px] text-red-500">{errors.cep}</p>
                : <a href="https://buscacepinter.correios.com.br/app/endereco/index.php" target="_blank" rel="noreferrer" className="mt-1 text-[11px] text-gray-400 underline block">Não sei meu CEP</a>
              }
            </div>

            {/* Logradouro */}
            <div>
              <label className={labelCls}>Logradouro</label>
              <input
                type="text"
                value={addr.logradouro}
                onChange={e => setAddr(p => ({ ...p, logradouro: e.target.value }))}
                placeholder="Rua, Avenida, Travessa..."
                className={[inputCls, errors.logradouro ? "border-red-400" : ""].join(" ")}
              />
              {errors.logradouro && <p className="mt-1 text-[11px] text-red-500">{errors.logradouro}</p>}
            </div>

            {/* Número + Complemento */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Número</label>
                <input
                  ref={numeroRef}
                  type="text"
                  value={addr.numero}
                  onChange={e => setAddr(p => ({ ...p, numero: e.target.value }))}
                  placeholder="123"
                  className={[inputCls, errors.numero ? "border-red-400" : ""].join(" ")}
                />
                {errors.numero && <p className="mt-1 text-[11px] text-red-500">{errors.numero}</p>}
              </div>
              <div>
                <label className={labelCls}>Complemento <span className="text-gray-400 font-normal">(opcional)</span></label>
                <input
                  type="text"
                  value={addr.complemento}
                  onChange={e => setAddr(p => ({ ...p, complemento: e.target.value }))}
                  placeholder="Apto, Bloco..."
                  className={inputCls}
                />
              </div>
            </div>

            {/* Bairro */}
            <div>
              <label className={labelCls}>Bairro</label>
              <input
                type="text"
                value={addr.bairro}
                onChange={e => setAddr(p => ({ ...p, bairro: e.target.value }))}
                placeholder="Bairro"
                className={[inputCls, errors.bairro ? "border-red-400" : ""].join(" ")}
              />
              {errors.bairro && <p className="mt-1 text-[11px] text-red-500">{errors.bairro}</p>}
            </div>

            {/* Cidade + Estado */}
            <div className="grid grid-cols-[1fr_80px] gap-3">
              <div>
                <label className={labelCls}>Cidade</label>
                <input
                  type="text"
                  value={addr.cidade}
                  onChange={e => setAddr(p => ({ ...p, cidade: e.target.value }))}
                  placeholder="Cidade"
                  className={[inputCls, errors.cidade ? "border-red-400" : ""].join(" ")}
                />
                {errors.cidade && <p className="mt-1 text-[11px] text-red-500">{errors.cidade}</p>}
              </div>
              <div>
                <label className={labelCls}>UF</label>
                <input
                  type="text"
                  value={addr.estado}
                  onChange={e => setAddr(p => ({ ...p, estado: e.target.value.toUpperCase().slice(0, 2) }))}
                  placeholder="SP"
                  maxLength={2}
                  className={[inputCls, errors.estado ? "border-red-400" : ""].join(" ")}
                />
                {errors.estado && <p className="mt-1 text-[11px] text-red-500">{errors.estado}</p>}
              </div>
            </div>

          </div>
        </div>

        {/* Tipo de entrega */}
        <div>
          <h2 className="text-[16px] font-medium mb-1">Tipo de entrega</h2>
          <p className="text-[12px] text-gray-500 mb-4">Entrega 1 de 1</p>

          <div className="border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-200">
            <label className={["flex items-center gap-3 px-4 py-4 cursor-pointer transition-colors", entrega === "normal" ? "bg-[#f5f5f5]" : "bg-white hover:bg-gray-50"].join(" ")}>
              <input type="radio" name="entrega" value="normal" checked={entrega === "normal"} onChange={() => setEntrega("normal")} className="accent-black w-4 h-4 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium">Normal — Frete Grátis</p>
                <p className="text-[12px] text-gray-500 mt-0.5">5 dias úteis</p>
                {entrega === "normal" && <p className="text-[12px] text-[#007a33] mt-0.5">Cupom de frete grátis aplicado</p>}
              </div>
              <Truck className="w-5 h-5 text-gray-400 flex-shrink-0" />
            </label>

            <label className={["flex items-center gap-3 px-4 py-4 cursor-pointer transition-colors", entrega === "expresso" ? "bg-[#f5f5f5]" : "bg-white hover:bg-gray-50"].join(" ")}>
              <input type="radio" name="entrega" value="expresso" checked={entrega === "expresso"} onChange={() => setEntrega("expresso")} className="accent-black w-4 h-4 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium">Nike Expresso — R$ 18,71</p>
                <p className="text-[12px] text-gray-500 mt-0.5">2 dias úteis</p>
                <p className="text-[12px] text-gray-400 mt-0.5">Entrega mais rápida da Nike</p>
              </div>
              <Truck className="w-5 h-5 text-gray-400 flex-shrink-0" />
            </label>
          </div>
        </div>

        {/* Oferta ativa */}
        <div className="rounded-lg border border-[#b2dfcb] bg-[#f0faf5] px-4 py-3.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#007a33] mb-1.5">Oferta ativa</p>
          <p className="text-[12px] text-[#007a33]">
            Você continua economizando {fmt(economia)} com o valor reservado da campanha.
          </p>
        </div>

      </main>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 z-50">
        <button
          onClick={handleContinue}
          className="w-full bg-black text-white rounded-full py-4 font-medium text-[15px] hover:bg-gray-800 transition-colors flex justify-center"
        >
          Continuar para pagamento
        </button>
      </div>
    </div>
  );
}

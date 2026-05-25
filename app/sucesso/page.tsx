"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useCheckout } from "../context/CheckoutContext";
import { pixelPurchase } from "../lib/pixel";
import { MapPin, Package, Truck, CheckCircle } from "lucide-react";

function fmt(v: number) {
  return `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const STEPS = [
  { icon: CheckCircle, label: "Pagamento confirmado",        desc: "PIX recebido com sucesso"                     },
  { icon: Package,     label: "Enviado ao CD",               desc: "Centro de distribuição Nike — Extrema, MG"    },
  { icon: Truck,       label: "Em preparação para entrega",  desc: "Previsão: 3–5 dias úteis"                     },
  { icon: MapPin,      label: "Entregue",                    desc: "No endereço cadastrado"                       },
];

export default function SucessoPage() {
  const checkout = useCheckout();

  const [pedido,   setPedido]   = useState("");
  const [cdSent,   setCdSent]   = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const p = params.get("pedido") ?? "NKE" + Date.now().toString().slice(-8);
    setPedido(p);
    pixelPurchase({ value: checkout.total || 139.19, order_id: p });
  }, []);

  /* Simula progressão: pagamento confirmado → enviado ao CD */
  useEffect(() => {
    const t1 = setTimeout(() => setActiveStep(1), 1200);
    const t2 = setTimeout(() => { setCdSent(true); setActiveStep(2); }, 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const total       = checkout.total       || 139.19;
  const tamanho     = checkout.tamanho     || "—";
  const hasCustom   = checkout.personalizar;
  const logradouro  = checkout.logradouro;
  const hasAddress  = logradouro && checkout.cidade;

  return (
    <div className="min-h-screen bg-white text-[#111] font-sans pb-16">

      {/* Header */}
      <header className="flex items-center justify-center px-6 py-4 border-b border-gray-200">
        <Image
          src="https://static.nike.com.br/v11-288-0/images/brands/logo.svg"
          alt="Nike"
          width={48}
          height={17}
          className="w-12 h-auto"
          priority
        />
      </header>

      <main className="px-6 py-8 max-w-xl mx-auto space-y-8">

        {/* Hero de sucesso */}
        <div className="flex flex-col items-center text-center gap-4 py-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#f0faf5]">
            <svg className="w-10 h-10 text-[#007a33]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <div>
            <h1 className="text-[24px] font-medium text-[#007a33]">Pedido confirmado!</h1>
            <p className="text-[14px] text-gray-500 mt-1">
              Obrigado pela sua compra. Acompanhe o status abaixo.
            </p>
          </div>
          {pedido && (
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-[#f5f5f5] px-4 py-2">
              <span className="text-[12px] text-gray-500">Número do pedido</span>
              <span className="text-[13px] font-bold text-[#111] tracking-wider">{pedido}</span>
            </div>
          )}
        </div>

        {/* Timeline de status */}
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-[#f5f5f5] border-b border-gray-200">
            <p className="text-[13px] font-medium">Status do pedido</p>
          </div>
          <div className="px-4 py-5">
            <ol className="relative flex flex-col gap-0">
              {STEPS.map((step, i) => {
                const done    = i < activeStep;
                const current = i === activeStep;
                const pending = i > activeStep;
                const Icon    = step.icon;
                const isLast  = i === STEPS.length - 1;

                return (
                  <li key={i} className="flex gap-4">
                    {/* Connector + icon */}
                    <div className="flex flex-col items-center">
                      <div className={[
                        "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all duration-500",
                        done    ? "border-[#007a33] bg-[#007a33] text-white"     :
                        current ? "border-[#007a33] bg-white text-[#007a33]"     :
                                  "border-gray-200 bg-white text-gray-300",
                      ].join(" ")}>
                        <Icon className="w-4 h-4" />
                      </div>
                      {!isLast && (
                        <div className={[
                          "mt-1 mb-1 w-0.5 flex-1 min-h-[2rem] transition-colors duration-700",
                          i < activeStep ? "bg-[#007a33]" : "bg-gray-200",
                        ].join(" ")} />
                      )}
                    </div>

                    {/* Text */}
                    <div className={["pb-5", isLast ? "" : ""].join(" ")}>
                      <p className={[
                        "text-[14px] font-medium leading-tight",
                        pending ? "text-gray-400" : "text-[#111]",
                      ].join(" ")}>
                        {step.label}
                        {i === 1 && cdSent && (
                          <span className="ml-2 inline-flex items-center rounded-full bg-[#f0faf5] border border-[#b2dfcb] px-2 py-0.5 text-[10px] font-semibold text-[#007a33]">
                            Agora
                          </span>
                        )}
                      </p>
                      <p className={[
                        "text-[12px] mt-0.5",
                        pending ? "text-gray-300" : "text-gray-500",
                      ].join(" ")}>
                        {step.desc}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>

        {/* CD enviado — destaque */}
        {cdSent && (
          <div className="rounded-xl border border-[#b2dfcb] bg-[#f0faf5] px-4 py-4 flex gap-3">
            <Package className="w-5 h-5 text-[#007a33] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[13px] font-medium text-[#007a33]">Pedido enviado ao centro de distribuição</p>
              <p className="text-[12px] text-[#007a33]/80 mt-0.5">
                Nike CD — Extrema, MG. Previsão de despacho: hoje.
              </p>
            </div>
          </div>
        )}

        {/* Resumo do pedido */}
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-[#f5f5f5] border-b border-gray-200">
            <p className="text-[13px] font-medium">Resumo do pedido</p>
          </div>
          <div className="px-4 py-4 flex gap-4">
            <div className="relative w-16 h-16 flex-shrink-0 bg-[#f5f5f5] rounded-lg overflow-hidden">
              <Image
                src="https://imgnike-a.akamaihd.net/1920x1920/09761915A3.jpg"
                alt="Camisa Brasil"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-medium leading-snug">Camisa Brasil Jordan II 2026/27</p>
              <p className="text-[12px] text-gray-500 mt-1">Azul · Tamanho: {tamanho}</p>
              {hasCustom && (
                <p className="text-[12px] text-gray-500">
                  Personalização:
                  {checkout.nomePersonalizado  && <> {checkout.nomePersonalizado}</>}
                  {checkout.numeroPersonalizado && <> #{checkout.numeroPersonalizado}</>}
                </p>
              )}
              <p className="text-[14px] font-medium mt-1.5">{fmt(total)}</p>
            </div>
          </div>
          <div className="px-4 pb-4 border-t border-gray-100 pt-3 text-[13px] space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-500">Frete</span>
              <span className="text-[#007a33] font-medium">Grátis</span>
            </div>
            <div className="flex justify-between font-medium text-[14px] pt-1 border-t border-gray-100">
              <span>Total pago</span>
              <span>{fmt(total)}</span>
            </div>
          </div>
        </div>

        {/* Endereço de entrega */}
        {hasAddress && (
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-[#f5f5f5] border-b border-gray-200">
              <p className="text-[13px] font-medium">Endereço de entrega</p>
            </div>
            <div className="px-4 py-4 flex gap-3">
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <p className="text-[13px] text-gray-700 leading-relaxed">
                {checkout.logradouro}, {checkout.numero}
                {checkout.complemento && `, ${checkout.complemento}`}
                <br />
                {checkout.bairro} — {checkout.cidade}/{checkout.estado}
                <br />
                CEP {checkout.cep}
              </p>
            </div>
          </div>
        )}

        {/* Confirmação por email */}
        {checkout.email && (
          <p className="text-center text-[12px] text-gray-400 leading-relaxed">
            Uma confirmação foi enviada para <span className="font-medium text-gray-600">{checkout.email}</span>.
            <br />Guarde o número do pedido <span className="font-medium text-gray-600">{pedido}</span> para acompanhamento.
          </p>
        )}

        {/* Voltar à loja */}
        <a
          href="/"
          className="flex w-full items-center justify-center rounded-full border border-gray-300 py-4 text-[15px] font-medium hover:border-black transition-colors"
        >
          Voltar à loja
        </a>

      </main>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, X, Trash2, Tag, Info } from 'lucide-react';
import { useCheckout } from '../context/CheckoutContext';
import { pixelInitiateCheckout } from '../lib/pixel';

export default function CartPage() {
  const checkout = useCheckout();

  const [quantity,    setQuantity]    = useState(1);
  const [showBanner,  setShowBanner]  = useState(true);
  const [isCartEmpty, setIsCartEmpty] = useState(false);

  useEffect(() => {
    pixelInitiateCheckout({ value: checkout.total || 49.90, num_items: 1 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const unitPrice    = checkout.total    || 49.90;
  const unitSavings  = 749.99 - (checkout.precoBase || 49.90);
  const totalPrice   = quantity * unitPrice;
  const totalSavings = quantity * unitSavings;

  const fmt = (v: number) =>
    `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const tamanho    = checkout.tamanho     || '—';
  const hasCustom  = checkout.personalizar;
  const nomeProduto   = checkout.nomeProduto   || 'Camisa Brasil Jordan II 2026/27 Jogador Masculina';
  const corLabel      = checkout.corLabel      || 'Azul/Preto';
  const imagemProduto = checkout.imagemProduto || 'https://imgnike-a.akamaihd.net/1920x1920/09761915A3.jpg';
  const estiloId      = checkout.estiloId      || 'IU1074-417';

  return (
    <div className="min-h-screen bg-white text-[#111] font-sans pb-32">
      {/* Header */}
      <header className="flex items-center justify-center px-6 py-4 relative border-b border-gray-200">
        <Link href="/nike" className="absolute left-6">
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
          className="flex-[1.2] bg-white flex items-center justify-center relative z-10"
          style={{ clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 50%, calc(100% - 15px) 100%, 0 100%)' }}
        >
          <span className="w-4 h-4 bg-black text-white rounded-full flex items-center justify-center mr-2 text-[10px]">1</span>
          Carrinho
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-500 relative z-0 pl-2">
          <span className="w-4 h-4 bg-gray-400 text-white rounded-full flex items-center justify-center mr-2 text-[10px]">2</span>
          Identificação
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <span className="w-4 h-4 bg-gray-400 text-white rounded-full flex items-center justify-center mr-2 text-[10px]">3</span>
          Pagamento
        </div>
      </div>

      <main className="px-6 py-6 max-w-xl mx-auto">

        {/* Banner */}
        {showBanner && (
          <div className="bg-[#f5f5f5] rounded-lg p-4 mb-8 flex items-start justify-between">
            <p className="text-[13px] text-gray-800 leading-relaxed pr-4">
              Os produtos no carrinho não estão reservados. Finalize seu pedido antes que o estoque acabe.
            </p>
            <button onClick={() => setShowBanner(false)} className="text-gray-500 mt-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {!isCartEmpty ? (
          <>
            {/* Product Item */}
            <div className="mb-8 border-b border-gray-200 pb-8">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-[15px] font-medium leading-snug pr-4">
                  {nomeProduto}
                </h2>
                <button onClick={() => setIsCartEmpty(true)} className="text-gray-600">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              {/* Variação */}
              <div className="text-[13px] text-gray-600 space-y-1 mb-6">
                <p>Quantidade: {quantity}</p>
                <p>Cor: {corLabel}</p>
                <p>Tamanho: <span className="font-medium text-[#111]">{tamanho}</span></p>
                <p>Estilo: {estiloId}</p>
                {hasCustom && (
                  <div className="mt-2 flex flex-col gap-0.5">
                    <p className="font-medium text-[#111]">Personalização incluída:</p>
                    {checkout.nomePersonalizado && (
                      <p>Nome: <span className="font-medium text-[#111] uppercase tracking-wider">{checkout.nomePersonalizado}</span></p>
                    )}
                    {checkout.numeroPersonalizado && (
                      <p>Número: <span className="font-medium text-[#111]">{checkout.numeroPersonalizado}</span></p>
                    )}
                  </div>
                )}
              </div>

              <div className="relative aspect-[4/5] w-full bg-[#f5f5f5] mb-6">
                <Image
                  src={imagemProduto}
                  alt={nomeProduto}
                  fill
                  className="object-cover"
                  referrerPolicy="no-referrer"
                  priority
                />
              </div>

              <div className="flex justify-between items-start">
                {/* Quantity Selector */}
                <div className="flex items-center border border-gray-300 rounded">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    -
                  </button>
                  <span className="w-10 h-10 flex items-center justify-center text-[15px] border-x border-gray-300">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    +
                  </button>
                </div>

                {/* Price */}
                <div className="text-right">
                  <p className="text-[18px] font-medium mb-1">{fmt(totalPrice)}</p>
                  {hasCustom && (
                    <p className="text-[11px] text-gray-500 mb-0.5">
                      Inclui personalização ({fmt(checkout.taxaPersonalizacao)})
                    </p>
                  )}
                  <p className="text-[11px] text-[#007a33]">Frete grátis da campanha</p>
                  <p className="text-[11px] text-[#007a33]">Você economiza {fmt(totalSavings)}</p>
                </div>
              </div>
            </div>

            {/* Cupom de desconto */}
            <div className="mb-8 border-b border-gray-200 pb-8">
              <h3 className="text-[15px] font-medium mb-4">Cupom de desconto</h3>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Digite seu cupom"
                  className="flex-1 border border-gray-300 rounded-full px-4 py-3 focus:outline-none focus:border-black text-[14px]"
                />
                <button className="border border-gray-300 rounded-full px-6 py-3 font-medium hover:border-black transition-colors text-[14px]">
                  Aplicar
                </button>
              </div>
              <div className="flex items-start gap-2 text-[12px] text-gray-600">
                <Tag className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>Tem um vale-troca ou cartão presente? Você poderá usá-los na etapa de pagamento.</p>
              </div>
            </div>

            {/* Resumo */}
            <div className="mb-8">
              <h3 className="text-[18px] font-medium mb-6">Resumo</h3>

              <div className="space-y-3 mb-6 text-[14px]">
                <div className="flex justify-between">
                  <span className="text-gray-600">{nomeProduto}</span>
                  <span>{fmt(quantity * checkout.precoBase)}</span>
                </div>
                {hasCustom && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Personalização</span>
                    <span>{fmt(quantity * checkout.taxaPersonalizacao)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Frete</span>
                  <span className="text-[#007a33] font-medium">Grátis</span>
                </div>
                <div className="flex justify-between text-[#007a33] text-[13px]">
                  <span>Desconto da campanha</span>
                  <span>- {fmt(totalSavings)}</span>
                </div>
              </div>

              <div className="flex justify-between items-start border-t border-gray-200 pt-4 mb-6">
                <span className="text-[16px] font-medium">Total da compra</span>
                <div className="text-right">
                  <p className="text-[16px] font-medium">{fmt(totalPrice)} no Pix</p>
                  <p className="text-[13px] text-gray-600">{fmt(totalPrice)} no cartão</p>
                </div>
              </div>

              <div className="bg-[#f5f5f5] rounded-lg p-4 flex items-start gap-3">
                <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-[13px] text-gray-800 leading-relaxed">
                  O desconto da campanha já está aplicado neste carrinho. Agora é só seguir para a etapa de pagamento.
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Seu carrinho está vazio.</p>
            <Link href="/nike" className="inline-block bg-black text-white rounded-full px-8 py-3 font-medium text-[15px]">
              Continuar comprando
            </Link>
          </div>
        )}
      </main>

      {/* Sticky Footer */}
      {!isCartEmpty && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 z-50">
          <Link
            href="/identificacao"
            className="w-full bg-black text-white rounded-full py-4 font-medium text-[15px] hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
          >
            <span>Continuar</span>
            <span className="opacity-50">·</span>
            <span>{fmt(totalPrice)}</span>
          </Link>
        </div>
      )}
    </div>
  );
}

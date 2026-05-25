'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Search, User, ShoppingBag, Menu, ChevronLeft, ChevronRight, Ruler, ChevronDown, Globe, Facebook, Instagram, Youtube } from 'lucide-react';
import { useCheckout } from '../context/CheckoutContext';
import { pixelViewContent, pixelAddToCart } from '../lib/pixel';

const SIZES = ['P', 'M', 'G', 'GG', 'GGG'];
const BASE_PRICE  = 69.90;
const CUSTOM_FEE  = 19.00;

const CORES = [
  {
    id:        'amarelo',
    label:     'Amarelo/Verde',
    nome:      'Camisa Brasil Nike I 2026/27 Torcedor Pro Masculina',
    contentId: '10977200A4',
    thumb:     'https://imgnike-a.akamaihd.net/120x120/10977200A4.jpg',
    img:       'https://imgnike-a.akamaihd.net/1920x1920/10977200A4.jpg',
    estilo:    '10977200A4',
    descricao: 'A camisa oficial do Brasil chega na tradicional cor amarela para a Copa do Mundo 2026. Com tecnologia Nike Dri-FIT, o tecido afasta o suor da pele para manter você fresco e confortável durante toda a partida.',
  },
  {
    id:        'azul',
    label:     'Azul/Preto',
    nome:      'Camisa Brasil Jordan II 2026/27 Jogador Masculina',
    contentId: '09761915A3',
    thumb:     'https://imgnike-a.akamaihd.net/120x120/09761915A3.jpg',
    img:       'https://imgnike-a.akamaihd.net/1920x1920/09761915A3.jpg',
    estilo:    'IU1074-417',
    descricao: 'O uniforme alternativo do Brasil une a herança Jordan ao futebol brasileiro. Com tecnologia Aero-FIT, proporciona respirabilidade de alto desempenho para jogadores e torcedores.',
  },
];

export default function Page() {
  const router   = useRouter();
  const checkout = useCheckout();

  const [selectedSize,  setSelectedSize]  = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState(CORES[0]);

  useEffect(() => {
    pixelViewContent({ content_name: selectedColor.nome, content_ids: [selectedColor.contentId], value: BASE_PRICE });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [personalizar, setPersonalizar] = useState(false);
  const [nome,         setNome]         = useState('');
  const [numero,       setNumero]       = useState('');
  const [showError,    setShowError]    = useState(false);

  const total = BASE_PRICE + (personalizar ? CUSTOM_FEE : 0);

  const fmt = (v: number) =>
    `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const handleAddToCart = () => {
    if (!selectedSize) {
      setShowError(true);
      document.getElementById('size-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setShowError(false);
    checkout.set({
      tamanho:             selectedSize,
      personalizar,
      nomePersonalizado:   nome,
      numeroPersonalizado: numero,
      precoBase:           BASE_PRICE,
      taxaPersonalizacao:  personalizar ? CUSTOM_FEE : 0,
      total,
      nomeProduto:   selectedColor.nome,
      corLabel:      selectedColor.label,
      imagemProduto: selectedColor.img,
      estiloId:      selectedColor.estilo,
    });
    pixelAddToCart({ content_name: selectedColor.nome, content_ids: [selectedColor.contentId], value: total });
    router.push('/carrinho');
  };

  return (
    <div className="min-h-screen bg-white text-[#111] font-sans pb-24">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="w-12">
          <Image
            src="https://static.nike.com.br/v11-288-0/images/brands/logo.svg"
            alt="Nike"
            width={48}
            height={17}
            className="w-12 h-auto"
            priority
          />
        </div>
        <div className="flex items-center gap-5">
          <Search className="w-6 h-6" />
          <User   className="w-6 h-6" />
          <ShoppingBag className="w-6 h-6" />
          <Menu   className="w-6 h-6" />
        </div>
      </header>

      {/* Promo Banner */}
      <div className="bg-[#f5f5f5] py-3 px-4 flex items-center justify-between text-sm">
        <ChevronLeft className="w-5 h-5" />
        <div className="text-center flex-1">
          <span className="font-bold">TÊNIS DE CORRIDA</span> Encontre o seu tênis ideal.{' '}
          <a href="#" className="underline">Saiba Mais</a>
        </div>
        <ChevronRight className="w-5 h-5" />
      </div>

      <main className="px-6 py-6 max-w-xl mx-auto">

        {/* Product Info */}
        <h1 className="text-[22px] font-medium leading-tight mb-1">
          {selectedColor.nome}
        </h1>
        <p className="text-gray-600 mb-4">Futebol</p>

        {/* Price */}
        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-gray-500 line-through text-lg">R$ 449,90</span>
            <span className="text-[#007a33] text-[28px] font-bold">{fmt(total)}</span>
          </div>
          {personalizar && (
            <p className="text-[12px] text-gray-500 mt-0.5">
              Inclui personalização ({fmt(CUSTOM_FEE)})
            </p>
          )}
          <p className="text-gray-600 text-sm mt-1">
            ou <span className="font-bold text-black">12x</span> de{' '}
            <span className="font-bold text-black">{fmt(total / 12)}</span> sem juros
          </p>
        </div>

        {/* Main Image */}
        <div className="relative aspect-[4/5] w-full bg-[#f5f5f5] mb-6">
          <Image
            key={selectedColor.id}
            src={selectedColor.img}
            alt={selectedColor.nome}
            fill
            className="object-cover"
            referrerPolicy="no-referrer"
            priority
          />
        </div>

        {/* Thumbnails / Color Selector */}
        <div className="mb-8">
          <p className="mb-1 text-[15px]">
            Cores e modelos —{' '}
            <span className="font-semibold">{selectedColor.label}</span>
          </p>
          <div className="flex gap-3 mt-3">
            {CORES.map((cor) => {
              const active = selectedColor.id === cor.id;
              return (
                <button
                  key={cor.id}
                  onClick={() => { setSelectedColor(cor); setSelectedSize(null); }}
                  className={[
                    'flex flex-col items-center gap-1.5 focus:outline-none',
                  ].join(' ')}
                >
                  <div className={[
                    'w-16 h-16 relative rounded overflow-hidden transition-all duration-150',
                    active ? 'ring-2 ring-black ring-offset-1' : 'ring-1 ring-gray-300',
                  ].join(' ')}>
                    <Image
                      src={cor.thumb}
                      alt={cor.label}
                      fill
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span className={[
                    'text-[11px]',
                    active ? 'font-semibold text-black' : 'text-gray-500',
                  ].join(' ')}>
                    {cor.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Size warning */}
        <div className="bg-[#f5f5f5] p-4 rounded-md mb-6">
          <p className="font-bold flex items-center gap-2 mb-1 text-[15px]">
            <Ruler className="w-4 h-4" />
            Atenção! Compre um tamanho maior:
          </p>
          <p className="text-[15px] text-gray-600">
            Recomendamos escolher um tamanho maior que o usual para um ajuste mais confortável.
          </p>
        </div>

        {/* ── Size Selector ── */}
        <div id="size-section" className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[15px] font-medium">
              Tamanho{' '}
              {selectedSize && (
                <span className="font-bold text-black">— {selectedSize}</span>
              )}
            </p>
            <a href="#" className="text-[13px] text-gray-500 underline flex items-center gap-1">
              <Ruler className="w-3.5 h-3.5" /> Guia de tamanhos
            </a>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {SIZES.map((size) => {
              const selected = selectedSize === size;
              return (
                <button
                  key={size}
                  onClick={() => { setSelectedSize(size); setShowError(false); }}
                  className={[
                    'border rounded py-3.5 text-center text-[15px] font-medium transition-all duration-150',
                    selected
                      ? 'border-black bg-black text-white shadow-md scale-[1.04]'
                      : 'border-gray-300 text-[#111] hover:border-gray-600',
                  ].join(' ')}
                >
                  {size}
                </button>
              );
            })}
          </div>

          {showError && (
            <p className="mt-2.5 text-[13px] text-red-500 font-medium">
              Selecione um tamanho antes de continuar.
            </p>
          )}
        </div>

        {/* ── Personalização ── */}
        <div className="mb-8 border border-gray-200 rounded-xl overflow-hidden">
          {/* Toggle row */}
          <button
            type="button"
            onClick={() => setPersonalizar(v => !v)}
            className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors"
          >
            <div className="text-left">
              <p className="text-[15px] font-medium">Personalizar camisa</p>
              <p className="text-[12px] text-gray-500 mt-0.5">
                Nome e número · <span className="font-semibold text-[#111]">{fmt(CUSTOM_FEE)}</span>
              </p>
            </div>
            {/* Toggle switch */}
            <div className={[
              'relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0',
              personalizar ? 'bg-black' : 'bg-gray-300',
            ].join(' ')}>
              <span className={[
                'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200',
                personalizar ? 'translate-x-5' : 'translate-x-0.5',
              ].join(' ')} />
            </div>
          </button>

          {/* Fields — shown when toggle is on */}
          {personalizar && (
            <div className="px-4 pb-5 border-t border-gray-100 flex flex-col gap-4 pt-4">
              <div>
                <label className="block text-[12px] font-medium text-gray-500 mb-1.5">
                  Nome na camisa <span className="text-gray-400">(máx. 12 caracteres)</span>
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={e => setNome(e.target.value.toUpperCase().slice(0, 12))}
                  placeholder="Ex: NEYMAR"
                  maxLength={12}
                  className="w-full border border-gray-300 rounded px-4 py-3 text-[15px] placeholder-gray-400 outline-none focus:border-black transition-colors uppercase tracking-widest font-medium"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-gray-500 mb-1.5">
                  Número
                </label>
                <input
                  type="text"
                  value={numero}
                  onChange={e => setNumero(e.target.value.replace(/\D/g, '').slice(0, 2))}
                  placeholder="Ex: 10"
                  maxLength={2}
                  inputMode="numeric"
                  className="w-full border border-gray-300 rounded px-4 py-3 text-[15px] placeholder-gray-400 outline-none focus:border-black transition-colors font-bold tracking-widest"
                />
              </div>
            </div>
          )}
        </div>

        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          className={[
            'w-full rounded-full py-4 mb-10 font-medium text-[15px] transition-colors flex justify-center',
            selectedSize
              ? 'bg-black text-white hover:bg-gray-800'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed',
          ].join(' ')}
        >
          {selectedSize ? 'Adicionar ao carrinho' : 'Selecione um tamanho'}
        </button>


        {/* Description */}
        <div className="mb-12">
          <h3 className="text-[18px] font-medium mb-4">Descrição</h3>
          <p className="text-gray-700 mb-4 leading-relaxed text-[15px]">
            {selectedColor.descricao}
          </p>
          <a href="#" className="underline font-medium block mb-6 text-[15px]">Ver mais detalhes do produto</a>
          <ul className="list-disc pl-5 text-gray-700 space-y-1 mb-6 text-[15px]">
            <li>Cor: {selectedColor.label}</li>
            <li>Estilo: {selectedColor.estilo}</li>
          </ul>
          <a href="#" className="underline text-sm text-gray-600">Relatar problema</a>
        </div>

        {/* Marketing Content */}
        <div className="space-y-12 mb-12">
          {[
            {
              src: 'https://imgnike-a.akamaihd.net//strapi/nike/Jordan_SU_26_P6_Launch_03_13_Dotcom_e_PDP_Mobile_P1_769407b867/Jordan_SU_26_P6_Launch_03_13_Dotcom_e_PDP_Mobile_P1_769407b867.png',
              alt: 'Joga Sinistro',
              title: 'Bem-vindos ao Lado\nSombrio do Futebol',
              body: 'AVISO. Às seleções em busca da glória, Jordan e a Seleção Brasileira advertem: saiam da frente ou sofram as consequências.',
            },
            {
              src: 'https://imgnike-a.akamaihd.net//strapi/nike/Jordan_SU_26_P6_Launch_03_13_Dotcom_e_PDP_Mobile_P2_a774e6afbd/Jordan_SU_26_P6_Launch_03_13_Dotcom_e_PDP_Mobile_P2_a774e6afbd.png',
              alt: 'O Espírito da Seleção',
              title: 'O Espírito da Seleção',
              body: 'Com o instinto dos predadores, o novo uniforme do Brasil impõe respeito imediato. O padrão em azul royal e preto é complementado por detalhes em verde-água e amarelo.',
            },
            {
              src: 'https://imgnike-a.akamaihd.net//strapi/nike/Jordan_SU_26_P6_Launch_03_13_Dotcom_e_PDP_Mobile_P3_871527b357/Jordan_SU_26_P6_Launch_03_13_Dotcom_e_PDP_Mobile_P3_871527b357.png',
              alt: 'Corpo Fresco Sob Pressão',
              title: 'Corpo Fresco Sob\nPressão',
              body: 'Feito com tecido 100% reciclado, o uniforme conta com a tecnologia de resfriamento Aero-FIT, projetada para circular o ar entre a pele e o tecido.',
            },
          ].map(({ src, alt, title, body }) => (
            <div key={alt}>
              <div className="relative aspect-[4/5] w-full bg-[#f5f5f5] mb-6">
                <Image src={src} alt={alt} fill className="object-cover" referrerPolicy="no-referrer" />
              </div>
              <h2 className="text-[28px] font-medium text-center mb-4 leading-tight whitespace-pre-line">{title}</h2>
              <p className="text-center text-gray-700 leading-relaxed text-[15px]">{body}</p>
            </div>
          ))}
        </div>

        {/* Accordions */}
        <div className="mb-12">
          <h3 className="text-[18px] font-medium mb-4">Mais roupas</h3>
          <div className="border-t border-gray-200">
            {['Camisetas', 'Uniforme', 'Corrida', 'Torneio de Futebol 2026', 'Outras categorias'].map((item) => (
              <button key={item} className="w-full py-4 flex items-center justify-between border-b border-gray-200 text-left text-[15px]">
                {item}
                <ChevronDown className="w-5 h-5 text-gray-500" />
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-gray-200">
        <div className="space-y-4 mb-8">
          {['Cadastre-se para receber novidades', 'Encontre uma loja Nike', 'Black Friday Nike', 'Cartão presente', 'Mapa do site', 'Guia de produtos', 'Corinthians', 'Acompanhe seu pedido', 'Vendas corporativas'].map(item => (
            <a key={item} href="#" className="block font-medium text-[15px]">{item}</a>
          ))}
        </div>

        <div className="border-t border-gray-200">
          {['Ajuda', 'Sobre a Nike'].map(item => (
            <button key={item} className="w-full py-4 flex items-center justify-between border-b border-gray-200 text-left font-medium text-[15px]">
              {item}
              <ChevronDown className="w-5 h-5 text-gray-500" />
            </button>
          ))}
        </div>

        <div className="mt-8 mb-8 flex items-center gap-2 text-gray-600 text-[15px]">
          <Globe className="w-5 h-5" />
          <span>Brasil</span>
        </div>

        <div className="mb-8">
          <p className="text-gray-600 mb-4 text-[15px]">Redes sociais</p>
          <div className="flex gap-4">
            <Facebook  className="w-6 h-6 text-gray-600" />
            <Instagram className="w-6 h-6 text-gray-600" />
            <Youtube   className="w-6 h-6 text-gray-600" />
          </div>
        </div>

        <div className="mb-8">
          <p className="text-gray-600 mb-4 text-[15px]">Formas de pagamento</p>
          <div className="flex flex-wrap gap-2">
            {['MC', 'VISA', 'AMEX', 'ELO', 'HIPER', 'DISC', 'BOLETO'].map(c => (
              <div key={c} className="w-12 h-8 border border-gray-300 rounded flex items-center justify-center text-[10px] font-bold">{c}</div>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <p className="text-gray-600 mb-4 text-[15px]">Baixe o app Nike</p>
          <div className="flex gap-2">
            <div className="w-32 h-10 bg-black rounded text-white flex items-center justify-center text-xs">Google Play</div>
            <div className="w-32 h-10 bg-black rounded text-white flex items-center justify-center text-xs">App Store</div>
          </div>
        </div>

        <div className="space-y-2 text-sm text-gray-500 mb-8">
          {['Política de privacidade', 'Política de cookies', 'Termos de uso'].map(t => (
            <a key={t} href="#" className="block">{t}</a>
          ))}
        </div>

        <p className="text-xs text-gray-500 leading-relaxed">
          © 2026 Nike. Todos os direitos reservados. Fisia Comércio de Produtos Esportivos Ltda - CNPJ: 59.546.515/0045-55<br />
          Rodovia Fernão Dias, S/N Km 947.5 - Galpão Modulo 3640 - CEP 37640-900 - Extrema - MG
        </p>
      </footer>

      {/* Sticky Add to Cart */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 z-50">
        <button
          onClick={handleAddToCart}
          className={[
            'w-full rounded-full py-4 font-medium text-[15px] transition-colors flex items-center justify-center gap-2',
            selectedSize
              ? 'bg-black text-white hover:bg-gray-800'
              : 'bg-gray-200 text-gray-400',
          ].join(' ')}
        >
          {selectedSize
            ? <><span>Adicionar ao carrinho</span><span className="opacity-60">·</span><span>{fmt(total)}</span></>
            : 'Selecione um tamanho'}
        </button>
      </div>
    </div>
  );
}

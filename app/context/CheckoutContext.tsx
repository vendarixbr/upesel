"use client";

import { createContext, useContext, useState } from "react";

interface CheckoutState {
  /* cliente */
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  cupomAtivo: boolean;

  /* endereço */
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;

  /* produto */
  tamanho: string;
  personalizar: boolean;
  nomePersonalizado: string;
  numeroPersonalizado: string;
  precoBase: number;
  taxaPersonalizacao: number;
  total: number;
  nomeProduto: string;
  corLabel: string;
  imagemProduto: string;
  estiloId: string;
}

interface CheckoutContextValue extends CheckoutState {
  set: (partial: Partial<CheckoutState>) => void;
}

const CheckoutContext = createContext<CheckoutContextValue | null>(null);

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CheckoutState>({
    nome: "",
    cpf: "",
    email: "",
    telefone: "",
    cupomAtivo: false,
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    tamanho: "",
    personalizar: false,
    nomePersonalizado: "",
    numeroPersonalizado: "",
    precoBase: 49.90,
    taxaPersonalizacao: 0,
    total: 49.90,
    nomeProduto: "Camisa Brasil Jordan II 2026/27 Jogador Masculina",
    corLabel: "Azul/Preto",
    imagemProduto: "https://imgnike-a.akamaihd.net/1920x1920/09761915A3.jpg",
    estiloId: "IU1074-417",
  });

  const set = (partial: Partial<CheckoutState>) =>
    setState((prev) => ({ ...prev, ...partial }));

  return (
    <CheckoutContext.Provider value={{ ...state, set }}>
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const ctx = useContext(CheckoutContext);
  if (!ctx) throw new Error("useCheckout must be used inside CheckoutProvider");
  return ctx;
}

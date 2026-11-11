"use client";

import { useActionState, type ReactNode } from "react";
import { botaoPrincipal } from "./ui";

export type EstadoAcao = { erro?: string; ok?: string } | null;
export type Acao = (anterior: EstadoAcao, dados: FormData) => Promise<EstadoAcao>;

/**
 * Formulário ligado a uma Server Action, com estado de envio e mensagem de erro ou sucesso.
 * Os textos do botão seguem a voz da marca: "Salvar" e, enquanto envia, "Salvando…".
 */
export function FormAcao({
  acao,
  children,
  botao,
  enviando,
  classeBotao = botaoPrincipal,
  className = "flex flex-col gap-4",
}: {
  acao: Acao;
  children?: ReactNode;
  botao: ReactNode;
  enviando?: string;
  classeBotao?: string;
  className?: string;
}) {
  const [estado, enviar, pendente] = useActionState(acao, null);
  return (
    <form action={enviar} className={className}>
      {children}
      <button type="submit" className={classeBotao} disabled={pendente}>
        {pendente ? (enviando ?? "Enviando…") : botao}
      </button>
      <p
        role="status"
        aria-live="polite"
        className={`text-legenda font-semibold empty:hidden ${estado?.erro ? "text-erro" : "text-sucesso"}`}
      >
        {estado?.erro ?? estado?.ok ?? ""}
      </p>
    </form>
  );
}

/** Botão pequeno que dispara uma ação sem mensagem (ex.: "Faltou", "Cancelar"). */
export function BotaoAcao({
  acao,
  campos,
  children,
  className,
  confirmar,
}: {
  acao: (dados: FormData) => Promise<void>;
  campos: Record<string, string>;
  children: ReactNode;
  className: string;
  confirmar?: string;
}) {
  return (
    <form
      action={acao}
      onSubmit={(e) => {
        if (confirmar && !window.confirm(confirmar)) e.preventDefault();
      }}
    >
      {Object.entries(campos).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <button type="submit" className={className}>
        {children}
      </button>
    </form>
  );
}

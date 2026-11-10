import { Logo } from "@/components/Logo";

const CORES = [
  { nome: "Amarelo", classe: "bg-amarelo", hex: "#FFD23F" },
  { nome: "Petróleo", classe: "bg-petroleo", hex: "#0F3D3E" },
  { nome: "Menta", classe: "bg-menta-suave", hex: "#DDEFE8" },
  { nome: "Pêssego", classe: "bg-pessego-suave", hex: "#FFE3D3" },
  { nome: "Fundo", classe: "bg-fundo", hex: "#F1F4F2" },
  { nome: "Superfície", classe: "bg-superficie", hex: "#FFFFFF" },
];

export default function Inicio() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="bg-sol px-4 pt-6 pb-12">
        <div className="mx-auto max-w-3xl">
          <Logo />
          <h1 className="mt-10 max-w-[14ch] text-display">Seu cliente pede. A Marcaí marca.</h1>
          <p className="mt-4 max-w-[32ch] text-subtitulo font-medium">
            A atendente que responde no WhatsApp, mostra os horários livres e já deixa marcado.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-3xl px-4 py-10">
        <div className="rounded-cartao border border-linha bg-superficie p-5">
          <p className="text-legenda text-texto-suave">Próximo horário</p>
          <div className="mt-3 flex items-center gap-3">
            <span className="rounded-etiqueta bg-amarelo-suave px-2 py-1 font-bold tabular-nums">
              18:00
            </span>
            <span className="text-corpo">Carla, escova (pela Lia)</span>
            <span className="ml-auto text-corpo text-texto-suave tabular-nums">R$ 50</span>
          </div>
          <button
            type="button"
            className="mt-5 min-h-toque w-full rounded-botao bg-amarelo px-6 font-bold text-sobre-amarelo"
          >
            Marcar às 18:00
          </button>
        </div>

        <div className="mt-6 max-w-[84%] rounded-destaque bg-petroleo px-4 py-3 text-sobre-petroleo">
          Oi, Carla! Sábado tenho 09:00 e 10:30. Qual fica melhor pra você?
        </div>

        <h2 className="mt-10 text-subtitulo">Cores da marca</h2>
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {CORES.map((cor) => (
            <li
              key={cor.nome}
              className="overflow-hidden rounded-cartao border border-linha bg-superficie"
            >
              <div className={`${cor.classe} h-16`} />
              <div className="px-3 py-2">
                <p className="text-corpo font-semibold">{cor.nome}</p>
                <p className="text-legenda text-texto-suave tabular-nums">{cor.hex}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <footer className="mt-auto bg-petroleo px-4 py-6 text-sobre-petroleo">
        <div className="mx-auto max-w-3xl">
          <Logo fundo="escuro" tamanho={28} />
        </div>
      </footer>
    </main>
  );
}

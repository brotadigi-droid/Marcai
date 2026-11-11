import Link from "next/link";
import { botaoDiscreto } from "@/components/ui";

export function Voltar({
  href = "/ajustes",
  children = "← Ajustes",
}: {
  href?: string;
  children?: React.ReactNode;
}) {
  return (
    <Link href={href} className={`${botaoDiscreto} -ml-3 self-start`}>
      {children}
    </Link>
  );
}

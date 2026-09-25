import type { ReactNode } from "react";
import Container from "./Container";

export default function LegalPage({
  eyebrow,
  title,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="bg-background pb-24">
      <section className="bg-dark py-20 text-center">
        <Container>
          <span className="eyebrow border border-white/15 bg-white/10 text-white">{eyebrow}</span>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">{title}</h1>
          <p className="mt-4 text-sm text-white/50">Last updated {updated}</p>
        </Container>
      </section>
      <Container className="mt-16 max-w-3xl">
        <div className="card-surface space-y-8 p-8 text-sm leading-relaxed text-ink/80 sm:p-10 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-ink [&_li]:ml-5 [&_li]:list-disc [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:space-y-1.5">
          {children}
        </div>
      </Container>
    </div>
  );
}

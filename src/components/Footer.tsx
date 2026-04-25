import { ShieldCheck, Tv } from "lucide-react";

const Footer = () => {
  return (
    <footer className="mt-16 border-t border-primary/10 bg-black/60">
      <div className="container mx-auto px-4 py-10">
        <div className="glass-panel flex flex-col gap-6 rounded-[2rem] p-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_0_24px_rgba(255,208,0,0.22)]">
                <Tv className="h-5 w-5" />
              </div>

              <div>
                <span className="text-3xl leading-none text-foreground">
                  You <span className="text-primary">cine shops</span>
                </span>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Recargas para streaming
                </p>
              </div>
            </div>

            <p className="max-w-xl text-sm leading-7 text-muted-foreground">
              Compra simples, pagamento seguro.
            </p>
          </div>

          <div className="rounded-full border border-primary/15 bg-white/5 px-5 py-3 text-sm font-semibold text-foreground">
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Pagamento seguro via PIX
            </span>
          </div>
        </div>

        <div className="mt-8 text-center text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          (c) {new Date().getFullYear()} You cine shops
        </div>
      </div>
    </footer>
  );
};

export default Footer;

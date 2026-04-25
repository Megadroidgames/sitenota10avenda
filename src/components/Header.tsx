import { Search, ShieldCheck, Tv } from "lucide-react";
import { Input } from "@/components/ui/input";

interface HeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
}

const Header = ({ search, onSearchChange }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-40 border-b border-primary/10 bg-black/75 backdrop-blur-2xl">
      <div className="container mx-auto flex flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/30 bg-primary text-primary-foreground shadow-[0_0_30px_rgba(255,208,0,0.25)]">
              <Tv className="h-5 w-5" />
            </div>

            <div>
              <h1 className="text-3xl leading-none text-foreground sm:text-4xl">
                You <span className="text-primary">cine shops</span>
              </h1>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                Recargas para streaming
              </p>
            </div>
          </div>

          <div className="hidden rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary md:flex md:items-center md:gap-2">
            <ShieldCheck className="h-4 w-4" />
            PIX seguro
          </div>
        </div>

        <div className="flex w-full flex-col gap-3 lg:w-auto lg:min-w-[420px] lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/60" />
            <Input
              placeholder="Buscar produto..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-12 rounded-full border-primary/15 bg-white/5 pl-11 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
            />
          </div>

          <div className="inline-flex items-center justify-center rounded-full border border-primary/15 bg-white/5 px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            24 HORA ONLINE
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

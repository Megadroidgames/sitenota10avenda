import { useMemo, useState } from "react";
import { ShieldCheck, TimerReset, Wallet } from "lucide-react";
import Header from "@/components/Header";
import CategoryFilter from "@/components/CategoryFilter";
import ProductCard from "@/components/ProductCard";
import CheckoutModal from "@/components/CheckoutModal";
import Footer from "@/components/Footer";
import { products, Product } from "@/data/products";

const Index = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todos");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const filtered = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = category === "Todos" || product.category === category;
      const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [search, category]);

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8rem] top-28 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-[-6rem] top-[30rem] h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <Header search={search} onSearchChange={setSearch} />

      <main className="container relative z-10 mx-auto flex-1 px-4 pb-10 pt-8">
        <section className="glass-panel rounded-[2rem] px-6 py-8 sm:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-primary/70">Super promoçao!</p>
            <h2 className="mt-3 text-4xl leading-[0.92] text-foreground sm:text-5xl lg:text-6xl">
              Compre sua recarga em poucos cliques.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              Escolha a plataforma, selecione o plano e finalize com PIX de forma rapida e segura.
            </p>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <div className="gold-outline rounded-[1.25rem] bg-black/45 p-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold text-foreground">Pagamento seguro</span>
              </div>
            </div>

            <div className="gold-outline rounded-[1.25rem] bg-black/45 p-4">
              <div className="flex items-center gap-3">
                <TimerReset className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold text-foreground">Compra simples e rapida</span>
              </div>
            </div>

            <div className="gold-outline rounded-[1.25rem] bg-black/45 p-4">
              <div className="flex items-center gap-3">
                <Wallet className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold text-foreground">Entrega automatica</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[1.75rem] border border-primary/10 bg-black/40 p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary/70">Filtre por categoria</p>
              <h3 className="mt-2 text-3xl leading-none text-foreground">Escolha o produto ideal</h3>
            </div>

            <p className="text-sm font-medium text-muted-foreground">
              {filtered.length} produto{filtered.length === 1 ? "" : "s"} disponivel{filtered.length === 1 ? "" : "is"}
            </p>
          </div>

          <div className="mt-5">
            <CategoryFilter selected={category} onSelect={setCategory} />
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary/70">Catalogo</p>
            <h3 className="mt-2 text-3xl leading-none text-foreground">Produtos disponiveis</h3>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} onBuy={setSelectedProduct} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="gold-outline mt-12 rounded-[1.75rem] bg-black/45 p-10 text-center">
              <p className="text-3xl leading-none text-foreground">Nenhum produto encontrado</p>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Tente outro termo na busca ou troque a categoria para ver mais opcoes.
              </p>
            </div>
          )}
        </section>
      </main>

      <Footer />

      <CheckoutModal
        product={selectedProduct}
        open={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
};

export default Index;

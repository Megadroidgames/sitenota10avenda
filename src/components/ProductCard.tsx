import { ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Product } from "@/data/products";

interface ProductCardProps {
  product: Product;
  onBuy: (product: Product) => void;
}

const ProductCard = ({ product, onBuy }: ProductCardProps) => {
  const hasDiscount = Boolean(product.originalPrice && product.originalPrice > product.price);
  const discountPercentage = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  return (
    <Card className="group spotlight-card gold-outline relative overflow-hidden rounded-[1.5rem] transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_24px_50px_rgba(0,0,0,0.45)]">
      {product.isCombo && (
        <Badge className="absolute right-4 top-4 z-10 rounded-full border-0 bg-[hsl(var(--combo))] px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.2em] text-[hsl(var(--combo-foreground))]">
          Combo
        </Badge>
      )}

      <div className="relative h-44 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />

        <div className="absolute bottom-4 left-4">
          <span className="rounded-full border border-primary/20 bg-black/65 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary backdrop-blur-md">
            {product.category}
          </span>
        </div>
      </div>

      <CardContent className="space-y-4 p-5">
        <div>
          <h3 className="text-2xl leading-none text-foreground">{product.name}</h3>
          <p className="mt-2 text-sm font-medium uppercase tracking-[0.16em] text-muted-foreground">
            {product.duration}
          </p>
        </div>

        <div className="rounded-2xl border border-primary/10 bg-black/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Preco</p>

          <div className="mt-2 flex items-end gap-3">
            {hasDiscount && (
              <span className="text-sm font-medium text-muted-foreground line-through">
                R$ {product.originalPrice!.toFixed(2).replace(".", ",")}
              </span>
            )}
            <span className="text-4xl font-black leading-none text-primary">
              R$ {product.price.toFixed(2).replace(".", ",")}
            </span>
          </div>

          {hasDiscount && (
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary/80">
              {discountPercentage}% de desconto
            </p>
          )}
        </div>

        <Button
          onClick={() => onBuy(product)}
          className="h-12 w-full rounded-full bg-primary text-base font-extrabold uppercase tracking-[0.12em] text-primary-foreground shadow-[0_18px_30px_rgba(255,208,0,0.18)] transition-transform duration-300 hover:-translate-y-0.5 hover:bg-primary"
          size="lg"
        >
          <ShoppingCart className="h-4 w-4" />
          Comprar
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductCard;

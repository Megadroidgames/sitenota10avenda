import { categories } from "@/data/products";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  selected: string;
  onSelect: (category: string) => void;
}

const CategoryFilter = ({ selected, onSelect }: CategoryFilterProps) => {
  return (
    <div className="flex flex-wrap gap-3">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={cn(
            "rounded-full border px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] transition-all duration-300",
            selected === cat
              ? "border-primary bg-primary text-primary-foreground shadow-[0_12px_30px_rgba(255,208,0,0.28)]"
              : "border-primary/20 bg-white/5 text-muted-foreground hover:-translate-y-0.5 hover:border-primary/45 hover:bg-primary/10 hover:text-foreground",
          )}
        >
          {cat}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;

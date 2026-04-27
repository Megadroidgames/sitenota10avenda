import { categories, products } from "../../catalog/products.js";

export interface Product {
  id: string;
  name: string;
  category: string;
  duration: string;
  price: number;
  originalPrice?: number;
  isCombo?: boolean;
  image: string;
}

export { categories };
export const productsList: Product[] = products;
export { productsList as products };

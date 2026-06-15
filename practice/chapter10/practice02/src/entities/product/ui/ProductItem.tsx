import React from "react";
import type { Product } from "../model/types";
import styles from "./ProductItem.module.css";

export const ProductItem = React.memo(({ product }: { product: Product }) => {
  console.log("ProductItem 렌더링: ", product.name);
  return (
    <div className={styles.item}>
      <p className={styles.name}>{product.name}</p>
      <p className={styles.category}>{product.category}</p>
      <p className={styles.price}>{product.price}원</p>
    </div>
  );
});

import { useMemo, useState } from "react";
import { products } from "../../../entities/product/model/data";

export const useProductSearch = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [clickCount, setClickCount] = useState<number>(0); // useMemo 확인하는 용도

  const filteredProducts = useMemo(
    () => products.filter((product) => product.name.includes(searchTerm)),
    [searchTerm],
  );

  const avgPrice = useMemo(() => {
    console.log("avgPrice 계산 실행됨.");
    // 의미 없는 함수
    for (let i = 0; i < 10000000; i++) {
      Math.sqrt(i);
    }
    if (filteredProducts.length === 0) return 0;
    const sum = filteredProducts.reduce((acc, cur) => acc + cur.price, 0);
    return sum / filteredProducts.length;
  }, [filteredProducts]);

  return {
    searchTerm,
    setSearchTerm,
    avgPrice,
    clickCount,
    setClickCount,
    filteredProducts,
  };
};

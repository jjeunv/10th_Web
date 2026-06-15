import { ProductItem } from "../../../entities/product/ui/ProductItem";
import { useProductSearch } from "../model/useProductSearch";
import styles from "./ProductSearchPage.module.css";

const ProductSearchPage = () => {
  const {
    searchTerm,
    setSearchTerm,
    clickCount,
    setClickCount,
    avgPrice,
    filteredProducts,
  } = useProductSearch();
  return (
    <div className={styles.page}>
      <div className={styles.controls}>
        <input
          className={styles.searchInput}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="상품 검색"
        />
        <button
          className={styles.counterButton}
          onClick={() => setClickCount((prev) => prev + 1)}
        >
          클릭: {clickCount}
        </button>
      </div>
      <p className={styles.avgPrice}>평균 가격: {avgPrice}원</p>

      <div className={styles.list}>
        {filteredProducts.map((product) => (
          <ProductItem key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default ProductSearchPage;

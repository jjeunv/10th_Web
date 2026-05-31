import CartList from "../../../widgets/cart-list/ui/CartList";
import CartSummary from "../../../widgets/cart-summary/ui/CartSummary";

const CartPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-900 text-white px-6 py-4">
        <h1 className="text-lg font-bold">KASA</h1>
      </header>
      <main className="max-w-xl mx-auto px-4 py-6 flex flex-col gap-4">
        <CartList />
        <CartSummary />
      </main>
    </div>
  );
};

export default CartPage;

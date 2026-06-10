import { useStore } from "../../../app/useStore";
import type { CartItem } from "../../../entities/cart/model/types";
import CartCard from "../../../entities/cart/ui/CartCard";

const CartList = () => {
  const { cartItems } = useStore();
  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <p className="text-base font-medium">장바구니가 비어있습니다</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-gray-100">
      {cartItems.map((item: CartItem) => (
        <div key={item.id} className="py-4">
          <CartCard item={item} />
        </div>
      ))}
    </div>
  );
};

export default CartList;

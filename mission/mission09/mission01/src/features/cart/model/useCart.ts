import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../app/store";
import { clearCart, decrease, increase, removeItem } from "./cartSlice";

export const useCart = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { cartItems, amount, total } = useSelector(
    (state: RootState) => state.cart,
  );

  return {
    cartItems,
    amount,
    total,
    increase: (id: string) => dispatch(increase(id)),
    decrease: (id: string) => dispatch(decrease(id)),
    removeItem: (id: string) => dispatch(removeItem(id)),
    clearCart: () => dispatch(clearCart()),
  };
};

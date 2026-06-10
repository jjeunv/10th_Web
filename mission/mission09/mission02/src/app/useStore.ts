import type { CartItem } from "../entities/cart/model/types";
import { create } from "zustand";
import { cartItems } from "../shared/constants/cartItem";

interface CartState {
  cartItems: CartItem[]; // 장바구니에 담긴 음반 목록
  amount: number; // 전체 수량 합계
  total: number; // 전체 금액 합계
  isOpen: boolean; // 모달(전체 삭제 확인창)
}

interface CartActions {
  increase: (id: string) => void; // 특정 음반 수량 +1
  decrease: (id: string) => void; // 특정 음반 수량 -1 (0이 되면 자동 제거)
  removeItem: (id: string) => void; // 특정 음반 장바구니에서 제거
  clearCart: () => void; // 장바구니 비우기
  openModal: () => void; // 모달 열기
  closeModal: () => void; // 모달 닫기
}

export const useStore = create<CartState & CartActions>()((set) => ({
  cartItems: cartItems,
  amount: cartItems.reduce((acc, cur) => acc + cur.amount, 0),
  total: cartItems.reduce((acc, cur) => acc + cur.amount * cur.price, 0),
  isOpen: false,
  increase: (id) =>
    set((state) => {
      const newCartItems = state.cartItems.map((item) =>
        item.id === id ? { ...item, amount: item.amount + 1 } : item,
      );
      return { cartItems: newCartItems, ...calculateTotals(newCartItems) };
    }),
  decrease: (id) =>
    set((state) => {
      const newCartItems = state.cartItems
        .map((item) =>
          item.id === id ? { ...item, amount: item.amount - 1 } : item,
        )
        .filter((item) => item.amount > 0);
      return { cartItems: newCartItems, ...calculateTotals(newCartItems) };
    }),
  removeItem: (id) =>
    set((state) => {
      const newCartItems = state.cartItems.filter((item) => item.id !== id);
      return { cartItems: newCartItems, ...calculateTotals(newCartItems) };
    }),
  clearCart: () => set({ cartItems: [], ...calculateTotals([]) }),
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),
}));

const calculateTotals = (items: CartItem[]) => {
  const amount = items.reduce((acc, cur) => acc + cur.amount, 0);
  const total = items.reduce((acc, cur) => acc + cur.amount * cur.price, 0);
  return { amount, total };
};

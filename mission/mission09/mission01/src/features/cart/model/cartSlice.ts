import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CartItem } from "../../../entities/cart/model/types";
import { cartItems } from "../../../shared/constants/cartItem";

interface CartState {
  cartItems: CartItem[];
  amount: number; // 모든 음반의 수량을 다 더한 전체 수량 합계
  total: number; // 전체 금액 합계 (price x amount를 모두 더한 값)
}

const initialState: CartState = {
  cartItems: cartItems,
  amount: cartItems.reduce((acc, cur) => acc + cur.amount, 0),
  total: cartItems.reduce((acc, cur) => acc + cur.price * cur.amount, 0),
};

/*

createSlice는 아래 세 가지를 한 번에 만들어준다.

- state: initialState로 초기 상태 설정
- action: reducers에 정의한 함수마다 액션 자동 생성
- reducer: 각 액션에 따라 상태를 어떻게 바꿀지 정의

 */

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // 장바구니 비우기
    clearCart(state) {
      state.cartItems = [];
      cartSlice.caseReducers.calculateTotals(state);
    },
    // 특정 음반 하나를 장바구니에서 제거
    removeItem(state, action: PayloadAction<string>) {
      state.cartItems = state.cartItems.filter(
        (item) => item.id !== action.payload,
      );
      cartSlice.caseReducers.calculateTotals(state);
    },
    // 특정 음반의 수량을 +1
    increase(state, action: PayloadAction<string>) {
      const item = state.cartItems.find((item) => item.id === action.payload);
      if (item) item.amount += 1;
      cartSlice.caseReducers.calculateTotals(state);
    },
    // 특정 음반의 수량을 -1, 단 수량이 1 이하로 내려가면 아이템을 자동 제거
    decrease(state, action: PayloadAction<string>) {
      const item = state.cartItems.find((item) => item.id === action.payload);
      if (item) {
        item.amount -= 1;
        if (item.amount === 0) {
          state.cartItems = state.cartItems.filter(
            (item) => item.id !== action.payload,
          );
        }
      }
      cartSlice.caseReducers.calculateTotals(state);
    },
    // 장바구니 전체 수량(amount)과 총 금액(total)을 재계산
    calculateTotals(state) {
      state.amount = state.cartItems.reduce((acc, cur) => acc + cur.amount, 0);
      state.total = state.cartItems.reduce(
        (acc, cur) => acc + cur.price * cur.amount,
        0,
      );
    },
  },
});

export const { clearCart, removeItem, increase, decrease, calculateTotals } =
  cartSlice.actions;
export default cartSlice.reducer;

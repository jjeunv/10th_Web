import { useStore } from "../../../app/useStore";

const CartSummary = () => {
  const { amount, total, openModal } = useStore();
  return (
    <div className="flex flex-col gap-3 pt-6 border-t border-gray-200">
      <div className="flex justify-between items-center text-sm text-gray-700">
        <span>총 수량</span>
        <span className="font-semibold">{amount}개</span>
      </div>
      <div className="flex justify-between items-center text-sm text-gray-700">
        <span>총 금액</span>
        <span className="font-bold text-base text-gray-900">
          ${total.toLocaleString()}
        </span>
      </div>
      <button
        onClick={() => openModal()}
        className="mt-2 w-full py-2 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 transition-colors"
      >
        전체 삭제
      </button>
    </div>
  );
};

export default CartSummary;

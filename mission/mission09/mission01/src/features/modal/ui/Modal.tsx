import { useCart } from "../../cart/model/useCart";
import useModal from "../model/useModal";

const Modal = () => {
  const { closeModal } = useModal();
  const { clearCart } = useCart();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl px-8 py-6 flex flex-col items-center gap-6 shadow-xl w-72">
        <p className="text-sm font-semibold text-gray-800">정말 삭제하시겠습니까?</p>
        <div className="flex gap-3 w-full">
          <button
            onClick={() => closeModal()}
            className="flex-1 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            아니요
          </button>
          <button
            onClick={() => {
              clearCart();
              closeModal();
            }}
            className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors"
          >
            네
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;

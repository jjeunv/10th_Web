import type { CartItem } from "../model/types";
import { useStore } from "../../../app/useStore";

type Props = {
  item: CartItem;
};

const CartCard = ({ item }: Props) => {
  const { decrease, increase } = useStore();
  return (
    <div className="flex items-center gap-4">
      <img
        src={item.img}
        alt={item.title}
        className="w-20 h-20 rounded-md object-cover shrink-0"
      />
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <h3 className="font-semibold text-sm text-gray-900 truncate">
          {item.title}
        </h3>
        <p className="text-xs text-gray-500 truncate">{item.singer}</p>
        <p className="text-sm font-bold text-gray-900">${item.price}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => decrease(item.id)}
          className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm flex items-center justify-center transition-colors"
        >
          -
        </button>
        <span className="w-5 text-center text-sm font-semibold text-gray-900">
          {item.amount}
        </span>
        <button
          onClick={() => increase(item.id)}
          className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm flex items-center justify-center transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );
};

export default CartCard;

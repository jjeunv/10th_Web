import { useDispatch, useSelector } from "react-redux";
import { type AppDispatch, type RootState } from "../../../app/store";
import { closeModal, openModal } from "./modalSlice";

const useModal = () => {
  const dispatch = useDispatch<AppDispatch>();
  const isOpen = useSelector((state: RootState) => state.modal.isOpen);

  return {
    isOpen,
    openModal: () => dispatch(openModal()),
    closeModal: () => dispatch(closeModal()),
  };
};

export default useModal;

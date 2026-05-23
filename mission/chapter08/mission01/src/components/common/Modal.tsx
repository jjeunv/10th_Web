import { createPortal } from "react-dom";

const Modal = ({ children }: { children: React.ReactNode }) => {
  return createPortal(children, document.body);
};

export default Modal;

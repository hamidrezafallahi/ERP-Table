import { useState } from "react";

export const useModalState = () => {
  const [modals, setModals] = useState({
    form: false,
    deleteDrawer: false,
    deleteModal: false,
    attachment: false,
    dynamic: false,
    credit: false,
  });
  const toggleModal = (key: keyof typeof modals, value: boolean) =>
    setModals((prev) => ({ ...prev, [key]: value }));
  return { modals, setModals, toggleModal };
};

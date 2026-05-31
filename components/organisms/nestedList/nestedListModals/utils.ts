export const toggleModal = (setStates: any, key: string, value: boolean) => {
  setStates.setModals((prev: any) => ({ ...prev, [key]: value }));
};

export const handleUpdateTitle = (setStates: any, newTitle: string) => {
  setStates.setSelection((prev: any) => ({ ...prev, title: newTitle }));
};

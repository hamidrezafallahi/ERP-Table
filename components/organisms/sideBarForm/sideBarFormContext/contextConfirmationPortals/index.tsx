import { CustomModal } from "@components/atoms/defaultElements";
import { CustomDrawer } from "@components/atoms/defaultElements/drawer";
import Confirmation from "@components/molecules/confirmation";
import { Dispatch, SetStateAction } from "react";

interface ContextConfirmationPortalsProps {
  isConfirmModalOpen: boolean;
  selectedId: number;
  handleConfirmation: () => Promise<void>;
  triggerIsLoading: boolean;
  isConfirmDrawerOpen: boolean;
  setIsConfirmDrawerOpen: Dispatch<SetStateAction<boolean>>;
  setIsConfirmModalOpen: Dispatch<SetStateAction<boolean>>;
}

export function ContextConfirmationPortals(
  props: ContextConfirmationPortalsProps,
) {
  const {
    isConfirmModalOpen,
    setIsConfirmModalOpen,
    selectedId,
    handleConfirmation,
    triggerIsLoading,
    isConfirmDrawerOpen,
    setIsConfirmDrawerOpen,
  } = props;

  return (
    <>
      {isConfirmModalOpen && (
        <CustomModal
          width={300}
          disableTitle
          centered
          closeModal={() => setIsConfirmModalOpen(false)}
          isModalOpen={isConfirmModalOpen}
          content={
            <Confirmation
              itemsToConfirm={selectedId}
              onCancel={() => setIsConfirmModalOpen(false)}
              onConfirm={handleConfirmation}
              onLoading={triggerIsLoading}
            />
          }
        />
      )}
      <CustomDrawer
        isOpen={isConfirmDrawerOpen}
        onClose={() => setIsConfirmDrawerOpen(false)}
        content={
          <Confirmation
            itemsToConfirm={selectedId}
            onCancel={() => setIsConfirmDrawerOpen(false)}
            onConfirm={handleConfirmation}
            onLoading={triggerIsLoading}
          />
        }
      />
    </>
  );
}

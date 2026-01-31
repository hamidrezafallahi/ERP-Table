import React from 'react';

import { UITableController } from '../adapters/ui/UITableController';

interface AddNewRowButtonProps {
  controller: UITableController;
}

export const AddNewRowButton: React.FC<AddNewRowButtonProps> = ({
  controller,
}) => {
  const handleAddRow = () => {
    void controller.dispatch({type:'ADD_EMPTY_ROW'})
  };

  return (
    <button
      type="button"
      className="w-full"
      onClick={handleAddRow}
    >
      +
    </button>
  );
};

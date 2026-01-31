import React from "react";

import BaseButton from "./baseButton";
import BomButton from "./BomButton";
import SubmitButton from "./submitButton";

function ProductOptions() {
  return (
    <div className="top-4 left-4 absolute lg:relative flex flex-col items-end gap-3 !w-72">
      <SubmitButton />
      <BomButton />
      <BaseButton />
    </div>
  );
}

export default ProductOptions;

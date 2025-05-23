
import React from "react";
import SplitMethodSelector from "./SplitMethodSelector";
import ValidationAlert from "./ValidationAlert";

interface SplitMethodSelectorContainerProps {
  splitMethod: string;
  setSplitMethod: (method: string) => void;
  validationError: string | null;
}

const SplitMethodSelectorContainer: React.FC<SplitMethodSelectorContainerProps> = ({
  splitMethod,
  setSplitMethod,
  validationError
}) => {
  return (
    <>
      {/* Split Method Selector */}
      <SplitMethodSelector splitMethod={splitMethod} setSplitMethod={setSplitMethod} />
      
      {/* Validation Alert */}
      <ValidationAlert validationError={validationError} />
    </>
  );
};

export default SplitMethodSelectorContainer;


import React from "react";
import SplitMethodSelector from "./SplitMethodSelector";

interface EmptyParticipantsStateProps {
  splitMethod: string;
  setSplitMethod: (method: string) => void;
}

const EmptyParticipantsState: React.FC<EmptyParticipantsStateProps> = ({
  splitMethod,
  setSplitMethod
}) => {
  return (
    <div className="space-y-4">
      <SplitMethodSelector splitMethod={splitMethod} setSplitMethod={setSplitMethod} />
      <div className="text-amber-500 text-center p-4">
        Please add participants to your group to split expenses with.
      </div>
    </div>
  );
};

export default EmptyParticipantsState;

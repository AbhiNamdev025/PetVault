import React from "react";
import { PawPrint } from "lucide-react";
import { ReviewSlider } from "../../../common";

const DaycareReviews = () => {
  return (
    <ReviewSlider
      endpoints={["/daycare", "/caretaker"]}
      icon={<PawPrint size={28} />}
      title="What Our Pet Parents Say"
      subtitle="Live feedback from pet parents who used our daycare and caretaker partners."
      emptyText="No reviews yet. Be the first to leave one."
    />
  );
};

export default DaycareReviews;

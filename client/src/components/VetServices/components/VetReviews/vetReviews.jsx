import React from "react";
import { Dog } from "lucide-react";
import { ReviewSlider } from "../../../common";

const VetReviews = () => {
  return (
    <ReviewSlider
      endpoints={["/doctor", "/hospital"]}
      icon={<Dog size={28} />}
      title="What Our Pet Parents Say"
      subtitle="Real reviews submitted for our veterinary professionals and hospitals."
      emptyText="No vet reviews yet. Be the first to share your experience."
    />
  );
};

export default VetReviews;

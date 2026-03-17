import React from "react";
import { Badge } from "../../../../../../common";

export default function AvailabilityBadge({ availabilityInfo }) {
  return (
    <Badge
      variant="secondary"
      size="sm"
      style={{
        backgroundColor: availabilityInfo.color,
        color: "var(--color-text-inverse)",
      }}
    >
      {availabilityInfo.text}
    </Badge>
  );
}

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import styles from "../profileInfo.module.css";
import { Button } from "../../../../common";
const ExpandableText = ({
  text
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  if (!text) return null;
  const shouldTruncate = text.length > 250 || text.split("\n").length > 5;
  if (!shouldTruncate) {
    return <div className={styles.infoValue}>{text}</div>;
  }
  return <div className={styles.expandableTextWrapper}>
      <div className={isExpanded ? styles.infoValue : styles.infoValueTruncated}>
        {text}
      </div>
      <Button onClick={() => setIsExpanded(!isExpanded)} className={styles.viewMoreButton} variant="ghost" size="md">
        {isExpanded ? <>
            <ChevronUp size={16} />
            View Less
          </> : <>
            <ChevronDown size={16} />
            View More
          </>}
      </Button>
    </div>;
};
export default ExpandableText;

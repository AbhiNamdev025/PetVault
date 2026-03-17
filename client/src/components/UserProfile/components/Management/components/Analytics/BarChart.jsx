import React from "react";
import {
  formatCompactCurrency,
  formatCurrency,
} from "../../../../../Order/Orders/orderUtils";

const BarChart = ({ data, metric = "earnings" }) => {
  if (!data || data.length === 0) return <div>No data available</div>;

  const valueKey = metric;
  const isEarnings = metric === "earnings";

  // Find max value for scaling
  const maxVal = Math.max(...data.map((d) => d[valueKey] || 0));
  const maxSafeVal = maxVal === 0 ? 10 : maxVal; // Prevent division by zero

  const colorGradient = isEarnings
    ? "linear-gradient(to top, var(--color-success), var(--color-success-light))"
    : "linear-gradient(to top, var(--color-info), var(--color-info-light))";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        height: "100%",
        width: "100%",
        paddingTop: "var(--space-lg)",
      }}
    >
      {data.map((item, index) => {
        const val = item[valueKey] || 0;
        const heightPercent = (val / maxSafeVal) * 100;

        return (
          <div
            key={index}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              flex: 1,
              height: "100%",
              justifyContent: "flex-end",
            }}
          >
            <div
              style={{
                width: "60%",
                maxWidth: "var(--size-bar-width)",
                height: `${heightPercent}%`,
                background: colorGradient,
                borderRadius: "6px 6px 0 0",
                minHeight: val > 0 ? "4px" : "0",
                transition: "height 0.5s ease",
                position: "relative",
              }}
              title={`${isEarnings ? "Earnings" : "Appointments"}: ${isEarnings ? formatCurrency(val) : val}`}
            >
              {/* Value Label on top */}
              {heightPercent > 10 && (
                <span
                  style={{
                    position: "absolute",
                    top: "calc(-1 * var(--space-lg))",
                    left: "50%",
                    transform: "translateX(-50%)",
                    fontSize: "var(--font-size-xs)",
                    color: "var(--color-text-tertiary)",
                    fontWeight: "var(--font-weight-bold)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {isEarnings ? formatCompactCurrency(val) : val}
                </span>
              )}
            </div>
            <div
              style={{
                marginTop: "var(--space-xs)",
                fontSize: "var(--font-size-xs)",
                color: "var(--color-text-secondary)",
                fontWeight: "var(--font-weight-medium)",
              }}
            >
              {item.name}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BarChart;

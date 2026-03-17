import React from "react";
import { TrendingUp } from "lucide-react";
import styles from "../adminDashboard.module.css";

const RevenueTrends = ({ dailyRevenue = [], range = "lifetime" }) => {
  const hasData = dailyRevenue.length > 0;
  const maxRevenue = hasData
    ? Math.max(...dailyRevenue.map((d) => d.revenue || 1))
    : 1;

  const getTitle = () => {
    switch (range) {
      case "today":
        return "Today's Revenue Trends";
      case "week":
        return "Revenue Trends (Last 7 Days)";
      case "month":
        return "Revenue Trends (Last 30 Days)";
      default:
        return "Lifetime Revenue Trends";
    }
  };

  return (
    <div className={styles.contentSection}>
      <div className={styles.sectionHeader}>
        <div className={styles.titleWithSub}>
          <h3>{getTitle()}</h3>
        </div>
        <div className={styles.legend}>
          <span className={styles.dotServices}>Services</span>
          <span className={styles.dotProducts}>Products</span>
        </div>
      </div>
      <div
        className={styles.chartContainer}
        style={{
          gap: dailyRevenue.length > 12 ? "var(--space-2)" : "var(--space-6)",
          overflowX: dailyRevenue.length > 7 ? "auto" : "visible", // visible allows better tooltips if it fits
          justifyContent:
            dailyRevenue.length > 7 ? "flex-start" : "space-between",
          paddingBottom:
            dailyRevenue.length > 12 ? "var(--space-6)" : "var(--space-2)",
          width: "100%",
          maxWidth: "100%",
          flexWrap: "nowrap",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {hasData ? (
          dailyRevenue.map((data, i) => {
            const isHighDensity = dailyRevenue.length > 10;
            const barWidth = isHighDensity ? "36px" : "52px";
            const showLabel =
              !isHighDensity || i % Math.floor(dailyRevenue.length / 8) === 0;

            return (
              <div
                key={i}
                className={styles.chartBarWrapper}
                style={{ width: barWidth }}
              >
                <div
                  className={styles.barStack}
                  style={{ width: "100%", maxWidth: "none" }}
                  title={`${data.day}\nServices: ₹${data.services || 0}\nProducts: ₹${data.orders || 0}\nTotal: ₹${data.revenue}`}
                >
                  <div
                    className={styles.barFillProducts}
                    style={{
                      height: `${((data.orders || 0) / maxRevenue) * 100}%`,
                    }}
                  ></div>
                  <div
                    className={styles.barFillServices}
                    style={{
                      height: `${((data.services || 0) / maxRevenue) * 100}%`,
                      bottom: `${((data.orders || 0) / maxRevenue) * 100}%`,
                    }}
                  ></div>
                </div>
                {showLabel && (
                  <span className={styles.barLabel}>{data.day}</span>
                )}
              </div>
            );
          })
        ) : (
          <div className={styles.noData}>
            <TrendingUp size={32} opacity={0.2} />
            <p>Collecting data for analysis...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RevenueTrends;

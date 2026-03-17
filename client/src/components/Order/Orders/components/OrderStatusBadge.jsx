import React from "react";
import {
  CheckCircle2,
  Clock3,
  PackageCheck,
  Truck,
  XCircle,
} from "lucide-react";
import { getOrderStatusMeta } from "../orderUtils";
import { Badge } from "../../../common";

const iconByStatus = {
  pending: Clock3,
  confirmed: CheckCircle2,
  shipped: Truck,
  delivered: PackageCheck,
  cancelled: XCircle,
};

const variantByTone = {
  success: "success-soft",
  info: "info-soft",
  accent: "accent",
  danger: "danger-soft",
  warning: "warning-soft",
};

const OrderStatusBadge = ({ status = "pending", size = "md" }) => {
  const { label, tone } = getOrderStatusMeta(status);
  const Icon = iconByStatus[status] || Clock3;

  return (
    <Badge
      variant={variantByTone[tone] || "warning-soft"}
      size={size}
      icon={<Icon size={size === "sm" ? 12 : 14} />}
    >
      {label}
    </Badge>
  );
};

export default OrderStatusBadge;

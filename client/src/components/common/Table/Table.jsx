import React from "react";
import styles from "./Table.module.css";

const Table = ({
  children,
  className = "",
  striped = false,
  hoverable = false,
  compact = false,
  ...props
}) => {
  const tableClasses = [
    styles.table,
    striped && styles.striped,
    hoverable && styles.hoverable,
    compact && styles.compact,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <table className={tableClasses} {...props}>
      {children}
    </table>
  );
};

export const TableHeader = ({ children, className = "", ...props }) => (
  <thead className={[styles.header, className].filter(Boolean).join(" ")} {...props}>
    {children}
  </thead>
);

export const TableBody = ({ children, className = "", ...props }) => (
  <tbody className={[styles.body, className].filter(Boolean).join(" ")} {...props}>
    {children}
  </tbody>
);

export const TableRow = ({ children, className = "", ...props }) => (
  <tr className={[styles.row, className].filter(Boolean).join(" ")} {...props}>
    {children}
  </tr>
);

export const TableHead = ({ children, className = "", ...props }) => (
  <th className={[styles.headCell, className].filter(Boolean).join(" ")} {...props}>
    {children}
  </th>
);

export const TableCell = ({ children, className = "", ...props }) => (
  <td className={[styles.cell, className].filter(Boolean).join(" ")} {...props}>
    {children}
  </td>
);

Table.Header = TableHeader;
Table.Body = TableBody;
Table.Row = TableRow;
Table.Head = TableHead;
Table.Cell = TableCell;

export default Table;

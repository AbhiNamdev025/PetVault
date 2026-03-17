import React from "react";
import { MoreVertical, RotateCcw, Trash2 } from "lucide-react";
import styles from "../shopDetail.module.css";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Button } from "../../../common";
const ProductsTable = ({
  products = [],
  baseUrl,
  activeMenuId,
  onToggleMenu,
  onView,
  onDelete,
  onRestore
}) => {
  return <div className={styles.tableContainer}>
      <Table className={styles.table}>
        <TableHeader>
          <TableRow>
            <TableHead>Product Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Brand</TableHead>
            <TableHead>Upload Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length > 0 ? products.map(product => <TableRow key={product._id} className={`${styles.clickableRow} ${product.isArchived ? styles.archivedRow : ""}`} onClick={() => onView(product)}>
                <TableCell data-label="Product Name">
                  <div className={styles.productName}>
                    {product.images && product.images[0] && <img src={`${baseUrl}/uploads/products/${product.images[0]}`} alt={product.name} className={styles.productImage} />}
                    <span>{product.name}</span>
                    {product.isArchived && <span className={styles.archivedBadge}>Archived</span>}
                  </div>
                </TableCell>
                <TableCell data-label="Category">
                  <span className={styles.categoryBadge}>
                    {product.category}
                  </span>
                </TableCell>
                <TableCell data-label="Price">₹{product.price}</TableCell>
                <TableCell data-label="Stock">
                  <span className={`${styles.stockBadge} ${product.stock > 0 ? styles.inStock : styles.outOfStock}`}>
                    {product.stock} units
                  </span>
                </TableCell>
                <TableCell data-label="Brand">{product.brand || "N/A"}</TableCell>
                <TableCell data-label="Upload Date">
                  {new Date(product.upload_date).toLocaleDateString()}
                </TableCell>
                <TableCell data-label="Actions">
                  <div className={styles.actionWrapper} onClick={e => e.stopPropagation()}>
                    <Button className={styles.miniAction} onClick={e => {
                e.stopPropagation();
                onToggleMenu(product._id);
              }} variant="primary" size="md">
                      <MoreVertical size={18} />
                    </Button>

                    {activeMenuId === product._id && <div className={styles.miniMenu}>
                        {product.isArchived ? <div onClick={() => onRestore(product)} className={styles.restore}>
                            <RotateCcw size={14} /> Restore
                          </div> : <div onClick={() => onDelete(product)} className={styles.delete}>
                            <Trash2 size={14} /> Archive
                          </div>}
                      </div>}
                  </div>
                </TableCell>
              </TableRow>) : <TableRow>
              <TableCell colSpan="7" className={styles.noData}>
                No products found
              </TableCell>
            </TableRow>}
        </TableBody>
      </Table>
    </div>;
};
export default ProductsTable;

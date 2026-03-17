import React from "react";
import { MoreVertical, RotateCcw, Trash2 } from "lucide-react";
import styles from "../shopDetail.module.css";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Button } from "../../../common";
const PetsTable = ({
  pets = [],
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
            <TableHead>Pet Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Breed</TableHead>
            <TableHead>Age</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Available</TableHead>
            <TableHead>Upload Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pets.length > 0 ? pets.map(pet => <TableRow key={pet._id} className={`${styles.clickableRow} ${pet.isArchived ? styles.archivedRow : ""}`} onClick={() => onView(pet)}>
                <TableCell data-label="Pet Name">
                  <div className={styles.productName}>
                    {pet.images && pet.images[0] && <img src={`${baseUrl}/uploads/pets/${pet.images[0]}`} alt={pet.name} className={styles.productImage} />}
                    <span>{pet.name}</span>
                    {pet.isArchived && <span className={styles.archivedBadge}>Archived</span>}
                  </div>
                </TableCell>
                <TableCell data-label="Type">{pet.type}</TableCell>
                <TableCell data-label="Breed">{pet.breed}</TableCell>
                <TableCell data-label="Age">{pet.age} months</TableCell>
                <TableCell data-label="Price">₹{pet.price}</TableCell>
                <TableCell data-label="Available">
                  <span className={`${styles.availableBadge} ${pet.available ? styles.available : styles.notAvailable}`}>
                    {pet.available ? "Available" : "Not Available"}
                  </span>
                </TableCell>
                <TableCell data-label="Upload Date">
                  {new Date(pet.upload_date).toLocaleDateString()}
                </TableCell>
                <TableCell data-label="Actions">
                  <div className={styles.actionWrapper} onClick={e => e.stopPropagation()}>
                    <Button className={styles.miniAction} onClick={e => {
                e.stopPropagation();
                onToggleMenu(pet._id);
              }} variant="primary" size="md">
                      <MoreVertical size={18} />
                    </Button>

                    {activeMenuId === pet._id && <div className={styles.miniMenu}>
                        {pet.isArchived ? <div onClick={() => onRestore(pet)} className={styles.restore}>
                            <RotateCcw size={14} /> Restore
                          </div> : <div onClick={() => onDelete(pet)} className={styles.delete}>
                            <Trash2 size={14} /> Archive
                          </div>}
                      </div>}
                  </div>
                </TableCell>
              </TableRow>) : <TableRow>
              <TableCell colSpan="8" className={styles.noData}>
                No pets found
              </TableCell>
            </TableRow>}
        </TableBody>
      </Table>
    </div>;
};
export default PetsTable;

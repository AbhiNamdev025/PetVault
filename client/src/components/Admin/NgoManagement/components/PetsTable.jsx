import React from "react";
import { MoreVertical, PawPrint, RotateCcw, Trash2 } from "lucide-react";
import styles from "../ngoDetail.module.css";
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
            <TableHead>Pet Data</TableHead>
            <TableHead>Type/Breed</TableHead>
            <TableHead>Age/Gender</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Uploaded</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pets.length > 0 ? pets.map(pet => <TableRow key={pet._id} className={`${styles.clickableRow} ${pet.isArchived ? styles.archivedRow : ""}`} onClick={() => onView(pet._id)}>
                <TableCell data-label="Pet Data">
                  <div className={styles.productName}>
                    {pet.images?.[0] ? <img src={`${baseUrl}/uploads/pets/${pet.images[0]}`} alt={pet.name} className={styles.productImage} /> : <div className={styles.productImage} style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                        <PawPrint size={20} color="var(--color-border-dark)" />
                      </div>}
                    <span>{pet.name}</span>
                  </div>
                </TableCell>
                <TableCell data-label="Type/Breed">
                  {pet.type} • {pet.breed}
                </TableCell>
                <TableCell data-label="Age/Gender">
                  {pet.age} months • {pet.gender}
                </TableCell>
                <TableCell data-label="Status">
                  {pet.isArchived ? <span className={`${styles.availableBadge} ${styles.notAvailable}`}>
                      Archived
                    </span> : pet.available ? <span className={`${styles.availableBadge} ${styles.available}`}>
                      Available
                    </span> : <span className={`${styles.availableBadge} ${styles.notAvailable}`}>
                      Adopted
                    </span>}
                </TableCell>
                <TableCell data-label="Uploaded">
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
              <TableCell colSpan="6" className={styles.noData}>
                No pets found
              </TableCell>
            </TableRow>}
        </TableBody>
      </Table>
    </div>;
};
export default PetsTable;

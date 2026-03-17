import React from "react";
import { Button, EmptyState } from "../../../../../common";
import styles from "../../myPets.module.css";
const PetEmptyState = ({
  onAdd
}) => {
  return <EmptyState compact className={styles.emptyState} title="No pets added yet" description="You haven't added any pets yet." action={<Button variant="ghost" onClick={onAdd} size="md">
          Add your first pet
        </Button>} />;
};
export default PetEmptyState;

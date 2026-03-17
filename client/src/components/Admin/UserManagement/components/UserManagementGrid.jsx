import React from "react";
import { Users } from "lucide-react";
import UserCard from "./UserCards/userCard";
import styles from "../userManagement.module.css";
import { Button } from "../../../common";
const UserManagementGrid = ({
  filteredUsers,
  onClearFilters,
  onViewDetails,
  onArchive,
  onApprove,
  onReject
}) => {
  if (filteredUsers.length === 0) {
    return <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>
          <Users size={48} />
        </div>
        <h3>No Users Found</h3>
        <p>We couldn't find any users matching your current filters.</p>
        <Button className={styles.resetBtn} onClick={onClearFilters} variant="ghost" size="md">
          Clear Filters
        </Button>
      </div>;
  }
  return <div className={styles.grid}>
      {filteredUsers.map(user => <UserCard key={user._id} user={user} onArchive={(id, e) => onArchive(user, e)} onClick={() => onViewDetails(user)} onApprove={() => onApprove(user)} onReject={() => onReject(user)} />)}
    </div>;
};
export default UserManagementGrid;

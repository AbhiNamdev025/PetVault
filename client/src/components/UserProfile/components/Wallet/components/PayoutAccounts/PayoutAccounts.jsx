import React from "react";
import { MoreVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { Button, Input, Checkbox } from "../../../../../common";
import styles from "./PayoutAccounts.module.css";

const PayoutAccounts = ({
  bankAccounts,
  showAddAccountForm,
  editingAccountId,
  activeAccountMenuId,
  bankForm,
  savingBank,
  onToggleAddAccountForm,
  onToggleAccountMenu,
  onSetDefaultAccount,
  onEditAccount,
  onDeleteAccount,
  onBankFormChange,
  onSaveBankAccount,
}) => {
  return (
    <div className={styles.bankCard}>
      <div className={styles.bankHeader}>
        <h3>Payout Accounts</h3>
        <Button
          variant="ghost"
          size="sm"
          className={styles.addAccountBtn}
          onClick={onToggleAddAccountForm}
        >
          <Plus size={14} />
          {showAddAccountForm
            ? "Hide Form"
            : editingAccountId
              ? "Edit Account"
              : "Add Account"}
        </Button>
      </div>

      {bankAccounts.length === 0 ? (
        <p className={styles.emptyHint}>
          No payout account added yet. Add one account to request withdrawal.
        </p>
      ) : (
        <div className={styles.accountList}>
          {bankAccounts.map((account) => (
            <div key={account._id} className={styles.accountRow}>
              <div>
                <p>
                  {account.bankName} ({account.accountNumberMasked})
                </p>
                <span>
                  {account.accountHolderName} • {account.ifscCode}
                </span>
              </div>
              <div className={styles.accountActions}>
                {account.isDefault && (
                  <span className={styles.defaultTag}>Default</span>
                )}
                <div
                  className={styles.accountActionMenuWrap}
                  onClick={(event) => event.stopPropagation()}
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={styles.accountActionTrigger}
                    onClick={(event) => {
                      event.stopPropagation();
                      onToggleAccountMenu(account._id);
                    }}
                    aria-label="Account actions"
                  >
                    <MoreVertical size={18} />
                  </Button>
                  {activeAccountMenuId === String(account._id) && (
                    <div className={styles.accountActionMenu}>
                      {!account.isDefault && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className={styles.accountActionItem}
                          onClick={() => onSetDefaultAccount(account._id)}
                        >
                          Set Default
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className={styles.accountActionItem}
                        onClick={() => onEditAccount(account)}
                        leftIcon={<Pencil size={14} />}
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className={`${styles.accountActionItem} ${styles.deleteAction}`}
                        onClick={() => onDeleteAccount(account._id)}
                        leftIcon={<Trash2 size={14} />}
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddAccountForm && (
        <div className={styles.accountForm}>
          <div className={styles.formGrid}>
            <Input
              label="Nickname"
              name="nickname"
              value={bankForm.nickname}
              onChange={onBankFormChange}
              placeholder="e.g. Primary HDFC"
              fullWidth
              className={styles.formGroup}
            />
            <Input
              label="Account Holder Name"
              name="accountHolderName"
              value={bankForm.accountHolderName}
              onChange={onBankFormChange}
              placeholder="Enter account holder name"
              fullWidth
              className={styles.formGroup}
            />
            <Input
              label="Bank Name"
              name="bankName"
              value={bankForm.bankName}
              onChange={onBankFormChange}
              placeholder="Enter bank name"
              fullWidth
              className={styles.formGroup}
            />
            <Input
              label="Account Number"
              name="accountNumber"
              value={bankForm.accountNumber}
              onChange={onBankFormChange}
              placeholder={
                editingAccountId
                  ? "Leave blank to keep existing"
                  : "Enter account number"
              }
              fullWidth
              className={styles.formGroup}
            />
            <Input
              label="Confirm Account Number"
              name="confirmAccountNumber"
              value={bankForm.confirmAccountNumber}
              onChange={onBankFormChange}
              placeholder={
                editingAccountId
                  ? "Leave blank to keep existing"
                  : "Confirm account number"
              }
              fullWidth
              className={styles.formGroup}
            />
            <Input
              label="IFSC Code"
              name="ifscCode"
              value={bankForm.ifscCode}
              onChange={onBankFormChange}
              placeholder="e.g. HDFC0001234"
              fullWidth
              className={styles.formGroup}
            />
            <Input
              label="Branch Name"
              name="branchName"
              value={bankForm.branchName}
              onChange={onBankFormChange}
              placeholder="Optional branch name"
              fullWidth
              className={styles.formGroup}
            />
            <Input
              label="UPI ID"
              name="upiId"
              value={bankForm.upiId}
              onChange={onBankFormChange}
              placeholder="Optional UPI ID"
              fullWidth
              className={styles.formGroup}
            />
          </div>
          <div className={styles.checkboxLine}>
            <Checkbox
              name="isDefault"
              checked={bankForm.isDefault}
              onChange={onBankFormChange}
              label="Set as default payout account"
            />
          </div>
          <div className={styles.formActions}>
            <Button
              onClick={onSaveBankAccount}
              disabled={savingBank}
              variant="primary"
              size="md"
            >
              {savingBank
                ? "Saving..."
                : editingAccountId
                  ? "Update Account"
                  : "Save Account"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayoutAccounts;

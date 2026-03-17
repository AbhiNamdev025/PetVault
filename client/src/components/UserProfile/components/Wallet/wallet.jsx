import React, { useState } from "react";
import styles from "./wallet.module.css";
import useWallet from "../../../../hooks/useWallet";
import WalletHeader from "./components/WalletHeader/WalletHeader";
import WalletStats from "./components/WalletStats/WalletStats";
import EarningsOverview from "./components/EarningsOverview/EarningsOverview";
import PayoutAccounts from "./components/PayoutAccounts/PayoutAccounts";
import WithdrawRequest from "./components/WithdrawRequest/WithdrawRequest";
import WithdrawalRequests from "./components/WithdrawalRequests/WithdrawalRequests";
import WalletActivity from "./components/WalletActivity/WalletActivity";
import useWalletDashboard from "./hooks/useWalletDashboard";
import FilterSidebar from "../../../common/FilterSidebar/FilterSidebar";
import {
  formatCurrency,
  formatDateTime,
  toReadableStatus,
} from "./utils/wallet.utils";

const Wallet = ({ user }) => {
  const [showFilters, setShowFilters] = useState(false);
  const { balance, refresh: refreshBalance } = useWallet();
  const {
    period,
    setPeriod,
    sectionView,
    setSectionView,
    loading,
    isRefreshing,
    ledger,
    providerSummary,
    payoutSummary,
    payoutStatusFilter,
    setPayoutStatusFilter,
    bankAccounts,
    selectedPayoutAccountId,
    setSelectedPayoutAccountId,
    showAddAccountForm,
    editingAccountId,
    activeAccountMenuId,
    setActiveAccountMenuId,
    bankForm,
    savingBank,
    payoutAmount,
    setPayoutAmount,
    payoutNote,
    setPayoutNote,
    requestingPayout,
    isProvider,
    filteredPayoutRequests,
    payoutAccountOptions,
    sectionOptions,
    showProviderOverview,
    showProviderAccounts,
    showProviderWithdraw,
    showProviderRequests,
    showWalletActivity,
    handleRefresh,
    handleBankFormChange,
    handleToggleAddAccountForm,
    handleSaveBankAccount,
    handleEditAccount,
    handleSetDefaultAccount,
    handleDeleteAccount,
    handleCreatePayoutRequest,
    handleCancelPayout,
    periodOptions,
    payoutStatusOptions,
  } = useWalletDashboard({ user, refreshBalance });

  const hasActiveFilters = sectionView !== "all" || period !== "all";

  const filterOptions = [
    {
      id: "sectionView",
      label: "Wallet Section",
      values: sectionOptions.map((o) => ({ id: o.value, label: o.label })),
      clearValue: "all",
    },
    {
      id: "period",
      label: "Time Period",
      values: periodOptions.map((o) => ({ id: o.value, label: o.label })),
      clearValue: "all",
    },
  ];

  return (
    <div className={styles.container}>
      <FilterSidebar
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={{ sectionView, period }}
        setFilters={(newFilters) => {
          if (newFilters.sectionView !== undefined)
            setSectionView(newFilters.sectionView);
          if (newFilters.period !== undefined) setPeriod(newFilters.period);
        }}
        options={filterOptions}
        showSearch={false}
        onReset={() => {
          setSectionView("all");
          setPeriod("all");
        }}
      />
      <WalletHeader
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        setShowFilters={setShowFilters}
        hasActiveFilters={hasActiveFilters}
        onClear={() => {
          setSectionView("all");
          setPeriod("all");
        }}
      />

      <WalletStats
        balance={balance}
        isProvider={isProvider}
        availableToWithdraw={payoutSummary?.payouts?.availableToRequest || 0}
        totalEarnings={providerSummary?.totalEarnings || 0}
        formatCurrency={formatCurrency}
      />

      {isProvider && (
        <div className={styles.providerSection}>
          {showProviderOverview && (
            <EarningsOverview
              providerSummary={providerSummary}
              payoutSummary={payoutSummary}
              providerRole={user?.role}
              formatCurrency={formatCurrency}
            />
          )}

          {showProviderAccounts && (
            <PayoutAccounts
              bankAccounts={bankAccounts}
              showAddAccountForm={showAddAccountForm}
              editingAccountId={editingAccountId}
              activeAccountMenuId={activeAccountMenuId}
              bankForm={bankForm}
              savingBank={savingBank}
              onToggleAddAccountForm={handleToggleAddAccountForm}
              onToggleAccountMenu={(accountId) =>
                setActiveAccountMenuId((prev) =>
                  prev === String(accountId) ? "" : String(accountId),
                )
              }
              onSetDefaultAccount={handleSetDefaultAccount}
              onEditAccount={handleEditAccount}
              onDeleteAccount={handleDeleteAccount}
              onBankFormChange={handleBankFormChange}
              onSaveBankAccount={handleSaveBankAccount}
            />
          )}

          {showProviderWithdraw && (
            <WithdrawRequest
              payoutSummary={payoutSummary}
              selectedPayoutAccountId={selectedPayoutAccountId}
              payoutAccountOptions={payoutAccountOptions}
              payoutAmount={payoutAmount}
              payoutNote={payoutNote}
              requestingPayout={requestingPayout}
              hasBankAccounts={bankAccounts.length > 0}
              onSelectPayoutAccount={(event) =>
                setSelectedPayoutAccountId(event.target.value)
              }
              onPayoutAmountChange={(event) =>
                setPayoutAmount(event.target.value)
              }
              onPayoutNoteChange={(event) => setPayoutNote(event.target.value)}
              onCreatePayoutRequest={handleCreatePayoutRequest}
              formatCurrency={formatCurrency}
            />
          )}

          {showProviderRequests && (
            <WithdrawalRequests
              payoutStatusFilter={payoutStatusFilter}
              payoutStatusOptions={payoutStatusOptions}
              filteredPayoutRequests={filteredPayoutRequests}
              onPayoutStatusFilterChange={(event) =>
                setPayoutStatusFilter(event.target.value)
              }
              onCancelPayout={handleCancelPayout}
              formatCurrency={formatCurrency}
              formatDateTime={formatDateTime}
              toReadableStatus={toReadableStatus}
            />
          )}
        </div>
      )}

      {showWalletActivity && (
        <WalletActivity
          loading={loading}
          ledger={ledger}
          formatDateTime={formatDateTime}
          formatCurrency={formatCurrency}
        />
      )}
    </div>
  );
};

export default Wallet;

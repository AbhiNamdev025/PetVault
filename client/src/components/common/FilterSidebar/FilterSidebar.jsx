import React, { useEffect } from "react";
import styles from "./filterSidebar.module.css";
import { X, Search } from "lucide-react";
import { Button, Input, Radio, Checkbox } from "..";

const FilterSidebar = ({
  isOpen,
  onClose,
  filters,
  setFilters,
  options,
  onReset,
  showSearch = true,
  searchMaxLength = 80,
}) => {
  // Lock body scroll while the sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("scroll-locked");
      return () => {
        document.body.classList.remove("scroll-locked");
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;
  const normalizedMaxLength = Math.max(1, Number(searchMaxLength) || 80);
  const normalizedSearchValue = String(filters.search || "").slice(
    0,
    normalizedMaxLength,
  );

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <aside className={styles.sidebar}>
        <div className={styles.header}>
          <h3>Filters</h3>
          <Button
            className={styles.closeBtn}
            onClick={onClose}
            variant="ghost"
            size="sm"
          >
            <X size={20} />
          </Button>
        </div>

        <div className={styles.content}>
          {showSearch && (
            <div className={styles.filterSection}>
              <Input
                placeholder="Search..."
                value={normalizedSearchValue}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    search: String(e.target.value || "").slice(
                      0,
                      normalizedMaxLength,
                    ),
                  })
                }
                icon={<Search size={16} />}
                maxLength={normalizedMaxLength}
                fullWidth
              />
            </div>
          )}

          {options.map((section) => {
            const clearValue = section.clearValue ?? "all";
            const canClear = filters[section.id] !== clearValue;
            const isMultiple = section.multiSelect === true;

            return (
              <div key={section.id} className={styles.filterSection}>
                <div className={styles.sectionHeader}>
                  <label>{section.label}</label>
                  {canClear && (
                    <Button
                      onClick={() =>
                        setFilters({
                          ...filters,
                          [section.id]: clearValue,
                        })
                      }
                      variant="ghost"
                      size="sm"
                    >
                      Clear
                    </Button>
                  )}
                </div>
                <div className={styles.optionsList}>
                  {section.values.map((opt) => {
                    if (isMultiple) {
                      const isChecked = (filters[section.id] || []).includes(
                        opt.id,
                      );
                      return (
                        <Checkbox
                          key={opt.id}
                          label={opt.label}
                          checked={isChecked}
                          onChange={() => {
                            const current = filters[section.id] || [];
                            const next = isChecked
                              ? current.filter((id) => id !== opt.id)
                              : [...current, opt.id];
                            setFilters({
                              ...filters,
                              [section.id]: next,
                            });
                          }}
                          className={styles.optionItem}
                        />
                      );
                    }
                    return (
                      <Radio
                        key={opt.id}
                        label={opt.label}
                        checked={filters[section.id] === opt.id}
                        onChange={() =>
                          setFilters({
                            ...filters,
                            [section.id]: opt.id,
                          })
                        }
                        className={styles.optionItem}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className={styles.resetBtnWrapper}>
          <Button
            className={styles.resetBtn}
            onClick={onReset}
            variant="secondary"
            size="md"
            fullWidth
          >
            Reset All Filters
          </Button>
        </div>
      </aside>
    </>
  );
};

export default FilterSidebar;

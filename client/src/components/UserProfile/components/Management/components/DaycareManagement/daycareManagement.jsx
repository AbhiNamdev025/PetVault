import React, { useEffect, useState } from "react";
import styles from "./daycareManagement.module.css";
import { API_BASE_URL, BASE_URL } from "../../../../../../utils/constants";
import { Plus, Edit, Trash2 } from "lucide-react";
import AddCaretakerModal from "./addCaretakerModal";
import EditCaretakerModal from "./editCaretakerModal";
import toast from "react-hot-toast";
const DaycareManagement = () => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const savedUser = JSON.parse(
    localStorage.getItem("user") || sessionStorage.getItem("user")
  );
  const daycareId = savedUser?._id;

  const [caretakers, setCaretakers] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedCaretaker, setSelectedCaretaker] = useState(null);

  const loadCaretakers = async () => {
    const res = await fetch(`${API_BASE_URL}/daycare/staff/${daycareId}`);
    const data = await res.json();
    setCaretakers(data.caretakers || []);
  };

  useEffect(() => {
    loadCaretakers();
  }, []);

  const deleteCaretaker = async (id) => {
    if (!window.confirm("Delete caretaker?")) return;

    const res = await fetch(`${API_BASE_URL}/caretaker/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      toast.success("Caretaker removed");
      loadCaretakers();
    } else toast.error("Failed");
  };

  return (
    <div className={styles.container}>
      <div className={styles.topRow}>
        <h2 className={styles.title}>Manage Caretakers</h2>

        <button className={styles.addBtn} onClick={() => setShowAdd(true)}>
          <Plus size={16} /> Add Caretaker
        </button>
      </div>

      <div className={styles.grid}>
        {caretakers.map((c) => (
          <div className={styles.card} key={c._id}>
            <img
              src={
                c.avatar
                  ? `${BASE_URL}/uploads/avatars/${c.avatar}`
                  : "https://cdn-icons-png.flaticon.com/512/1946/1946429.png"
              }
              className={styles.avatar}
            />

            <h3 className={styles.name}>{c.name}</h3>
            <p className={styles.specialization}>
              {c.roleData?.staffSpecialization}
            </p>
            <p className={styles.experience}>
              {c.roleData?.staffExperience} yrs
            </p>

            <div className={styles.actions}>
              <button
                className={styles.editBtn}
                onClick={() => {
                  setSelectedCaretaker(c);
                  setShowEdit(true);
                }}
              >
                <Edit size={16} />
              </button>

              <button
                className={styles.delBtn}
                onClick={() => deleteCaretaker(c._id)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <AddCaretakerModal
          daycareId={daycareId}
          onClose={() => setShowAdd(false)}
          onAdded={loadCaretakers}
        />
      )}

      {showEdit && selectedCaretaker && (
        <EditCaretakerModal
          caretaker={selectedCaretaker}
          onClose={() => setShowEdit(false)}
          onUpdated={loadCaretakers}
        />
      )}
    </div>
  );
};

export default DaycareManagement;

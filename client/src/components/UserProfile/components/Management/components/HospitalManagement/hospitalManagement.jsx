import React, { useEffect, useState } from "react";
import styles from "./hospitalManagement.module.css";
import { API_BASE_URL, BASE_URL } from "../../../../../../utils/constants";
import { Plus, Edit, Trash2 } from "lucide-react";
import AddDoctorModal from "./addDoctorModal";
import EditDoctorModal from "./editDoctorModal";
import toast from "react-hot-toast";
const HospitalManagement = () => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const savedUser = JSON.parse(
    localStorage.getItem("user") || sessionStorage.getItem("user")
  );
  const hospitalId = savedUser?._id;

  const [doctors, setDoctors] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const loadDoctors = async () => {
    const res = await fetch(`${API_BASE_URL}/hospital/doctors/${hospitalId}`);
    const data = await res.json();
    setDoctors(data.doctors || []);
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  const deleteDoctor = async (doctorId) => {
    if (!window.confirm("Delete Doctor?")) return;

    const res = await fetch(`${API_BASE_URL}/doctor/${doctorId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      toast.success("Doctor Removed");
      loadDoctors();
    } else toast.error("Failed");
  };

  return (
    <div className={styles.container}>
      <div className={styles.topRow}>
        <h2 className={styles.title}>Manage Doctors</h2>

        <button className={styles.addBtn} onClick={() => setShowAdd(true)}>
          <Plus size={16} /> Add Doctor
        </button>
      </div>

      <div className={styles.grid}>
        {doctors.map((d) => (
          <div className={styles.card} key={d._id}>
            <div className={styles.cardBody}>
              <img
                src={
                  d.avatar
                    ? `${BASE_URL}/uploads/avatars/${d.avatar}`
                    : "https://cdn-icons-png.flaticon.com/512/387/387561.png"
                }
                className={styles.avatar}
              />

              <h3 className={styles.docName}>{d.roleData?.doctorName}</h3>
              <p className={styles.specialization}>
                {d.roleData?.doctorSpecialization}
              </p>
              <p className={styles.fee}>₹{d.roleData?.consultationFee}</p>
            </div>

            <div className={styles.actions}>
              <button
                className={styles.editBtn}
                onClick={() => {
                  setSelectedDoctor(d);
                  setShowEdit(true);
                }}
              >
                <Edit size={16} />
              </button>

              <button
                className={styles.delBtn}
                onClick={() => deleteDoctor(d._id)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <AddDoctorModal
          hospitalId={hospitalId}
          onClose={() => setShowAdd(false)}
          onAdded={loadDoctors}
        />
      )}

      {showEdit && selectedDoctor && (
        <EditDoctorModal
          doctor={selectedDoctor}
          onClose={() => setShowEdit(false)}
          onUpdated={loadDoctors}
        />
      )}
    </div>
  );
};

export default HospitalManagement;

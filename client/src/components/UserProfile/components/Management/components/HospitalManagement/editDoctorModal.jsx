import React, { useState } from "react";
import styles from "./hospitalManagement.module.css";
import { API_BASE_URL } from "../../../../../../utils/constants";
import toast from "react-hot-toast";
const EditDoctorModal = ({ doctor, onClose, onUpdated }) => {
  const [form, setForm] = useState({
    doctorName: doctor.roleData?.doctorName || "",
    doctorSpecialization: doctor.roleData?.doctorSpecialization || "",
    doctorExperience: doctor.roleData?.doctorExperience || "",
    consultationFee: doctor.roleData?.consultationFee || "",
    doctorCertificates: doctor.roleData?.doctorCertificates || "",
  });

  const [avatar, setAvatar] = useState(null);
  const token = localStorage.getItem("token");

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    const fd = new FormData();

    const roleData = {
      doctorName: form.doctorName,
      doctorSpecialization: form.doctorSpecialization,
      doctorExperience: Number(form.doctorExperience),
      consultationFee: Number(form.consultationFee),
      doctorCertificates: form.doctorCertificates,
      hospitalId: doctor.roleData?.hospitalId,
    };

    fd.append("roleData", JSON.stringify(roleData));
    fd.append("role", "doctor");

    if (avatar) fd.append("avatar", avatar);

    const res = await fetch(`${API_BASE_URL}/doctor/${doctor._id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });

    if (!res.ok) return toast.error("Failed to update");

    toast.success("Doctor Updated");
    onUpdated();
    onClose();
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalBox}>
        <h3>Edit Doctor</h3>

        <label>Name</label>
        <input name="doctorName" value={form.doctorName} onChange={change} />

        <label>Specialization</label>
        <input
          name="doctorSpecialization"
          value={form.doctorSpecialization}
          onChange={change}
        />

        <label>Experience</label>
        <input
          name="doctorExperience"
          value={form.doctorExperience}
          onChange={change}
        />

        <label>Fee</label>
        <input
          name="consultationFee"
          value={form.consultationFee}
          onChange={change}
        />

        <label>Certificates</label>
        <input
          name="doctorCertificates"
          value={form.doctorCertificates}
          onChange={change}
        />

        <label>Update Avatar</label>
        <input type="file" onChange={(e) => setAvatar(e.target.files[0])} />

        <div className={styles.modalActions}>
          <button onClick={submit}>Update</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default EditDoctorModal;

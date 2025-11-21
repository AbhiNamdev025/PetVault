import React, { useState } from "react";
import styles from "./hospitalManagement.module.css";
import { API_BASE_URL } from "../../../../../../utils/constants";
import { toast } from "react-toastify";

const AddDoctorModal = ({ hospitalId, onClose, onAdded }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    doctorName: "",
    doctorSpecialization: "",
    doctorExperience: "",
    consultationFee: "",
    doctorCertificates: "",
  });

  const [avatar, setAvatar] = useState(null);
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    const fd = new FormData();

    fd.append("name", form.name);
    fd.append("email", form.email);
    fd.append("phone", form.phone);
    fd.append("password", form.password);

    const roleData = {
      doctorName: form.doctorName,
      doctorSpecialization: form.doctorSpecialization,
      doctorExperience: Number(form.doctorExperience),
      consultationFee: Number(form.consultationFee),
      doctorCertificates: form.doctorCertificates,
      hospitalId,
    };

    fd.append("roleData", JSON.stringify(roleData));
    fd.append("role", "doctor");

    if (avatar) fd.append("avatar", avatar);

    const res = await fetch(`${API_BASE_URL}/doctor`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });

    if (!res.ok) return toast.error("Failed to add doctor");

    toast.success("Doctor Added Successfully");
    onAdded();
    onClose();
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalBox}>
        <h3>Add Doctor</h3>

        <label>Full Name</label>
        <input name="name" placeholder="Enter name" onChange={change} />

        <label>Email</label>
        <input name="email" placeholder="Enter email" onChange={change} />

        <label>Phone</label>
        <input name="phone" placeholder="Enter phone" onChange={change} />

        <label>Password</label>
        <input name="password" placeholder="Enter password" onChange={change} />

        <label>Doctor Display Name</label>
        <input name="doctorName" placeholder="Enter doctor name" onChange={change} />

        <label>Specialization</label>
        <input name="doctorSpecialization" placeholder="e.g. Cardiologist" onChange={change} />

        <label>Experience (Years)</label>
        <input name="doctorExperience" placeholder="e.g. 5" onChange={change} />

        <label>Consultation Fee</label>
        <input name="consultationFee" placeholder="e.g. 400" onChange={change} />

        <label>Certificates</label>
        <input name="doctorCertificates" placeholder="Enter certificates" onChange={change} />

        <label>Upload Avatar</label>
        <input type="file" onChange={(e) => setAvatar(e.target.files[0])} />

        <div className={styles.modalActions}>
          <button onClick={submit}>Save</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default AddDoctorModal;

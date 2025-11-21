import React, { useState } from "react";
import styles from "./daycareManagement.module.css";
import { API_BASE_URL } from "../../../../../../utils/constants";
import { toast } from "react-toastify";

const EditCaretakerModal = ({ caretaker, onClose, onUpdated }) => {
  const [form, setForm] = useState({
    name: caretaker.name,
    email: caretaker.email,
    phone: caretaker.phone,
    staffSpecialization: caretaker.roleData?.staffSpecialization || "",
    staffExperience: caretaker.roleData?.staffExperience || "",
  });

  const [avatar, setAvatar] = useState(null);
  const token = localStorage.getItem("token");

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    const fd = new FormData();

    fd.append("name", form.name);
    fd.append("email", form.email);
    fd.append("phone", form.phone);
    fd.append(
      "roleData",
      JSON.stringify({
        staffSpecialization: form.staffSpecialization,
        staffExperience: Number(form.staffExperience),
      })
    );

    if (avatar) fd.append("avatar", avatar);

    const res = await fetch(`${API_BASE_URL}/caretaker/${caretaker._id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });

    if (!res.ok) return toast.error("Failed");

    toast.success("Updated");
    onUpdated();
    onClose();
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalBox}>
        <h3>Edit Caretaker</h3>

        <input name="name" value={form.name} onChange={change} />
        <input name="email" value={form.email} onChange={change} />
        <input name="phone" value={form.phone} onChange={change} />
        <input
          name="staffSpecialization"
          value={form.staffSpecialization}
          onChange={change}
        />
        <input
          name="staffExperience"
          value={form.staffExperience}
          onChange={change}
        />
        <input type="file" onChange={(e) => setAvatar(e.target.files[0])} />

        <div className={styles.modalActions}>
          <button onClick={submit}>Update</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default EditCaretakerModal;

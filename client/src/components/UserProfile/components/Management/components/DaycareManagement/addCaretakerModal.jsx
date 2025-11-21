import React, { useState } from "react";
import styles from "./daycareManagement.module.css";
import { API_BASE_URL } from "../../../../../../utils/constants";
import { toast } from "react-toastify";

const AddCaretakerModal = ({ daycareId, onClose, onAdded }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    staffSpecialization: "",
    staffExperience: "",
  });

  const [avatar, setAvatar] = useState(null);
  const token = localStorage.getItem("token");

  const change = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async () => {
    const fd = new FormData();

    fd.append("name", form.name);
    fd.append("email", form.email);
    fd.append("phone", form.phone);
    fd.append("password", form.password);
    fd.append(
      "roleData",
      JSON.stringify({
        staffSpecialization: form.staffSpecialization,
        staffExperience: Number(form.staffExperience),
        daycareId,
      })
    );
    fd.append("role", "caretaker");

    if (avatar) fd.append("avatar", avatar);

    const res = await fetch(`${API_BASE_URL}/caretaker`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });

    if (!res.ok) return toast.error("Failed");

    toast.success("Caretaker Added");
    onAdded();
    onClose();
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalBox}>
        <h3>Add Caretaker</h3>

        <input name="name" placeholder="Full Name" onChange={change} />
        <input name="email" placeholder="Email" onChange={change} />
        <input name="phone" placeholder="Phone" onChange={change} />
        <input name="password" placeholder="Password" onChange={change} />
        <input
          name="staffSpecialization"
          placeholder="Specialization"
          onChange={change}
        />
        <input
          name="staffExperience"
          placeholder="Experience (Years)"
          onChange={change}
        />

        <input type="file" onChange={(e) => setAvatar(e.target.files[0])} />

        <div className={styles.modalActions}>
          <button onClick={submit}>Save</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default AddCaretakerModal;

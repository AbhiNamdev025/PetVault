import React, { useState, useEffect } from "react";
import styles from "./petManagement.module.css";
import { API_BASE_URL } from "../../../../../../utils/constants";
import toast from "react-hot-toast";
const AddPetModal = ({ onClose, onAdded }) => {
  const savedUser = JSON.parse(localStorage.getItem("user"));
  const isNgo = savedUser?.role === "ngo";
  const idKey = isNgo ? "ngoId" : "shopId";
  const accId = savedUser?._id;

  const [form, setForm] = useState({
    name: "",
    type: "",
    breed: "",
    age: "",
    ageUnit: "months",
    gender: "",
    price: "",
    color: "",
    description: "",
    vaccinated: false,
    available: true,
    category: isNgo ? "adoption" : "shop",
    featured: false,
  });

  const [images, setImages] = useState([]);
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "auto");
  }, []);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    const fd = new FormData();
    Object.keys(form).forEach((key) => fd.append(key, form[key]));
    fd.append(idKey, accId);
    images.forEach((img) => fd.append("petImages", img));

    try {
      const res = await fetch(`${API_BASE_URL}/pets/create`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) throw new Error();
      toast.success("Pet added");
      onAdded();
      onClose();
    } catch {
      toast.error("Failed to add");
    }
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalBox}>
        <h3>Add Pet</h3>

        <input name="name" placeholder="Name" onChange={change} />

        <select name="type" onChange={change}>
          <option value="">Select Type</option>
          <option value="dog">Dog</option>
          <option value="cat">Cat</option>
          <option value="bird">Bird</option>
          <option value="rabbit">Rabbit</option>
          <option value="fish">Fish</option>
          <option value="other">Other</option>
        </select>

        <input name="breed" placeholder="Breed" onChange={change} />
        <input name="age" placeholder="Age" onChange={change} />

        <select name="ageUnit" onChange={change}>
          <option value="months">Months</option>
          <option value="years">Years</option>
        </select>

        <select name="gender" onChange={change}>
          <option value="">Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>

        {!isNgo && <input name="price" placeholder="Price" onChange={change} />}

        <input name="color" placeholder="Color" onChange={change} />
        <textarea
          name="description"
          placeholder="Description"
          onChange={change}
        />

        <input
          type="file"
          multiple
          onChange={(e) => setImages([...e.target.files])}
        />

        <div className={styles.modalActions}>
          <button onClick={submit}>Save</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default AddPetModal;

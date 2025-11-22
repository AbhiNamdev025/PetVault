import React, { useState, useEffect } from "react";
import { Plus, Search, Filter, Edit, Trash2, Image } from "lucide-react";
import toast from "react-hot-toast";
import AddServiceModal from "./AddServiceModal/addServiceModal";
import EditServiceModal from "./EditServiceModal/editServiceModal";
import DeleteConfirmationModal from "../DeleteConfirmationModal/deleteConfirmationModal";
import styles from "./serviceManagement.module.css";
import { API_BASE_URL } from "../../../utils/constants";

const ServiceManagement = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/services`);
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      } else {
        toast.error("Failed to fetch services");
      }
    } catch (error) {
      toast.error("Error fetching services");
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = async (formData) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/services`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) {
        toast.success("Service added successfully");
        setShowAddModal(false);
        fetchServices();
      } else {
        const err = await response.json();
        toast.error(err.message || "Failed to add service");
      }
    } catch (error) {
      toast.error("Error adding service");
    }
  };

  const handleEditService = async (id, formData) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/services/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) {
        toast.success("Service updated successfully");
        onSave && onSave(service._id, formData);
        onClose();
      } else {
        const err = await response.json();
        toast.error(err.message || "Failed to update service");
      }
    } catch (error) {
      toast.error("Error updating service");
    }
  };

  const handleDeleteService = async () => {
    if (!serviceToDelete) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/services/${serviceToDelete._id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        toast.success("Service deleted successfully");
        setShowDeleteModal(false);
        fetchServices();
      } else {
        toast.error("Failed to delete service");
      }
    } catch (error) {
      toast.error("Error deleting service");
    }
  };

  const filteredServices = services.filter((service) => {
    const matchesSearch = service.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || service.type === filterType;
    return matchesSearch && matchesType;
  });

  if (loading) return <div className={styles.loading}>Loading services...</div>;

  return (
    <div className={styles.serviceManagement}>
      <div className={styles.header}>
        <div>
          <h1>Services Management</h1>
          <p>Manage veterinary, grooming, and daycare services</p>
        </div>
        <button
          className={styles.addButton}
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={20} />
          Add New Service
        </button>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <Search size={20} />
          <input
            type="text"
            placeholder="Search services by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className={styles.filterBox}>
          <Filter size={20} />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="vet">Vet</option>
            <option value="daycare">Daycare</option>
            <option value="grooming">Grooming</option>
            <option value="training">Training</option>
            <option value="boarding">Boarding</option>
          </select>
        </div>
      </div>

      <div className={styles.servicesGrid}>
        {filteredServices.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No services found</p>
            <button
              className={styles.addButton}
              onClick={() => setShowAddModal(true)}
            >
              <Plus size={20} />
              Add Your First Service
            </button>
          </div>
        ) : (
          filteredServices.map((service) => (
            <div key={service._id} className={styles.serviceCard}>
              <div className={styles.serviceImage}>
                {service.images && service.images.length > 0 ? (
                  <img
                    src={`${API_BASE_URL.replace(
                      "/api",
                      ""
                    )}/uploads/services/${service.images[0]}`}
                    alt={service.name}
                  />
                ) : (
                  <div className={styles.noImage}>
                    <Image size={28} /> No Image
                  </div>
                )}
              </div>

              <div className={styles.serviceInfo}>
                <h3>{service.name}</h3>
                <p className={styles.desc}>{service.description}</p>
                {service.features?.length > 0 && (
                  <ul className={styles.featuresList}>
                    {service.features.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                )}
                <div className={styles.details}>
                  <span className={styles.type}>{service.type}</span>
                  <span>{service.duration} min</span>
                  <span>₹{service.price}</span>
                  <span
                    className={
                      service.available ? styles.available : styles.unavailable
                    }
                  >
                    {service.available ? "Available" : "Unavailable"}
                  </span>
                </div>
                <div className={styles.actions}>
                  <button
                    className={styles.editBtn}
                    onClick={() => {
                      setSelectedService(service);
                      setShowEditModal(true);
                    }}
                  >
                    <Edit size={16} /> Edit
                  </button>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => {
                      setServiceToDelete(service);
                      setShowDeleteModal(true);
                    }}
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showAddModal && (
        <AddServiceModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddService}
        />
      )}
      {showEditModal && selectedService && (
        <EditServiceModal
          service={selectedService}
          onClose={() => {
            setShowEditModal(false);
            setSelectedService(null);
          }}
          onSave={handleEditService}
        />
      )}
      {showDeleteModal && serviceToDelete && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteService}
          itemType="service"
          itemName={serviceToDelete.name}
        />
      )}
    </div>
  );
};

export default ServiceManagement;

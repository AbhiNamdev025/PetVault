import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import ServiceFormModal from "./ServiceFormModal/ServiceFormModal";
import DeleteConfirmationModal from "../DeleteConfirmationModal/deleteConfirmationModal";
import styles from "./serviceManagement.module.css";
import { API_BASE_URL, BASE_URL } from "../../../utils/constants";
import { GridSkeleton } from "../../Skeletons";
import ServiceHeader from "./components/ServiceHeader";
import ServiceGrid from "./components/ServiceGrid";
import FilterSidebar from "../../common/FilterSidebar/FilterSidebar";
import { Pagination } from "../../common";

const SERVICE_TYPE_OPTIONS = [
  { value: "all", label: "All Types" },
  { value: "vet", label: "Vet" },
  { value: "daycare", label: "Daycare" },
  { value: "grooming", label: "Grooming" },
  { value: "training", label: "Training" },
  { value: "boarding", label: "Boarding" },
];

const filterOptions = [
  {
    id: "type",
    label: "Service Type",
    values: SERVICE_TYPE_OPTIONS.map((opt) => ({
      id: opt.value,
      label: opt.label,
    })),
  },
];

const ServiceManagement = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ type: "all" });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

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

  const handleSaveService = async (idOrFormData, maybeFormData) => {
    const isEdit = typeof idOrFormData === "string";
    const id = isEdit ? idOrFormData : null;
    const formData = isEdit ? maybeFormData : idOrFormData;

    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      const endpoint = isEdit
        ? `${API_BASE_URL}/services/${id}`
        : `${API_BASE_URL}/services`;
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) {
        toast.success(`Service ${isEdit ? "updated" : "added"} successfully`);
        setShowFormModal(false);
        setSelectedService(null);
        fetchServices();
      } else {
        const err = await response.json();
        toast.error(
          err.message || `Failed to ${isEdit ? "update" : "add"} service`,
        );
      }
    } catch (error) {
      toast.error(`Error ${isEdit ? "updating" : "adding"} service`);
    }
  };

  const handleDeleteService = async () => {
    if (!serviceToDelete) return;
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/services/${serviceToDelete._id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
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
    const matchesType = filters.type === "all" || service.type === filters.type;
    return matchesType;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
  const paginatedServices = React.useMemo(() => {
    return filteredServices.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage,
    );
  }, [filteredServices, currentPage, itemsPerPage]);

  if (loading) return <GridSkeleton count={6} />;

  const hasActiveFilters = filters.type !== "all";

  return (
    <div className={styles.serviceManagement}>
      <FilterSidebar
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        setFilters={setFilters}
        options={filterOptions}
        showSearch={false}
        onReset={() =>
          setFilters({
            type: "all",
          })
        }
      />

      <ServiceHeader
        onAdd={() => {
          setSelectedService(null);
          setShowFormModal(true);
        }}
        onShowFilters={() => setShowFilters(true)}
        hasActiveFilters={hasActiveFilters}
      />

      <ServiceGrid
        services={paginatedServices}
        baseUrl={BASE_URL}
        onAdd={() => {
          setSelectedService(null);
          setShowFormModal(true);
        }}
        onEdit={(service) => {
          setSelectedService(service);
          setShowFormModal(true);
        }}
        onDelete={(service) => {
          setServiceToDelete(service);
          setShowDeleteModal(true);
        }}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        showPageInfo={true}
        className={styles.pagination}
      />

      <ServiceFormModal
        isOpen={showFormModal}
        service={selectedService}
        services={services}
        onClose={() => {
          setShowFormModal(false);
          setSelectedService(null);
        }}
        onSave={handleSaveService}
      />

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

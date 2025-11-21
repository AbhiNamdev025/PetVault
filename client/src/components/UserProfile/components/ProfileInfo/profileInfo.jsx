import React, { useState } from "react";
import styles from "./profileInfo.module.css";
import { BASE_URL } from "../../../../utils/constants";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  GraduationCap,
  Briefcase,
  Building,
  Stethoscope,
  ShoppingBag,
  HeartHandshake,
  Star,
  Award,
  IndianRupee,
  BookOpen,
  Languages,
  FileText,
  Truck,
  Shield,
  Users,
  PawPrint,
  Scissors,
  Pill,
  CheckCircle,
  XCircle,
} from "lucide-react";

const ProfileInfo = ({ user }) => {
  const [activeDayTab, setActiveDayTab] = useState(0);

  const getShopTypeLabel = (type) => {
    const types = {
      petStore: "Pet Store",
      groomingCenter: "Grooming Center",
      medicalStore: "Medical Store",
      mixed: "Mixed Store",
    };
    return types[type] || type;
  };

  const getShopTypeIcon = (type) => {
    const icons = {
      petStore: ShoppingBag,
      groomingCenter: Scissors,
      medicalStore: Pill,
      mixed: Building,
    };
    const IconComponent = icons[type] || ShoppingBag;
    return <IconComponent className={styles.labelIcon} />;
  };

  const isAvailable = user?.availability?.available;
  const availability = user?.availability;
  const days = availability?.days || [];

  const renderRoleSpecificInfo = () => {
    const roleData = user?.roleData || {};
    const qualifications = roleData?.doctorQualifications || {};

    switch (user?.role) {
      case "doctor":
        return (
          <div className={styles.roleSection}>
            <h3 className={styles.sectionTitle}>
              <Stethoscope className={styles.titleIcon} />
              Professional Information
            </h3>

            <div className={styles.infoGrid}>
              {roleData.doctorName && (
                <div className={styles.infoCard}>
                  <div className={styles.infoLabel}>
                    <User className={styles.labelIcon} />
                    Doctor Name
                  </div>
                  <div className={styles.infoValue}>{roleData.doctorName}</div>
                </div>
              )}

              {roleData.doctorSpecialization && (
                <div className={styles.infoCard}>
                  <div className={styles.infoLabel}>
                    <GraduationCap className={styles.labelIcon} />
                    Specialization
                  </div>
                  <div className={styles.infoValue}>
                    {roleData.doctorSpecialization}
                  </div>
                </div>
              )}

              {roleData.doctorExperience && (
                <div className={styles.infoCard}>
                  <div className={styles.infoLabel}>
                    <Briefcase className={styles.labelIcon} />
                    Experience
                  </div>
                  <div className={styles.infoValue}>
                    {roleData.doctorExperience} Years
                  </div>
                </div>
              )}

              {roleData.consultationFee && (
                <div className={styles.infoCard}>
                  <div className={styles.infoLabel}>
                    <IndianRupee className={styles.labelIcon} />
                    Consultation Fee
                  </div>
                  <div className={styles.infoValue}>
                    ₹{roleData.consultationFee}
                  </div>
                </div>
              )}

              {roleData.hospitalName && (
                <div className={styles.infoCard}>
                  <div className={styles.infoLabel}>
                    <Building className={styles.labelIcon} />
                    Hospital
                  </div>
                  <div className={styles.infoValue}>
                    {roleData.hospitalName}
                  </div>
                </div>
              )}
            </div>

            {/* Doctor Qualifications */}
            {(qualifications.degree ||
              qualifications.institution ||
              qualifications.yearOfCompletion ||
              qualifications.licenseNumber ||
              qualifications.certifications?.length > 0 ||
              qualifications.skills?.length > 0 ||
              qualifications.languages?.length > 0) && (
              <div className={styles.qualificationsSection}>
                <h4 className={styles.subSectionTitle}>
                  <BookOpen className={styles.titleIcon} />
                  Qualifications & Certifications
                </h4>

                <div className={styles.infoGrid}>
                  {qualifications.degree && (
                    <div className={styles.infoCard}>
                      <div className={styles.infoLabel}>
                        <GraduationCap className={styles.labelIcon} />
                        Degree
                      </div>
                      <div className={styles.infoValue}>
                        {qualifications.degree}
                      </div>
                    </div>
                  )}

                  {qualifications.institution && (
                    <div className={styles.infoCard}>
                      <div className={styles.infoLabel}>
                        <Building className={styles.labelIcon} />
                        Institution
                      </div>
                      <div className={styles.infoValue}>
                        {qualifications.institution}
                      </div>
                    </div>
                  )}

                  {qualifications.yearOfCompletion && (
                    <div className={styles.infoCard}>
                      <div className={styles.infoLabel}>
                        <Calendar className={styles.labelIcon} />
                        Year Completed
                      </div>
                      <div className={styles.infoValue}>
                        {qualifications.yearOfCompletion}
                      </div>
                    </div>
                  )}

                  {qualifications.licenseNumber && (
                    <div className={styles.infoCard}>
                      <div className={styles.infoLabel}>
                        <FileText className={styles.labelIcon} />
                        License Number
                      </div>
                      <div className={styles.infoValue}>
                        {qualifications.licenseNumber}
                      </div>
                    </div>
                  )}

                  {qualifications.certifications?.length > 0 && (
                    <div className={styles.infoCard}>
                      <div className={styles.infoLabel}>
                        <Award className={styles.labelIcon} />
                        Certifications
                      </div>
                      <div className={styles.certificationsList}>
                        {qualifications.certifications.map((cert, index) => (
                          <div key={index} className={styles.certificationItem}>
                            <FileText className={styles.certIcon} />
                            <span>{cert}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {qualifications.skills?.length > 0 && (
                    <div className={styles.infoCard}>
                      <div className={styles.infoLabel}>
                        <Star className={styles.labelIcon} />
                        Skills
                      </div>
                      <div className={styles.servicesList}>
                        {qualifications.skills.map((skill, index) => (
                          <span key={index} className={styles.serviceTag}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {qualifications.languages?.length > 0 && (
                    <div className={styles.infoCard}>
                      <div className={styles.infoLabel}>
                        <Languages className={styles.labelIcon} />
                        Languages
                      </div>
                      <div className={styles.servicesList}>
                        {qualifications.languages.map((lang, index) => (
                          <span key={index} className={styles.serviceTag}>
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );

      case "hospital":
        return (
          <div className={styles.roleSection}>
            <h3 className={styles.sectionTitle}>
              <Building className={styles.titleIcon} />
              Hospital Information
            </h3>

            <div className={styles.infoGrid}>
              {roleData.hospitalName && (
                <div className={styles.infoCard}>
                  <div className={styles.infoLabel}>
                    <Building className={styles.labelIcon} />
                    Hospital Name
                  </div>
                  <div className={styles.infoValue}>
                    {roleData.hospitalName}
                  </div>
                </div>
              )}

              {roleData.hospitalDescription && (
                <div className={styles.infoCard}>
                  <div className={styles.infoLabel}>
                    <FileText className={styles.labelIcon} />
                    Description
                  </div>
                  <div className={styles.infoValue}>
                    {roleData.hospitalDescription}
                  </div>
                </div>
              )}

              {roleData.hospitalServices?.length > 0 && (
                <div className={styles.infoCard}>
                  <div className={styles.infoLabel}>
                    <Stethoscope className={styles.labelIcon} />
                    Services
                  </div>
                  <div className={styles.servicesList}>
                    {roleData.hospitalServices.map((service, index) => (
                      <span key={index} className={styles.serviceTag}>
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case "caretaker":
        return (
          <div className={styles.roleSection}>
            <h3 className={styles.sectionTitle}>
              <Users className={styles.titleIcon} />
              Caretaker Information
            </h3>

            <div className={styles.infoGrid}>
              {roleData.staffSpecialization && (
                <div className={styles.infoCard}>
                  <div className={styles.infoLabel}>
                    <GraduationCap className={styles.labelIcon} />
                    Specialization
                  </div>
                  <div className={styles.infoValue}>
                    {roleData.staffSpecialization}
                  </div>
                </div>
              )}

              {roleData.staffExperience && (
                <div className={styles.infoCard}>
                  <div className={styles.infoLabel}>
                    <Briefcase className={styles.labelIcon} />
                    Experience
                  </div>
                  <div className={styles.infoValue}>
                    {roleData.staffExperience} Years
                  </div>
                </div>
              )}

              {roleData.serviceDescription && (
                <div className={styles.infoCard}>
                  <div className={styles.infoLabel}>
                    <FileText className={styles.labelIcon} />
                    Service Description
                  </div>
                  <div className={styles.infoValue}>
                    {roleData.serviceDescription}
                  </div>
                </div>
              )}

              {roleData.hourlyRate && (
                <div className={styles.infoCard}>
                  <div className={styles.infoLabel}>
                    <IndianRupee className={styles.labelIcon} />
                    Hourly Rate
                  </div>
                  <div className={styles.infoValue}>
                    ₹{roleData.hourlyRate}/hour
                  </div>
                </div>
              )}

              {roleData.serviceType && (
                <div className={styles.infoCard}>
                  <div className={styles.infoLabel}>
                    <Shield className={styles.labelIcon} />
                    Service Type
                  </div>
                  <div className={styles.infoValue}>{roleData.serviceType}</div>
                </div>
              )}
            </div>
          </div>
        );

      case "daycare":
        return (
          <div className={styles.roleSection}>
            <h3 className={styles.sectionTitle}>
              <PawPrint className={styles.titleIcon} />
              Daycare Information
            </h3>

            <div className={styles.infoGrid}>
              {roleData.daycareName && (
                <div className={styles.infoCard}>
                  <div className={styles.infoLabel}>
                    <Building className={styles.labelIcon} />
                    Daycare Name
                  </div>
                  <div className={styles.infoValue}>{roleData.daycareName}</div>
                </div>
              )}

              {roleData.maxPetsAllowed && (
                <div className={styles.infoCard}>
                  <div className={styles.infoLabel}>
                    <Users className={styles.labelIcon} />
                    Max Pets Allowed
                  </div>
                  <div className={styles.infoValue}>
                    {roleData.maxPetsAllowed} pets
                  </div>
                </div>
              )}

              {roleData.daycareDescription && (
                <div className={styles.infoCard}>
                  <div className={styles.infoLabel}>
                    <FileText className={styles.labelIcon} />
                    Description
                  </div>
                  <div className={styles.infoValue}>
                    {roleData.daycareDescription}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case "shop":
        return (
          <div className={styles.roleSection}>
            <h3 className={styles.sectionTitle}>
              <ShoppingBag className={styles.titleIcon} />
              Shop Information
            </h3>

            <div className={styles.infoGrid}>
              {roleData.shopName && (
                <div className={styles.infoCard}>
                  <div className={styles.infoLabel}>
                    <ShoppingBag className={styles.labelIcon} />
                    Shop Name
                  </div>
                  <div className={styles.infoValue}>{roleData.shopName}</div>
                </div>
              )}

              {roleData.shopType && (
                <div className={styles.infoCard}>
                  <div className={styles.infoLabel}>
                    {getShopTypeIcon(roleData.shopType)}
                    Shop Type
                  </div>
                  <div className={styles.infoValue}>
                    {getShopTypeLabel(roleData.shopType)}
                  </div>
                </div>
              )}

              <div className={styles.infoCard}>
                <div className={styles.infoLabel}>
                  <Truck className={styles.labelIcon} />
                  Delivery Available
                </div>
                <div className={styles.infoValue}>
                  {roleData.deliveryAvailable ? (
                    <span className={styles.available}>
                      <CheckCircle className={styles.statusIcon} />
                      Yes
                    </span>
                  ) : (
                    <span className={styles.notAvailable}>
                      <XCircle className={styles.statusIcon} />
                      No
                    </span>
                  )}
                </div>
              </div>

              {roleData.deliveryRadius && (
                <div className={styles.infoCard}>
                  <div className={styles.infoLabel}>
                    <MapPin className={styles.labelIcon} />
                    Delivery Radius
                  </div>
                  <div className={styles.infoValue}>
                    {roleData.deliveryRadius} km
                  </div>
                </div>
              )}

              {roleData.servicesOffered?.length > 0 && (
                <div className={styles.infoCard}>
                  <div className={styles.infoLabel}>
                    <Scissors className={styles.labelIcon} />
                    Services Offered
                  </div>
                  <div className={styles.servicesList}>
                    {roleData.servicesOffered.map((service, index) => (
                      <span key={index} className={styles.serviceTag}>
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case "ngo":
        return (
          <div className={styles.roleSection}>
            <h3 className={styles.sectionTitle}>
              <HeartHandshake className={styles.titleIcon} />
              NGO Information
            </h3>

            <div className={styles.infoGrid}>
              {roleData.ngoName && (
                <div className={styles.infoCard}>
                  <div className={styles.infoLabel}>
                    <Building className={styles.labelIcon} />
                    NGO Name
                  </div>
                  <div className={styles.infoValue}>{roleData.ngoName}</div>
                </div>
              )}

              {roleData.servicesOffered?.length > 0 && (
                <div className={styles.infoCard}>
                  <div className={styles.infoLabel}>
                    <HeartHandshake className={styles.labelIcon} />
                    Services Offered
                  </div>
                  <div className={styles.servicesList}>
                    {roleData.servicesOffered.map((service, index) => (
                      <span key={index} className={styles.serviceTag}>
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.profileHeader}>
        <div className={styles.left}>
          <div className={styles.avatarSection}>
            <div className={styles.avatarWrapper}>
              <img
                src={
                  user?.avatar
                    ? `${BASE_URL}/uploads/avatars/${user.avatar}`
                    : "https://i.pinimg.com/236x/d5/ef/b5/d5efb56c3aff04b52ef374e9ae99eb39.jpg"
                }
                className={styles.avatar}
                alt="avatar"
              />
            </div>
            {isAvailable !== undefined && (
              <div
                className={styles.availabilityBadge}
                style={{
                  background: isAvailable
                    ? "linear-gradient(135deg, #10b981, #34d399)"
                    : "linear-gradient(135deg, #ef4444, #f87171)",
                }}
              >
                {isAvailable ? "Available" : "Not Available"}
              </div>
            )}
          </div>

          <div className={styles.basicInfo}>
            <h2 className={styles.name}>
              <User className={styles.nameIcon} />
              {user?.name}
            </h2>

            <div className={styles.roleBadge}>{user?.role}</div>

            <div className={styles.contactInfo}>
              <div className={styles.contactItem}>
                <Mail className={styles.contactIcon} />
                {user?.email}
              </div>

              <div className={styles.contactItem}>
                <Phone className={styles.contactIcon} />
                {user?.phone || "No phone added"}
              </div>
            </div>
          </div>
        </div>

        {/* ROLE SPECIFIC INFO */}
        <div className={styles.right}>{renderRoleSpecificInfo()}</div>
      </div>

      {/* ADDRESS */}
      <div className={styles.addressSection}>
        <h3 className={styles.sectionTitle}>
          <MapPin className={styles.titleIcon} />
          Address
        </h3>
        <div className={styles.infoCard}>
          <div className={styles.infoLabel}>
            <MapPin className={styles.labelIcon} />
            Location
          </div>
          <div className={styles.infoValue}>
            {user?.address
              ? `${user.address.street || ""}, ${user.address.city || ""}, ${
                  user.address.state || ""
                } ${user.address.zipCode || ""}`
              : "No address added"}
          </div>
        </div>
      </div>

      {/* AVAILABILITY SECTION */}
      {user?.role !== "user" && user?.role !== "admin" && availability && (
        <div className={styles.availabilitySection}>
          <h3 className={styles.sectionTitle}>
            <Calendar className={styles.titleIcon} />
            Availability Schedule
          </h3>

          {days.length > 0 ? (
            <>
              <div className={styles.daysTabs}>
                {days.map((day, index) => (
                  <button
                    key={index}
                    className={styles.dayTab}
                    onClick={() => setActiveDayTab(index)}
                  >
                    {day.substring(0, 3)}
                  </button>
                ))}
              </div>

              {/* SAFE INDEX */}
              {(() => {
                const safeIndex = activeDayTab < days.length ? activeDayTab : 0;

                return (
                  <div className={styles.scheduleGrid}>
                    <div className={styles.infoCard}>
                      <div className={styles.infoLabel}>
                        <Calendar className={styles.labelIcon} />
                        Day
                      </div>
                      <div className={styles.infoValue}>{days[safeIndex]}</div>
                    </div>

                    <div className={styles.infoCard}>
                      <div className={styles.infoLabel}>
                        <Clock className={styles.labelIcon} />
                        Timing
                      </div>
                      <div className={styles.infoValue}>
                        {availability.startTime} - {availability.endTime}
                      </div>
                    </div>

                    {availability.serviceRadius && (
                      <div className={styles.infoCard}>
                        <div className={styles.infoLabel}>
                          <MapPin className={styles.labelIcon} />
                          Service Radius
                        </div>
                        <div className={styles.infoValue}>
                          {availability.serviceRadius} km
                        </div>
                      </div>
                    )}

                    {availability.statusNote && (
                      <div className={styles.infoCard}>
                        <div className={styles.infoLabel}>
                          <Star className={styles.labelIcon} />
                          Note
                        </div>
                        <div className={styles.infoValue}>
                          {availability.statusNote}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </>
          ) : (
            <p className={styles.noSchedule}>No schedule set</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileInfo;

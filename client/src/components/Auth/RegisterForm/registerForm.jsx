import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  UserCog,
  ArrowLeft,
  Upload,
  FileText,
  Store,
  Briefcase,
  Hospital,
} from "lucide-react";
import toast from "react-hot-toast";
import styles from "./registerForm.module.css";
import { API_BASE_URL, ROLE_OPTIONS } from "../../../utils/constants";
import { Input, Button } from "../../common";
const roleOptions = ROLE_OPTIONS.filter((role) =>
  ["user", "hospital", "daycare", "shop", "ngo"].includes(role.id),
);
const RegisterForm = ({
  onSwitchToLogin,
  initialRole,
  onRegistrationSuccess,
  showHeader = true,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: initialRole || "user",
    roleData: {},
    kycDocuments: [],
  });
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const location = useLocation();
  useEffect(() => {
    const roleToSet = initialRole || location.state?.selectedRole;
    if (roleToSet) {
      setFormData((prev) => ({
        ...prev,
        role: roleToSet,
      }));
    }
  }, [location.state, initialRole]);
  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "firstName":
        if (!value.trim()) error = "First name is required";
        else if (value.length > 20) error = "Max 20 characters";
        break;
      case "lastName":
        if (!value.trim()) error = "Last name is required";
        else if (value.length > 20) error = "Max 20 characters";
        break;
      case "email":
        if (!value) error = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(value)) error = "Email is invalid";
        break;
      case "phone":
        if (!value) error = "Phone is required";
        else if (!/^[1-9][0-9]{9}$/.test(value))
          error = "Phone must be 10 digits";
        break;
      case "password":
        if (!value) error = "Password is required";
        else if (value.length < 6) error = "Min 6 characters";
        break;
      case "confirmPassword":
        if (value !== formData.password) error = "Passwords do not match";
        break;
      default:
        break;
    }
    return error;
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Real-time validation
    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };
  const handleRoleDataChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      roleData: {
        ...prev.roleData,
        [name]: value,
      },
    }));
  };
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: Array.from(files),
    }));
  };
  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    else if (formData.firstName.length > 20)
      newErrors.firstName = "Max 20 characters";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    else if (formData.lastName.length > 20)
      newErrors.lastName = "Max 20 characters";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";
    if (!formData.phone) newErrors.phone = "Phone is required";
    else if (!/^[1-9][0-9]{9}$/.test(formData.phone))
      newErrors.phone = "Phone must be 10 digits";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Min 6 characters";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSendOTP = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          phone: formData.phone,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || "OTP sent to your email!");
        setStep(2);
      } else {
        const errorMsg = data.message || "Failed to send OTP";
        setErrors({ email: errorMsg });
        toast.error(errorMsg);
      }
    } catch {
      const errorMsg = "Something went wrong. Please try again.";
      setErrors({ email: errorMsg });
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === 1) {
      handleSendOTP();
      return;
    }
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }
    setIsLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append(
        "name",
        `${formData.firstName} ${formData.lastName}`,
      );
      formDataToSend.append("email", formData.email);
      formDataToSend.append("password", formData.password);
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("role", formData.role);
      formDataToSend.append("otp", otp);

      // Append role specific data
      if (formData.role !== "user") {
        formDataToSend.append("roleData", JSON.stringify(formData.roleData));
        if (formData.kycDocuments && formData.kycDocuments.length > 0) {
          formData.kycDocuments.forEach((file) => {
            formDataToSend.append("kycDocuments", file);
          });
        }
      }
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        body: formDataToSend, // Send FormData object directly (no existing Content-Type header)
      });
      const data = await response.json();
      if (response.ok) {
        toast.success("Account created successfully!");
        if (formData.role === "user") {
          setTimeout(() => {
            onSwitchToLogin();
          }, 750);
        } else {
          // Show success modal for tenants
          if (onRegistrationSuccess) {
            onRegistrationSuccess({
              email: formData.email,
              role: formData.role,
            });
          }
        }
      } else {
        const errorMsg = data.message || "Registration failed!";
        setErrors({ otp: errorMsg });
        toast.error(errorMsg);
      }
    } catch {
      const errorMsg = "Registration failed. Please try again.";
      setErrors({ otp: errorMsg });
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };
  const handleGoogleRegister = () => {
    window.location.href = `${API_BASE_URL}/auth/google?role=${formData.role}`;
  };
  return (
    <div className={styles.registerForm}>
      {showHeader && (
        <div className={styles.formHeader}>
          <h2 className={styles.title}>
            {step === 1 ? "Create Account" : "Verify Email"}
          </h2>
          <p className={styles.subtitle}>
            {step === 1
              ? "Join our pet loving community"
              : `Enter the OTP sent to ${formData.email}`}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        {step === 1 && (
          <>
            <div className={styles.nameRow}>
              <div className={styles.formGroup}>
                <Input
                  label="First Name"
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First name"
                  required
                  maxLength={20}
                  fullWidth
                  icon={<User size={20} />}
                  error={errors.firstName}
                />
              </div>

              <div className={styles.formGroup}>
                <Input
                  label="Last Name"
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last name"
                  required
                  maxLength={20}
                  fullWidth
                  icon={<User size={20} />}
                  error={errors.lastName}
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <Input
                  label="Email Address"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                  fullWidth
                  icon={<Mail size={20} />}
                  error={errors.email}
                />
              </div>

              <div className={styles.formGroup}>
                <Input
                  label="Phone Number"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  required
                  pattern="^[1-9][0-9]{9}$"
                  fullWidth
                  icon={<Phone size={20} />}
                  error={errors.phone}
                />
              </div>
            </div>

            {/* ROLE SELECTOR */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Select Role</label>
              <div className={styles.radioGroup}>
                {roleOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`${styles.radioLabel} ${formData.role === option.value ? styles.radioLabelActive : ""}`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={option.value}
                      checked={formData.role === option.value}
                      onChange={handleChange}
                      className={styles.radioInput}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Role Specific Fields */}
            {formData.role !== "user" && (
              <div className={styles.roleSpecificSection}>
                <h3 className={styles.sectionTitle}>
                  Provider Verification Details
                </h3>

                <div className={styles.roleSpecificGrid}>
                  <div className={styles.formGroup}>
                    <Input
                      label={
                        formData.role === "doctor"
                          ? "Clinic / Practice Name"
                          : formData.role === "hospital"
                            ? "Hospital Name"
                            : formData.role === "shop"
                              ? "Shop Name"
                              : formData.role === "daycare"
                                ? "Daycare Name"
                                : formData.role === "caretaker"
                                  ? "Service / Entity Name"
                                  : "Business / Entity Name"
                      }
                      type="text"
                      name="entityName"
                      value={formData.roleData.entityName || ""}
                      onChange={handleRoleDataChange}
                      placeholder={`Enter the name of your ${formData.role}`}
                      required={formData.role !== "caretaker"}
                      fullWidth
                      icon={
                        formData.role === "shop" ? (
                          <Store size={20} />
                        ) : formData.role === "hospital" ? (
                          <Hospital size={20} />
                        ) : (
                          <Briefcase size={20} />
                        )
                      }
                      error={errors.entityName}
                    />
                  </div>

                  <div className={styles.kycSection}>
                    <label className={styles.fileInputLabel}>
                      Verification Documents
                    </label>
                    <div className={styles.uploadArea}>
                      <input
                        type="file"
                        id="kyc-upload"
                        name="kycDocuments"
                        multiple
                        onChange={handleFileChange}
                        className={styles.hiddenInput}
                        accept="image/*,application/pdf"
                      />
                      <label
                        htmlFor="kyc-upload"
                        className={styles.uploadTrigger}
                      >
                        <div className={styles.uploadText}>
                          <p className={styles.uploadSub}>Upload ID Proof</p>
                        </div>
                      </label>
                    </div>
                    {formData.kycDocuments?.length > 0 && (
                      <div className={styles.fileListPreview}>
                        {Array.from(formData.kycDocuments).map((file, idx) => (
                          <div key={idx} className={styles.fileItem}>
                            <FileText size={14} />
                            <span>{file.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className={styles.passwordRow}>
              <div className={styles.formGroup}>
                <Input
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  required
                  minLength="6"
                  fullWidth
                  icon={<Lock size={20} />}
                  error={errors.password}
                  rightElement={
                    <Button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={styles.passwordToggle}
                      variant="ghost"
                      size="sm"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </Button>
                  }
                />
              </div>

              <div className={styles.formGroup}>
                <Input
                  label="Confirm Password"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  required
                  minLength="6"
                  fullWidth
                  icon={<Lock size={20} />}
                  error={errors.confirmPassword}
                  rightElement={
                    <Button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className={styles.passwordToggle}
                      variant="ghost"
                      size="sm"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </Button>
                  }
                />
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <div className={styles.formGroup}>
            <Button
              type="button"
              onClick={() => setStep(1)}
              className={styles.backButton}
              variant="ghost"
              size="sm"
            >
              <ArrowLeft size={16} /> Back to details
            </Button>
            <Input
              label="Verification Code"
              type="text"
              name="otp"
              value={otp}
              onChange={(e) => {
                if (/^\d*$/.test(e.target.value) && e.target.value.length <= 6)
                  setOtp(e.target.value);
              }}
              placeholder="Enter 6-digit OTP"
              required
              fullWidth
              autoFocus
              icon={<UserCog size={20} />}
              error={errors.otp}
            />
            <p className={styles.otpHelper}>
              Please check your gmail for the verification code.
            </p>
          </div>
        )}

        <Button
          type="submit"
          fullWidth
          isLoading={isLoading}
          className={styles.submitButton}
          variant="primary"
          size="md"
        >
          {step === 1 ? "Sign Up" : "Verify & Create Account"}
        </Button>
      </form>

      <div className={styles.divider}>
        <span>Or continue with</span>
      </div>

      <div className={styles.socialLogin}>
        <Button
          className={styles.socialButton}
          onClick={handleGoogleRegister}
          variant="primary"
          size="md"
        >
          <img
            src="https://www.google.com/favicon.ico"
            alt="Google"
            className={styles.socialIcon}
          />{" "}
          Google
        </Button>
      </div>

      <div className={styles.loginLink}>
        Already have an account?{" "}
        <Button
          type="button"
          className={styles.link}
          onClick={onSwitchToLogin}
          variant="ghost"
          size="sm"
          usePresetStyle={false}
        >
          Sign in
        </Button>
      </div>
    </div>
  );
};
export default RegisterForm;

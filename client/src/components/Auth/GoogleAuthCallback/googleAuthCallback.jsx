import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import styles from "./GoogleAuthCallback.module.css";
import { redirectToAuthHome } from "../../../utils/authModalNavigation";
import { emitAuthStateChanged } from "../../../utils/authState";
import VerificationModal from "../VerificationModal/VerificationModal";

const GoogleAuthCallback = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [verificationData, setVerificationData] = useState(null);

  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const token = params.get("token");
    const name = params.get("name");
    const email = params.get("email");
    let role = params.get("role");
    const id = params.get("id");
    const kycStatus = params.get("kycStatus");
    const error = params.get("error");

    if (error) {
      toast.error("Google login failed. Please try again.");
      redirectToAuthHome(navigate, "login", "/");
      return;
    }

    if (token) {
      const normalizedRole = role ? role.toLowerCase() : "user";

      // If user is a provider and NOT approved, block login and show verification
      if (
        normalizedRole !== "user" &&
        normalizedRole !== "admin" &&
        kycStatus !== "approved"
      ) {
        setVerificationData({
          status: kycStatus || "pending",
          userId: id,
          token: token,
          message:
            kycStatus === "rejected"
              ? "Your verification was rejected."
              : "Your account needs verification before you can log in.",
        });
        return;
      }

      // Traditional successful login
      localStorage.setItem("token", token);
      localStorage.setItem(
        "user",
        JSON.stringify({ _id: id, name, email, role: normalizedRole }),
      );
      emitAuthStateChanged({ status: "logged_in", source: "google_auth" });

      toast.success(`Welcome ${name || "User"}!`);

      if (normalizedRole === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } else {
      toast.error("Google login failed!");
      redirectToAuthHome(navigate, "login", "/");
    }
  }, [params, navigate]);

  const handleCancelVerification = () => {
    toast.error("Verification required to access your account.");
    redirectToAuthHome(navigate, "login", "/");
  };

  const handleResubmitSuccess = () => {
    redirectToAuthHome(navigate, "login", "/");
  };

  return (
    <div className={styles.container}>
      {!verificationData ? (
        <div className={styles.loadingContent}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Completing Google login...</p>
        </div>
      ) : (
        <VerificationModal
          isOpen={true}
          onClose={handleCancelVerification}
          onResubmit={handleResubmitSuccess}
          {...verificationData}
        />
      )}
    </div>
  );
};

export default GoogleAuthCallback;

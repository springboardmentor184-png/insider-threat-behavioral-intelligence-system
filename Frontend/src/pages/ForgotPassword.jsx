import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import {
  forgotPassword,
  verifyOTP,
  resetPassword,
} from "../services/authService";

import "../styles/auth.css";


function ForgotPassword() {

  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");

  const [otp, setOtp] = useState("");

  const [newPassword, setNewPassword] = useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] = useState(false);


  // =====================================================
  // Send OTP
  // =====================================================

  const handleSendOTP = async (e) => {

    e.preventDefault();

    if (!email) {

      toast.error(
        "Please enter your email address."
      );

      return;
    }

    try {

      setLoading(true);

      await forgotPassword(email);

      toast.success(
        "If the email is registered, an OTP has been sent."
      );

      setStep(2);

    } catch (error) {

      toast.error(
        error.response?.data?.detail ||
        "Unable to send OTP."
      );

    } finally {

      setLoading(false);

    }
  };


  // =====================================================
  // Verify OTP
  // =====================================================

  const handleVerifyOTP = async (e) => {

    e.preventDefault();

    if (otp.length !== 6) {

      toast.error(
        "Please enter the 6-digit OTP."
      );

      return;
    }

    try {

      setLoading(true);

      await verifyOTP(
        email,
        otp
      );

      toast.success(
        "OTP verified successfully."
      );

      setStep(3);

    } catch (error) {

      toast.error(
        error.response?.data?.detail ||
        "Invalid or expired OTP."
      );

    } finally {

      setLoading(false);

    }
  };


  // =====================================================
  // Reset Password
  // =====================================================

  const handleResetPassword = async (e) => {

    e.preventDefault();

    if (newPassword !== confirmPassword) {

      toast.error(
        "Passwords do not match."
      );

      return;
    }

    if (newPassword.length < 8) {

      toast.error(
        "Password must contain at least 8 characters."
      );

      return;
    }

    try {

      setLoading(true);

      await resetPassword(
        email,
        otp,
        newPassword
      );

      toast.success(
        "Password reset successfully. Please login."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1000);

    } catch (error) {

      toast.error(
        error.response?.data?.detail ||
        "Failed to reset password."
      );

    } finally {

      setLoading(false);

    }
  };


  return (

    <div className="container-fluid login-page">

      <div className="row min-vh-100">

        <div className="col-lg-6 left-panel d-none d-lg-flex">

          <div className="left-content">

            <div className="logo-circle">

              <i className="bi bi-shield-lock-fill"></i>

            </div>

            <h1 className="project-title">
              AI Insider Threat
            </h1>

            <h3 className="project-subtitle">
              Behavioral Intelligence System
            </h3>

            <p className="project-text">
              Securely recover your account using
              OTP-based password reset.
            </p>

          </div>

        </div>


        <div className="col-lg-6 d-flex justify-content-center align-items-center">

          <div className="login-card shadow-lg">

            <span className="badge bg-primary mb-3 px-3 py-2">

              <i className="bi bi-shield-check me-2"></i>

              Secure Password Recovery

            </span>


            {step === 1 && (

              <>

                <h2 className="mb-2 fw-bold">
                  Forgot Password?
                </h2>

                <p className="text-muted mb-4">
                  Enter your registered email to receive
                  a password reset OTP.
                </p>

                <form onSubmit={handleSendOTP}>

                  <label className="form-label">
                    Email Address
                  </label>

                  <input
                    type="email"
                    className="form-control mb-3"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    required
                  />

                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={loading}
                  >

                    {loading
                      ? "Sending OTP..."
                      : "Send OTP"
                    }

                  </button>

                </form>

              </>

            )}


            {step === 2 && (

              <>

                <h2 className="mb-2 fw-bold">
                  Verify OTP
                </h2>

                <p className="text-muted mb-4">
                  Enter the 6-digit OTP sent to your email.
                </p>

                <form onSubmit={handleVerifyOTP}>

                  <input
                    type="text"
                    className="form-control mb-3 text-center"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    maxLength={6}
                    onChange={(e) =>
                      setOtp(
                        e.target.value.replace(
                          /\D/g,
                          ""
                        )
                      )
                    }
                    required
                  />

                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={loading}
                  >

                    {loading
                      ? "Verifying..."
                      : "Verify OTP"
                    }

                  </button>

                </form>

              </>

            )}


            {step === 3 && (

              <>

                <h2 className="mb-2 fw-bold">
                  Create New Password
                </h2>

                <p className="text-muted mb-4">
                  Set a new secure password for your account.
                </p>

                <form onSubmit={handleResetPassword}>

                  <input
                    type="password"
                    className="form-control mb-3"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) =>
                      setNewPassword(
                        e.target.value
                      )
                    }
                    required
                  />

                  <input
                    type="password"
                    className="form-control mb-3"
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(
                        e.target.value
                      )
                    }
                    required
                  />

                  <small className="text-muted d-block mb-3">
                    Minimum 8 characters with uppercase,
                    lowercase, number and special character.
                  </small>

                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={loading}
                  >

                    {loading
                      ? "Resetting Password..."
                      : "Reset Password"
                    }

                  </button>

                </form>

              </>

            )}


            <div className="text-center mt-4">

              <Link
                to="/login"
                className="register-link"
              >
                ← Back to Login
              </Link>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}


export default ForgotPassword;
import { useEffect, useState } from "react";
import axios from "axios";
import {
  User,
  Mail,
  Shield,
  Calendar,
  Save,
  Lock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import "./Profile.css";

const API_URL = "http://127.0.0.1:8000";

function Profile() {
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    role: "",
    created_at: ""
  });

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: ""
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${API_URL}/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = response.data;

      setProfile({
        full_name:
          data.full_name ||
          data.name ||
          "",
        email: data.email || "",
        role: data.role || "",
        created_at:
          data.created_at || ""
      });
    } catch (err) {
      const storedUser =
        localStorage.getItem("user");

      if (storedUser) {
        try {
          const user =
            JSON.parse(storedUser);

          setProfile({
            full_name:
              user.full_name ||
              user.name ||
              "",
            email:
              user.email || "",
            role:
              user.role || "",
            created_at:
              user.created_at || ""
          });
        } catch {
          setError(
            "Unable to load profile"
          );
        }
      } else {
        setError(
          err.response?.data?.detail ||
            "Unable to load profile"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (
    event
  ) => {
    setProfile({
      ...profile,
      [event.target.name]:
        event.target.value
    });
  };

  const handlePasswordChange = (
    event
  ) => {
    setPasswordData({
      ...passwordData,
      [event.target.name]:
        event.target.value
    });
  };

  const saveProfile = async (
    event
  ) => {
    event.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const token =
        localStorage.getItem(
          "token"
        );

      await axios.put(
        `${API_URL}/auth/profile`,
        {
          full_name:
            profile.full_name
        },
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

      const storedUser =
        localStorage.getItem(
          "user"
        );

      if (storedUser) {
        const user =
          JSON.parse(
            storedUser
          );

        localStorage.setItem(
          "user",
          JSON.stringify({
            ...user,
            full_name:
              profile.full_name
          })
        );
      }

      setMessage(
        "Profile updated successfully"
      );
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (
    event
  ) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (
      !passwordData.current_password ||
      !passwordData.new_password ||
      !passwordData.confirm_password
    ) {
      setError(
        "Please fill all password fields"
      );
      return;
    }

    if (
      passwordData.new_password !==
      passwordData.confirm_password
    ) {
      setError(
        "New passwords do not match"
      );
      return;
    }

    if (
      passwordData.new_password.length <
      6
    ) {
      setError(
        "New password must contain at least 6 characters"
      );
      return;
    }

    try {
      setSaving(true);

      const token =
        localStorage.getItem(
          "token"
        );

      await axios.put(
        `${API_URL}/auth/change-password`,
        {
          current_password:
            passwordData.current_password,

          new_password:
            passwordData.new_password
        },
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: ""
      });

      setMessage(
        "Password changed successfully"
      );
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to change password"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div>
          <h1>
            My Profile
          </h1>

          <p>
            Manage your account information and security
          </p>
        </div>
      </div>

      {message && (
        <div className="profile-message success">
          <CheckCircle size={17} />

          {message}
        </div>
      )}

      {error && (
        <div className="profile-message error">
          <AlertCircle size={17} />

          {error}
        </div>
      )}

      <div className="profile-layout">
        <div className="profile-card profile-overview-card">
          <div className="profile-avatar">
            {profile.full_name
              ? profile.full_name
                  .split(" ")
                  .map(
                    (word) =>
                      word[0]
                  )
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()
              : "U"}
          </div>

          <h2>
            {profile.full_name ||
              "User"}
          </h2>

          <p className="profile-email">
            {profile.email ||
              "No email available"}
          </p>

          <span className="profile-role">
            <Shield size={14} />

            {profile.role ||
              "Security Analyst"}
          </span>

          <div className="profile-overview-details">
            <div>
              <Calendar size={16} />

              <span>
                Account Member
              </span>
            </div>

            <strong>
              {profile.created_at
                ? new Date(
                    profile.created_at
                  ).toLocaleDateString()
                : "Active"}
            </strong>
          </div>
        </div>

        <div className="profile-card">
          <div className="profile-card-heading">
            <div className="profile-card-heading-icon">
              <User size={20} />
            </div>

            <div>
              <h2>
                Personal Information
              </h2>

              <p>
                Update your personal account details
              </p>
            </div>
          </div>

          <form
            className="profile-form"
            onSubmit={
              saveProfile
            }
          >
            <div className="profile-form-group">
              <label>
                Full Name
              </label>

              <div className="profile-input-wrapper">
                <User size={17} />

                <input
                  type="text"
                  name="full_name"
                  value={
                    profile.full_name
                  }
                  onChange={
                    handleProfileChange
                  }
                  required
                />
              </div>
            </div>

            <div className="profile-form-group">
              <label>
                Email Address
              </label>

              <div className="profile-input-wrapper disabled">
                <Mail size={17} />

                <input
                  type="email"
                  value={
                    profile.email
                  }
                  disabled
                />
              </div>

              <small>
                Email address cannot be changed
              </small>
            </div>

            <div className="profile-form-group">
              <label>
                Role
              </label>

              <div className="profile-input-wrapper disabled">
                <Shield size={17} />

                <input
                  type="text"
                  value={
                    profile.role
                  }
                  disabled
                />
              </div>
            </div>

            <button
              className="profile-save-button"
              type="submit"
              disabled={saving}
            >
              <Save size={16} />

              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>
          </form>
        </div>
      </div>

      <div className="profile-card password-card">
        <div className="profile-card-heading">
          <div className="profile-card-heading-icon password">
            <Lock size={20} />
          </div>

          <div>
            <h2>
              Change Password
            </h2>

            <p>
              Keep your account secure with a strong password
            </p>
          </div>
        </div>

        <form
          className="password-form"
          onSubmit={
            changePassword
          }
        >
          <div className="profile-form-group">
            <label>
              Current Password
            </label>

            <input
              type="password"
              name="current_password"
              value={
                passwordData.current_password
              }
              onChange={
                handlePasswordChange
              }
              placeholder="Enter current password"
            />
          </div>

          <div className="profile-form-group">
            <label>
              New Password
            </label>

            <input
              type="password"
              name="new_password"
              value={
                passwordData.new_password
              }
              onChange={
                handlePasswordChange
              }
              placeholder="Enter new password"
            />
          </div>

          <div className="profile-form-group">
            <label>
              Confirm New Password
            </label>

            <input
              type="password"
              name="confirm_password"
              value={
                passwordData.confirm_password
              }
              onChange={
                handlePasswordChange
              }
              placeholder="Confirm new password"
            />
          </div>

          <button
            className="profile-save-button"
            type="submit"
            disabled={saving}
          >
            <Lock size={16} />

            Change Password
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile;
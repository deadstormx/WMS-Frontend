import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./UserSettings.css";
import Adminlogo from "../../../assets/Adminlogo.svg";
import Camera from "../../../assets/Camera.svg";
import LogoutIcon from "../../../assets/Logouticon.svg";
import DeleteIcon from "../../../assets/Delete.svg";
import axios from "axios";

const UserSettings = () => {
  const [isLogoutPopupOpen, setIsLogoutPopupOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [avatar, setAvatar] = useState(Adminlogo);
  const [userInfo, setUserInfo] = useState({ fullName: "", email: "" });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        setUserInfo({
          fullName: parsedUser.fullName || "",
          email: parsedUser.email || "",
        });
        if (parsedUser.avatar?.url && parsedUser.avatar.url !== avatar) {
          setAvatar(parsedUser.avatar.url);
        }
      } catch (err) {
        console.error("Failed to parse user data:", err);
      }
    }
  }, []);

  const handleAvatarChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/upload-avatar",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.avatar?.url) {
        // Update avatar in state
        setAvatar(response.data.avatar.url);

        // Update user data in localStorage
        const user = JSON.parse(localStorage.getItem("user"));
        const updatedUser = {
          ...user,
          avatar: response.data.avatar
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        // Dispatch storage event
        const storageEvent = new StorageEvent('storage', {
          key: 'user',
          newValue: JSON.stringify(updatedUser),
          oldValue: localStorage.getItem('user'),
          storageArea: localStorage
        });
        window.dispatchEvent(storageEvent);
      }
    } catch (error) {
      console.error("Failed to upload avatar:", error);
      alert("Failed to upload avatar. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const closePopups = () => {
    setIsLogoutPopupOpen(false);
    setIsDeletePopupOpen(false);
  };

  const handleUpdateDetails = async () => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;
  
    if (!parsedUser?.id) {
      alert("User session expired. Please login again.");
      window.location.href = '/signin';
      return;
    }

    try {
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/users/update-details", {
        fullName: userInfo.fullName,
        email: userInfo.email
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      // Preserve the user ID when updating localStorage
      const updatedUser = {
        ...parsedUser,  // Keep existing user data including ID
        fullName: userInfo.fullName,
        email: userInfo.email
      };
  
      // Update localStorage
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // Dispatch storage event to notify other components
      const storageEvent = new StorageEvent('storage', {
        key: 'user',
        newValue: JSON.stringify(updatedUser),
        oldValue: storedUser,
        storageArea: localStorage
      });
      window.dispatchEvent(storageEvent);

      alert("Profile updated successfully.");
    } catch (error) {
      console.error("Failed to update details:", error);
      if (error.response?.status === 401) {
        alert("Session expired. Please login again.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = '/signin';
      } else {
        alert("Failed to update profile.");
      }
    }
  };
  

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const token = localStorage.getItem("token");

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/logout", {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      // Clear localStorage and navigate only after API call completes
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Use replace: true to prevent back navigation
      navigate("/signin", { replace: true });
      setIsLoggingOut(false);
    }
  };
  const handleDeleteAccount = async () => {
    const token = localStorage.getItem("token");
    setIsDeleting(true);
  
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/users/delete-account", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      localStorage.clear();
  
      setTimeout(() => {
        navigate("/signin");
      }, 2000);
    } catch (error) {
      console.error("Account deletion failed:", error);
      localStorage.clear();
  
      setTimeout(() => {
        navigate("/signin");
      }, 2000);
    }
  };
  
  return (
    <div className="settings-page">
      <div className={`settings-layout ${isLogoutPopupOpen || isDeletePopupOpen ? "blur-background" : ""}`}>
        <div className="user-settings-container">
          <div className="profile-card">
            <div className="profile-header">
              <div className="avatar-container">
                <img 
                  src={avatar} 
                  alt="User Avatar" 
                  className="avatar"
                  style={{ opacity: isUploading ? 0.5 : 1 }}
                />
                <input
                  type="file"
                  id="avatarInput"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: "none" }}
                  disabled={isUploading}
                />
                <img
                  src={Camera}
                  alt="Change Avatar"
                  className="camera-icon"
                  onClick={() => !isUploading && document.getElementById("avatarInput").click()}
                  style={{ opacity: isUploading ? 0.5 : 1, cursor: isUploading ? 'not-allowed' : 'pointer' }}
                />
                {isUploading && (
                  <div className="upload-overlay">
                    <div className="upload-spinner"></div>
                  </div>
                )}
              </div>
              <div className="profile-info">
                <h2>Profile Settings</h2>
                <p>Update your personal information</p>
              </div>
            </div>

            <div className="profile-form">
              <div className="form-group">
                <label htmlFor="username">Full Name</label>
                <input
                  id="username"
                  type="text"
                  value={userInfo.fullName}
                  onChange={(e) => setUserInfo({ ...userInfo, fullName: e.target.value })}
                  className="input-field"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  value={userInfo.email}
                  onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                  className="input-field"
                />
              </div>

              <button className="save-button" onClick={handleUpdateDetails}>
  Save Changes
</button>


            </div>
          </div>

          <div className="account-actions">
            <h3>Account Actions</h3>
            <button className="action-button logout" onClick={() => setIsLogoutPopupOpen(true)}>
              <img src={LogoutIcon} alt="Logout" className="action-icon" /> Logout
            </button>
            <button className="action-button delete" onClick={() => setIsDeletePopupOpen(true)}>
              <img src={DeleteIcon} alt="Delete" className="action-icon" /> Delete Account
            </button>
          </div>
        </div>
      </div>

      {isLogoutPopupOpen && (
        <div className="popuppp-overlayyy">
          <div className="popup-boxes">
            <p>Are you sure you want to logout?</p>
            <div className="popuppp-buttonss">
              <button className="popupp-confirms" onClick={handleLogout}>Yes</button>
              <button className="popupp-cancels" onClick={closePopups}>
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeletePopupOpen && (
        <div className="popuppp-overlayyy">
          <div className="popup-boxes">
            <p>Are you sure you want to delete your account?</p>
            <div className="popuppp-buttonss">
              <button className="popupp-confirms" onClick={handleDeleteAccount}>Yes</button>
              <button className="popupp-cancels" onClick={closePopups}>
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoggingOut && (
        <div className="logout-overlay">
          <div className="logout-animation">
            <span className="loading-spinner"></span>
            <p>Logging out...</p>
          </div>
        </div>
      )}
      {isDeleting && (
  <div className="logout-overlay">
    <div className="logout-animation">
      <span className="loading-spinner"></span>
      <p>Deleting...</p>
    </div>
  </div>
)}

    </div>
  );
};

export default UserSettings;

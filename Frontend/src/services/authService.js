import api from "./api";


// =====================================================
// Register User
// =====================================================

export const registerUser = (userData) => {
  return api.post(
    "/auth/register",
    userData
  );
};


// =====================================================
// Login User
// =====================================================

export const loginUser = (credentials) => {
  return api.post(
    "/auth/login",
    credentials
  );
};


// =====================================================
// Get Current Logged-In User
// =====================================================

export const getCurrentUser = () => {

  const token = localStorage.getItem(
    "access_token"
  );

  return api.get(
    "/auth/me",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

};


// =====================================================
// Get Current User Role
// =====================================================

export const getUserRole = async () => {

  try {

    const response = await getCurrentUser();

    const user = response.data;

    // Store complete user information
    localStorage.setItem(
      "current_user",
      JSON.stringify(user)
    );

    // Store role separately
    localStorage.setItem(
      "user_role",
      user.role
    );

    return user;

  } catch (error) {

    console.error(
      "Failed to get user role:",
      error
    );

    return null;
  }
};

// =====================================================
// Forgot Password - Send OTP
// =====================================================

export const forgotPassword = (email) => {
  return api.post(
    "/auth/forgot-password",
    {
      email,
    }
  );
};


// =====================================================
// Verify Password Reset OTP
// =====================================================

export const verifyOTP = (email, otp) => {
  return api.post(
    "/auth/verify-otp",
    {
      email,
      otp,
    }
  );
};


// =====================================================
// Reset Password
// =====================================================

export const resetPassword = (
  email,
  otp,
  new_password
) => {
  return api.post(
    "/auth/reset-password",
    {
      email,
      otp,
      new_password,
    }
  );
};


// =====================================================
// Clear Authentication Data
// =====================================================

export const clearAuthData = () => {

  localStorage.removeItem(
    "access_token"
  );

  localStorage.removeItem(
    "current_user"
  );

  localStorage.removeItem(
    "user_role"
  );

};
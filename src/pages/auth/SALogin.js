import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axiosConfig';
import { ToastContainer, toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [resetData, setResetData] = useState({
    email: '',
    token: '',
    password: '',
    password_confirmation: ''
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isSendingResetLink, setIsSendingResetLink] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleResetChange = (e) => {
    setResetData({ ...resetData, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleNewPasswordVisibility = () => setShowNewPassword(!showNewPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  // ✅ Login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await axios.post('/login', formData);
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setIsLoading(false);

      toast.success('Login successful! Redirecting...', { autoClose: 2000 });

      setTimeout(() => {
        navigate('/sinfodeadmin/dashboard');
      }, 2000);

    } catch (err) {
      setIsLoading(false);
      const errorMessage = err.response?.data?.message || 'Invalid credentials';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  // ✅ Forgot Password (Get token from backend)
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsSendingResetLink(true);

    try {
      const response = await axios.post('/forgot-password', {
        email: resetData.email
      });

      setIsSendingResetLink(false);
      setShowForgotPassword(false);

      // 🔑 Save token from backend
      setResetData(prev => ({
        ...prev,
        token: response.data.token // backend should return token
      }));

      toast.success('Password reset link sent! Check your email.');

      setShowResetPassword(true);

    } catch (err) {
      setIsSendingResetLink(false);
      const errorMessage = err.response?.data?.message || 'Error sending reset link';
      toast.error(errorMessage);
    }
  };

  // ✅ Reset Password (auto attach token)
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (resetData.password !== resetData.password_confirmation) {
      toast.error('Passwords do not match!');
      return;
    }

    if (!resetData.token) {
      toast.error('Reset token missing!');
      return;
    }

    setIsResettingPassword(true);

    try {
      await axios.post('/reset-password', resetData);

      setIsResettingPassword(false);
      setShowResetPassword(false);
      setResetData({ email: '', token: '', password: '', password_confirmation: '' });

      toast.success('Password reset successfully! You can now login.');

    } catch (err) {
      setIsResettingPassword(false);
      const errorMessage = err.response?.data?.message || 'Error resetting password';
      toast.error(errorMessage);
    }
  };

  // Eye icon component
  const EyeIcon = ({ show }) => (
    show ? (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
      </svg>
    )
  );

  return (
    <div className="flex min-h-screen">
      {/* Left Side */}
      <div className="hidden md:flex w-1/2 bg-indigo-600 text-white flex-col justify-center items-center p-8">
        <img src="/imag.png" alt="Logo" className="w-[490px] h-[300px] mb-4" />
      </div>

      {/* Right Side */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 p-8 bg-gray-50">
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold text-center mb-6">ADMIN LOGIN</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Email</label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="border border-gray-300 rounded-md w-full p-2"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="border border-gray-300 rounded-md w-full p-2 pr-10"
                  required
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2"
                  onClick={togglePasswordVisibility}>
                  <EyeIcon show={showPassword} />
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <button type="button"
                onClick={() => {
                  setResetData({ email: formData.email, token: '', password: '', password_confirmation: '' });
                  setShowForgotPassword(true);
                }}
                className="text-sm text-indigo-600 hover:underline">
                Forgot Password?
              </button>
            </div>

            {/* Submit */}
            <button type="submit" disabled={isLoading}
              className={`w-full text-white text-lg p-2 rounded-md ${isLoading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-semibold mb-4">Reset Password</h3>
            <form onSubmit={handleForgotPassword}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Email</label>
                <input
                  name="email"
                  type="email"
                  value={resetData.email}
                  onChange={handleResetChange}
                  placeholder="Enter your email"
                  className="border border-gray-300 rounded-md w-full p-2"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setShowForgotPassword(false)}
                  className="px-4 py-2 border rounded-md">Cancel</button>
                <button type="submit" disabled={isSendingResetLink}
                  className={`px-4 py-2 text-white rounded-md ${isSendingResetLink ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                  {isSendingResetLink ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-semibold mb-4">Set New Password</h3>
            <form onSubmit={handleResetPassword}>
              {/* Email (readonly) */}
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Email</label>
                <input
                  name="email"
                  type="email"
                  value={resetData.email}
                  readOnly
                  className="border border-gray-300 rounded-md w-full p-2 bg-gray-100"
                />
              </div>

              {/* New Password */}
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">New Password</label>
                <div className="relative">
                  <input
                    name="password"
                    type={showNewPassword ? "text" : "password"}
                    value={resetData.password}
                    onChange={handleResetChange}
                    placeholder="Enter new password"
                    className="border border-gray-300 rounded-md w-full p-2 pr-10"
                    required
                  />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2"
                    onClick={toggleNewPasswordVisibility}>
                    <EyeIcon show={showNewPassword} />
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="mb-6">
                <label className="block text-gray-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <input
                    name="password_confirmation"
                    type={showConfirmPassword ? "text" : "password"}
                    value={resetData.password_confirmation}
                    onChange={handleResetChange}
                    placeholder="Confirm password"
                    className="border border-gray-300 rounded-md w-full p-2 pr-10"
                    required
                  />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2"
                    onClick={toggleConfirmPasswordVisibility}>
                    <EyeIcon show={showConfirmPassword} />
                  </button>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setShowResetPassword(false)}
                  className="px-4 py-2 border rounded-md">Cancel</button>
                <button type="submit" disabled={isResettingPassword}
                  className={`px-4 py-2 text-white rounded-md ${isResettingPassword ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                  {isResettingPassword ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      <ToastContainer />
    </div>
  );
}

export default Login;

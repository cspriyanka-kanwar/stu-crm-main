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

  const [, setError] = useState('');
  const [, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    try {
      const response = await axios.post('/login', formData);
      const { token, user } = response.data;
      // console.log('Login Successful:', response.data);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setSuccess(true);
      if (user.role === "accountant") {
        navigate("/account/dashboard");
      } else {
        navigate("account/login"); // default
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Invalid credentials';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side */}
      <div className="hidden md:flex w-1/2 bg-indigo-600 text-white flex-col justify-center items-center p-8">
        {/* <h1 className="text-4xl font-bold mb-2">Admin Login</h1> */}

        {/* Logo */}
        <img
          src="/imag.png"
          alt="Logo"
          className="w-[490px] h-[300px] mb-4"
        />

        {/* Heading */}

        {/* Subtitle */}

      </div>

      {/* Right Side - Login Form */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 p-8 bg-gray-50">
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold text-center mb-6">ACCOUNTANT LOGIN</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-gray-700 font-medium mb-1"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="border-gray-300 rounded-md w-full p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-gray-700 font-medium mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="border-gray-300 rounded-md w-full p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
                />
                <button
                  type="submit" className="absolute right-2 top-2 text-gray-500"

                >

                </button>
              </div>
            </div>



            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white text-lg p-2 rounded-md hover:bg-indigo-700 transition"
            >
              Login
            </button>
          </form>


        </div>
      </div>

      {/* Toast */}
      {/* <ToastContainer position="top-right" autoClose={3000} /> */}
    </div>
  );
}

export default Login;

import React, { useState } from "react";
import "./AdminLogin.css";
import Nav from "../Nav";
import { useNavigate } from "react-router-dom";

import user_icon from "../Assets/person.png";
import password_icon from "../Assets/password.png";

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAdminLogin = async () => {
    if (!username || !password) {
      alert("Please enter username and password");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("http://localhost:3000/AdminLogin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await res.json();
      console.log("Admin Login response:", data);

      if (data.success) {
        alert("Admin login successful!");

        // เก็บ token และข้อมูล admin
        if (data.token) {
          localStorage.setItem("authToken", data.token);
          localStorage.setItem("role", data.role); // เก็บ role = "admin"
          localStorage.setItem("username", data.username);
        }

        // ไปหน้า Admin Dashboard
        navigate("/AdminDashboard"); // ⭐ สร้างหน้านี้ต่อ
      } else {
        alert(data.message || "Admin login failed");
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Nav />

      <div className="admin-container">
        <div className="header">
          <div className="text admin-text">Admin Login</div>
          <div className="underline admin-underline"></div>
        </div>

        <div className="inputs">
          {/* Username */}
          <div className="input">
            <img src={user_icon} alt="" />
            <input
              type="text"
              placeholder="Name"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {/* Password */}
          <div className="input">
            <img src={password_icon} alt="" />
            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <div className="submit-container">
          <button
            className="submit admin-submit"
            onClick={handleAdminLogin}
            disabled={loading}
          >
            {loading ? "Please wait..." : "Login as Admin"}
          </button>

          <button
            className="submit gray"
            onClick={() => navigate("/")}
            disabled={loading}
          >
            Back to Customer Login
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;
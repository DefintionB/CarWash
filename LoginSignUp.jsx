import React, { useState } from "react";
import "./LoginSignUp.css";
import Nav from "../Nav";
import { useNavigate } from "react-router-dom";

import user_icon from "../Assets/person.png";
import email_icon from "../Assets/email.png";
import password_icon from "../Assets/password.png";

const LoginSignUp = () => {
  const [action, setAction] = useState("Login"); // Login, Sign Up, Admin Login
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // SIGN UP
  const handleSignUp = async () => {
    if (!name || !email || !password) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("http://localhost:3000/Register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: name,
          password: password,
        }),
      });

      const data = await res.json();
      console.log("Register response:", data);

      if (data.success) {
        alert("Signup successful! Please login.");
        setAction("Login");
        setPassword("");
      } else {
        alert(data.message || "Register failed");
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  
  const handleLogin = async () => {
    if (!name || !password) {
      alert("Please enter username and password");
      return;
    }

    try {
      setLoading(true);

  
      const adminRes = await fetch("http://localhost:3000/AdminLogin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: name,
          password: password,
        }),
      });

      const adminData = await adminRes.json();

      
      if (adminData.success) {
        alert("Admin login successful!");

        localStorage.setItem("authToken", adminData.token);
        localStorage.setItem("role", adminData.role);
        localStorage.setItem("username", adminData.username);

        navigate("/AdminDashboard");
        return;
      }

     
      const userRes = await fetch("http://localhost:3000/Login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: name,
          password: password,
        }),
      });

      const userData = await userRes.json();

    if (userData.success) {
      alert("Login successful!");

      if (userData.token) {
        localStorage.setItem("authToken", userData.token);
        localStorage.setItem("username", name);
      }
      if (userData.customerId) {
        localStorage.setItem("customerId", userData.customerId);
      }

      // Navigate to Rules page first
      navigate("/rule");
    } else {
      alert(userData.message || "Invalid username or password");
    }
  } catch (err) {
    console.error(err);
    alert("Error connecting to server");
  } finally {
    setLoading(false);
  }
};

  const handleSubmit = () => {
    if (action === "Sign Up") {
      handleSignUp();
    } else if (action === "Admin Login") {
      handleAdminLogin();
    } else {
      handleLogin();
    }
  };

  return (
    <>
      <Nav />

      <div className="container">
        <div className="header">
          <div className="text">{action}</div>
          <div className="underline"></div>
        </div>

        {action === "Admin Login" && (
          <div className="admin-notice">
            🛡️ Admin Access Only
          </div>
        )}

        <div className="inputs">
          <div className="input">
            <img src={user_icon} alt="" />
            <input
              type="text"
              placeholder={action === "Admin Login" ? "Admin Username" : "Username"}
              minLength={3}
              maxLength={20}
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

    
          {action === "Sign Up" && (
            <div className="input">
              <img src={email_icon} alt="" />
              <input
                type="email"
                placeholder="Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          )}


          <div className="input">
            <img src={password_icon} alt="" />
            <input
              type="password"
              placeholder="Password"
              minLength={3}
              maxLength={20}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <div className="submit-container">
      
          <button
            className="submit"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Please wait..." : action}
          </button>


          {action !== "Admin Login" && (
            <>
              <button
                className="submit gray"
                onClick={() => {
                  setAction(action === "Sign Up" ? "Login" : "Sign Up");
                  setPassword("");
                }}
                disabled={loading}
              >
                {action === "Sign Up" ? "Login" : "Sign Up"}
              </button>

            </>
          )}
        </div>
      </div>
    </>
  );
};

export default LoginSignUp;
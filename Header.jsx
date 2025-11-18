import React from 'react'
import "./Header.css"
import { useNavigate } from 'react-router-dom'

const Header = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem("username"); // ⭐ ดึง username
  
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("username");
    localStorage.removeItem("customerId"); 
    navigate("/"); 
  }

  return (
    <section className="h-wrapper">
      <div className="flexCenter paddings innerWidth h-container">
        <img src="/public/006.png" alt="logo" width={100} />
        
        <div className="flexCenter h-menu">
          <a href="#service-s">Service</a>
          <a href="#aboutus-s">About Us</a>
          <a href="#contact-s">Contact Us</a>
          <a href="#getstarted-s">GetStarted</a>
          
          <button className="button my-bookings-btn" onClick={() => navigate("/MyBookings")}>
            <a>📋 My Bookings</a>
          </button>

          {username && (
            <span className="username-display">👤 {username}</span>
          )}

          <button className="button" onClick={handleLogout}>
            <a href="">Logout</a>
          </button>
        </div>
      </div>
    </section>
  )
}

export default Header

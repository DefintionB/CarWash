import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") {
      alert("Access denied! Admin only");
      navigate("/AdminLogin");
      return;
    }

    fetchAllBookings();
  }, [navigate]);

  const fetchAllBookings = async () => {
    try {
      const res = await fetch("http://localhost:3000/AdminBookings");
      const data = await res.json();

      if (data.success) {
        setBookings(data.bookings || []);
      } else {
        console.error("Cannot load booking:", data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Cannot connect to the server");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (bookingId, newStatus) => {
    try {
      const res = await fetch(
        `http://localhost:3000/Bookings/${bookingId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await res.json();

      if (data.success) {
        alert(`✅ Update status to: ${newStatus}`);
        fetchAllBookings();
      } else {
        alert("❌ " + (data.message || "Update failed"));
      }
    } catch (err) {
      console.error(err);
      alert("Cannot connect to the server");
    }
  };

  const handleSendWarning = async (bookingId) => {
    const warningMessage = prompt("พิมพ์ข้อความเตือนถึงลูกค้า:");
    
    if (!warningMessage || warningMessage.trim() === "") {
      alert("❌ ยกเลิกการส่งคำเตือน");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:3000/Bookings/${bookingId}/warning`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ warningMessage: warningMessage.trim() }),
        }
      );

      const data = await res.json();

      if (data.success) {
        alert(`✅ ส่งคำเตือนสำเร็จ: "${warningMessage}"`);
        fetchAllBookings();
      } else {
        alert("❌ " + (data.message || "ส่งคำเตือนไม่สำเร็จ"));
      }
    } catch (err) {
      console.error(err);
      alert("Cannot connect to the server");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#f39c12";
      case "verify":
        return "#3498db";
      case "complete":
        return "#27ae60";
      case "cancel":
        return "#e74c3c";
      default:
        return "#95a5a6";
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesFilter = filter === "all" || b.status === filter;
    const matchesSearch =
      b.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.serviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.carPlate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.carModel?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    verify: bookings.filter((b) => b.status === "verify").length,
    complete: bookings.filter((b) => b.status === "complete").length,
    cancel: bookings.filter((b) => b.status === "cancel").length,
   
    revenue: bookings
      .filter((b) => ["verify", "complete", "cancel"].includes(b.status))
      .reduce((sum, b) => {
        if (b.status === "cancel") {
          return sum + (b.finalPrice * 0.9);
        }
        return sum + b.finalPrice;
      }, 0),
  };
     

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="admin-wrapper">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="admin-wrapper">
      <div className="admin-container">
        <header className="admin-header">
          <h1>🛡️ Admin Dashboard</h1>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </header>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">All Booking</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: "#f39c12" }}>
              ⏳
            </div>
            <div className="stat-info">
              <div className="stat-value">{stats.pending}</div>
              <div className="stat-label">Pending</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: "#3498db" }}>
              🔍
            </div>
            <div className="stat-info">
              <div className="stat-value">{stats.verify}</div>
              <div className="stat-label">Verifying</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: "#27ae60" }}>
              ✅
            </div>
            <div className="stat-info">
              <div className="stat-value">{stats.complete}</div>
              <div className="stat-label">Completed</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: "#e74c3c" }}>
              ❌
            </div>
            <div className="stat-info">
              <div className="stat-value">{stats.cancel}</div>
              <div className="stat-label">Canceled</div>
            </div>
          </div>

          <div className="stat-card highlight">
            <div className="stat-icon" style={{ background: "#9b59b6" }}>
              💰
            </div>
            <div className="stat-info">
              <div className="stat-value">
                ฿{stats.revenue.toLocaleString()}
              </div>
              <div className="stat-label">Total Revenue</div>
            </div>
          </div>
        </div>

        <div className="filters-section">
          <input
            type="text"
            placeholder="🔍 Search by ID, Customer, Username, Field..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />

          <div className="filter-tabs">
            <button
              className={filter === "all" ? "active" : ""}
              onClick={() => setFilter("all")}
            >
             All
            </button>
            <button
              className={filter === "pending" ? "active" : ""}
              onClick={() => setFilter("pending")}
            >
              Pending
            </button>
            <button
              className={filter === "verify" ? "active" : ""}
              onClick={() => setFilter("verify")}
            >
              Verifying
            </button>
            <button
              className={filter === "complete" ? "active" : ""}
              onClick={() => setFilter("complete")}
            >
              Completed
            </button>
            <button
              className={filter === "cancel" ? "active" : ""}
              onClick={() => setFilter("cancel")}
            >
              Cancelled
            </button>
          </div>
        </div>

        <div className="bookings-table-wrapper">
          <table className="bookings-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Customer</th>
                <th>Service</th>
                <th>License plate</th>
                <th>Car model</th>
                <th>Date</th>
                <th>Duration</th>
                <th>Price</th>
                <th>Status</th>
                <th>Transfer Info</th>
                <th>Payment Slip</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="12" style={{ textAlign: "center" }}>
                    No bookings found
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => (
                  <tr key={booking._id}>
                    <td>
                      <strong>{booking.bookingId}</strong>
                      {booking.hasWarning && (
                        <div style={{ color: "#e74c3c", fontSize: "0.8rem", marginTop: "0.3rem" }}>
                          ⚠️ มีคำเตือน
                        </div>
                      )}
                    </td>
                    <td>
                      {booking.username || "N/A"}
                      <br />
                      <small style={{ color: "#999" }}>
                        {booking.customerId}
                      </small>
                    </td>
                    <td>{booking.serviceId}</td>
                    <td><strong>{booking.carPlate}</strong></td>
                    <td>{booking.carModel}</td>
                    <td>{booking.date}</td>
                    <td>{booking.timeSlot}</td>
                    <td>
                      <strong>฿{booking.finalPrice.toLocaleString()}</strong>
                      {booking.discount > 0 && (
                        <div style={{ color: "#27ae60", fontSize: "0.85rem" }}>
                          (-฿{booking.discount.toLocaleString()})
                        </div>
                      )}
                    </td>
                    <td>
                      <span
                        className="status-badge-table"
                        style={{ background: getStatusColor(booking.status) }}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td>
                      {booking.transferDate ? (
                        <div className="transfer-info">
                          <div>📅 {booking.transferDate}</div>
                          <div>🕐 {booking.transferTime}</div>
                          <div>💰 ฿{booking.transferAmount?.toLocaleString()}</div>
                        </div>
                      ) : (
                        <span style={{ color: "#999" }}>No Info</span>
                      )}
                    </td>
                    <td>
                      {booking.paymentSlip ? (
                        <div>
                          <a
                            href={`http://localhost:3000${booking.paymentSlip}`}
                            target="_blank"
                            rel="noreferrer"
                            className="view-slip-btn"
                          >
                            View Slip
                          </a>
                          <button
                            className="detail-btn"
                            onClick={() => setSelectedBooking(booking)}
                          >
                            📋
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: "#999" }}>No slip</span>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        {booking.status !== "complete" && (
                          <button
                            className="btn-success"
                            onClick={() =>
                              updateStatus(booking.bookingId, "complete")
                            }
                          >
                            ✓
                          </button>
                        )}
                        {booking.status !== "verify" && (
                          <button
                            className="btn-verify"
                            onClick={() =>
                              updateStatus(booking.bookingId, "verify")
                            }
                          >
                            🔍
                          </button>
                        )}
                        {booking.status === "verify" && (
                          <button
                            className="btn-warning"
                            onClick={() => handleSendWarning(booking.bookingId)}
                          >
                            ⚠️
                          </button>
                        )}
                        {booking.status !== "cancel" && (
                          <button
                            className="btn-cancel"
                            onClick={() =>
                              updateStatus(booking.bookingId, "cancel")
                            }
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedBooking && (
        <div className="modal-overlay" onClick={() => setSelectedBooking(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>📋 Booking Details - {selectedBooking.bookingId}</h3>
            
            {selectedBooking.hasWarning && selectedBooking.warningMessage && (
              <div style={{
                background: "#fff3cd",
                border: "2px solid #ffc107",
                borderRadius: "8px",
                padding: "1rem",
                marginBottom: "1rem"
              }}>
                <strong>⚠️ คำเตือนที่ส่งไป:</strong>
                <p style={{ margin: "0.5rem 0 0 0" }}>{selectedBooking.warningMessage}</p>
              </div>
            )}

            <div className="modal-body">
              <div className="detail-row">
                <span className="detail-label">Customer:</span>
                <span>{selectedBooking.username} ({selectedBooking.customerId})</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Service:</span>
                <span>{selectedBooking.serviceId}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">License plate:</span>
                <span>{selectedBooking.carPlate}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Car model:</span>
                <span>{selectedBooking.carModel}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Date:</span>
                <span>{selectedBooking.date}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Duration:</span>
                <span>{selectedBooking.timeSlot}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Base Price:</span>
                <span>฿{selectedBooking.basePrice.toLocaleString()}</span>
              </div>
              {selectedBooking.discount > 0 && (
                <div className="detail-row">
                  <span className="detail-label">Discount:</span>
                  <span className="discount-text">-฿{selectedBooking.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="detail-row highlight">
                <span className="detail-label">Total:</span>
                <span className="total-text">฿{selectedBooking.finalPrice.toLocaleString()}</span>
              </div>

              <hr />

              <h4>💳 Transfer Information</h4>
              {selectedBooking.transferDate ? (
                <>
                  <div className="detail-row">
                    <span className="detail-label">Transfer Date:</span>
                    <span>{selectedBooking.transferDate}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Transfer Time:</span>
                    <span>{selectedBooking.transferTime}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Transfer Amount:</span>
                    <span>฿{selectedBooking.transferAmount?.toLocaleString()}</span>
                  </div>
                  {selectedBooking.hasBeenEdited && (
                    <div style={{ color: "#95a5a6", fontSize: "0.9rem", marginTop: "0.5rem" }}>
                      ✏️ ลูกค้าได้แก้ไขข้อมูลแล้ว
                    </div>
                  )}
                </>
              ) : (
                <p style={{ color: "#999" }}>No transfer information</p>
              )}

              {selectedBooking.paymentSlip && (
                <div className="slip-preview">
                  <h4>📎 Payment Slip</h4>
                  <img
                    src={`http://localhost:3000${selectedBooking.paymentSlip}`}
                    alt="Payment Slip"
                    style={{ maxWidth: "100%", borderRadius: "10px" }}
                  />
                </div>
              )}
            </div>
            <button className="modal-close" onClick={() => setSelectedBooking(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
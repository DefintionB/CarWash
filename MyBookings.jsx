import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./MyBookings.css";
import Nav from "../Nav";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [editingBooking, setEditingBooking] = useState(null);
  const [editForm, setEditForm] = useState({
    transferDate: "",
    transferTime: "",
    transferAmount: "",
  });
  const [newSlip, setNewSlip] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyBookings();
    const interval = setInterval(fetchMyBookings, 30000);
    return () => clearInterval(interval);
  }, [navigate]);

  const fetchMyBookings = async () => {
    const customerId = localStorage.getItem("customerId");
    if (!customerId) {
      alert("Please wait a second!");
      navigate("/");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:3000/MyBookings/${customerId}`
      );
      const data = await res.json();

      if (data.success) {
        setBookings(data.bookings || []);
      } else {
        console.error("Booking unavailable:", data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Cannot connect to the server");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    const confirmCancel = window.confirm(
      "Do you want to cancel this booking?\n\nYou will receive a 10% discount on your next booking\n(but the service fee will not be refunded)"
    );

    if (!confirmCancel) return;

    const customerId = localStorage.getItem("customerId");

    try {
      const res = await fetch(
        `http://localhost:3000/Bookings/${bookingId}/cancel`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customerId }),
        }
      );

      const data = await res.json();

      if (data.success) {
        alert(data.message);
        fetchMyBookings();
      } else {
        alert("❌ " + (data.message || "Cancellation failed"));
      }
    } catch (err) {
      console.error(err);
      alert("Cannot connect to the server");
    }
  };

  const handleEditBooking = (booking) => {
    if (booking.hasBeenEdited) {
      alert("⚠️ คุณได้แก้ไข booking นี้ไปแล้ว ไม่สามารถแก้ไขอีกได้");
      return;
    }

    setEditingBooking(booking);
    setEditForm({
      transferDate: booking.transferDate || "",
      transferTime: booking.transferTime || "",
      transferAmount: booking.transferAmount?.toString() || "",
    });
    setNewSlip(null);
  };

  const handleUpdateBooking = async () => {
    if (!editForm.transferDate || !editForm.transferTime || !editForm.transferAmount) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    const confirmEdit = window.confirm(
      "⚠️ คำเตือน: คุณสามารถแก้ไข booking นี้ได้เพียงครั้งเดียวเท่านั้น\n\nคุณแน่ใจหรือไม่?"
    );

    if (!confirmEdit) return;

    const customerId = localStorage.getItem("customerId");

    try {
      setIsUploading(true);

      // ถ้ามีการอัปโหลดสลิปใหม่
      if (newSlip) {
        const formData = new FormData();
        formData.append("slip", newSlip);
        formData.append("transferDate", editForm.transferDate);
        formData.append("transferTime", editForm.transferTime);
        formData.append("transferAmount", editForm.transferAmount);
        formData.append("customerId", customerId);

        const res = await fetch(
          `http://localhost:3000/Bookings/${editingBooking.bookingId}/upload-slip-update`,
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await res.json();

        if (data.success) {
          alert("✅ " + data.message);
          setEditingBooking(null);
          fetchMyBookings();
        } else {
          alert("❌ " + (data.message || "Update failed"));
        }
      } else {
        // ถ้าไม่มีสลิปใหม่ แค่อัปเดตข้อมูล
        const res = await fetch(
          `http://localhost:3000/Bookings/${editingBooking.bookingId}/update`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              customerId,
              ...editForm,
            }),
          }
        );

        const data = await res.json();

        if (data.success) {
          alert("✅ " + data.message);
          setEditingBooking(null);
          fetchMyBookings();
        } else {
          alert("❌ " + (data.message || "Update failed"));
        }
      }
    } catch (err) {
      console.error(err);
      alert("Cannot connect to the server");
    } finally {
      setIsUploading(false);
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

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "⏳ Pending";
      case "verify":
        return "🔍 Verifying";
      case "complete":
        return "✅ Completed";
      case "cancel":
        return "❌ Cancelled";
      default:
        return status;
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filter === "all") return true;
    return b.status === filter;
  });

  if (loading) {
    return (
      <>
        <Nav />
        <div className="mybookings-wrapper">
          <div className="loading">Loading...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Nav />
      <div className="mybookings-wrapper">
        <div className="mybookings-container">
          <h1>🚗 My Bookings</h1>

          <div className="filter-tabs">
            <button
              className={filter === "all" ? "active" : ""}
              onClick={() => setFilter("all")}
            >
              All ({bookings.length})
            </button>
            <button
              className={filter === "pending" ? "active" : ""}
              onClick={() => setFilter("pending")}
            >
              Pending ({bookings.filter((b) => b.status === "pending").length})
            </button>
            <button
              className={filter === "verify" ? "active" : ""}
              onClick={() => setFilter("verify")}
            >
              Verifying ({bookings.filter((b) => b.status === "verify").length})
            </button>
            <button
              className={filter === "complete" ? "active" : ""}
              onClick={() => setFilter("complete")}
            >
              Completed (
              {bookings.filter((b) => b.status === "complete").length})
            </button>
            <button
              className={filter === "cancel" ? "active" : ""}
              onClick={() => setFilter("cancel")}
            >
              Cancelled ({bookings.filter((b) => b.status === "cancel").length})
            </button>
          </div>

          {filteredBookings.length === 0 ? (
            <div className="no-bookings">
              <p>No bookings found</p>
              <button onClick={() => navigate("/mainpage")}>
                Book a service now
              </button>
            </div>
          ) : (
            <div className="bookings-grid">
              {filteredBookings.map((booking) => (
                <div key={booking._id} className="booking-card">
                  {booking.hasWarning && booking.warningMessage && (
                    <div className="warning-banner">
                      <strong>⚠️ Admin Notification:</strong>
                      <p>{booking.warningMessage}</p>
                      {!booking.hasBeenEdited && (
                        <button
                          className="edit-btn-small"
                          onClick={() => handleEditBooking(booking)}
                        >
                          ✏️ Edit Info
                        </button>
                      )}
                    </div>
                  )}

                  <div className="card-header">
                    <span className="booking-id">{booking.bookingId}</span>
                    <span
                      className="status-badge"
                      style={{ background: getStatusColor(booking.status) }}
                    >
                      {getStatusText(booking.status)}
                    </span>
                  </div>

                  <div className="card-body">
                    <div className="info-row">
                      <span className="label">🚗 Service:</span>
                      <span className="value">{booking.serviceId}</span>
                    </div>

                    <div className="info-row">
                      <span className="label">🚙 License plate:</span>
                      <span className="value">{booking.carPlate}</span>
                    </div>

                    <div className="info-row">
                      <span className="label">🏎️ Car model:</span>
                      <span className="value">{booking.carModel}</span>
                    </div>

                    <div className="info-row">
                      <span className="label">📅 Date:</span>
                      <span className="value">{booking.date}</span>
                    </div>

                    <div className="info-row">
                      <span className="label">🕐 Duration:</span>
                      <span className="value">{booking.timeSlot}</span>
                    </div>

                    <div className="info-row">
                      <span className="label">💰 Price:</span>
                      <span className="value">
                        ฿{booking.basePrice.toLocaleString()}
                      </span>
                    </div>

                    {booking.discount > 0 && (
                      <div className="info-row discount-row">
                        <span className="label">🎉 Discount:</span>
                        <span className="value discount">
                          -฿{booking.discount.toLocaleString()}
                        </span>
                      </div>
                    )}

                    <div className="info-row total-row">
                      <span className="label">Total:</span>
                      <span className="value total">
                        ฿{booking.finalPrice.toLocaleString()}
                      </span>
                    </div>

                    {booking.transferDate && (
                      <div className="transfer-info-card">
                        <div className="info-row">
                          <span className="label">📅 Transfer Date:</span>
                          <span className="value">{booking.transferDate}</span>
                        </div>
                        <div className="info-row">
                          <span className="label">🕐 Transfer Time:</span>
                          <span className="value">{booking.transferTime}</span>
                        </div>
                        <div className="info-row">
                          <span className="label">💰 Amount:</span>
                          <span className="value">
                            ฿{booking.transferAmount?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}

                    {booking.paymentSlip && (
                      <div className="payment-slip">
                        <span>📎 Payment slip uploaded</span>
                        <a
                          href={`http://localhost:3000${booking.paymentSlip}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View
                        </a>
                      </div>
                    )}

                  
                    {booking.hasBeenEdited && (
                      <div className="edited-badge">
                        ✏️ This has already been edited
                      </div>
                    )}
                  </div>

                  <div className="card-footer">
                    <small>
                      Created: {new Date(booking.createdAt).toLocaleString('th-TH')}
                    </small>

                    {booking.status === "verify" && !booking.hasBeenEdited && (
                      <button
                        className="edit-booking-btn"
                        onClick={() => handleEditBooking(booking)}
                      >
                        ✏️ Edit Payment Info
                      </button>
                    )}
                    
                    {booking.status !== "cancel" && (
                      <button
                        className="cancel-btn"
                        onClick={() => handleCancelBooking(booking.bookingId)}
                      >
                        ❌ Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      
        {editingBooking && (
          <div className="modal-overlay" onClick={() => setEditingBooking(null)}>
            <div className="modal-content edit-modal" onClick={(e) => e.stopPropagation()}>
              <h3>✏️ Edit Payment Info</h3>
              <p className="warning-text">
                ⚠️ You can edit <strong>only 1 time</strong>!
              </p>

              <div className="edit-form">
                <label>
                  📅 Transfer date:
                  <input
                    type="date"
                    value={editForm.transferDate}
                    onChange={(e) =>
                      setEditForm({ ...editForm, transferDate: e.target.value })
                    }
                  />
                </label>

                <label>
                  🕐 Transfer time:
                  <input
                    type="time"
                    value={editForm.transferTime}
                    onChange={(e) =>
                      setEditForm({ ...editForm, transferTime: e.target.value })
                    }
                  />
                </label>

                <label>
                  💰 Amount (บาท):
                  <input
                    type="number"
                    value={editForm.transferAmount}
                    onChange={(e) =>
                      setEditForm({ ...editForm, transferAmount: e.target.value })
                    }
                    min="0"
                    step="0.01"
                  />
                </label>

                <label className="file-upload-label">
                  📎 New slip (ถ้ามี):
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewSlip(e.target.files[0])}
                  />
                </label>

                {newSlip && (
                  <div className="file-selected">✓ {newSlip.name}</div>
                )}
              </div>

              <div className="modal-buttons">
                <button
                  className="save-btn"
                  onClick={handleUpdateBooking}
                  disabled={isUploading}
                >
                  {isUploading ? "Saving" : "💾 Save edit"}
                </button>
                <button
                  className="cancel-modal-btn"
                  onClick={() => setEditingBooking(null)}
                  disabled={isUploading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MyBookings;
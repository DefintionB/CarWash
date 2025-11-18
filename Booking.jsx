import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Booking.css";

const serviceConfig = {
  S001: { name: "S001", detail: "ล้างสี, ดูดฝุ่น", price: 200 },
  S002: { name: "S002", detail: "ล้างสี, ดูดฝุ่น, เคลือบสี", price: 700 },
  S003: { name: "S003", detail: "โปรแกรมฟื้นฟูสภาพรถ ขัดลบรอย เคลือบสี", price: 2500 },
  S004: { name: "S004", detail: "เคลือบแก้ว ราคาเดียวเท่านั้น", price: 8999 },
};

const timeSlots = [
  "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00",
  "17:00", "18:00", "19:00", "20:00",
];

function timeToNumber(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h + m / 60;
}

const Booking = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const service = serviceConfig[serviceId];

  const [customerName, setCustomerName] = useState("");
  const [carPlate, setCarPlate] = useState("");
  const [carModel, setCarModel] = useState("");
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("09:00");

  const [error, setError] = useState("");
  const [bookings, setBookings] = useState([]);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [bookingId, setBookingId] = useState(null);

  const [paymentSlip, setPaymentSlip] = useState(null);
  const [transferDate, setTransferDate] = useState("");
  const [transferTime, setTransferTime] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [existingBookings, setExistingBookings] = useState([]);
  
  // ✅ เปลี่ยนจาก customerDiscount เป็น coupons
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState(null);

  const today = new Date().toISOString().split("T")[0];

  if (!service) {
    return <div style={{ padding: "2rem" }}>Service {serviceId} not found</div>;
  }


  const fetchCustomerCoupons = async () => {
    const customerId = localStorage.getItem("customerId");
    if (!customerId) return;

    try {
      const res = await fetch(`http://localhost:3000/CustomerCoupons/${customerId}`);
      const data = await res.json();
      if (data.success) {

        const validCoupons = data.coupons.filter(c => c.serviceId === serviceId);
        setAvailableCoupons(validCoupons);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCustomerCoupons();
  }, [serviceId]);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!date) return;

      try {
        const res = await fetch(
          `http://localhost:3000/Bookings?serviceId=${serviceId}&date=${date}`
        );
        const data = await res.json();
        if (data.success) {
          setExistingBookings(data.bookings || []);
        } else {
          console.error("Cannot load bookings:", data.message);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchBookings();
  }, [date, serviceId]);

  const isSlotTaken = (timeStr) => {
    return existingBookings.some((b) => b.timeSlot === timeStr);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!customerName || !carPlate || !carModel || !date) {
      setError("Please fill in all required fields");
      return;
    }

    const customerId = localStorage.getItem("customerId");
    if (!customerId) {
      setError("Customer data not found. Please log in again");
      return;
    }

    try {
      setIsSubmitting(true);

      const res = await fetch("http://localhost:3000/Bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          serviceId,
          date,
          timeSlot,
          carPlate,
          carModel,
          couponId: selectedCoupon?.couponId || null, 
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Booking failed");
        return;
      }

      const { basePrice, discount, finalPrice } = data.priceInfo;

      const newBooking = {
        id: Date.now(),
        serviceId,
        customerName,
        carPlate,
        carModel,
        date,
        timeSlot,
        basePrice,
        discount,
        finalPrice,
      };

      setBookings([newBooking]);
      setBookingId(data.bookingId);
      setIsConfirmed(true);
      setTransferAmount(finalPrice.toString());

      setExistingBookings((prev) => [
        ...prev,
        { serviceId, date, timeSlot },
      ]);

      alert("✅ Booking successful! Please upload payment slip");
      
      // ✅ Refresh คูปอง (คูปองที่ใช้จะถูกลบออกแล้ว)
      fetchCustomerCoupons();
      setSelectedCoupon(null);
    } catch (err) {
      console.error(err);
      setError("Cannot connect to server");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadSlip = async () => {
    if (!paymentSlip || !bookingId) {
      alert("Please select a file first");
      return;
    }

    if (!transferDate || !transferTime || !transferAmount) {
      alert("Please fill in transfer date, time, and amount");
      return;
    }

    const formData = new FormData();
    formData.append("slip", paymentSlip);
    formData.append("transferDate", transferDate);
    formData.append("transferTime", transferTime);
    formData.append("transferAmount", transferAmount);

    try {
      setIsUploading(true);

      const res = await fetch(
        `http://localhost:3000/Bookings/${bookingId}/upload-slip`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (data.success) {
        setPaymentStatus("submitted");
        alert("✅ Payment slip uploaded! Redirecting to My Bookings...");
      } else {
        alert("❌ " + (data.message || "Upload failed"));
      }
    } catch (err) {
      console.error(err);
      alert("Cannot connect to server.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleResetBooking = async () => {
    const confirmReset = window.confirm(
     "Do you want to reset?"
    );

    if (!confirmReset) return;

    const customerId = localStorage.getItem("customerId");

    try {
      const res = await fetch(
        `http://localhost:3000/Bookings/${bookingId}?customerId=${customerId}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json();

      if (data.success) {
        alert("✅ Booking deleted successfully! You can book again");
        
        setBookings([]);
        setBookingId(null);
        setIsConfirmed(false);
        setPaymentSlip(null);
        setTransferDate("");
        setTransferTime("");
        setTransferAmount("");
        setPaymentStatus("pending");
        setSelectedCoupon(null);
        
        fetchCustomerCoupons();
        
        if (date) {
          const res = await fetch(
            `http://localhost:3000/Bookings?serviceId=${serviceId}&date=${date}`
          );
          const data = await res.json();
          if (data.success) {
            setExistingBookings(data.bookings || []);
          }
        }
      } else {
        alert("❌ " + (data.message || "Delete failed"));
      }
    } catch (err) {
      console.error(err);
      alert("Cannot connect to server");
    }
  };

  const totalPrice = bookings.reduce((sum, b) => sum + b.finalPrice, 0);

  return (
    <div className="booking-wrapper">
      <div className="booking-card">
        <h2>
          🚗 Book Service {service.name}
        </h2>
        <p className="service-detail">
          {service.detail}
        </p>
        <p className="price-info">
          Price: {service.price.toLocaleString()} บาท
        </p>


        {availableCoupons.length > 0 && !isConfirmed && (
          <div className="coupon-section">
            <h3>🎟️ Available Coupons</h3>
            <select 
              value={selectedCoupon?.couponId || ""}
              onChange={(e) => {
                const coupon = availableCoupons.find(c => c.couponId === e.target.value);
                setSelectedCoupon(coupon || null);
              }}
              className="coupon-select"
            >
              <option value="">-- Don't use coupon --</option>
              {availableCoupons.map((coupon) => (
                <option key={coupon.couponId} value={coupon.couponId}>
                  {coupon.couponId}: -{coupon.discountAmount} Baht (Expires: {new Date(coupon.expiresAt).toLocaleDateString()})
                </option>
              ))}
            </select>
            {selectedCoupon && (
              <div className="selected-coupon">
                ✅ Selected: Save {selectedCoupon.discountAmount} Baht!
              </div>
            )}
          </div>
        )}

        <form className="booking-form" onSubmit={handleSubmit}>
          <label>
            Name
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
              disabled={isConfirmed}
              placeholder="FullName-LastName"
            />
          </label>

          <label>
            License plate
            <input
              type="text"
              value={carPlate}
              onChange={(e) => setCarPlate(e.target.value)}
              required
              disabled={isConfirmed}
              placeholder="such as กก 1234 กรุงเทพ"
            />
          </label>

          <label>
            Car model
            <input
              type="text"
              value={carModel}
              onChange={(e) => setCarModel(e.target.value)}
              required
              disabled={isConfirmed}
              placeholder="such as Toyota Camry 2020"
            />
          </label>

          <label>
            Service date
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={today} 
              required
              disabled={isConfirmed}
            />
          </label>

          <div className="time-selection">
            <div className="time-label">Choose time slot</div>
            <div className="time-options">
              {timeSlots.map((t) => (
                <label key={t} className="time-radio">
                  <input
                    type="radio"
                    name="timeSlot"
                    value={t}
                    checked={timeSlot === t}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    disabled={isConfirmed || isSlotTaken(t)}
                  />
                  <span className={isSlotTaken(t) ? "taken" : ""}>
                    {t}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {error && <div className="booking-error">{error}</div>}

          <button
            type="submit"
            className="booking-submit"
            disabled={isConfirmed || isSubmitting}
          >
            {isConfirmed
              ? "✅ Confirmed"
              : isSubmitting
              ? "Please wait a second"
              : "Confirmed Booking"}
          </button>
        </form>

        {bookings.length > 0 && (
          <div className="booking-summary">
            <h3>📋 Booking Summary</h3>
            <table>
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>License plate</th>
                  <th>Car model</th>
                  <th>Price</th>
                  <th>Discount</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id}>
                    <td>{b.serviceId}</td>
                    <td>{b.date}</td>
                    <td>{b.timeSlot}</td>
                    <td>{b.carPlate}</td>
                    <td>{b.carModel}</td>
                    <td>฿{b.basePrice.toLocaleString()}</td>
                    <td className="discount">
                      {b.discount > 0 && `-฿${b.discount.toLocaleString()}`}
                    </td>
                    <td className="final-price">
                      ฿{b.finalPrice.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="booking-total">
              Total: <strong>฿{totalPrice.toLocaleString()}</strong>
            </div>

            <div className="payment-section">
              <h3>💳 Payment</h3>
              <p>Scan QR Code to pay</p>
              <img
                src="/Qr.jpg"
                alt="QR Payment"
                className="qr-image"
              />

              <div className="transfer-info-section">
                <h4>Info. Transfer</h4>

                <label className="transfer-label">
                  Transfer data and time:
                  <div className="datetime-inputs">
                    <input
                      type="date"
                      value={transferDate}
                      onChange={(e) => setTransferDate(e.target.value)}
                      disabled={paymentStatus === "submitted"}
                      required
                    />
                    <input
                      type="time"
                      value={transferTime}
                      onChange={(e) => setTransferTime(e.target.value)}
                      disabled={paymentStatus === "submitted"}
                      required
                    />
                  </div>
                </label>

                <label className="transfer-label">
                  Amount (baht):
                  <input
                    type="number"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    disabled={paymentStatus === "submitted"}
                    required
                    min="0"
                    step="0.01"
                  />
                </label>
              </div>

              <label className="file-label">
                📎 Upload Payment Slip
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPaymentSlip(e.target.files[0])}
                  disabled={paymentStatus === "submitted"}
                />
              </label>

              {paymentSlip && (
                <div className="file-selected">
                  ✓ {paymentSlip.name}
                </div>
              )}

              <button
                className="upload-btn"
                disabled={!paymentSlip || isUploading || paymentStatus === "submitted"}
                onClick={handleUploadSlip}
              >
                {isUploading
                  ? "Uploading..."
                  : paymentStatus === "submitted"
                  ? "✅ Slip Uploaded"
                  : "Submit Payment Slip"}
              </button>

              {isConfirmed && paymentStatus !== "submitted" && (
                <button
                  className="reset-booking-btn"
                  onClick={handleResetBooking}
                >
                  🔄 Cancel & Reset Booking
                </button>
              )}

              {paymentStatus === "submitted" && (
                <>
                  <div className="success-message">
                    ✔ We received your payment slip! Waiting for admin verification
                  </div>
                  
                  <button
                    className="view-bookings-btn"
                    onClick={() => navigate("/MyBookings")}
                  >
                    🚗 View My Bookings
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Booking;
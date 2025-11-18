const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

dotenv.config();

const app = express();
const uri = process.env.DB_URI;
const saltRounds = parseInt(process.env.SALT_ROUNDS || "10", 10);

app.use(bodyParser.json());
app.use(cors({ origin: "http://localhost:5173" }));
app.use("/uploads", express.static("uploads"));


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/slips";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only image files are allowed!"));
  },
});

function getClient() {
  return new MongoClient(uri);
}

function timeToNumber(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h + m / 60;
}

function isOverlap(startA, endA, startB, endB) {
  return !(endA <= startB || startA >= endB);
}

// get customer discount 
app.get("/CustomerCoupons/:customerId", async (req, res) => {
  const { customerId } = req.params;
  const client = getClient();

  try {
    await client.connect();
    const db = client.db("carwash");
    const couponsCol = db.collection("discountCoupons");

    const coupons = await couponsCol
      .find({ customerId, isUsed: false })
      .sort({ createdAt: -1 })
      .toArray();

    res.json({ success: true, coupons });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Cannot get coupons" });
  } finally {
    await client.close();
  }
});

// register
app.post("/Register", async (req, res) => {
  const { username, password } = req.body;
  const client = getClient();

  try {
    await client.connect();
    const db = client.db("carwash");
    const usersCol = db.collection("userCarwash");

    const existingUser = await usersCol.findOne({ username });
    if (existingUser) {
      return res.json({ success: false, message: "Username already exists" });
    }

    const lastUser = await usersCol
      .find()
      .sort({ customerId: -1 })
      .limit(1)
      .toArray();

    let nextCustomerId = "C001";
    if (lastUser.length > 0 && lastUser[0].customerId) {
      const lastNum = parseInt(lastUser[0].customerId.replace("C", ""));
      nextCustomerId = "C" + String(lastNum + 1).padStart(3, "0");
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await usersCol.insertOne({
      customerId: nextCustomerId,
      username,
      password: hashedPassword,
    });

    res.json({ success: true, message: "Register successful" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Register failed" });
  } finally {
    await client.close();
  }
});

// login
app.post("/Login", async (req, res) => {
  const { username, password } = req.body;
  const client = getClient();

  try {
    await client.connect();
    const db = client.db("carwash");
    const usersCol = db.collection("userCarwash");

    const user = await usersCol.findOne({ username });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Wrong password" });
    }

    res.json({
      success: true,
      message: "Login successful",
      token: "temporary-token",
      customerId: user.customerId,
      username: user.username,
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Login failed" });
  } finally {
    await client.close();
  }
});

// admin login
app.post("/AdminLogin", async (req, res) => {
  const { username, password } = req.body;
  const ADMIN_USERNAME = "admin";
  const ADMIN_PASSWORD = "Poon2005";

  if (!username || !password) {
    return res.json({
      success: false,
      message: "Please provide username and password",
    });
  }

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    return res.json({
      success: true,
      message: "Admin login successful",
      token: "admin-token-secure",
      role: "admin",
      username: ADMIN_USERNAME,
    });
  }

  res.json({ success: false, message: "Invalid admin credentials" });
});

//create booking
app.post("/Bookings", async (req, res) => {
  const { customerId, serviceId, date, timeSlot, carPlate, carModel, couponId } = req.body;
  const client = getClient();

  if (!customerId || !serviceId || !date || !timeSlot || !carPlate || !carModel) {
    return res.json({ success: false, message: "Missing booking data" });
  }

  try {
    await client.connect();
    const db = client.db("carwash");
    const bookingsCol = db.collection("bookingCarwash");
    const usersCol = db.collection("userCarwash");
    const couponsCol = db.collection("discountCoupons");

    const user = await usersCol.findOne({ customerId });
    const username = user ? user.username : null;

    const existingBookings = await bookingsCol
      .find({ serviceId, date, status: { $ne: "cancel" } })
      .toArray();

    const conflict = existingBookings.some((b) => b.timeSlot === timeSlot);

    if (conflict) {
      return res.json({
        success: false,
        message: "This time slot has already been booked.",
      });
    }

    const servicePrices = {
      S001: 200,
      S002: 700,
      S003: 2500,
      S004: 8999,
    };

    const basePrice = servicePrices[serviceId] || 0;
    let discount = 0;
    let usedCouponId = null;

    if (couponId) {
      const coupon = await couponsCol.findOne({
        couponId,
        customerId,
        isUsed: false,
        serviceId,
      });

      if (coupon) {
        discount = coupon.discountAmount;
        usedCouponId = couponId;
        await couponsCol.deleteOne({ couponId });
        console.log(`🗑️ Coupon deleted: ${couponId}`);
      }
    }

    const finalPrice = Math.max(0, basePrice - discount);

    const lastBooking = await bookingsCol
      .find()
      .sort({ bookingId: -1 })
      .limit(1)
      .toArray();

    let nextBookingId = "B001";
    if (lastBooking.length > 0 && lastBooking[0].bookingId) {
      const lastNum = parseInt(lastBooking[0].bookingId.replace("B", ""));
      nextBookingId = "B" + String(lastNum + 1).padStart(3, "0");
    }

    await bookingsCol.insertOne({
      bookingId: nextBookingId,
      serviceId,
      customerId,
      username,
      date,
      timeSlot,
      carPlate,
      carModel,
      basePrice,
      discount,
      finalPrice,
      usedCouponId,
      status: "pending",
      paymentSlip: null,
      transferDate: null,
      transferTime: null,
      transferAmount: null,
      hasWarning: false,
      warningMessage: null,
      hasBeenEdited: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log("✅ Booking created:", nextBookingId);

    res.json({
      success: true,
      message: "Booking created",
      bookingId: nextBookingId,
      priceInfo: { basePrice, discount, finalPrice },
    });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Booking failed" });
  } finally {
    await client.close();
  }
});

// upload slip
app.post("/Bookings/:bookingId/upload-slip", upload.single("slip"), async (req, res) => {
  const { bookingId } = req.params;
  const { transferDate, transferTime, transferAmount } = req.body;
  const client = getClient();

  if (!req.file) {
    return res.json({ success: false, message: "No file uploaded" });
  }

  try {
    await client.connect();
    const db = client.db("carwash");
    const bookingsCol = db.collection("bookingCarwash");

    const slipPath = `/uploads/slips/${req.file.filename}`;

    const result = await bookingsCol.updateOne(
      { bookingId },
      {
        $set: {
          paymentSlip: slipPath,
          transferDate,
          transferTime,
          transferAmount: parseFloat(transferAmount),
          status: "verify",
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.json({ success: false, message: "Booking not found" });
    }

    console.log("✅ Payment slip uploaded:", bookingId);

    res.json({
      success: true,
      message: "Payment slip uploaded",
      slipPath,
    });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Upload failed" });
  } finally {
    await client.close();
  }
});

// 10%
app.patch("/Bookings/:bookingId/cancel", async (req, res) => {
  const { bookingId } = req.params;
  const { customerId } = req.body;
  const client = getClient();

  try {
    await client.connect();
    const db = client.db("carwash");
    const bookingsCol = db.collection("bookingCarwash");
    const couponsCol = db.collection("discountCoupons");

    const booking = await bookingsCol.findOne({ bookingId });

    if (!booking) {
      return res.json({ success: false, message: "Booking not found" });
    }

    if (booking.customerId !== customerId) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    if (booking.status === "cancel") {
      return res.json({ success: false, message: "Booking already cancelled" });
    }

    const discountAmount = Math.floor(booking.basePrice * 0.1);

    const lastCoupon = await couponsCol
      .find()
      .sort({ couponId: -1 })
      .limit(1)
      .toArray();

    let nextCouponId = "CP001";
    if (lastCoupon.length > 0 && lastCoupon[0].couponId) {
      const lastNum = parseInt(lastCoupon[0].couponId.replace("CP", ""));
      nextCouponId = "CP" + String(lastNum + 1).padStart(3, "0");
    }

    await couponsCol.insertOne({
      couponId: nextCouponId,
      customerId: booking.customerId,
      fromBookingId: bookingId,
      serviceId: booking.serviceId,
      discountAmount,
      discountPercent: 10,
      isUsed: false,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    });

    await bookingsCol.updateOne(
      { bookingId },
      { $set: { status: "cancel", updatedAt: new Date() } }
    );

    console.log(`✅ Booking cancelled: ${bookingId}`);
    console.log(`🎟️ Coupon created: ${nextCouponId}`);

    res.json({
      success: true,
      message: `Booking cancelled. You received a ${discountAmount} Baht discount coupon for ${booking.serviceId} service!`,
      coupon: {
        couponId: nextCouponId,
        discountAmount,
        serviceId: booking.serviceId,
      },
    });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Cancel failed" });
  } finally {
    await client.close();
  }
});

// get booking
app.get("/Bookings", async (req, res) => {
  const { serviceId, date } = req.query;
  const client = getClient();

  if (!serviceId || !date) {
    return res.json({
      success: false,
      message: "serviceId and date are required",
    });
  }

  try {
    await client.connect();
    const db = client.db("carwash");
    const bookingsCol = db.collection("bookingCarwash");

    const bookings = await bookingsCol
      .find({ 
        serviceId, 
        date, 
        status: { $ne: "cancel" } 
      })
      .toArray();

    res.json({ success: true, bookings });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Cannot load bookings" });
  } finally {
    await client.close();
  }
});

// my booking
app.get("/MyBookings/:customerId", async (req, res) => {
  const { customerId } = req.params;
  const client = getClient();

  try {
    await client.connect();
    const db = client.db("carwash");
    const bookingsCol = db.collection("bookingCarwash");

    const bookings = await bookingsCol
      .find({ customerId })
      .sort({ createdAt: -1 })
      .toArray();

    res.json({ success: true, bookings });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Cannot load bookings" });
  } finally {
    await client.close();
  }
});

// app admin booking
app.get("/AdminBookings", async (req, res) => {
  const client = getClient();

  try {
    await client.connect();
    const db = client.db("carwash");
    const bookingsCol = db.collection("bookingCarwash");

    const bookings = await bookingsCol
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    res.json({ success: true, bookings });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Cannot load bookings" });
  } finally {
    await client.close();
  }
});

// get all discount admin
app.get("/AdminCoupons", async (req, res) => {
  const client = getClient();

  try {
    await client.connect();
    const db = client.db("carwash");
    const couponsCol = db.collection("discountCoupons");

    const coupons = await couponsCol
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    res.json({ success: true, coupons });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Cannot load coupons" });
  } finally {
    await client.close();
  }
});

// stats admin slip
app.patch("/Bookings/:bookingId/status", async (req, res) => {
  const { bookingId } = req.params;
  const { status } = req.body;

  const allowed = ["pending", "verify", "complete", "cancel"];
  if (!allowed.includes(status)) {
    return res.json({ success: false, message: "Invalid status" });
  }

  const client = getClient();

  try {
    await client.connect();
    const db = client.db("carwash");
    const bookingsCol = db.collection("bookingCarwash");

    const booking = await bookingsCol.findOne({ bookingId });

    if (!booking) {
      return res.json({ success: false, message: "Booking not found" });
    }

    const result = await bookingsCol.updateOne(
      { bookingId },
      { $set: { status, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.json({ success: false, message: "Booking not found" });
    }

    console.log(`✅ Status updated: ${bookingId} -> ${status}`);

    res.json({ success: true, message: "Status updated" });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Cannot update status" });
  } finally {
    await client.close();
  }
});

// admin warning
app.patch("/Bookings/:bookingId/warning", async (req, res) => {
  const { bookingId } = req.params;
  const { warningMessage } = req.body;

  if (!warningMessage) {
    return res.json({ success: false, message: "Warning message is required" });
  }

  const client = getClient();

  try {
    await client.connect();
    const db = client.db("carwash");
    const bookingsCol = db.collection("bookingCarwash");

    const result = await bookingsCol.updateOne(
      { bookingId },
      {
        $set: {
          warningMessage,
          hasWarning: true,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.json({ success: false, message: "Booking not found" });
    }

    console.log(`⚠️ Warning sent to booking: ${bookingId}`);

    res.json({ success: true, message: "Warning sent successfully" });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Failed to send warning" });
  } finally {
    await client.close();
  }
});

// only 1 time
app.patch("/Bookings/:bookingId/update", async (req, res) => {
  const { bookingId } = req.params;
  const { customerId, transferDate, transferTime, transferAmount } = req.body;

  const client = getClient();

  try {
    await client.connect();
    const db = client.db("carwash");
    const bookingsCol = db.collection("bookingCarwash");

    const booking = await bookingsCol.findOne({ bookingId });

    if (!booking) {
      return res.json({ success: false, message: "Booking not found" });
    }

    if (booking.customerId !== customerId) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    if (booking.hasBeenEdited) {
      return res.json({
        success: false,
        message: "You have already edited this booking once. Cannot edit again.",
      });
    }

    const result = await bookingsCol.updateOne(
      { bookingId },
      {
        $set: {
          transferDate,
          transferTime,
          transferAmount: parseFloat(transferAmount),
          hasBeenEdited: true,
          hasWarning: false,
          warningMessage: null,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.json({ success: false, message: "Update failed" });
    }

    console.log(`✏️ Booking updated by customer: ${bookingId}`);

    res.json({
      success: true,
      message: "Booking updated successfully. You cannot edit again.",
    });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Update failed" });
  } finally {
    await client.close();
  }
});

// update slip 
app.post("/Bookings/:bookingId/upload-slip-update", upload.single("slip"), async (req, res) => {
  const { bookingId } = req.params;
  const { transferDate, transferTime, transferAmount, customerId } = req.body;
  const client = getClient();

  if (!req.file) {
    return res.json({ success: false, message: "No file uploaded" });
  }

  try {
    await client.connect();
    const db = client.db("carwash");
    const bookingsCol = db.collection("bookingCarwash");

    const booking = await bookingsCol.findOne({ bookingId });

    if (!booking) {
      return res.json({ success: false, message: "Booking not found" });
    }

    if (booking.customerId !== customerId) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    if (booking.hasBeenEdited) {
      return res.json({
        success: false,
        message: "You have already edited this booking once. Cannot edit again.",
      });
    }

    const slipPath = `/uploads/slips/${req.file.filename}`;

    const result = await bookingsCol.updateOne(
      { bookingId },
      {
        $set: {
          paymentSlip: slipPath,
          transferDate,
          transferTime,
          transferAmount: parseFloat(transferAmount),
          hasBeenEdited: true,
          hasWarning: false,
          warningMessage: null,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.json({ success: false, message: "Booking not found" });
    }

    console.log("✅ Payment slip re-uploaded:", bookingId);

    res.json({
      success: true,
      message: "Payment slip updated successfully. You cannot edit again.",
      slipPath,
    });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Upload failed" });
  } finally {
    await client.close();
  }
});

// delete booking
app.delete("/Bookings/:bookingId", async (req, res) => {
  const { bookingId } = req.params;
  const { customerId } = req.query;
  const client = getClient();

  try {
    await client.connect();
    const db = client.db("carwash");
    const bookingsCol = db.collection("bookingCarwash");

    const booking = await bookingsCol.findOne({ bookingId });

    if (!booking) {
      return res.json({ success: false, message: "Booking not found" });
    }

    if (booking.customerId !== customerId) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    await bookingsCol.deleteOne({ bookingId });

    console.log(`🗑️ Deleted booking: ${bookingId}`);

    res.json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Delete failed" });
  } finally {
    await client.close();
  }
});

app.listen(3000, () => {
  console.log("🚀 Server running at http://localhost:3000");
  console.log("📦 Database: carwash");
  console.log("📂 Collections: userCarwash, bookingCarwash, discountCoupons");
});
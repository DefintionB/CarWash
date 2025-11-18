import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import './RulesPage.css'


const RulesPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <h1 style={styles.title}>📋 Rules</h1>
        
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>🚗 ประเภทรถที่รับล้าง</h2>
          <ul style={styles.list}>
            <li style={styles.listItem}>✅ รถยนต์เก๋ง (Sedan)</li>
            <li style={styles.listItem}>✅ รถกระบะ (Pickup Truck)</li>
            <li style={styles.listItem}>✅ รถตู้ (Van)</li>
            <li style={styles.listItem}>❌ ไม่รับล้างรถจักรยานยนต์, รถบรรทุกขนาดใหญ่</li>
          </ul>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>💰 นโยบายการยกเลิกและคืนเงิน</h2>
          <ul style={styles.list}>
            <li style={styles.listItem}>
              ⚠️ <strong>ไม่สามารถขอคืนเงินได้</strong> เมื่อทำการจองแล้ว
            </li>
            <li style={styles.listItem}>
              🎟️ หากยกเลิกการจอง จะได้รับ <strong>คูปองส่วนลด 10%</strong> สำหรับ Service นั้นๆ
            </li>
            <li style={styles.listItem}>
              📅 คูปองส่วนลดมีอายุ <strong>90 วัน</strong> นับจากวันที่ออกคูปอง
            </li>
            <li style={styles.listItem}>
              🔒 คูปองใช้ได้เฉพาะ <strong>บริการที่ยกเลิกไป</strong> เท่านั้น
            </li>
            <li style={styles.listItem}>
              ✂️ เมื่อใช้คูปองแล้ว คูปองจะถูกลบออกจากระบบทันที
            </li>
          </ul>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>🕐 เวลาให้บริการ</h2>
          <ul style={styles.list}>
            <li style={styles.listItem}>⏰ เปิดให้บริการ: 09:00 - 20:00 น.</li>
            <li style={styles.listItem}>📅 ทุกวัน (รวมวันหยุดนักขัตฤกษ์)</li>
            <li style={styles.listItem}>⚡ แต่ละช่วงเวลามีระยะเวลา 1 ชั่วโมง</li>
          </ul>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>📦 แพ็กเกจบริการ</h2>
          <div style={styles.packageGrid}>
            <div style={styles.package}>
              <h3 style={styles.packageName}>S001</h3>
              <p style={styles.packageDetail}>ล้างสี, ดูดฝุ่น</p>
              <p style={styles.packagePrice}>200 บาท</p>
            </div>
            <div style={styles.package}>
              <h3 style={styles.packageName}>S002</h3>
              <p style={styles.packageDetail}>ล้างสี, ดูดฝุ่น, เคลือบสี</p>
              <p style={styles.packagePrice}>700 บาท</p>
            </div>
            <div style={styles.package}>
              <h3 style={styles.packageName}>S003</h3>
              <p style={styles.packageDetail}>ฟื้นฟูสภาพรถ ขัดลบรอย เคลือบสี</p>
              <p style={styles.packagePrice}>2,500 บาท</p>
            </div>
            <div style={styles.package}>
              <h3 style={styles.packageName}>S004</h3>
              <p style={styles.packageDetail}>เคลือบแก้ว (Premium)</p>
              <p style={styles.packagePrice}>8,999 บาท</p>
            </div>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>⚠️ ข้อควรระวัง</h2>
          <ul style={styles.list}>
            <li style={styles.listItem}>
              📸 กรุณาถ่ายภาพหลักฐานการโอนเงินให้ชัดเจน
            </li>
            <li style={styles.listItem}>
              ⏱️ กรุณากรอกข้อมูลการโอนให้เรียบร้อยก่อนอัปโหลด
            </li>
            <li style={styles.listItem}>
              🔍 Admin จะตรวจสอบสลิปภายใน 5 นาที
            </li>
            <li style={styles.listItem}>
              💼 หากมีปัญหา กรุณาติดต่อเราผ่าน Our contact 
            </li>
          </ul>
        </div>

        <div style={styles.exampleSection}>
          <h2 style={styles.sectionTitle}>💡 ตัวอย่างการคำนวณส่วนลด</h2>
          <div style={styles.exampleBox}>
            <p><strong>กรณีที่ 1:</strong> จองบริการ S002 (700 บาท)</p>
            <p>• หากยกเลิก → ได้คูปอง 70 บาท สำหรับบริการ S002</p>
            <p>• ใช้คูปองจองใหม่ → จ่ายเพียง 630 บาท</p>
            <p style={styles.highlight}>⚠️ เมื่อใช้คูปองแล้ว จะถูกลบออกจากระบบทันที</p>
          </div>
          
          <div style={styles.exampleBox}>
            <p><strong>กรณีที่ 2:</strong> จองบริการ S004 (8,999 บาท)</p>
            <p>• หากยกเลิก → ได้คูปอง 899 บาท สำหรับบริการ S004</p>
            <p>• ใช้คูปองจองใหม่ → จ่ายเพียง 8,100 บาท</p>
          </div>
        </div>

        <div style={styles.buttonGroup}>
          <button style={styles.backButton} onClick={() => navigate(-1)}>
            ← Back to Login
          </button>
          <button style={styles.bookButton} onClick={() => navigate("/mainpage")}>
            📅 Booking Service
          </button>
        </div>
      </div>
    </div>
  );
};
const styles = {
  wrapper: {
    minHeight: "100vh",
    background: "black",
    padding: "2rem",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  container: {
    maxWidth: "1000px",
    margin: "0 auto",
    background: "white",
    borderRadius: "20px",
    padding: "2.5rem",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: "2rem",
    color: "#2c3e50",
    textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
  },
  section: {
    marginBottom: "2.5rem",
    padding: "1.5rem",
    background: "#f8f9fa",
    borderRadius: "15px",
    border: "2px solid #e9ecef",
  },
  sectionTitle: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    marginBottom: "1rem",
    color: "#495057",
  },
  list: {
    listStyle: "none",
    padding: 0,
  },
  listItem: {
    padding: "0.75rem 0",
    borderBottom: "1px solid #dee2e6",
    fontSize: "1.1rem",
    color: "#495057",
  },
  packageGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1rem",
    marginTop: "1rem",
  },
  package: {
    background: "orange",
    color: "black",
    padding: "1.5rem",
    borderRadius: "12px",
    textAlign: "center",
    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
  },
  packageName: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    marginBottom: "0.5rem",
  },
  packageDetail: {
    fontSize: "0.9rem",
    marginBottom: "0.5rem",
    opacity: 0.9,
  },
  packagePrice: {
    fontSize: "1.8rem",
    fontWeight: "bold",
    marginTop: "0.5rem",
  },
  exampleSection: {
    marginBottom: "2rem",
    padding: "1.5rem",
    background: "#fff3cd",
    borderRadius: "15px",
    border: "2px solid #ffc107",
  },
  exampleBox: {
    background: "white",
    padding: "1rem",
    borderRadius: "10px",
    marginBottom: "1rem",
    border: "1px solid #dee2e6",
  },
  highlight: {
    color: "#dc3545",
    fontWeight: "bold",
    marginTop: "0.5rem",
  },
  buttonGroup: {
    display: "flex",
    gap: "1rem",
    justifyContent: "center",
    marginTop: "2rem",
  },
  backButton: {
    padding: "1rem 2rem",
    fontSize: "1.1rem",
    fontWeight: "bold",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    background: "#6c757d",
    color: "white",
    transition: "all 0.3s",
  },
  bookButton: {
    padding: "1rem 2rem",
    fontSize: "1.1rem",
    fontWeight: "bold",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    background: "orange",
    color: "black",
    transition: "all 0.3s",
    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
  },
};



export default RulesPage;
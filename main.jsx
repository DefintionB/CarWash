import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LoginSignUp from "./components/LoginSignUp/LoginSignUp";
import Mainpage from "./components/Mainpage/Mainpage";
import Layout from "./Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Booking from "./components/Booking/Booking";
import AdminLogin from "./components/AdminLogin/AdminLogin";
import AdminDashboard from "./components/AdminDashboard/AdminDashboard";
import MyBookings from "./components/MyBookings/MyBookings";
import RulesPage from "./components/Rule/RulesPage";



const router = createBrowserRouter([
  {
    path: "/",
    element: (
      
      <Layout>
        <LoginSignUp />
      </Layout>
      
    ),
  },
  {
    path: "/rule",
    element: (
      
      <Layout>
        <RulesPage />
      </Layout>
      
    ),
  },
  {
    path: "/AdminLogin",
    element: (
      
      <Layout>
        <AdminLogin />
      </Layout>
      
    ),
  },
    {
    path: "/MyBookings",
    element: (
      
      <Layout>
        <MyBookings />
      </Layout>
      
    ),
  },
  {
    path: "/AdminDashboard",
    element: (
      
      <Layout>
        <AdminDashboard />
      </Layout>
      
    ),
  },
   {
    path: "/booking/:serviceId",
    element: 
    <Layout>
      <Booking/> 
    </Layout>
      
  },
  {
    path: "/Mainpage",   
    element: (
      <ProtectedRoute>
      <Layout>
        <Mainpage />
      </Layout>
      </ProtectedRoute>
    ),
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

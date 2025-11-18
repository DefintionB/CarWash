import React from "react";
import "./App.css";

export default function Layout({ children }) {
  return (
    
    <div className="App">
      <div className="top" />
      {children}
    </div>
    

  );
}

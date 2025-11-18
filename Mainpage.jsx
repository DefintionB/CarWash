import React, { useEffect } from 'react'  // เพิ่ม { useEffect }
import Header from '../Header/Header'
import Hero from '../Hero /Hero'
import Companies from '../companies/companies'
import Service from '../Service/Service'
import Contact from '../Contact/Contact'
import AboutUs from '../AboutUs/AboutUs'
import GetStarted from '../GetStarted/GetStarted'

function Mainpage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <div className="top">
        <Header />
        <Hero />
      </div>
      <Companies />
      <Service/>
      <AboutUs/>
      <GetStarted />
      <Contact />
    </>
  )
}
export default Mainpage;
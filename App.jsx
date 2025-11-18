import Header from "./components/Header/Header";
import Hero from "./components/Hero /Hero";
import './App.css'
import Companies from "./components/companies/companies";
import Service from "./components/Service/Service";
import AboutUs from "./components/AboutUs/AboutUs";
import Contact from "./components/Contact/Contact";
import GetStarted from "./components/GetStarted/GetStarted";
import LoginSignUp from "./components/LoginSignUp/LoginSignUp"
import Nav from "./components/Nav";
import Mainpage from "./components/Mainpage/Mainpage";
import Booking from "./components/Booking/Booking"
import AdminLogin from "./components/AdminLogin/AdminLogin";
import AdminDashboard from "./components/AdminDashboard/AdminDashboard";
import MyBookings from "./components/MyBookings/MyBookings";
import RulesPage from "./components/Rule/RulesPage";
import ScrollToTop from "./components/ScrollToTop";


function App(){
  return(
    <div className="App">
    <div>
      <div className="white-gradient"/>
      <Header />
      <Hero/>
    </div>
    <Companies/>
    <Service/>
    <AboutUs/>
    <Contact/>
    <GetStarted/>
    <ScrollToTop/>
    <RulesPage/>
    <LoginSignUp/>
    <Nav/>
    <Mainpage/>
    <AdminDashboard/>
    <AdminLogin/>
    <MyBookings/>
    <Booking/>
    
    </div>
  )
}
export default App;
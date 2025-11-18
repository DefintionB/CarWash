import React from "react";
import "./Hero.css";
import {HiLocationMarker} from 'react-icons/hi'
import CountUp from "react-countup";
const Hero = () => {
  return (
    <section className="hero-wrapper">
      <div className="paddings innerWidth flexCenter hero-container">
        {/*left side*/}
        <div className="flexColStart hero-left">
          <div className="hero-title">
            <div className="blue-circle"/>

            <h1>
            Discover <br/>Your Shine
            <br />Find Your Sparkle
            </h1>
          </div>
          <div className="flexColStart hero-des">
            <span className="secondaryText">Say goodbye to endless phone calls and disappointing </span>
            <span className="secondaryText">car wash experiences No more wasting time searching for quality car care</span>
          </div>
          <div className="flexCenter search-bar">
            <HiLocationMarker color ="var(--blue)" size = {25}/>
            <input type = "text" />
            <button className="button">Search</button>
          
          </div>
          <div className="flexStart stats">
            <div className="flexColCenter stats">
              <span>
                <CountUp start={1200} end={1500} duration={4}/>
                <span >+</span>
                </span>
                <span className="  secondaryText"> Bookings</span>
            </div>
              <div className="flexColCenter stats">
              <span>
                <CountUp start={4700} end={5000} duration={4}/>
                <span>+</span>
                </span><span className="flexColStart secondaryText">
                    Happy Customers
                  </span>
            </div>

            <div className="flexColCenter stats">
              <span>
                <CountUp start={2} end={24} duration={4}/>
                <span>+</span>
                </span><span className="secondaryText">
                    Daily customers
                  </span>
            </div>

          </div>
          </div>
        
        {/*right side*/}
        <div className="flexCenter hero-right">
          <div className="image-container">
            <img src="./002.png" alt="" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

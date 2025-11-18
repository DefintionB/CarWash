import React from 'react'
import './Contact.css'
import {MdCall} from 'react-icons/md'
import {BsFillChatDotsFill} from 'react-icons/bs'
import {HiChatBubbleBottomCenter} from 'react-icons/hi2'
const Contact = () => {
  return (
    <section id='contact-s' className="c-wrapper">
        <div className="paddings innerWidth flexCenter c-container">
            {/*left side*/ }
            <div className="flexColStart c-left">
                <span className='orangeText'>Our Contact</span>
                <span className='primaryText'>Easy to Contact Us</span>
                <span className='secondaryText'>We always are ready to help by providing the best service for you. </span>
                
                <div className="flexColStart contactModes">
                    {/* first row*/ }
                    <div className="flexStart row">
                        <div className="flexColCenter mode">
                            <div className="flexStart">
                                <div className="flexCenter icon">
                                    <MdCall size={25}/>
                                </div>
                                <div className="flexColStart detail">
                                    <span className='primaryText'>Call</span>
                                    <span secondaryText>061-964-9254</span>
                                </div>
                            </div>
                            <button className='flexCenter button'>
                                <a href="tel:0619649254">Call Now</a>
                                 </button>
                        </div>

                    {/* second mode*/}
                    <div className="flexColCenter mode">
                            <div className="flexStart">
                                <div className="flexCenter icon">
                                    <BsFillChatDotsFill size={25}/>
                                </div>
                                <div className="flexColStart detail">
                                    <span className='primaryText'>Line</span>
                                    <span secondaryText>@poonmeow</span>
                                </div>
                            </div>
                           <button className='flexCenter button'>
                                <a href=" https://line.me/ti/p/momanddadwenttoashow">Click here</a>
                                 </button>
                    </div>

                    </div>

                    {/*second row*/}
                    <div className="flexStart row">
                        <div className="flexColCenter mode">
                            <div className="flexStart">
                                <div className="flexCenter icon">
                                    <BsFillChatDotsFill size={25}/>
                                </div>
                                <div className="flexColStart detail">
                                    <span className='primaryText'>SMS</span>
                                    <span secondaryText>Message</span>
                                </div>
                            </div>
                            <button className='flexCenter button'>
                                <a href="sms:0908894985">Send Now</a>
                                 </button>
                        </div>

                    {/* fourth mode*/}
                    <div className="flexColCenter mode">
                            <div className="flexStart">
                                <div className="flexCenter icon">
                                    <HiChatBubbleBottomCenter size={25}/>
                                </div>
                                <div className="flexColStart detail">
                                    <span className='primaryText'>Facebook</span>
                                    <span secondaryText>My Lord</span>
                                </div>
                            </div>
                            <div className="">
                                <button className='flexCenter button'>
                                <a href=" https://www.facebook.com/share/1Brp9psKRW/?mibextid=wwXIfr">Click here</a>
                                 </button>
                            </div>
                    </div>

                    </div>
                </div>
            </div>

            {/*right side*/ }
            <div className="c-right">
                <div className="image-container">
                    <img src="/public/005.png" alt="" />
                </div>
            </div>

        </div>
    </section>
  )
}

export default Contact

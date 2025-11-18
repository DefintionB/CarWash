import React from 'react'
import {Swiper, SwiperSlide, useSwiper} from 'swiper/react'
import "swiper/css"
import "./Service.css"
import data from '../../utils/slider.json'
import { color } from 'framer-motion'
import { sliderSettings } from '../../utils/common/common'
import { Link } from 'react-router'
const Service = () => {
  return (
    <section id='service-s' className='r-wrapper'>
        <div className="paddings innerWidth r-container">
            <div className='r-head flexColStart'>
                <span className='orangeText'>Best Choices</span>
                <span  className='primaryText'>All Service</span>
            </div>
            <Swiper {...sliderSettings}>
                {data.map((card,i) =>(
                    <SwiperSlide key={i}>
                         <Link to={`/booking/${card.name}`}>
                        <div className='flexColStart r-card'>
                            <img src={card.image} alt="home" />

                            <span className='secondaryText r-price'>
                            <span style={{color: "orange"}}>$</span>
                            <span>{card.price}</span>
                            </span>
                            <span className='primaryText'>{card.name}</span>
                             <span className='secondaryText'>{card.detail}</span>
                        </div>
                        </Link>
                    </SwiperSlide>
                ))
                }
            </Swiper>
        </div>
    </section>
  )
}

export default Service

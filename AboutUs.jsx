import React, { useState } from 'react'
import{
   Accordion,
   AccordionItem,
   AccordionItemHeading,
   AccordionItemButton,
   AccordionItemPanel,
   AccordionItemState,
}
from 'react-accessible-accordion'
import "react-accessible-accordion/dist/fancy-example.css";
import {MdOutlineArrowDropDown} from 'react-icons/md'
import './AboutUs.css'
import data from '../../utils/accordion'
const AboutUs = () => {
    return (
        <section id='aboutus-s' className='v-wrapper'>
            <div className='paddings innerWidth flexCenter v-container'>
            {/*left side */}
        <div className='v-left'>
            <div className='image-container'>
                <img src="/public/003.png" alt="" />
                </div>
                </div>

            {/*right side */}
            <div className='flexColStart v-right'>
                <span className='orangeText'>About Us</span>
                <span className='primaryText'>Value We Give To You</span>
                <span className='secondaryText'>Why we're worth it
                <br />Fair pricing, easy booking, well-maintained facilities, and reliable car care.
                </span>
                <Accordion
                className='accordion'
                allowMultipleExpanded={false}
                preExpanded={[0]}
                >
                {
                    data.map((item,i) => {
                        const [className,setClassName] = useState(null)
                        return(
                            <AccordionItem className={'accordionItem ${className}'} key={i} uuid={i}>
                                <AccordionItemHeading>
                                <AccordionItemButton className='flexCenter accordionButton'>

                                    <AccordionItemState>
                                        {({expanded}) => expanded
                                        ? setClassName("expanded")
                                        : setClassName("collapsed")
                                        }
                                    </AccordionItemState>
                                    <div className='flexCenter icon'> {item.icon}</div>
                                    <span className='primaryText'>
                                        {item.heading}
                                    </span>
                                    <div className='flexCenter icon'>
                                       <MdOutlineArrowDropDown size={20}/>
                                    </div>

                                </AccordionItemButton>
                                </AccordionItemHeading>

                                <AccordionItemPanel>
                                    <p className="secondaryText">
                                        {item.detail}
                                    </p>
                                </AccordionItemPanel>
                            </AccordionItem>
                        )
                    }
                    )
                }
                </Accordion>
            </div>
            </div>
        </section>
    )
}
export default AboutUs
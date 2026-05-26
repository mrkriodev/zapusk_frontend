import GlobeHero from "./GlobeHero";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import Creating from "../Creating/Creating";

export default function Home(){

    const [showIntro, setShowIntro] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowIntro(false)
        }, 6000)

        return () => {clearTimeout(timer)}
    }, [])


    return(
        <div className="min-h-screen  relative overflow-hidden">

            <AnimatePresence mode="wait">

                {showIntro ? (
                    <motion.section
                        key="intro"
                        className="origin-[50%_85%] bg-black"
                        initial={{ 
                            opacity: 1, 
                            scale: 1, 
                            rotate: 0,
                            y: 0,
                        }}
                        animate={{ 
                            opacity: 1, 
                            scale: 1, 
                            rotate: 0,
                            y: 0,
                        }}
                        exit={{
                            opacity: 0,
                            scale: 7,
                            rotate: 35,
                            y: -120,
                            filter: "blur(10px)",
                        }}
                        transition={{
                            duration: 0.9,
                            ease: [0.76, 0, 0.24, 1],
                        }}
                    >

                        <div
                        className="absolute inset-0 z-0 "
                        style={{
                        backgroundImage: "url(/bg-space.png)",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundAttachment: "fixed",
                        }}
                        />

                        <div className="relative z-10 container min-w-full flex 
                        flex-col overflow-hidden items-center min-h-screen ">

                            <GlobeHero />

                            <div className="flex-1 flex flex-col items-center z-20 justify-center -translate-y-24">
                                
                                <h1 className="text-white/85 text-5xl font-bold  mb-7">Zapusk</h1>
                            
                                <span
                                className="text-indigo-200 text-3xl inline-block"
                                aria-label="From Prompt to Spaceship"
                                >
                                {Array.from("From Prompt to Spaceship").map((char, i) => (
                                    <motion.span
                                    key={i}
                                    className="inline-block"
                                    initial={{
                                        opacity: 0.35,
                                        filter: "blur(3px)",
                                    }}
                                    animate={{
                                        opacity: 1,
                                        filter: "blur(0px)",
                                    }}
                                    transition={{
                                        opacity: {
                                        duration: 0.9,
                                        delay: i * 0.035,
                                        ease: "easeOut",
                                        },
                                        filter: {
                                        duration: 0.75,
                                        delay: i * 0.035,
                                        ease: "easeOut",
                                        },
                            
                                    }}
                                    >
                                    {char === " " ? "\u00A0" : char}
                                    </motion.span>
                                ))}
                                </span>
                            </div>
                        </div>

                    </motion.section>

                ) : (
                    
                    <motion.main
                        key="main"
                        className="relative z-10 min-h-screen  text-white"
                        initial={{
                        opacity: 0,
                        scale: 0.9,
                        filter: "blur(20px)",
                        }}
                        animate={{
                        opacity: 1,
                        scale: 1,
                        filter: "blur(0px)",
                        }}
                        transition={{
                        duration: 0.2,
                        ease: "easeOut",
                        }}
                    >

                        <Creating />

                    </motion.main>

                )}

            </AnimatePresence>
        </div>
    )
}
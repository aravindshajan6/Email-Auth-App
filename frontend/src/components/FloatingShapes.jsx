import React from "react";
import { motion } from "framer-motion";

const FloatingShapes = ({ color, size, top, left, delay, className }) => {
  return (
    <motion.div
      className={`${className} absolute rounded-full ${color} ${size} opacity-30 blur-sm  `}
      style={{ top, left, animationDelay: `${delay}s`, }}
      animate={{
        y: ["0%", "100%", "0%"],
        x: ["0%", "100%", "0%"],
        rotate: [0, 360],
      }}
      transition={{
        duration: 20,
        ease: "linear",
        repeat: Infinity,
        delay,
      }}
      aria-hidden="true"
    />
  );
};

export default FloatingShapes;




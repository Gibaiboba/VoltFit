"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

interface FramerWrapperProps {
  children: ReactNode;
  activeKey: string | number;
}

export const FramerWrapper = ({ children, activeKey }: FramerWrapperProps) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeKey}
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -10 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

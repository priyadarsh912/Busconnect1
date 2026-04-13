import { motion } from "framer-motion";
import { Bus } from "lucide-react";

const AnimatedBusLogo = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <motion.div
        animate={{
          x: [-2, 2, -2],
          y: [-1, 1, -1],
          rotate: [-1, 1, -1]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="text-primary"
      >
        <Bus className="w-6 h-6 stroke-[2.5px]" />
      </motion.div>
      
      {/* Animated Wheel circles */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-1 left-1.5 w-1.5 h-1.5 border-t border-primary rounded-full"
      />
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-1 right-1.5 w-1.5 h-1.5 border-t border-primary rounded-full"
      />

      {/* Speed lines */}
      <motion.div
        animate={{ opacity: [0, 1, 0], x: [-10, -20] }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "easeOut" }}
        className="absolute left-0 top-1/2 w-3 h-[1.5px] bg-primary/30 rounded-full"
      />
      <motion.div
        animate={{ opacity: [0, 1, 0], x: [-8, -18] }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "easeOut", delay: 0.2 }}
        className="absolute left-0 top-1/3 w-2 h-[1.5px] bg-primary/20 rounded-full"
      />
    </div>
  );
};

export default AnimatedBusLogo;

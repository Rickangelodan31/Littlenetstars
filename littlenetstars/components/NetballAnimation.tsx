import { motion } from "framer-motion";
import Image from "next/image";

export default function NetballAnimation() {
  return (
    <motion.div
      className="relative flex items-center justify-center"
      initial={{ scale: 0.3, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ rotate: { duration: 6, repeat: Infinity, ease: "linear" } }}
        className="relative w-28 h-28 md:w-36 md:h-36 drop-shadow-2xl"
      >
        <Image
          src="/netball.svg"
          alt="Netball"
          fill
          style={{ objectFit: "contain" }}
          priority
        />
      </motion.div>
    </motion.div>
  );
}

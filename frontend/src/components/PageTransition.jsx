import { motion } from "framer-motion";

function PageTransition({ children, delay = 0 }) {

  return (

    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: delay
      }}
    >

      {children}

    </motion.div>

  );

}

export default PageTransition;
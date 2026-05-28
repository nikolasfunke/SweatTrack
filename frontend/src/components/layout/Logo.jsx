import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Logo({ size = 'md', className = '' }) {
  const [imgFailed, setImgFailed] = useState(false);
  const navigate = useNavigate();
  const heights = { sm: 'h-7', md: 'h-8', lg: 'h-10', xl: 'h-12' };

  return (
    <motion.div
      onClick={() => navigate('/dashboard')}
      className={`flex items-center cursor-pointer ${className}`}
      whileHover={{ scale: 1.02 }}
    >
      {!imgFailed ? (
        <img
          src="/favicon.svg"
          alt="Sweat-Track"
          className={`${heights[size]} w-auto object-contain`}
          onError={() => setImgFailed(true)}
        />
      ) : (
        <TextLogo size={size} />
      )}
    </motion.div>
  );
}

function TextLogo({ size }) {
  const sizes = { sm: 'text-lg', md: 'text-xl', lg: 'text-2xl', xl: 'text-3xl' };
  return (
    <div className={`flex items-center gap-2 font-black ${sizes[size]}`}>
      <div className="relative flex-shrink-0">
        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-red-glow">
          <span className="text-white font-black text-base leading-none">S</span>
        </div>
        <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-400 animate-pulse-slow" />
      </div>
      <span>
        <span className="text-white">Sweat</span>
        <span className="text-primary">-Track</span>
      </span>
    </div>
  );
}

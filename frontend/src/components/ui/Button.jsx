import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function Button({
  children, variant = 'primary', size = 'md', loading = false,
  disabled = false, className = '', icon, ...props
}) {
  const variants = {
    primary: 'btn-primary',
    ghost: 'btn-ghost',
    outline: 'btn-outline',
    danger: 'bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-semibold rounded-xl px-5 py-3 transition-all duration-200 flex items-center justify-center gap-2',
  };
  const sizes = {
    sm: 'text-sm px-3 py-2',
    md: 'text-sm',
    lg: 'text-base px-6 py-4',
    xl: 'text-base px-8 py-4 w-full',
  };

  return (
    <motion.button
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      disabled={disabled || loading}
      className={`${variants[variant]} ${sizes[size]} ${className} relative`}
      {...props}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : icon ? (
        icon
      ) : null}
      {children}
    </motion.button>
  );
}

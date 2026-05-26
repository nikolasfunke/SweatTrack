import { forwardRef } from 'react';

const Input = forwardRef(function Input(
  { label, error, icon, suffix, className = '', ...props }, ref
) {
  return (
    <div className="w-full">
      {label && <label className="label">{label}</label>}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={`input-field ${icon ? 'pl-10' : ''} ${suffix ? 'pr-16' : ''} ${error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/30' : ''} ${className}`}
          {...props}
        />
        {suffix && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 text-sm font-medium">
            {suffix}
          </div>
        )}
      </div>
      {error && <p className="text-rose-400 text-xs mt-1.5">{error}</p>}
    </div>
  );
});

export default Input;

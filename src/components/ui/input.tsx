import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = "", ...props }, ref) => {
    return (
      <div className="form-group">
        {label && <label htmlFor={id} className="form-label">{label}</label>}
        <input ref={ref} id={id} className={`form-input ${error ? "form-input-error" : ""} ${className}`} {...props} />
        {error && <span className="form-error">{error}</span>}
      </div>
    );
  }
);
Input.displayName = "Input";

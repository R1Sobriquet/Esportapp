import React, { useState } from 'react';

const validationRules = {
  required: (value) => (!value || value.trim() === '' ? 'Ce champ est requis' : null),
  email: (value) => {
    if (!value) return null;
    return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Email invalide' : null;
  },
  minLength: (min) => (value) => (!value ? null : value.length < min ? `Minimum ${min} caractères` : null),
  maxLength: (max) => (value) => (!value ? null : value.length > max ? `Maximum ${max} caractères` : null),
  password: (value) => {
    if (!value) return null;
    if (value.length < 8) return 'Minimum 8 caractères';
    if (!/[a-zA-Z]/.test(value)) return 'Doit contenir une lettre';
    if (!/[0-9]/.test(value)) return 'Doit contenir un chiffre';
    return null;
  },
  url: (value) => {
    if (!value) return null;
    try { new URL(value); return null; } catch { return 'URL invalide'; }
  },
  match: (matchValue, fieldName) => (value) =>
    (!value ? null : value !== matchValue ? `Doit correspondre à ${fieldName}` : null),
};

const StateIcon = ({ state }) => {
  if (state === 'valid') return (
    <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
  if (state === 'invalid') return (
    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
  return null;
};

const FormInput = ({
  label, name, type = 'text', value, onChange, placeholder,
  icon, validation = [], disabled = false, className = '',
  showCounter = false, maxLength, hint, autoComplete, onValidationChange,
}) => {
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState(null);

  const validate = (val) => {
    for (const rule of validation) {
      let errorMsg = null;
      if (typeof rule === 'string') {
        if (validationRules[rule]) errorMsg = validationRules[rule](val);
      } else if (typeof rule === 'object') {
        const { type, value: ruleValue, fieldName } = rule;
        if (type === 'minLength') errorMsg = validationRules.minLength(ruleValue)(val);
        else if (type === 'maxLength') errorMsg = validationRules.maxLength(ruleValue)(val);
        else if (type === 'match') errorMsg = validationRules.match(ruleValue, fieldName)(val);
      } else if (typeof rule === 'function') {
        errorMsg = rule(val);
      }
      if (errorMsg) return errorMsg;
    }
    return null;
  };

  const handleChange = (e) => {
    onChange(e);
    if (touched) {
      const validationError = validate(e.target.value);
      setError(validationError);
      onValidationChange?.(name, !validationError);
    }
  };

  const handleBlur = () => {
    setTouched(true);
    const validationError = validate(value);
    setError(validationError);
    onValidationChange?.(name, !validationError);
  };

  const isValid = touched && !error && value;
  const isInvalid = touched && error;

  const inputClasses = `
    w-full px-4 py-3
    ${icon ? 'pl-11' : ''}
    ${isValid || isInvalid ? 'pr-11' : ''}
    bg-slate-50 dark:bg-white/5 border rounded-xl
    text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500
    transition-all duration-200 focus:outline-none focus:ring-2
    ${isInvalid
      ? 'border-red-300 dark:border-red-500/50 focus:ring-red-400/50 dark:focus:ring-red-500/50'
      : isValid
        ? 'border-emerald-300 dark:border-emerald-500/50 focus:ring-emerald-400/50 dark:focus:ring-emerald-500/50'
        : 'border-slate-200 dark:border-white/10 focus:ring-sky-400 dark:focus:ring-neon-cyan/60 focus:border-transparent'
    }
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${className}
  `;

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={name} className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
          {label}
          {validation.includes('required') && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
            {icon}
          </div>
        )}
        {type === 'textarea' ? (
          <textarea
            id={name} name={name} value={value}
            onChange={handleChange} onBlur={handleBlur}
            placeholder={placeholder} disabled={disabled}
            maxLength={maxLength} rows={4}
            className={inputClasses}
          />
        ) : (
          <input
            id={name} name={name} type={type} value={value}
            onChange={handleChange} onBlur={handleBlur}
            placeholder={placeholder} disabled={disabled}
            maxLength={maxLength} autoComplete={autoComplete}
            className={inputClasses}
          />
        )}
        {(isValid || isInvalid) && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <StateIcon state={isValid ? 'valid' : 'invalid'} />
          </div>
        )}
      </div>
      <div className="flex justify-between items-center min-h-[1.25rem]">
        <div>
          {isInvalid && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
          {!isInvalid && hint && <p className="text-sm text-slate-500 dark:text-slate-400">{hint}</p>}
        </div>
        {showCounter && maxLength && (
          <p className={`text-xs ${value?.length > maxLength * 0.9 ? 'text-amber-500' : 'text-slate-400 dark:text-slate-500'}`}>
            {value?.length || 0}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
};

export const FormSelect = ({
  label, name, value, onChange, options,
  placeholder = 'Sélectionner...', disabled = false, validation = [], className = '',
}) => {
  const [touched, setTouched] = useState(false);
  const isRequired = validation.includes('required');
  const isInvalid = touched && isRequired && !value;

  const selectClasses = `
    w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border rounded-xl
    text-slate-800 dark:text-white transition-all duration-200 appearance-none cursor-pointer
    focus:outline-none focus:ring-2
    ${isInvalid
      ? 'border-red-300 dark:border-red-500/50 focus:ring-red-400/50'
      : 'border-slate-200 dark:border-white/10 focus:ring-sky-400 dark:focus:ring-neon-cyan/60 focus:border-transparent'
    }
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${className}
  `;

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={name} className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={name} name={name} value={value} onChange={onChange}
          onBlur={() => setTouched(true)} disabled={disabled}
          className={selectClasses}
        >
          <option value="" disabled>{placeholder}</option>
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {isInvalid && <p className="text-sm text-red-500 dark:text-red-400">Ce champ est requis</p>}
    </div>
  );
};

export default FormInput;

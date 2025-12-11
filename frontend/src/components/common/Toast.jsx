/**
 * Toast Notification Component
 * Displays beautiful toast notifications with progress bar
 */

import React, { useState, useEffect } from 'react';

const Toast = ({ message, type = 'success', duration = 4000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - (100 / (duration / 50));
        return newProgress <= 0 ? 0 : newProgress;
      });
    }, 50);

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for animation
    }, duration);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [duration, onClose]);

  const typeStyles = {
    success: {
      gradient: 'bg-gradient-glow',
      icon: '✓',
      border: 'border-primary-light',
    },
    error: {
      gradient: 'bg-gradient-dark',
      icon: '✕',
      border: 'border-red-500',
    },
    info: {
      gradient: 'bg-gradient-primary',
      icon: 'ℹ',
      border: 'border-primary',
    },
    warning: {
      gradient: 'bg-gradient-dark',
      icon: '⚠',
      border: 'border-yellow-500',
    },
  };

  const style = typeStyles[type] || typeStyles.success;

  return (
    <div
      className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div
        className={`${style.gradient} backdrop-blur-lg rounded-xl shadow-glow-red-lg border ${style.border} overflow-hidden max-w-md`}
      >
        <div className="p-4 flex items-center gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-2xl">
            {style.icon}
          </div>
          <div className="flex-1">
            <p className="text-white font-medium text-sm leading-relaxed">
              {message}
            </p>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="flex-shrink-0 text-white/70 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-white/20">
          <div
            className="h-full bg-white/80 transition-all duration-50 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

// Toast Container Component
export const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-0 right-0 z-50 p-4 space-y-4 pointer-events-none">
      <div className="pointer-events-auto space-y-4">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
};

// Default export with ToastContainer attached
Toast.ToastContainer = ToastContainer;

export default Toast;
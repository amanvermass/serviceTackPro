import { toast as toastOriginal, Toast } from "react-hot-toast";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import React, { useState, useEffect } from "react";

interface CustomToastProps {
  t: Toast;
  message: string;
  type?: 'default' | 'success' | 'error' | 'info';
}

// Custom Toast Component
const CustomToast: React.FC<CustomToastProps> = ({ t, message, type = 'default' }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => (prev <= 0 ? 0 : prev - 1));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress <= 0) {
      toastOriginal.dismiss(t.id);
    }
  }, [progress, t.id]);

  return (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex flex-col overflow-hidden border border-gray-200 transform -translate-x-1/2 left-1/2 fixed top-8 z-[100]`}
    >
      <div className="flex-1 w-full p-4 relative">
        {/* Message */}
        <div className="flex items-center pr-8">
          <div className="flex-shrink-0">
            {type === 'success' ? (
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            ) : type === 'error' ? (
              <XCircle className="h-6 w-6 text-red-500" />
            ) : (
              <Info className="h-6 w-6 text-blue-500" />
            )}
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium text-gray-900">
              {type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Info'}
            </p>
            <p className="mt-1 text-sm text-gray-500">{message}</p>
          </div>
        </div>
        
        {/* Close Button */}
        <button
          onClick={() => toastOriginal.dismiss(t.id)}
          className="absolute top-1/2 right-2 transform -translate-y-1/2 text-gray-400 hover:text-gray-500 p-1"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      {/* Progress Bar */}
      <div className="bg-gray-100 h-1 w-full">
        <div
          className={`h-full ${
            type === 'success' ? 'bg-green-500' :
            type === 'error' ? 'bg-red-500' : 'bg-blue-500'
          } transition-all duration-50`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

// Toast configuration
const toastConfig = {
  success: (message: string) => {
    return toastOriginal.custom((t) => (
      <CustomToast t={t} message={message} type="success" />
    ), {
      duration: 5000,
      position: 'top-center',
    });
  },
  error: (message: string) => {
    return toastOriginal.custom((t) => (
      <CustomToast t={t} message={message} type="error" />
    ), {
      duration: 5000,
      position: 'top-center',
    });
  },
  info: (message: string) => {
    return toastOriginal.custom((t) => (
      <CustomToast t={t} message={message} type="info" />
    ), {
      duration: 5000,
      position: 'top-center',
    });
  }
};

export default toastConfig;

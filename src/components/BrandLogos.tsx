import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const MetaLogo: React.FC<LogoProps> = ({ className = '', size = 24 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path 
      d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" 
      fill="#1877F2"
    />
  </svg>
);

export const TikTokLogo: React.FC<LogoProps> = ({ className = '', size = 24 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path 
      d="M12.525.025v16.14c0 3.236-2.622 5.859-5.859 5.859a5.86 5.86 0 0 1-5.859-5.86 5.86 5.86 0 0 1 5.86-5.858c.347 0 .684.03 1.011.088v3.957a1.91 1.91 0 0 0-1.011-.284c-1.054 0-1.91.855-1.91 1.909 0 1.053.856 1.909 1.91 1.909 1.053 0 1.91-.856 1.91-1.91V0h3.948c.092 2.215 1.884 3.968 4.108 3.968v3.949a8.03 8.03 0 0 1-4.108-1.575V.025h-3.948z" 
      fill="#000000"
    />
    <path 
      d="M12.525.025v16.14c0 3.236-2.622 5.859-5.859 5.859a5.86 5.86 0 0 1-5.859-5.86 5.86 5.86 0 0 1 5.86-5.858c.347 0 .684.03 1.011.088v3.957a1.91 1.91 0 0 0-1.011-.284c-1.054 0-1.91.855-1.91 1.909 0 1.053.856 1.909 1.91 1.909 1.053 0 1.91-.856 1.91-1.91V0h3.948c.092 2.215 1.884 3.968 4.108 3.968v3.949a8.03 8.03 0 0 1-4.108-1.575V.025h-3.948z" 
      fill="#00F2FE"
      opacity="0.9"
      style={{ mixBlendMode: 'screen' }}
    />
  </svg>
);

export const GoogleAdsLogo: React.FC<LogoProps> = ({ className = '', size = 24 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path 
      d="M15.9 3.6l-11.8 20.4c-.4.7-1.3 1-2 .6-.7-.4-1-1.3-.6-2L13.3 2.2c.4-.7 1.3-1 2-.6.7.4 1 1.3.6 2z" 
      fill="#F9BC05"
    />
    <path 
      d="M22.5 15.6l-11.8-6.8c-.7-.4-1.6-.2-2 .5s-.2 1.6.5 2l11.8 6.8c.7.4 1.6.2 2-.5s.2-1.6-.5-2z" 
      fill="#34A853"
    />
    <path 
      d="M15.4 3.3c-.7-.4-1.6-.2-2 .5L1.6 21.2c-.4.7-.2 1.6.5 2 .7.4 1.6.2 2-.5L15.9 5.3c.4-.7.2-1.6-.5-2z" 
      fill="#4285F4"
    />
  </svg>
);

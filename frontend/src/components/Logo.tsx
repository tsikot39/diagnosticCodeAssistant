interface LogoProps {
  className?: string
  size?: number
}

export function Logo({ className = '', size = 32 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background circle */}
      <circle cx="32" cy="32" r="32" className="fill-primary" />
      
      {/* Stethoscope head */}
      <circle cx="32" cy="20" r="6" className="fill-primary-foreground stroke-primary-foreground" strokeWidth="2" />
      <circle cx="32" cy="20" r="4" className="fill-primary" />
      
      {/* Stethoscope tube */}
      <path
        d="M32 26 C28 30, 20 35, 18 42"
        className="stroke-primary-foreground"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M32 26 C36 30, 44 35, 46 42"
        className="stroke-primary-foreground"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      
      {/* Left earpiece */}
      <circle cx="18" cy="42" r="3" className="fill-primary-foreground" />
      
      {/* Right earpiece */}
      <circle cx="46" cy="42" r="3" className="fill-primary-foreground" />
      
      {/* Code brackets/terminal symbol */}
      <path
        d="M22 48 L18 52 L22 56"
        className="stroke-primary-foreground"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M42 48 L46 52 L42 56"
        className="stroke-primary-foreground"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Center line (representing code) */}
      <line
        x1="28"
        y1="52"
        x2="36"
        y2="52"
        className="stroke-primary-foreground"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

// Simplified icon version without background
export function LogoIcon({ className = '', size = 24 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Stethoscope head */}
      <circle cx="32" cy="20" r="6" className="fill-current stroke-current" strokeWidth="2" />
      <circle cx="32" cy="20" r="4" className="fill-background" />
      
      {/* Stethoscope tube */}
      <path
        d="M32 26 C28 30, 20 35, 18 42"
        className="stroke-current"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M32 26 C36 30, 44 35, 46 42"
        className="stroke-current"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      
      {/* Earpieces */}
      <circle cx="18" cy="42" r="4" className="fill-current" />
      <circle cx="46" cy="42" r="4" className="fill-current" />
      
      {/* Code symbol */}
      <path
        d="M22 48 L18 52 L22 56"
        className="stroke-current"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M42 48 L46 52 L42 56"
        className="stroke-current"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line x1="28" y1="52" x2="36" y2="52" className="stroke-current" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

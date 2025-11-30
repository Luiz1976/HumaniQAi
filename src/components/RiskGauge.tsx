import { useMemo, useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';

interface RiskGaugeProps {
  value: number; // 0-100
  totalTests?: number;
  size?: 'small' | 'medium' | 'large';
}

interface RiskLevel {
  label: string;
  shortLabel: string;
  color: string;
  bgColor: string;
  gradient: string;
  strokeColor: string;
  min: number;
  max: number;
}

const RISK_LEVELS: RiskLevel[] = [
  {
    label: 'Excelente',
    shortLabel: 'A+',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500',
    gradient: 'from-emerald-400 to-green-500',
    strokeColor: '#00ff00', // Neon Green
    min: 80,
    max: 100
  },
  {
    label: 'Bom',
    shortLabel: 'A',
    color: 'text-green-400',
    bgColor: 'bg-green-500',
    gradient: 'from-green-400 to-lime-500',
    strokeColor: '#ccff00', // Neon Lime
    min: 60,
    max: 79
  },
  {
    label: 'Atenção',
    shortLabel: 'B',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500',
    gradient: 'from-yellow-400 to-amber-500',
    strokeColor: '#ffff00', // Neon Yellow
    min: 40,
    max: 59
  },
  {
    label: 'Crítico',
    shortLabel: 'C',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500',
    gradient: 'from-orange-400 to-red-500',
    strokeColor: '#ff9900', // Neon Orange
    min: 20,
    max: 39
  },
  {
    label: 'Muito Crítico',
    shortLabel: 'D',
    color: 'text-red-400',
    bgColor: 'bg-red-500',
    gradient: 'from-red-500 to-red-700',
    strokeColor: '#ff0099', // Neon Pink/Red
    min: 0,
    max: 19
  }
];

export default function RiskGauge({ value, totalTests, size = 'medium' }: RiskGaugeProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(0);

  const riskLevel = useMemo(() => {
    return RISK_LEVELS.find(level => value >= level.min && value <= level.max) || RISK_LEVELS[4];
  }, [value]);

  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, []);

  const sizes = {
    small: {
      container: 'w-32 h-32',
      strokeWidth: 0.75, // Half of previous (1.5)
      fontSize: 'text-xl',
      labelSize: 'text-[10px]',
      badgeSize: 'text-[10px] px-2 py-0.5'
    },
    medium: {
      container: 'w-48 h-48 md:w-56 md:h-56',
      strokeWidth: 1, // Half of previous (2)
      fontSize: 'text-3xl md:text-4xl',
      labelSize: 'text-xs md:text-sm',
      badgeSize: 'text-xs px-3 py-1'
    },
    large: {
      container: 'w-64 h-64',
      strokeWidth: 1.25, // Half of previous (2.5)
      fontSize: 'text-5xl',
      labelSize: 'text-sm',
      badgeSize: 'text-sm px-4 py-1.5'
    }
  };

  const config = sizes[size];
  const strokeDashoffset = pathLength - (value / 100) * pathLength;
  const heartPath = "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z";

  return (
    <div className="flex flex-col items-center gap-4" data-testid="risk-gauge">
      <div className={`relative ${config.container} flex items-center justify-center`}>

        {/* Animated SVG Heart Background (Premium 3D Look) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <svg viewBox="0 0 24 24" className="w-full h-full" style={{ overflow: 'visible' }}>
            <defs>
              {/* Premium Gradient */}
              <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff4d4d" />
                <stop offset="50%" stopColor="#e60000" />
                <stop offset="100%" stopColor="#990000" />
              </linearGradient>

              {/* 3D Inner Shadow/Glow */}
              <filter id="heart3D" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur" />
                <feOffset in="blur" dx="0.5" dy="1" result="offsetBlur" />
                <feSpecularLighting in="blur" surfaceScale="5" specularConstant=".75" specularExponent="20" lightingColor="#ffcccc" result="specOut">
                  <fePointLight x="-5000" y="-10000" z="20000" />
                </feSpecularLighting>
                <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut" />
                <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="litPaint" />
                <feMerge>
                  <feMergeNode in="offsetBlur" />
                  <feMergeNode in="litPaint" />
                </feMerge>
              </filter>
            </defs>

            <path
              d={heartPath}
              fill="url(#heartGradient)"
              style={{
                filter: 'url(#heart3D) drop-shadow(0 0 15px rgba(220, 20, 60, 0.6))',
                transformOrigin: 'center',
                animation: 'pulse-organic 4s ease-in-out infinite' // Realistic lub-dub
              }}
            />
          </svg>
        </div>

        {/* SVG Overlay */}
        <svg
          className="absolute inset-0 w-full h-full drop-shadow-xl"
          viewBox="0 0 24 24"
          style={{ overflow: 'visible' }}
        >
          <defs>
            {/* Custom Neon Glow Filter */}
            <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="1" result="blur1" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur2" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur3" />
              <feMerge>
                <feMergeNode in="blur3" />
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background Path */}
          <path
            d={heartPath}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            transform="scale(1.2)"
            style={{ transformOrigin: 'center' }}
          />

          {/* Progress Path - Enhanced Neon Glow */}
          <path
            ref={pathRef}
            d={heartPath}
            fill="none"
            stroke={riskLevel.strokeColor}
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={pathLength}
            strokeDashoffset={strokeDashoffset}
            transform="scale(1.2)"
            className="transition-all duration-1000 ease-out"
            style={{
              // Multi-layer drop-shadow for intense neon effect
              filter: `
                drop-shadow(0 0 2px ${riskLevel.strokeColor})
                drop-shadow(0 0 4px ${riskLevel.strokeColor})
                drop-shadow(0 0 8px ${riskLevel.strokeColor})
                drop-shadow(0 0 16px ${riskLevel.strokeColor})
                drop-shadow(0 0 32px ${riskLevel.strokeColor})
                drop-shadow(0 0 64px ${riskLevel.strokeColor})
                drop-shadow(0 0 100px ${riskLevel.strokeColor})
              `,
              transformOrigin: 'center'
            }}
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pt-2">
          <div className={`${config.fontSize} font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]`}>
            {Math.round(value)}%
          </div>
          <div className={`${config.labelSize} font-bold text-white/90 uppercase tracking-wider drop-shadow-md`}>
            Bem-Estar
          </div>
          {totalTests && totalTests > 0 && (
            <div className="text-[10px] text-white/80 mt-0.5 font-medium drop-shadow-md">
              {totalTests} {totalTests === 1 ? 'avaliação' : 'avaliações'}
            </div>
          )}
        </div>
      </div>

      {/* Risk Level Badge */}
      <Badge
        className={`${riskLevel.bgColor} text-white border-0 shadow-lg ${config.badgeSize} font-bold`}
        data-testid="risk-level-badge"
        style={{ animation: 'pulse-organic 4s ease-in-out infinite' }}
      >
        {riskLevel.label}
      </Badge>

      {/* Custom Style for Organic Pulse (Lub-Dub) */}
      <style>{`
        @keyframes pulse-organic {
          0% { transform: scale(1); }
          15% { transform: scale(1.08); } /* Lub */
          30% { transform: scale(1); }
          45% { transform: scale(1.04); } /* Dub */
          60% { transform: scale(1); }
          100% { transform: scale(1); }
        }
      `}</style>

      {/* Scale */}
      <div className="w-full max-w-[200px] space-y-1" data-testid="risk-scale">
        {RISK_LEVELS.map((level) => {
          const isActive = level.label === riskLevel.label;
          return (
            <div
              key={level.label}
              className={`flex items-center gap-2 transition-all duration-300 ${isActive ? 'scale-105' : 'opacity-40'
                }`}
            >
              <div className={`w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-6 border-l-white transition-opacity ${isActive ? 'opacity-100' : 'opacity-0'
                }`}></div>
              <div className={`flex-1 h-5 ${level.bgColor} rounded flex items-center justify-between px-2 shadow-md ${isActive ? 'ring-2 ring-white ring-offset-2 ring-offset-transparent' : ''
                }`}>
                <span className="text-white text-[10px] font-bold">{level.shortLabel}</span>
                <span className="text-white text-[10px] font-medium">{level.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

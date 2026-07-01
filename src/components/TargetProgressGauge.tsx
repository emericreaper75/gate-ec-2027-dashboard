import React, { useMemo } from 'react';
import { useStore } from '../store';
import { Card, CardContent, CardHeader, CardTitle, cn } from './ui';

export function TargetProgressGauge() {
  const { mocks } = useStore();

  const maxScore = useMemo(() => {
    if (!mocks || mocks.length === 0) return 0;
    return Math.max(...mocks.map(m => m.overallScore));
  }, [mocks]);

  const targetScore = 90;
  const progress = Math.min((maxScore / targetScore) * 100, 100);

  // SVG parameters
  const size = 160;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * Math.PI; // Semicircle
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  let colorClass = 'text-accent-danger';
  if (maxScore >= 50) colorClass = 'text-accent-warning';
  if (maxScore >= 75) colorClass = 'text-accent-primary';
  if (maxScore >= 90) colorClass = 'text-accent-success';

  let strokeColor = 'var(--color-accent-danger)';
  if (maxScore >= 50) strokeColor = 'var(--color-accent-warning)';
  if (maxScore >= 75) strokeColor = 'var(--color-accent-primary)';
  if (maxScore >= 90) strokeColor = 'var(--color-accent-success)';

  const startX = strokeWidth / 2;
  const endX = size - strokeWidth / 2;
  const yPos = size / 2;
  const pathData = `M ${startX} ${yPos} A ${radius} ${radius} 0 0 1 ${endX} ${yPos}`;

  return (
    <Card className="border border-border bg-bg-card rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
      <CardHeader className="p-3 border-b border-border bg-bg-elevated w-full text-center space-y-0">
        <CardTitle className="font-mono text-xs font-bold text-text-primary uppercase">
          🎯 90+ Marks Target
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 flex flex-col items-center justify-center bg-bg-card w-full">
        <div className="relative flex items-center justify-center" style={{ width: size, height: size / 2 }}>
          {/* Background Arc */}
          <svg
            className="absolute top-0 left-0 overflow-visible"
            width={size}
            height={size / 2}
            viewBox={`0 0 ${size} ${size / 2}`}
          >
            <path
              d={pathData}
              fill="none"
              stroke="var(--color-bg-elevated)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
          </svg>
          {/* Progress Arc */}
          <svg
            className="absolute top-0 left-0 transition-all duration-1000 ease-out overflow-visible"
            width={size}
            height={size / 2}
            viewBox={`0 0 ${size} ${size / 2}`}
          >
            <path
              d={pathData}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>
          
          <div className="absolute bottom-0 left-0 w-full text-center pb-0">
            <span className={cn("text-3xl font-bold font-mono tracking-tighter", colorClass)}>
              {maxScore.toFixed(1)}
            </span>
            <span className="text-text-muted text-sm font-mono block -mt-1">/ {targetScore}</span>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-xs text-text-secondary font-mono">
            {maxScore >= targetScore 
              ? "🎯 Target Achieved! Maintain this level." 
              : `Just ${(targetScore - maxScore).toFixed(1)} marks away from goal.`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}


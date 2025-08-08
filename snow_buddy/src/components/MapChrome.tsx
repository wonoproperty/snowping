import { ReactNode } from 'react';

interface MapChromeProps {
  children: ReactNode;
}

export function MapChrome({ children }: MapChromeProps) {
  return (
    <div className="relative h-screen w-full bg-gradient-to-br from-slate-950 to-slate-900">
      {/* Map container with safe area padding */}
      <div className="absolute inset-0 pt-safe-top pb-safe-bottom pl-safe-left pr-safe-right">
        {children}
      </div>
    </div>
  );
}
import { ReactNode } from 'react';

interface MapChromeProps {
  children: ReactNode;
}

export function MapChrome({ children }: MapChromeProps) {
  return (
    <div className="relative h-screen w-full bg-gradient-to-br from-slate-950 to-slate-900">
      {/* Map container with proper padding for header and action buttons */}
      <div className="absolute inset-0 pt-24 pb-24 px-4 md:pt-20 md:pb-4 md:pr-20">
        {children}
      </div>
    </div>
  );
}
import { Copy, Check, Snowflake } from 'lucide-react';
import { useState } from 'react';

interface HeaderBarProps {
  groupCode?: string;
  isConnected?: boolean;
}

export function HeaderBar({ groupCode, isConnected }: HeaderBarProps) {
  const [isCopied, setIsCopied] = useState(false);

  const copyGroupCode = async () => {
    if (!groupCode) return;
    
    try {
      await navigator.clipboard.writeText(groupCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy group code:', error);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <div className="pt-safe-top px-4 py-3">
        <div className="glass rounded-2xl px-6 py-4 pointer-events-auto">
          <div className="flex items-center justify-between">
            {/* App title */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-sky-400 to-indigo-500 rounded-xl">
                <Snowflake className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">
                  SnowPing
                </h1>
                {isConnected && (
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-sm text-emerald-400 font-medium">Connected</span>
                  </div>
                )}
              </div>
            </div>

            {/* Group code badge */}
            {groupCode && (
              <button
                onClick={copyGroupCode}
                className="glass-dark rounded-xl px-4 py-2.5 transition-all duration-200 hover:bg-white/20 active:scale-95 focus:outline-none focus:ring-2 focus:ring-sky-400/60"
                title="Copy group code"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-white font-mono font-semibold text-lg tracking-wide">
                    {groupCode}
                  </span>
                  {isCopied ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-white/70" />
                  )}
                </div>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
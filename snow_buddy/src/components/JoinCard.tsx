import { useState } from 'react';
import { LogIn, Shuffle, Users, Snowflake } from 'lucide-react';

interface JoinCardProps {
  onJoinGroup: (groupCode: string, username: string) => void;
  isConnecting?: boolean;
}

export function JoinCard({ onJoinGroup, isConnecting }: JoinCardProps) {
  const [groupCode, setGroupCode] = useState('');
  const [username, setUsername] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateCode = () => {
    setIsGenerating(true);
    // Generate a random 4-character code
    const code = Math.random().toString(36).substring(2, 6).toUpperCase();
    setGroupCode(code);
    setTimeout(() => setIsGenerating(false), 200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (groupCode.trim() && username.trim()) {
      onJoinGroup(groupCode.trim().toUpperCase(), username.trim());
    }
  };

  const isValid = groupCode.trim().length >= 3 && username.trim().length >= 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and title */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-sky-400 to-indigo-500 rounded-3xl shadow-lg shadow-sky-500/25">
              <Snowflake className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
            SnowPing
          </h1>
          <p className="text-lg text-slate-300">
            Track friends on the slopes in real-time
          </p>
        </div>

        {/* Join form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="glass rounded-3xl p-8 shadow-lg shadow-black/20">
            <div className="space-y-6">
              {/* Group code input */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-white">
                  Group Code
                </label>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={groupCode}
                    onChange={(e) => setGroupCode(e.target.value.toUpperCase())}
                    placeholder="Enter group code"
                    className="flex-1 bg-black/20 border border-white/10 rounded-2xl px-4 py-3.5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-sky-400/60 focus:border-transparent transition-all duration-200"
                    maxLength={8}
                  />
                  <button
                    type="button"
                    onClick={generateCode}
                    disabled={isGenerating}
                    className="btn-secondary flex-shrink-0 px-4 py-3.5"
                    title="Generate random code"
                  >
                    <Shuffle className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Username input */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-white">
                  Your Name
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full bg-black/20 border border-white/10 rounded-2xl px-4 py-3.5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-sky-400/60 focus:border-transparent transition-all duration-200"
                  maxLength={20}
                />
              </div>
            </div>
          </div>

          {/* Join button */}
          <button
            type="submit"
            disabled={!isValid || isConnecting}
            className="w-full btn-primary py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-emerald-500"
          >
            {isConnecting ? (
              <div className="flex items-center justify-center space-x-3">
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Connecting...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-3">
                <LogIn className="w-6 h-6" />
                <span>Join Group</span>
              </div>
            )}
          </button>
        </form>

        {/* Help text */}
        <div className="mt-8 text-center">
          <div className="glass-dark rounded-2xl p-4">
            <div className="flex items-start space-x-3">
              <Users className="w-5 h-5 text-sky-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-slate-300 text-left">
                <p className="font-medium text-white mb-1">How it works:</p>
                <p>
                  Create or join a group to share your location with friends. 
                  Everyone in the group can see each other's location on the map 
                  and use the compass to navigate to each other.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
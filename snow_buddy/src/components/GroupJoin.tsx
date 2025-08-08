import React, { useState } from 'react';
import { Users, Shuffle, LogIn, Snowflake } from 'lucide-react';

interface GroupJoinProps {
  onJoinGroup: (groupCode: string, username: string) => void;
  isConnecting: boolean;
}

export function GroupJoin({ onJoinGroup, isConnecting }: GroupJoinProps) {
  const [groupCode, setGroupCode] = useState('');
  const [username, setUsername] = useState('');
  const [errors, setErrors] = useState<{ groupCode?: string; username?: string }>({});

  const validateForm = () => {
    const newErrors: { groupCode?: string; username?: string } = {};
    
    if (!groupCode.trim()) {
      newErrors.groupCode = 'Group code is required';
    } else if (groupCode.trim().length < 3) {
      newErrors.groupCode = 'Group code must be at least 3 characters';
    }
    
    if (!username.trim()) {
      newErrors.username = 'Username is required';
    } else if (username.trim().length < 2) {
      newErrors.username = 'Username must be at least 2 characters';
    } else if (username.trim().length > 20) {
      newErrors.username = 'Username must be less than 20 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onJoinGroup(groupCode.trim().toUpperCase(), username.trim());
    }
  };

  const generateGroupCode = () => {
    // Generate a random 6-character alphanumeric code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGroupCode(result);
    setErrors({ ...errors, groupCode: undefined });
  };

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
            Join a group to start tracking friends on the slopes
          </p>
        </div>

        {/* Join form */}
        <div className="glass rounded-3xl p-8 shadow-lg shadow-black/20">

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-white">
                Group Code
              </label>
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={groupCode}
                  onChange={(e) => {
                    setGroupCode(e.target.value.toUpperCase());
                    setErrors({ ...errors, groupCode: undefined });
                  }}
                  placeholder="Enter group code"
                  className={`flex-1 bg-black/20 border rounded-2xl px-4 py-3.5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-sky-400/60 focus:border-transparent transition-all duration-200 ${
                    errors.groupCode ? 'border-rose-400/50' : 'border-white/10'
                  }`}
                  maxLength={8}
                  disabled={isConnecting}
                />
                <button
                  type="button"
                  onClick={generateGroupCode}
                  disabled={isConnecting}
                  className="btn-secondary flex-shrink-0 px-4 py-3.5"
                  title="Generate random code"
                >
                  <Shuffle className="w-5 h-5" />
                </button>
              </div>
              {errors.groupCode && (
                <p className="mt-1 text-sm text-rose-400">{errors.groupCode}</p>
              )}
              <p className="mt-1 text-sm text-slate-400">
                Share this code with friends so they can join your group
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-white">
                Your Name
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setErrors({ ...errors, username: undefined });
                }}
                placeholder="Enter your name"
                className={`w-full bg-black/20 border rounded-2xl px-4 py-3.5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-sky-400/60 focus:border-transparent transition-all duration-200 ${
                  errors.username ? 'border-rose-400/50' : 'border-white/10'
                }`}
                maxLength={20}
                disabled={isConnecting}
              />
              {errors.username && (
                <p className="mt-1 text-sm text-rose-400">{errors.username}</p>
              )}
            </div>

          </form>
        </div>

        {/* Join button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            if (validateForm()) {
              onJoinGroup(groupCode.trim().toUpperCase(), username.trim());
            }
          }}
          disabled={isConnecting || !groupCode.trim() || !username.trim()}
          className="w-full btn-primary py-4 text-lg font-semibold mt-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-emerald-500"
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

        {/* Help text */}
        <div className="mt-8 text-center">
          <div className="glass-dark rounded-2xl p-4">
            <div className="flex items-start space-x-3">
              <Users className="w-5 h-5 text-sky-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-slate-300 text-left">
                <p className="font-medium text-white mb-1">How it works:</p>
                <ul className="space-y-1">
                  <li>• Share your group code with friends</li>
                  <li>• See everyone's location on the map</li>
                  <li>• Use the compass to navigate to friends</li>
                  <li>• Stay connected on the slopes</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
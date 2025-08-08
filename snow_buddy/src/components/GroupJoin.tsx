import React, { useState } from 'react';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">SnowPing</h1>
          <p className="text-gray-600">Join a group to start tracking friends on the slopes</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="groupCode" className="block text-sm font-medium text-gray-700 mb-2">
              Group Code
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="groupCode"
                value={groupCode}
                onChange={(e) => {
                  setGroupCode(e.target.value.toUpperCase());
                  setErrors({ ...errors, groupCode: undefined });
                }}
                placeholder="Enter or generate code"
                className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.groupCode ? 'border-red-300' : 'border-gray-300'
                }`}
                maxLength={10}
                disabled={isConnecting}
              />
              <button
                type="button"
                onClick={generateGroupCode}
                disabled={isConnecting}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                title="Generate random code"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
            {errors.groupCode && (
              <p className="mt-1 text-sm text-red-600">{errors.groupCode}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Share this code with friends so they can join your group
            </p>
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setErrors({ ...errors, username: undefined });
              }}
              placeholder="Enter your display name"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.username ? 'border-red-300' : 'border-gray-300'
              }`}
              maxLength={20}
              disabled={isConnecting}
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-600">{errors.username}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isConnecting || !groupCode.trim() || !username.trim()}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isConnecting ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Joining Group...
              </div>
            ) : (
              'Join Group'
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-3">How it works:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Share your group code with friends</li>
            <li>• See everyone's location on the map</li>
            <li>• Use the compass to navigate to friends</li>
            <li>• Stay connected on the slopes</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { Users, Plus, Hash, ArrowRight } from 'lucide-react';

interface RoomCreateJoinProps {
  onJoinRoom: (roomCode: string) => void;
  onCreateRoom: () => void;
}

export default function RoomCreateJoin({ onJoinRoom, onCreateRoom }: RoomCreateJoinProps) {
  const [roomCode, setRoomCode] = useState('');
  const [showJoinForm, setShowJoinForm] = useState(false);

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomCode.trim()) {
      onJoinRoom(roomCode.trim().toUpperCase());
    }
  };

  const handleCreateRoom = () => {
    onCreateRoom();
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-6 h-6 text-farm-blue" />
        <h3 className="text-lg font-semibold text-gray-800">Multiplayer Rooms</h3>
      </div>

      <div className="space-y-4">
        {/* Create Room */}
        <button
          onClick={handleCreateRoom}
          className="w-full bg-farm-green hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create New Room
        </button>

        {/* Join Room */}
        <div className="border-t border-gray-200 pt-4">
          {!showJoinForm ? (
            <button
              onClick={() => setShowJoinForm(true)}
              className="w-full bg-farm-blue hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Hash className="w-5 h-5" />
              Join Existing Room
            </button>
          ) : (
            <form onSubmit={handleJoinRoom} className="space-y-3">
              <div>
                <label htmlFor="roomCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Room Code
                </label>
                <input
                  type="text"
                  id="roomCode"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="Enter room code (e.g., ABC123)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farm-blue focus:border-transparent"
                  maxLength={6}
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-farm-blue hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowRight className="w-4 h-4" />
                  Join Room
                </button>
                <button
                  type="button"
                  onClick={() => setShowJoinForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-semibold text-blue-800 mb-2">How it works:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Create a room to invite friends</li>
          <li>• Share the room code with others</li>
          <li>• Everyone plays the same weekly seed</li>
          <li>• Compare scores on the room leaderboard</li>
        </ul>
      </div>
    </div>
  );
}


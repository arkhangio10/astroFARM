'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Swords, Shield, Heart, Zap, Trophy, Users, Timer, ArrowLeft } from 'lucide-react';

interface VegetableAvatar {
  id: string;
  playerId: string;
  playerName: string;
  vegetableType: string;
  level: number;
  experience: number;
  powerLevel: number;
  health: number;
  maxHealth: number;
  traits: string[];
  wins: number;
  losses: number;
}

interface BattleRoom {
  id: string;
  name: string;
  players: VegetableAvatar[];
  maxPlayers: number;
  status: 'waiting' | 'battling' | 'finished';
  winner?: string;
}

interface VegetableBattleArenaProps {
  playerAvatar: VegetableAvatar;
  onClose: () => void;
  onBattleRequest?: (opponentId: string) => Promise<void>;
}

export default function VegetableBattleArena({ playerAvatar, onClose, onBattleRequest }: VegetableBattleArenaProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'rooms' | 'leaderboard' | 'myStats'>('rooms');
  const [battleRooms, setBattleRooms] = useState<BattleRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<BattleRoom | null>(null);
  const [inBattle, setInBattle] = useState(false);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [opponent, setOpponent] = useState<VegetableAvatar | null>(null);

  useEffect(() => {
    // Cargar salas de batalla disponibles
    loadBattleRooms();
  }, []);

  const loadBattleRooms = () => {
    // Simulación de salas de batalla
    const mockRooms: BattleRoom[] = [
      {
        id: '1',
        name: 'Arena de Novatos',
        players: [],
        maxPlayers: 2,
        status: 'waiting',
      },
      {
        id: '2',
        name: 'Desafío Vegetal',
        players: [],
        maxPlayers: 4,
        status: 'waiting',
      },
      {
        id: '3',
        name: 'Torneo de Cosecha',
        players: [],
        maxPlayers: 8,
        status: 'waiting',
      },
    ];
    setBattleRooms(mockRooms);
  };

  const joinRoom = (room: BattleRoom) => {
    setSelectedRoom(room);
    // Simular oponente
    const mockOpponent: VegetableAvatar = {
      id: 'bot-1',
      playerId: 'bot',
      playerName: 'Granjero Bot',
      vegetableType: 'tomato',
      level: playerAvatar.level + Math.floor(Math.random() * 3 - 1),
      experience: 150,
      powerLevel: 80 + Math.floor(Math.random() * 40),
      health: 100,
      maxHealth: 100,
      traits: ['Resistente', 'Maduro'],
      wins: Math.floor(Math.random() * 10),
      losses: Math.floor(Math.random() * 5),
    };
    setOpponent(mockOpponent);
  };

  const startBattle = () => {
    if (!opponent || !selectedRoom) return;

    setInBattle(true);
    setBattleLog(['The battle has begun!']);

    // Turn-based battle simulation
    let playerHealth = playerAvatar.maxHealth;
    let opponentHealth = opponent.maxHealth;
    const logs: string[] = ['The battle has begun!'];

    const battleInterval = setInterval(() => {
      // Player turn
      const playerDamage = Math.floor(playerAvatar.powerLevel / 10 + Math.random() * 10);
      opponentHealth -= playerDamage;
      logs.push(`${playerAvatar.playerName} attacks dealing ${playerDamage} damage!`);

      if (opponentHealth <= 0) {
        logs.push(`${playerAvatar.playerName} has won the battle! 🏆`);
        handleBattleEnd(true);
        clearInterval(battleInterval);
        return;
      }

      // Opponent turn
      const opponentDamage = Math.floor(opponent.powerLevel / 10 + Math.random() * 10);
      playerHealth -= opponentDamage;
      logs.push(`${opponent.playerName} counterattacks dealing ${opponentDamage} damage!`);

      if (playerHealth <= 0) {
        logs.push(`${opponent.playerName} has won the battle...`);
        handleBattleEnd(false);
        clearInterval(battleInterval);
        return;
      }

      setBattleLog([...logs]);
    }, 2000);
  };

  const handleBattleEnd = (playerWon: boolean) => {
    setInBattle(false);
    if (playerWon) {
      // Actualizar estadísticas
      playerAvatar.wins += 1;
      playerAvatar.experience += 50;
    } else {
      playerAvatar.losses += 1;
      playerAvatar.experience += 10;
    }
  };

  const getVegetableEmoji = (type: string) => {
    const emojis: Record<string, string> = {
      'carrot': '🥕',
      'lettuce': '🥬',
      'tomato': '🍅',
      'corn': '🌽',
      'almonds': '🌰',
      'pistachios': '🥜',
      'walnuts': '🌰',
      'grapes': '🍇',
      'citrus': '🍊',
      'strawberries': '🍓',
      'rice': '🌾',
      'cotton': '🌿',
    };
    return emojis[type] || '🌱';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="rounded-xl w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl overflow-hidden" style={{
        backgroundImage: 'url(/images/granja_batalla.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-bold flex items-center gap-2" style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)' }}>
                <Swords className="w-8 h-8" />
                Vegetable Battle Arena
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm opacity-80">Your Avatar</p>
                <p className="font-bold flex items-center gap-2">
                  <span className="text-2xl">{getVegetableEmoji(playerAvatar.vegetableType)}</span>
                  Level {playerAvatar.level}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b bg-white">
          <button
            onClick={() => setActiveTab('rooms')}
            className={`flex-1 py-3 px-4 font-medium transition-colors ${
              activeTab === 'rooms'
                ? 'border-b-2 border-purple-600 text-purple-600'
                : 'text-gray-800 hover:text-black'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Battle Rooms
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex-1 py-3 px-4 font-medium transition-colors ${
              activeTab === 'leaderboard'
                ? 'border-b-2 border-purple-600 text-purple-600'
                : 'text-gray-800 hover:text-black'
            }`}
          >
            <Trophy className="w-4 h-4 inline mr-2" />
            Leaderboard
          </button>
          <button
            onClick={() => setActiveTab('myStats')}
            className={`flex-1 py-3 px-4 font-medium transition-colors ${
              activeTab === 'myStats'
                ? 'border-b-2 border-purple-600 text-purple-600'
                : 'text-gray-800 hover:text-black'
            }`}
          >
            <Zap className="w-4 h-4 inline mr-2" />
            My Statistics
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-white bg-opacity-90">
          {activeTab === 'rooms' && !selectedRoom && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {battleRooms.map(room => (
                <div
                  key={room.id}
                  className="bg-gray-50 rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-purple-300"
                  onClick={() => joinRoom(room)}
                >
                  <h3 className="font-bold text-lg mb-2 text-black">{room.name}</h3>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center justify-between">
                      <span className="text-gray-900 font-medium">Players:</span>
                      <span className="font-semibold text-black">{room.players.length}/{room.maxPlayers}</span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span className="text-gray-900 font-medium">Status:</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        room.status === 'waiting' ? 'bg-green-100 text-green-800' :
                        room.status === 'battling' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {room.status === 'waiting' ? 'Waiting' :
                         room.status === 'battling' ? 'In Battle' : 'Finished'}
                      </span>
                    </p>
                  </div>
                  <button className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition-colors">
                    Join
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Battle Screen */}
          {selectedRoom && opponent && (
            <div className="max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-center mb-6 text-black">
                {selectedRoom.name}
              </h3>

              <div className="grid grid-cols-2 gap-8 mb-8">
                {/* Player */}
                <div className="bg-white bg-opacity-95 backdrop-blur-md rounded-lg p-6 text-center shadow-xl border-2 border-green-300">
                  <h4 className="font-bold text-lg mb-2 text-black">{playerAvatar.playerName}</h4>
                  <div className="text-6xl mb-4">{getVegetableEmoji(playerAvatar.vegetableType)}</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-black font-semibold">Level:</span>
                      <span className="font-bold text-black text-lg">{playerAvatar.level}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-black font-semibold">Power:</span>
                      <span className="font-bold text-black text-lg">{playerAvatar.powerLevel}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-black font-semibold">Traits:</span>
                      <span className="text-sm font-semibold text-black">{playerAvatar.traits.join(', ')}</span>
                    </div>
                  </div>
                </div>

                {/* VS */}
                <div className="bg-white bg-opacity-95 backdrop-blur-md rounded-lg p-6 text-center shadow-xl border-2 border-red-300">
                  <h4 className="font-bold text-lg mb-2 text-black">{opponent.playerName}</h4>
                  <div className="text-6xl mb-4">{getVegetableEmoji(opponent.vegetableType)}</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-black font-semibold">Level:</span>
                      <span className="font-bold text-black text-lg">{opponent.level}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-black font-semibold">Power:</span>
                      <span className="font-bold text-black text-lg">{opponent.powerLevel}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-black font-semibold">Traits:</span>
                      <span className="text-sm font-semibold text-black">{opponent.traits.join(', ')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Battle Log */}
              {battleLog.length > 0 && (
                <div className="bg-gray-100 rounded-lg p-4 mb-6 max-h-40 overflow-y-auto">
                  <h5 className="font-bold mb-2">Battle Log</h5>
                  {battleLog.map((log, index) => (
                    <p key={index} className="text-sm text-gray-700 mb-1">
                      {log}
                    </p>
                  ))}
                </div>
              )}

              {/* Battle Controls */}
              <div className="flex justify-center gap-4">
                {!inBattle && battleLog.length === 0 && (
                  <button
                    onClick={startBattle}
                    className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Swords className="w-5 h-5" />
                    Start Battle!
                  </button>
                )}
                {!inBattle && battleLog.length > 0 && (
                  <button
                    onClick={() => {
                      setSelectedRoom(null);
                      setBattleLog([]);
                      setOpponent(null);
                    }}
                    className="px-8 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg transition-colors"
                  >
                    Back to Rooms
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === 'leaderboard' && (
            <div className="max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold mb-6 text-black">Top Warrior Vegetables</h3>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                  <thead className="bg-purple-600 text-white">
                    <tr>
                      <th className="px-4 py-3 text-left">#</th>
                      <th className="px-4 py-3 text-left">Player</th>
                      <th className="px-4 py-3 text-left">Vegetable</th>
                      <th className="px-4 py-3 text-center">Level</th>
                      <th className="px-4 py-3 text-center">Wins</th>
                      <th className="px-4 py-3 text-center">Power</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3, 4, 5].map((rank) => (
                      <tr key={rank} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">
                          {rank <= 3 ? (
                            <span className="text-2xl">
                              {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
                            </span>
                          ) : (
                            rank
                          )}
                        </td>
                        <td className="px-4 py-3 font-medium text-black">Granjero {rank}</td>
                        <td className="px-4 py-3">
                          <span className="text-2xl">
                            {['🥕', '🍅', '🌽', '🥬', '🍇'][rank - 1]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-black font-semibold">{15 - rank * 2}</td>
                        <td className="px-4 py-3 text-center text-black font-semibold">{50 - rank * 5}</td>
                        <td className="px-4 py-3 text-center text-black font-bold">
                          {150 - rank * 10}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'myStats' && (
            <div className="max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold mb-6 text-black">Battle Statistics</h3>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6">
                <div className="text-center mb-6">
                  <div className="text-6xl mb-2">{getVegetableEmoji(playerAvatar.vegetableType)}</div>
                  <h4 className="text-xl font-bold text-black">{playerAvatar.playerName}</h4>
                  <p className="text-gray-800 font-medium">Level {playerAvatar.level} • {playerAvatar.experience} EXP</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-black text-sm font-semibold">Wins</p>
                    <p className="text-3xl font-bold text-black">{playerAvatar.wins}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-black text-sm font-semibold">Losses</p>
                    <p className="text-3xl font-bold text-black">{playerAvatar.losses}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-black text-sm font-semibold">Combat Power</p>
                    <p className="text-3xl font-bold text-black">{playerAvatar.powerLevel}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-black text-sm font-semibold">Win Rate</p>
                    <p className="text-3xl font-bold text-black">
                      {playerAvatar.wins > 0 
                        ? Math.round((playerAvatar.wins / (playerAvatar.wins + playerAvatar.losses)) * 100)
                        : 0}%
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <h5 className="font-bold mb-2 text-black">Special Traits</h5>
                  <div className="flex flex-wrap gap-2">
                    {playerAvatar.traits.map(trait => (
                      <span
                        key={trait}
                        className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

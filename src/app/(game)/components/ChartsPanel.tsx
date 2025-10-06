'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/lib/store/gameStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Droplets, Thermometer, CloudRain } from 'lucide-react';

export default function ChartsPanel() {
  const { actions, currentDay, scores, environmentData } = useGameStore();
  const [chartData, setChartData] = useState<any[]>([]);
  const [historicalNASAData, setHistoricalNASAData] = useState<any[]>([]);

  // Fetch historical NASA data
  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        const endDate = new Date();
        
        const response = await fetch('/api/nasa-game-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lat: 36.7378,
            lon: -119.7871,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
          })
        });
        
        const result = await response.json();
        if (result.success) {
          setHistoricalNASAData(result.data);
        }
      } catch (error) {
        console.error('Error fetching historical NASA data:', error);
      }
    };
    
    fetchHistoricalData();
  }, []);

  useEffect(() => {
    // Generate chart data based on game actions and NASA data
    const data = [];
    for (let day = 0; day <= currentDay; day++) {
      const dayActions = actions.filter(action => action.day === day);
      
      // Use real NASA data if available, otherwise use current environment data or defaults
      const nasaData = historicalNASAData[day] || environmentData || {
        ndvi: 0.6,
        soilMoisture: 40,
        temperature: 22,
        precipitation: 0
      };
      
      data.push({
        day: day + 1,
        water: dayActions.filter(a => a.type === 'WATER').length * 10,
        fertilizer: dayActions.filter(a => a.type === 'FERTILIZE').length * 5,
        planting: dayActions.filter(a => a.type === 'PLANT').length * 1,
        harvest: dayActions.filter(a => a.type === 'HARVEST').length * 1,
        // Real NASA environmental data
        ndvi: nasaData.ndvi,
        soilMoisture: nasaData.soilMoisture / 100, // Convert to 0-1 range for chart
        temperature: nasaData.temperature,
        precipitation: nasaData.precipitation,
      });
    }
    
    setChartData(data);
  }, [actions, currentDay, environmentData, historicalNASAData]);

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Game Analytics</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Actions Chart */}
        <div>
          <h4 className="text-md font-medium text-gray-700 mb-3">Daily Actions</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="water" fill="#3b82f6" name="Water" />
              <Bar dataKey="fertilizer" fill="#10b981" name="Fertilizer" />
              <Bar dataKey="planting" fill="#8b5cf6" name="Planting" />
              <Bar dataKey="harvest" fill="#f59e0b" name="Harvest" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* NDVI Chart */}
        <div>
          <h4 className="text-md font-medium text-gray-700 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            NDVI Trend
          </h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis domain={[0, 1]} />
              <Tooltip />
              <Line type="monotone" dataKey="ndvi" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Soil Moisture Chart */}
        <div>
          <h4 className="text-md font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Droplets className="w-4 h-4" />
            Soil Moisture
          </h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis domain={[0, 1]} />
              <Tooltip />
              <Line type="monotone" dataKey="soilMoisture" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Temperature Chart */}
        <div>
          <h4 className="text-md font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Thermometer className="w-4 h-4" />
            Temperature
          </h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="temperature" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Current Scores */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-md font-medium text-gray-700 mb-3">Current Scores</h4>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{scores.yield}</div>
            <div className="text-sm text-gray-600">Yield</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{scores.water}</div>
            <div className="text-sm text-gray-600">Water</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{scores.environment}</div>
            <div className="text-sm text-gray-600">Environment</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-farm-gold">{scores.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
        </div>
      </div>
    </div>
  );
}


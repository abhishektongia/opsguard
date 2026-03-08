'use client';

import { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const mockData = [
  { date: 'Mon', P1: 2, P2: 4, P3: 8, P4: 5, P5: 3 },
  { date: 'Tue', P1: 1, P2: 3, P3: 6, P4: 4, P5: 2 },
  { date: 'Wed', P1: 3, P2: 5, P3: 9, P4: 7, P5: 4 },
  { date: 'Thu', P1: 2, P2: 4, P3: 7, P4: 6, P5: 3 },
  { date: 'Fri', P1: 4, P2: 6, P3: 10, P4: 8, P5: 5 },
  { date: 'Sat', P1: 1, P2: 2, P3: 4, P4: 3, P5: 1 },
  { date: 'Sun', P1: 2, P2: 3, P3: 5, P4: 4, P5: 2 },
];

export function AlertTrendChart() {
  const [range, setRange] = useState<'7' | '30'>('7');
  const [chartType, setChartType] = useState<'line' | 'bar'>('bar');

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Alert Trend</h2>
        <div className="flex gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setRange('7')}
              className={`px-3 py-1 text-sm rounded ${
                range === '7'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              7 days
            </button>
            <button
              onClick={() => setRange('30')}
              className={`px-3 py-1 text-sm rounded ${
                range === '30'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              30 days
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1 text-sm rounded ${
                chartType === 'line'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Line
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1 text-sm rounded ${
                chartType === 'bar'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Bar
            </button>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        {chartType === 'line' ? (
          <LineChart data={mockData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="P1"
              stroke="#dc2626"
              name="Critical (P1)"
            />
            <Line
              type="monotone"
              dataKey="P2"
              stroke="#ea580c"
              name="High (P2)"
            />
            <Line
              type="monotone"
              dataKey="P3"
              stroke="#eab308"
              name="Medium (P3)"
            />
            <Line type="monotone" dataKey="P4" stroke="#3b82f6" name="Low (P4)" />
            <Line
              type="monotone"
              dataKey="P5"
              stroke="#6b7280"
              name="Minimal (P5)"
            />
          </LineChart>
        ) : (
          <BarChart data={mockData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="P1" stackId="a" fill="#dc2626" name="Critical (P1)" />
            <Bar dataKey="P2" stackId="a" fill="#ea580c" name="High (P2)" />
            <Bar dataKey="P3" stackId="a" fill="#eab308" name="Medium (P3)" />
            <Bar dataKey="P4" stackId="a" fill="#3b82f6" name="Low (P4)" />
            <Bar dataKey="P5" stackId="a" fill="#6b7280" name="Minimal (P5)" />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

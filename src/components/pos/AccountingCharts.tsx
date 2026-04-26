"use client";

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';

interface ChartData {
  date: string;
  ventas: number;
  gastos: number;
}

interface AccountingChartsProps {
  data: ChartData[];
}

const AccountingCharts: React.FC<AccountingChartsProps> = ({ data }) => {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 min-h-[400px] flex flex-col">
        <h3 className="font-bold text-slate-800 mb-4">Tendencia de Ventas vs Gastos</h3>
        <div className="flex-1 w-full min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" fontSize={10} tickMargin={10} axisLine={false} tickLine={false} />
              <YAxis 
                fontSize={10} 
                axisLine={false} 
                tickLine={false} 
                tickFormatter={(value) => `$${value}`} 
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                formatter={(value: any) => `$${Number(value).toLocaleString()}`}
                labelFormatter={(label) => `Fecha: ${label}`}
              />
              <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '20px', fontSize: '12px' }} />
              <Bar dataKey="ventas" fill="#ec4899" radius={[4, 4, 0, 0]} name="Ventas" />
              <Bar dataKey="gastos" fill="#94a3b8" radius={[4, 4, 0, 0]} name="Gastos" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 min-h-[400px] flex flex-col">
        <h3 className="font-bold text-slate-800 mb-4">Evolución de Ingresos</h3>
        <div className="flex-1 w-full min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" fontSize={10} tickMargin={10} axisLine={false} tickLine={false} />
              <YAxis 
                fontSize={10} 
                axisLine={false} 
                tickLine={false} 
                tickFormatter={(value) => `$${value}`} 
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                formatter={(value: any) => `$${Number(value).toLocaleString()}`}
                labelFormatter={(label) => `Fecha: ${label}`}
              />
              <Line type="monotone" dataKey="ventas" stroke="#ec4899" strokeWidth={3} dot={{ r: 4, fill: '#ec4899' }} activeDot={{ r: 6 }} name="Ventas" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AccountingCharts;
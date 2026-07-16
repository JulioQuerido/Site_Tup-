import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AudienceChart() {
  const data = [
    { name: 'Lançamento', 'Visualizações': 500, 'Engajamento': 150 },
    { name: 'Grupos CS', 'Visualizações': 1200, 'Engajamento': 480 },
    { name: 'Playoffs CS', 'Visualizações': 2300, 'Engajamento': 920 },
    { name: 'Grupos Free Fire', 'Visualizações': 2900, 'Engajamento': 1100 },
    { name: 'Finais Free Fire', 'Visualizações': 4100, 'Engajamento': 1650 }
  ];

  return (
    <div className="w-full bg-[#1A1A1A] border border-[#242424] rounded-xl p-6 md:p-8 hover-neon-glow transition-all duration-300 relative overflow-hidden">
      <div className="mb-6">
        <h3 className="font-display-lg text-xl md:text-2xl font-bold text-on-surface mb-2 uppercase tracking-wider">
          Copa E-Games Paracatu — Evolução de Audiência
        </h3>
        <p className="text-on-surface-variant text-sm max-w-xl">
          Acompanhamento dinâmico do público ao vivo acumulado e do engajamento social nas transmissões oficiais das fases de Counter-Strike e Free Fire, atingindo o pico histórico de 4.100 espectadores simultâneos.
        </p>
      </div>

      <div className="h-80 w-full relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#242424" />
            <XAxis 
              dataKey="name" 
              stroke="#87929b" 
              tick={{ fill: '#87929b', fontSize: 11, fontWeight: 500 }} 
              axisLine={{ stroke: '#242424' }}
            />
            <YAxis 
              stroke="#87929b" 
              tick={{ fill: '#87929b', fontSize: 11, fontWeight: 500 }}
              axisLine={{ stroke: '#242424' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#131313', 
                borderColor: '#8fd6ff', 
                borderRadius: '8px',
                color: '#e5e2e1',
                fontFamily: 'Hanken Grotesk, sans-serif'
              }}
              labelStyle={{ color: '#8fd6ff', fontWeight: 'bold' }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36} 
              iconType="circle"
              wrapperStyle={{ 
                fontSize: 12, 
                fontWeight: 600, 
                color: '#e5e2e1',
                paddingTop: 15
              }}
            />
            <Line 
              type="monotone" 
              dataKey="Visualizações" 
              stroke="#8fd6ff" 
              strokeWidth={3} 
              activeDot={{ r: 8, stroke: '#00bfff', strokeWidth: 2 }} 
              dot={{ r: 4, fill: '#131313', stroke: '#8fd6ff', strokeWidth: 2 }}
              name="Visualizações Simultâneas"
            />
            <Line 
              type="monotone" 
              dataKey="Engajamento" 
              stroke="#94ccff" 
              strokeWidth={2} 
              strokeDasharray="5 5"
              dot={{ r: 3, fill: '#131313', stroke: '#94ccff', strokeWidth: 2 }}
              name="Reações & Cliques (Engajamento)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Decorative lightning background effect */}
      <div className="absolute bottom-0 right-0 w-44 h-44 bg-primary/5 blur-3xl rounded-full z-0 pointer-events-none"></div>
    </div>
  );
}

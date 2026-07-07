import React from 'react';
import { BillAnalysis, TariffRecommendation } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface AnalysisDashboardProps {
  data: BillAnalysis;
  onReset: () => void;
}

const TariffCard: React.FC<{ rec: TariffRecommendation; isBest?: boolean }> = ({ rec, isBest }) => {
  // Fallback URL search if the API doesn't provide a direct link
  const tariffUrl = rec.url || `https://www.google.com/search?q=${encodeURIComponent(`${rec.companyName} ${rec.tariffName} tarifa`)}`;

  return (
    <div className={`relative p-5 rounded-xl border-2 transition-all flex flex-col h-full ${isBest ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 shadow-md' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'}`}>
      {isBest && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-emerald-600 text-white px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase shadow-sm">
          Mejor Opción
        </div>
      )}
      
      {/* Header */}
      <div className="flex justify-between items-start mb-3 mt-1">
        <div className="overflow-hidden pr-2">
          <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100 leading-tight" title={rec.companyName}>{rec.companyName || 'Oferta'}</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide mt-0.5" title={rec.tariffName}>{rec.tariffName || 'Tarifa Estándar'}</p>
        </div>
        <div className="text-right flex-shrink-0 bg-white dark:bg-slate-700 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-600 shadow-sm">
          <div className="text-xl font-bold text-slate-900 dark:text-white">{rec.estimatedMonthlyCost}€</div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 text-center">/mes</div>
        </div>
      </div>

      {/* Cost Breakdown Grid */}
      <div className="bg-white/60 dark:bg-slate-700/40 rounded-lg p-2.5 mb-3 border border-slate-200/60 dark:border-slate-700/60">
          <div className="grid grid-cols-2 gap-4 text-xs mb-2">
              <div className="flex flex-col">
                  <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-semibold">Energía</span>
                  <span className="font-medium text-slate-700 dark:text-slate-200 text-sm">
                      {rec.estimatedEnergyCost ? `${rec.estimatedEnergyCost}€` : '-'}
                  </span>
              </div>
              <div className="flex flex-col text-right">
                  <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-semibold">Potencia</span>
                  <span className="font-medium text-slate-700 dark:text-slate-200 text-sm">
                      {rec.estimatedPowerCost ? `${rec.estimatedPowerCost}€` : '-'}
                  </span>
              </div>
          </div>
          {rec.pricePerKwh && (
               <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400 text-[10px]">Precio kWh</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-100 dark:border-emerald-900/40">{rec.pricePerKwh} €/kWh</span>
               </div>
          )}
      </div>

      {/* Savings Badge */}
      <div className="mb-4">
          <div className="w-full flex items-center justify-center bg-emerald-100 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 py-1.5 rounded-lg text-xs font-bold border border-emerald-200 dark:border-emerald-900/40">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Ahorro estimado: {rec.savingsAmount}€ ({rec.savingsPercentage}%)
          </div>
      </div>

      {/* Pros & Cons List - Full Detail */}
      <div className="flex-1 space-y-3 mb-4 overflow-y-auto max-h-48 pr-1 scrollbar-hide">
          {rec.pros && rec.pros.length > 0 && (
            <div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1.5 flex items-center">
                   <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span> Ventajas
                </p>
                <ul className="text-xs space-y-1.5 pl-1">
                    {rec.pros.map((pro, i) => (
                        <li key={`p-${i}`} className="flex items-start text-slate-600 dark:text-slate-300">
                            <span className="text-emerald-500 mr-2 font-bold">✓</span>
                            <span className="leading-snug">{pro}</span>
                        </li>
                    ))}
                </ul>
            </div>
          )}
          
          {rec.cons && rec.cons.length > 0 && (
            <div className="pt-2">
                 <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1.5 flex items-center">
                   <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span> A tener en cuenta
                </p>
                <ul className="text-xs space-y-1.5 pl-1">
                    {rec.cons.map((con, i) => (
                        <li key={`c-${i}`} className="flex items-start text-slate-600 dark:text-slate-300">
                             <span className="text-amber-500 mr-2 font-bold">!</span>
                            <span className="leading-snug">{con}</span>
                        </li>
                    ))}
                </ul>
            </div>
          )}
      </div>

      {/* Action Button */}
      <a 
        href={tariffUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className={`mt-auto w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center transition-colors shadow-sm
            ${isBest 
                ? 'bg-emerald-600 dark:bg-emerald-500 text-white hover:bg-emerald-700 dark:hover:bg-emerald-600 shadow-emerald-200' 
                : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'}`}
      >
        Ver Oferta
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 ml-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
        </svg>
      </a>
    </div>
  );
};

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ data, onReset }) => {
  const recommendations = data.recommendations || [];

  const chartData = [
    { name: 'Actual', coste: data.currentTotalCost || 0 },
    ...recommendations.map(r => ({ 
      name: (r.companyName || 'Opción').substring(0, 10), 
      coste: r.estimatedMonthlyCost || 0 
    }))
  ];

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900 overflow-y-auto px-4 py-6 md:px-8 transition-colors duration-200">
      <div className="flex flex-row justify-between items-center mb-6">
        <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Tu Informe</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {data.currentProvider ? `${data.currentProvider}` : 'Análisis'} 
              {data.billingPeriodStart ? ` (${data.billingPeriodStart})` : ''}
            </p>
        </div>
        <button 
            onClick={onReset}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
            Nueva Factura
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        {/* Narrative Analysis */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-blue-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                Diagnóstico
            </h3>
            <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line flex-1">
                {data.narrativeAnalysis || "Análisis no disponible."}
            </p>
            {data.powerOptimizationSuggestion && (
                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 rounded-lg flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-amber-600 mr-2 flex-shrink-0">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                    </svg>
                    <p className="text-xs text-amber-900 dark:text-amber-300 font-medium">{data.powerOptimizationSuggestion}</p>
                </div>
            )}
        </div>

        <div className="flex flex-col gap-6">
            {/* Chart - Showing Costs of ALL tariffs */}
            <div 
                className="w-full bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex-1 min-h-[220px]"
            >
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase mb-2 ml-1">Comparativa Mensual</p>
                <ResponsiveContainer width="100%" height="90%">
                    <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#475569" strokeOpacity={0.2} />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 11, fill: '#94a3b8'}} />
                        <Tooltip 
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: '#1e293b', color: '#f1f5f9', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            formatter={(value: number) => [`${value}€`, 'Coste Est.']}
                        />
                        <Bar dataKey="coste" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24}>
                            {
                                chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === 0 ? '#ef4444' : '#10b981'} />
                                ))
                            }
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Key Stats Row */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">Consumo</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{data.totalConsumption || 0} <span className="text-sm font-normal text-slate-400 dark:text-slate-500">kWh</span></p>
                </div>
                <div className="bg-emerald-600 p-4 rounded-2xl shadow-sm border border-emerald-500 text-white flex flex-col justify-center">
                    <p className="text-xs text-emerald-100 uppercase font-bold mb-1">Ahorro Est.</p>
                    <p className="text-2xl font-bold">
                        {recommendations.length > 0 ? Math.max(...recommendations.map(r => r.savingsAmount || 0)) : 0}€
                    </p>
                </div>
            </div>
        </div>
      </div>
      
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 px-1">Mejores Tarifas Encontradas</h3>
      {/* Recommendations Cards - Showing Detailed Pros/Cons */}
      {recommendations.length > 0 ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 pb-6">
            {recommendations.map((rec, index) => (
                <TariffCard key={index} rec={rec} isBest={index === 0} />
            ))}
        </div>
      ) : (
        <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400 text-sm">No se encontraron recomendaciones claras.</p>
        </div>
      )}
    </div>
  );
};

export default AnalysisDashboard;
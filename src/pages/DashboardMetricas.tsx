import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Clock, Target, FileText } from 'lucide-react';
import { mediator } from '../services/api';

export default function DashboardMetricas() {
  const [data, setData] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const dashData = await mediator.obtener_dashboard_completo();
    const metData = await mediator.obtener_metricas();
    setData(dashData);
    setMetrics(metData);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--ink)]">Dashboard de Métricas</h2>
          <p className="text-[var(--muted)] mt-1">Impacto y retorno de inversión de la automatización de procesos.</p>
        </div>
        <button className="generate-btn flex items-center gap-2 px-6 py-2.5 bg-[var(--navy)] text-white rounded-lg text-sm font-semibold transition-colors hover:bg-[var(--cyan)] shadow-sm">
          <FileText size={18} />
          <span>Generar Reporte Ejecutivo PDF</span>
        </button>
      </div>

      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 metrics">
          <div className="format-card bg-white p-6 rounded-xl border border-[var(--line)] shadow-sm accent-cyan">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[var(--muted)] font-semibold text-sm mb-1 uppercase tracking-wider">Ahorro Generado</p>
                <h3 className="text-4xl font-black text-[var(--ink)] mt-2">{metrics.ahorro}</h3>
              </div>
              <div className="p-3 bg-[#fbeaec] text-[var(--cyan)] rounded-xl">
                <TrendingUp size={24} />
              </div>
            </div>
            <div className="mt-4 text-sm font-medium text-green-600 flex items-center gap-1">
              +15% vs mes anterior
            </div>
          </div>

          <div className="format-card bg-white p-6 rounded-xl border border-[var(--line)] shadow-sm accent-violet">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[var(--muted)] font-semibold text-sm mb-1 uppercase tracking-wider">Optimización de Tiempo</p>
                <h3 className="text-4xl font-black text-[var(--ink)] mt-2">{metrics.optimizacion}</h3>
              </div>
              <div className="p-3 bg-[var(--paper)] text-[var(--navy)] rounded-xl">
                <Clock size={24} />
              </div>
            </div>
            <div className="mt-4 text-sm font-medium text-green-600 flex items-center gap-1">
              Reducción de tareas operativas
            </div>
          </div>

          <div className="format-card bg-white p-6 rounded-xl border border-[var(--line)] shadow-sm accent-orange">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[var(--muted)] font-semibold text-sm mb-1 uppercase tracking-wider">Alcance Operativo</p>
                <h3 className="text-4xl font-black text-[var(--ink)] mt-2">{metrics.alcance}</h3>
              </div>
              <div className="p-3 bg-orange-50 text-[var(--orange)] rounded-xl">
                <Target size={24} />
              </div>
            </div>
            <div className="mt-4 text-sm font-medium text-[var(--muted)] flex items-center gap-1">
              Colaboradores impactados
            </div>
          </div>
        </div>
      )}

      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-[var(--line)]">
            <h3 className="font-bold text-[var(--ink)] mb-6 text-lg">Retorno de Inversión (ROI) por Área</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.roi} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)' }} tickFormatter={(value) => `$${value}`} />
                  <RechartsTooltip cursor={{ fill: 'var(--paper)' }} contentStyle={{ borderRadius: '8px', border: '1px solid var(--line)', boxShadow: 'var(--shadow)' }} />
                  <Bar dataKey="valor" fill="var(--cyan)" radius={[4, 4, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-[var(--line)]">
            <h3 className="font-bold text-[var(--ink)] mb-6 text-lg">Tiempo Manual vs Automatizado (Horas)</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.tiempos} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)' }} dy={10} />
                  <YAxis scale="log" domain={['dataMin', 'dataMax']} axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)' }} />
                  <RechartsTooltip cursor={{ fill: 'var(--paper)' }} contentStyle={{ borderRadius: '8px', border: '1px solid var(--line)' }} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar name="Tiempo Manual" dataKey="manual" fill="var(--muted)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar name="Tiempo Automatizado" dataKey="auto" fill="var(--cyan)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

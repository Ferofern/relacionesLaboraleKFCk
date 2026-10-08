import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Clock, Target, FileText } from 'lucide-react';
import { mediator } from '../services/api';

export default function DashboardMetricas() {
  const [data, setData] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const rawData = await mediator.obtener_dashboard_completo();
      if (Array.isArray(rawData)) {
        let totalAhorro = 0;
        let totalAlcance = 0;
        let avgOpt = 0;

        const chartData = rawData.map((item: any) => {
          const ahorroGlobal = item['Ahorro (h)'] * item['Frecuencia'];
          totalAhorro += ahorroGlobal;
          totalAlcance += item['Alcance'];
          avgOpt += item['Optimizacion %'];
          
          return {
            ...item,
            ahorroGlobal: ahorroGlobal,
            manual: item['Manual (h)'] > 0 ? item['Manual (h)'] : 0.0001,
            auto: item['App Promedio (h)'] > 0 ? item['App Promedio (h)'] : 0.0001
          };
        });

        if (rawData.length > 0) avgOpt /= rawData.length;

        setMetrics({
          ahorro: `${totalAhorro.toFixed(1)} h`,
          optimizacion: `${avgOpt.toFixed(1)}%`,
          alcance: totalAlcance
        });

        setData(chartData);
      }
    } catch (error) {
      console.error('Error loading dashboard data', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--ink)]">Dashboard de Métricas</h2>
          <p className="text-[var(--muted)] mt-1">Impacto y retorno de inversión de la automatización de procesos.</p>
        </div>
        <button 
          onClick={async () => {
            try {
              const response = await fetch("https://kfc-3.onrender.com/api/dashboard/reporte-pdf");
              if (!response.ok) throw new Error("Error al descargar el reporte");
              const blob = await response.blob();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "Reporte_ROI.pdf";
              document.body.appendChild(a);
              a.click();
              window.URL.revokeObjectURL(url);
              a.remove();
            } catch (err) {
              alert("El backend aún no tiene listo este reporte o hubo un error.");
            }
          }}
          className="generate-btn flex items-center gap-2 px-6 py-2.5 bg-[var(--navy)] text-white rounded-lg text-sm font-semibold transition-colors hover:bg-[var(--cyan)] shadow-sm"
        >
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

      {data.length > 0 && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-[var(--line)]">
              <h3 className="font-bold text-[var(--ink)] mb-6 text-lg">Ahorro Histórico (h) por Módulo</h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line)" />
                    <XAxis dataKey="Proyecto" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)' }} />
                    <RechartsTooltip cursor={{ fill: 'var(--paper)' }} contentStyle={{ borderRadius: '8px', border: '1px solid var(--line)', boxShadow: 'var(--shadow)' }} formatter={(value: any) => [`${Number(value).toFixed(2)} h`, 'Ahorro Histórico']} />
                    <Bar name="Ahorro Histórico" dataKey="ahorroGlobal" fill="var(--cyan)" radius={[4, 4, 0, 0]} maxBarSize={60} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-[var(--line)]">
              <h3 className="font-bold text-[var(--ink)] mb-6 text-lg">Tiempo Manual vs Automatizado (Horas)</h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line)" />
                    <XAxis dataKey="Proyecto" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 12 }} dy={10} />
                    <YAxis scale="log" domain={[0.001, 'auto']} axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)' }} />
                    <RechartsTooltip cursor={{ fill: 'var(--paper)' }} contentStyle={{ borderRadius: '8px', border: '1px solid var(--line)' }} />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar name="Manual (h)" dataKey="manual" fill="var(--muted)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    <Bar name="Automatizado (h)" dataKey="auto" fill="var(--cyan)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-[var(--line)] overflow-hidden">
            <h3 className="font-bold text-[var(--ink)] mb-4 text-lg">Tabla de Detalles de ROI</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-[var(--paper)] border-b border-[var(--line)]">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Código</th>
                    <th className="px-4 py-3 font-semibold">Proyecto</th>
                    <th className="px-4 py-3 font-semibold">Frecuencia</th>
                    <th className="px-4 py-3 font-semibold">Total Tx</th>
                    <th className="px-4 py-3 font-semibold">Alcance</th>
                    <th className="px-4 py-3 font-semibold">Ahorro (h)</th>
                    <th className="px-4 py-3 font-semibold">Optimización</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, idx) => (
                    <tr key={idx} className="border-b border-[var(--line)] hover:bg-[var(--paper)] transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-600">{item['Codigo']}</td>
                      <td className="px-4 py-3 font-semibold text-[var(--ink)]">{item['Proyecto']}</td>
                      <td className="px-4 py-3">{item['Frecuencia']}</td>
                      <td className="px-4 py-3">{item['Total Transacciones']}</td>
                      <td className="px-4 py-3">{item['Alcance']} usrs</td>
                      <td className="px-4 py-3 text-green-600 font-medium">{Number(item['Ahorro (h)']).toFixed(2)}</td>
                      <td className="px-4 py-3 text-[var(--cyan)] font-medium">{Number(item['Optimizacion %']).toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

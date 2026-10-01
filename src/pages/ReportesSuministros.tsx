import { useState, useEffect } from 'react';
import { mediator } from '../services/api';
import { FileText, Users } from 'lucide-react';

export default function ReportesSuministros() {
  const [mes, setMes] = useState(new Date().getMonth() + 1 + '');
  const [anio, setAnio] = useState(new Date().getFullYear() + '');
  const [reporteGeneral, setReporteGeneral] = useState<any[]>([]);
  const [reportePersona, setReportePersona] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarReportes();
  }, [mes, anio]);

  const cargarReportes = async () => {
    setLoading(true);
    try {
      const [general, persona] = await Promise.all([
        mediator.obtener_reporte_general_articulos(mes, anio),
        mediator.obtener_reporte_por_persona(mes, anio)
      ]);
      setReporteGeneral(general);
      setReportePersona(persona);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-[var(--ink)]">Reportes de Suministros</h2>
        <p className="text-[var(--muted)] mt-1">Consolidados mensuales para compras y control.</p>
      </div>

      <div className="flex gap-4 mb-6">
        <select value={mes} onChange={e => setMes(e.target.value)} className="border border-[var(--line)] rounded-lg px-4 py-2 outline-none focus:border-[var(--cyan)]">
          {Array.from({length: 12}, (_, i) => i + 1).map(m => (
            <option key={m} value={m}>Mes {m}</option>
          ))}
        </select>
        <select value={anio} onChange={e => setAnio(e.target.value)} className="border border-[var(--line)] rounded-lg px-4 py-2 outline-none focus:border-[var(--cyan)]">
          {[2025, 2026, 2027].map(a => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-[var(--muted)]">Cargando reportes...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-[var(--line)] overflow-hidden">
            <div className="p-4 border-b border-[var(--line)] flex items-center gap-2 bg-[var(--paper)]">
              <FileText size={18} className="text-[var(--cyan)]" />
              <h3 className="font-semibold text-[var(--ink)]">Consolidado General (Para Compras)</h3>
            </div>
            <div className="p-0">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--paper)] text-[var(--muted)] text-sm border-b border-[var(--line)]">
                    <th className="p-4 font-medium">Artículo</th>
                    <th className="p-4 font-medium text-right">Cantidad Total</th>
                  </tr>
                </thead>
                <tbody>
                  {reporteGeneral.length > 0 ? reporteGeneral.map((item, idx) => (
                    <tr key={idx} className="border-b border-[var(--line)] last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-medium text-[var(--ink)]">{item.articulo}</td>
                      <td className="p-4 text-right text-[var(--ink)] font-bold">{item.cantidad}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={2} className="p-8 text-center text-[var(--muted)]">No hay datos para este período</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-[var(--line)] overflow-hidden">
            <div className="p-4 border-b border-[var(--line)] flex items-center gap-2 bg-[var(--paper)]">
              <Users size={18} className="text-[var(--cyan)]" />
              <h3 className="font-semibold text-[var(--ink)]">Reporte por Solicitante</h3>
            </div>
            <div className="p-0">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--paper)] text-[var(--muted)] text-sm border-b border-[var(--line)]">
                    <th className="p-4 font-medium">Solicitante</th>
                    <th className="p-4 font-medium text-right">Items Pedidos</th>
                  </tr>
                </thead>
                <tbody>
                  {reportePersona.length > 0 ? reportePersona.map((item, idx) => (
                    <tr key={idx} className="border-b border-[var(--line)] last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-medium text-[var(--ink)]">{item.persona}</td>
                      <td className="p-4 text-right text-[var(--ink)] font-bold">{item.items}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={2} className="p-8 text-center text-[var(--muted)]">No hay datos para este período</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

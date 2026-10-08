import { useState, useEffect } from 'react';
import { mediator } from '../services/api';
import { FileText, Users, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAppStore } from '../store';
import { useMetricasTiempo } from '../hooks/useMetricasTiempo';

export default function ReportesSuministros() {
  const { user } = useAppStore();
  const { getTiempoInteraccion, resetTimer } = useMetricasTiempo();
  const [mes, setMes] = useState(new Date().getMonth() + 1 + '');
  const [anio, setAnio] = useState(new Date().getFullYear() + '');
  const [reporteGeneral, setReporteGeneral] = useState<any[]>([]);
  const [reportePersona, setReportePersona] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<string>('');

  useEffect(() => {
    cargarReportes();
  }, [mes, anio]);

  const cargarReportes = async () => {
    setLoading(true);
    try {
      const [general, persona] = await Promise.all([
        mediator.obtener_reporte_general_articulos(mes, anio, { usuario_id: user?.id || 0, proyecto_id: 109, tiempo_interaccion_segundos: getTiempoInteraccion() }),
        mediator.obtener_reporte_por_persona(mes, anio, { usuario_id: user?.id || 0, proyecto_id: 109, tiempo_interaccion_segundos: getTiempoInteraccion() }).catch(e => {
          console.warn('Error backend reporte persona, asegurese de solucionar el problema del Timestamp:', e);
          return []; // fallback if it fails
        })
      ]);
      resetTimer();
      setReporteGeneral(general);
      setReportePersona(persona);
      
      const uniquePersonas = Array.from(new Set(persona.map((p: any) => p.Solicitante))).filter(Boolean);
      if (uniquePersonas.length > 0) {
        setSelectedPersona(uniquePersonas[0] as string);
      } else {
        setSelectedPersona('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const descargarExcelConsolidado = () => {
    if (!reporteGeneral || reporteGeneral.length === 0) return alert('No hay datos para exportar');
    const ws = XLSX.utils.json_to_sheet(reporteGeneral.map(item => ({
      'Artículo': item.articulo,
      'Cantidad Total': item.cantidad
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Consolidado");
    XLSX.writeFile(wb, `Consolidado_Suministros_Mes_${mes}_${anio}.xlsx`);
  };

  const descargarPDFDetalle = () => {
    if (!reportePersona || reportePersona.length === 0) return alert('No hay datos para exportar');
    const doc = new jsPDF();
    doc.text(`Detalle de Suministros Pedidos - Mes ${mes}/${anio}`, 14, 15);
    
    // Agrupamos la info por persona
    const dataAgrupada = reportePersona.reduce((acc, curr) => {
      const persona = curr.Solicitante || 'Desconocido';
      if (!acc[persona]) acc[persona] = [];
      acc[persona].push(curr);
      return acc;
    }, {} as Record<string, any[]>);

    let startY = 25;
    Object.keys(dataAgrupada).forEach((persona, index) => {
      if (index > 0) {
        startY = (doc as any).lastAutoTable.finalY + 10;
        if (startY > 270) {
           doc.addPage();
           startY = 20;
        }
      }
      
      doc.setFontSize(11);
      doc.text(`Solicitante: ${persona}`, 14, startY);
      
      const rows = dataAgrupada[persona].map((item: any) => [
        item.Articulo || item.Suministro || item.Item || item.nombre || 'N/A',
        item.Cantidad || 0,
        item['Fecha del Pedido'] || ''
      ]);

      autoTable(doc, {
        startY: startY + 5,
        head: [['Artículo', 'Cantidad', 'Fecha']],
        body: rows,
        theme: 'grid',
        styles: { fontSize: 9 },
        headStyles: { fillColor: [15, 23, 42] } // navy color
      });
    });

    doc.save(`Detalle_Suministros_Mes_${mes}_${anio}.pdf`);
  };

  const personasUnicas = Array.from(new Set(reportePersona.map(p => p.Solicitante))).filter(Boolean);
  const detalleFiltrado = reportePersona.filter(p => p.Solicitante === selectedPersona);

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-[var(--ink)]">Reportes de Suministros</h2>
        <p className="text-[var(--muted)] mt-1">Consolidados mensuales y detalles por empleado.</p>
      </div>

      <div className="flex gap-4 mb-6">
        <select value={mes} onChange={e => setMes(e.target.value)} className="border border-[var(--line)] rounded-lg px-4 py-2 outline-none focus:border-[var(--cyan)] shadow-sm">
          {Array.from({length: 12}, (_, i) => i + 1).map(m => (
            <option key={m} value={m}>Mes {m}</option>
          ))}
        </select>
        <select value={anio} onChange={e => setAnio(e.target.value)} className="border border-[var(--line)] rounded-lg px-4 py-2 outline-none focus:border-[var(--cyan)] shadow-sm">
          {[2025, 2026, 2027].map(a => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-[var(--muted)]">Cargando reportes...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tarjeta Consolidado */}
          <div className="bg-white rounded-xl shadow-sm border border-[var(--line)] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-[var(--line)] flex items-center justify-between bg-[var(--paper)]">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-[var(--cyan)]" />
                <h3 className="font-semibold text-[var(--ink)]">Consolidado General</h3>
              </div>
              <button 
                onClick={descargarExcelConsolidado} 
                className="text-sm bg-[var(--navy)] text-white px-3 py-1.5 rounded hover:bg-[var(--cyan)] transition-colors flex items-center gap-2"
              >
                <Download size={14} /> Excel
              </button>
            </div>
            <div className="p-0 overflow-auto flex-1">
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

          {/* Tarjeta Detalle por Persona */}
          <div className="bg-white rounded-xl shadow-sm border border-[var(--line)] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-[var(--line)] flex items-center justify-between bg-[var(--paper)]">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-[var(--cyan)]" />
                <h3 className="font-semibold text-[var(--ink)]">Detalle por Solicitante</h3>
              </div>
              <button 
                onClick={descargarPDFDetalle} 
                className="text-sm bg-[var(--navy)] text-white px-3 py-1.5 rounded hover:bg-[var(--cyan)] transition-colors flex items-center gap-2"
              >
                <Download size={14} /> PDF
              </button>
            </div>
            
            <div className="p-4 border-b border-[var(--line)] bg-[var(--paper)]">
              <label className="block text-sm text-[var(--muted)] mb-1">Filtrar Pedidos de:</label>
              <select 
                value={selectedPersona} 
                onChange={e => setSelectedPersona(e.target.value)} 
                className="w-full border border-[var(--line)] rounded-lg px-3 py-2 outline-none focus:border-[var(--cyan)] shadow-sm"
              >
                <option value="">Seleccione un empleado...</option>
                {personasUnicas.map(p => (
                  <option key={p as string} value={p as string}>{p as string}</option>
                ))}
              </select>
            </div>

            <div className="p-0 flex-1 overflow-auto min-h-[300px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--paper)] text-[var(--muted)] text-sm border-b border-[var(--line)]">
                    <th className="p-4 font-medium">Artículo Solicitado</th>
                    <th className="p-4 font-medium text-right">Cantidad</th>
                  </tr>
                </thead>
                <tbody>
                  {detalleFiltrado.length > 0 ? detalleFiltrado.map((item, idx) => (
                    <tr key={idx} className="border-b border-[var(--line)] last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-medium text-[var(--ink)]">{item.Articulo || item.Suministro || item.Item || 'N/A'}</td>
                      <td className="p-4 text-right text-[var(--ink)] font-bold">{item.Cantidad}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={2} className="p-8 text-center text-[var(--muted)]">
                      {selectedPersona ? 'No hay items para este empleado' : 'Selecciona un empleado para ver sus detalles'}
                    </td></tr>
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

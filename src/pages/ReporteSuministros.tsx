import { useState, useEffect } from 'react';
import { Download, Filter, FileSpreadsheet } from 'lucide-react';
import { mediator } from '../services/api';
import { useAppStore } from '../store';

export default function ReporteSuministros() {
  const { userRole } = useAppStore();
  const [mes, setMes] = useState('10');
  const [anio, setAnio] = useState('2023');
  const [tipoVista, setTipoVista] = useState<'general' | 'persona'>('general');
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [mes, anio, tipoVista]);

  const loadData = async () => {
    setIsLoading(true);
    let result = [];
    if (tipoVista === 'general') {
      result = await mediator.obtener_reporte_general_articulos(mes, anio);
    } else {
      result = await mediator.obtener_reporte_por_persona(mes, anio);
    }
    setData(result);
    setIsLoading(false);
  };

  const meses = [
    { value: '01', label: 'Enero' }, { value: '02', label: 'Febrero' }, { value: '03', label: 'Marzo' },
    { value: '04', label: 'Abril' }, { value: '05', label: 'Mayo' }, { value: '06', label: 'Junio' },
    { value: '07', label: 'Julio' }, { value: '08', label: 'Agosto' }, { value: '09', label: 'Septiembre' },
    { value: '10', label: 'Octubre' }, { value: '11', label: 'Noviembre' }, { value: '12', label: 'Diciembre' }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--ink)]">Reporte de Suministros</h2>
          <p className="text-[var(--muted)] mt-1">Consolidados mensuales para compras y distribución.</p>
        </div>
        <button className="download-all flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90 shadow-sm">
          <Download size={18} />
          <span>Exportar Consolidado (.xlsx)</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[var(--line)] p-5">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex items-center gap-4 border-r border-[var(--line)] pr-6">
            <Filter className="text-[var(--muted)]" size={20} />
            <div>
              <label className="block text-xs font-semibold text-[var(--muted)] mb-1 uppercase">Período</label>
              <div className="flex gap-2">
                <select value={mes} onChange={e => setMes(e.target.value)} className="border border-[var(--line)] rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[var(--cyan)] bg-white font-medium">
                  {meses.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
                <select value={anio} onChange={e => setAnio(e.target.value)} className="border border-[var(--line)] rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[var(--cyan)] bg-white font-medium">
                  <option value="2023">2023</option>
                  <option value="2024">2024</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <label className="block text-xs font-semibold text-[var(--muted)] mb-2 uppercase">Tipo de Vista</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  checked={tipoVista === 'general'} 
                  onChange={() => setTipoVista('general')} 
                  className="text-[var(--cyan)] accent-[var(--cyan)]" 
                />
                <span className="text-sm font-medium">Reporte General de Artículos</span>
              </label>
              <label className={`flex items-center gap-2 ${(userRole === 'Administrador' || userRole === 'Aprobador') ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}>
                <input 
                  type="radio" 
                  checked={tipoVista === 'persona'} 
                  onChange={() => setTipoVista('persona')} 
                  disabled={userRole !== 'Administrador' && userRole !== 'Aprobador'}
                  className="text-[var(--cyan)] accent-[var(--cyan)]" 
                />
                <span className="text-sm font-medium">Reporte por Persona</span>
                {(userRole !== 'Administrador' && userRole !== 'Aprobador') && (
                  <span className="text-[10px] bg-[var(--paper)] text-[var(--muted)] px-2 py-0.5 rounded">Restringido</span>
                )}
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[var(--line)] overflow-hidden">
        <div className="p-4 border-b border-[var(--line)] bg-[var(--paper)] flex justify-between items-center">
          <h3 className="font-semibold text-[var(--ink)] flex items-center gap-2">
            <FileSpreadsheet className="text-[var(--cyan)]" size={18} /> Resultados de la Consulta
          </h3>
          {isLoading && <span className="text-sm text-[var(--muted)] font-medium">Actualizando...</span>}
        </div>
        
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-[var(--muted)] uppercase bg-white border-b border-[var(--line)]">
              {tipoVista === 'general' ? (
                <tr>
                  <th className="px-6 py-3 font-semibold">Artículo Solicitado</th>
                  <th className="px-6 py-3 font-semibold text-right">Total Acumulado</th>
                </tr>
              ) : (
                <tr>
                  <th className="px-6 py-3 font-semibold">Colaborador</th>
                  <th className="px-6 py-3 font-semibold">Artículo Solicitado</th>
                  <th className="px-6 py-3 font-semibold text-right">Cantidad</th>
                </tr>
              )}
            </thead>
            <tbody className={isLoading ? 'opacity-50' : ''}>
              {data.map((row, i) => (
                <tr key={i} className="border-b border-[var(--line)] hover:bg-[var(--paper)] transition-colors">
                  {tipoVista === 'general' ? (
                    <>
                      <td className="px-6 py-4 font-medium text-[var(--ink)]">{row.articulo}</td>
                      <td className="px-6 py-4 font-bold text-[var(--cyan)] text-right">{row.total_solicitado}</td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 font-bold text-[var(--ink)]">{row.persona}</td>
                      <td className="px-6 py-4 text-[var(--muted)]">{row.articulo}</td>
                      <td className="px-6 py-4 font-bold text-[var(--cyan)] text-right">{row.cantidad}</td>
                    </>
                  )}
                </tr>
              ))}
              {data.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={tipoVista === 'general' ? 2 : 3} className="px-6 py-12 text-center text-[var(--muted)]">
                    No se encontraron registros para el período seleccionado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

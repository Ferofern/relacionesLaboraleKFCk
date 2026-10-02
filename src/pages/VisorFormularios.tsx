import { useState, useEffect, useMemo } from 'react';
import { FormInput, Download, CheckCircle2, Clock, Users, Filter, ExternalLink } from 'lucide-react';
import { mediator } from '../services/api';
import * as XLSX from 'xlsx';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';

export default function VisorFormularios() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [filtroMateria, setFiltroMateria] = useState('');
  const [filtroArea, setFiltroArea] = useState('');
  const [filtroPersonal, setFiltroPersonal] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await mediator.obtener_actualizacion_academica();
      
      let arrayData = Array.isArray(res) ? res : (res?.data || []);
      
      if (arrayData.length > 0 || Array.isArray(res)) {
        arrayData = arrayData.map((item: any) => {
          let materiasParsed = item.materias;
          try {
            if (Array.isArray(item.materias)) {
              materiasParsed = item.materias.join(', ');
            } else if (item.materias && typeof item.materias === 'string') {
              // Intenta parsear si es un string que parece array JSON
              if (item.materias.trim().startsWith('[')) {
                const parsed = JSON.parse(item.materias);
                materiasParsed = Array.isArray(parsed) ? parsed.join(', ') : parsed;
              }
            }
          } catch(e) {
             // Fallback to original if parse fails
          }
          return {
            ...item,
            materias: String(materiasParsed || '')
          };
        });
        setData(arrayData);
      } else {
        setData([]);
        console.warn("El backend retornó una respuesta vacía o inesperada", res);
      }
    } catch (err) {
      console.error(err);
      setError("Error al cargar los datos del formulario. Es posible que el endpoint del backend aún no esté listo.");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchMateria = filtroMateria === '' || item.materias === filtroMateria;
      const matchArea = filtroArea === '' || item.area_o_marca === filtroArea;
      const matchPersonal = filtroPersonal === '' || item.tipo_personal === filtroPersonal;
      return matchMateria && matchArea && matchPersonal;
    });
  }, [data, filtroMateria, filtroArea, filtroPersonal]);

  const kpis = useMemo(() => {
    const total = filteredData.length;
    const culminados = filteredData.filter((item: any) => 
      item.estado_estudios && item.estado_estudios.toLowerCase().includes('culminado')
    ).length;
    const enCurso = total - culminados;
    return { total, culminados, enCurso };
  }, [filteredData]);

  // Options for selects
  const materiasOptions = useMemo(() => Array.from(new Set(data.map(d => d.materias).filter(Boolean))), [data]);
  const areaOptions = useMemo(() => Array.from(new Set(data.map(d => d.area_o_marca).filter(Boolean))), [data]);
  const personalOptions = useMemo(() => Array.from(new Set(data.map(d => d.tipo_personal).filter(Boolean))), [data]);

  // Chart data: By Tipo de Personal
  const dataByPersonal = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredData.forEach(d => {
      const tipo = d.tipo_personal || 'Desconocido';
      counts[tipo] = (counts[tipo] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [filteredData]);

  // Chart data: Time series (created_at)
  const dataByDate = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredData.forEach(d => {
      if (d.created_at) {
        const dateObj = new Date(d.created_at);
        if (!isNaN(dateObj.getTime())) {
          const dateStr = dateObj.toISOString().split('T')[0];
          counts[dateStr] = (counts[dateStr] || 0) + 1;
        }
      }
    });
    return Object.entries(counts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));
  }, [filteredData]);

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Formularios");
    XLSX.writeFile(workbook, "Actualizacion_Academica.xlsx");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--ink)]">Dashboard de Actualización Académica</h2>
          <p className="text-[var(--muted)] mt-1">Analiza y filtra los registros del formulario enviados por los colaboradores.</p>
        </div>
        <button 
          onClick={handleExportExcel}
          disabled={filteredData.length === 0}
          className="download-all flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <Download size={18} />
          <span>Descargar Todo (Excel)</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--cyan)]"></div>
        </div>
      ) : (
        <>
          {/* FILTERS SECTION */}
          <div className="bg-white p-5 rounded-xl border border-[var(--line)] shadow-sm">
            <h3 className="text-sm font-bold text-[var(--ink)] mb-4 flex items-center gap-2">
              <Filter size={16} className="text-[var(--cyan)]" /> Filtros
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--muted)] mb-1 uppercase">Tipo de Título (Materias)</label>
                <select value={filtroMateria} onChange={e => setFiltroMateria(e.target.value)} className="w-full border border-[var(--line)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--cyan)] bg-[var(--paper)]">
                  <option value="">Todos</option>
                  {materiasOptions.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--muted)] mb-1 uppercase">Área o Marca</label>
                <select value={filtroArea} onChange={e => setFiltroArea(e.target.value)} className="w-full border border-[var(--line)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--cyan)] bg-[var(--paper)]">
                  <option value="">Todas</option>
                  {areaOptions.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--muted)] mb-1 uppercase">Tipo de Personal</label>
                <select value={filtroPersonal} onChange={e => setFiltroPersonal(e.target.value)} className="w-full border border-[var(--line)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--cyan)] bg-[var(--paper)]">
                  <option value="">Todos</option>
                  {personalOptions.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* KPIS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 metrics">
            <div className="format-card bg-white p-6 rounded-xl border border-[var(--line)] shadow-sm accent-violet flex items-center justify-between">
              <div>
                <p className="text-[var(--muted)] font-semibold text-sm mb-1 uppercase">Total Filtrados</p>
                <h3 className="text-3xl font-bold text-[var(--ink)]">{kpis.total}</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-[var(--paper)] flex items-center justify-center text-[var(--ink)]">
                <Users size={24} />
              </div>
            </div>
            <div className="format-card bg-white p-6 rounded-xl border border-[var(--line)] shadow-sm accent-cyan flex items-center justify-between">
              <div>
                <p className="text-[var(--muted)] font-semibold text-sm mb-1 uppercase">Culminados</p>
                <h3 className="text-3xl font-bold text-[var(--ink)]">{kpis.culminados}</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#fbeaec] flex items-center justify-center text-[var(--cyan)]">
                <CheckCircle2 size={24} />
              </div>
            </div>
            <div className="format-card bg-white p-6 rounded-xl border border-[var(--line)] shadow-sm accent-orange flex items-center justify-between">
              <div>
                <p className="text-[var(--muted)] font-semibold text-sm mb-1 uppercase">En Curso</p>
                <h3 className="text-3xl font-bold text-[var(--ink)]">{kpis.enCurso}</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-[var(--orange)]">
                <Clock size={24} />
              </div>
            </div>
          </div>

          {/* CHARTS */}
          {filteredData.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl border border-[var(--line)] shadow-sm">
                <h3 className="text-sm font-bold text-[var(--ink)] mb-4 uppercase">Distribución por Tipo de Personal</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dataByPersonal} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                      <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="count" fill="var(--cyan)" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-[var(--line)] shadow-sm">
                <h3 className="text-sm font-bold text-[var(--ink)] mb-4 uppercase">Evolución de Registros en el Tiempo</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dataByDate} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Line type="monotone" dataKey="count" stroke="var(--orange)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* DATA TABLE */}
          {filteredData.length > 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-[var(--line)] overflow-hidden">
              <div className="p-4 border-b border-[var(--line)] bg-[var(--paper)] flex justify-between items-center">
                <h3 className="font-semibold text-[var(--ink)] flex items-center gap-2">
                  <FormInput className="text-[var(--cyan)]" size={18} /> Detalle de Registros
                </h3>
              </div>
              <div className="overflow-x-auto max-h-[500px]">
                <table className="w-full text-sm text-left whitespace-nowrap relative">
                  <thead className="text-xs text-[var(--muted)] uppercase bg-white border-b border-[var(--line)] sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Cédula</th>
                      <th className="px-6 py-4 font-semibold">Empleado</th>
                      <th className="px-6 py-4 font-semibold">Tipo de Título</th>
                      <th className="px-6 py-4 font-semibold">Área / Marca</th>
                      <th className="px-6 py-4 font-semibold">Tipo de Personal</th>
                      <th className="px-6 py-4 font-semibold">Fecha Registro</th>
                      <th className="px-6 py-4 font-semibold text-center">Estado de Estudios</th>
                      <th className="px-6 py-4 font-semibold text-center">Validación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item: any) => (
                      <tr key={item.id} className="border-b border-[var(--line)] hover:bg-[var(--paper)] transition-colors">
                        <td className="px-6 py-4 font-medium text-[var(--muted)]">{item.cedula}</td>
                        <td className="px-6 py-4 font-bold text-[var(--ink)]">{item.nombre_completo}</td>
                        <td className="px-6 py-4 text-[var(--ink)]">{item.materias || '-'}</td>
                        <td className="px-6 py-4 text-[var(--muted)]">{item.area_o_marca}</td>
                        <td className="px-6 py-4 text-[var(--muted)]">{item.tipo_personal}</td>
                        <td className="px-6 py-4 text-[var(--muted)]">
                          {item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`score-pill ${
                            (item.estado_estudios && item.estado_estudios.toLowerCase().includes('culminado')) 
                              ? '' : 'empty'
                          }`}>
                            {item.estado_estudios || 'Desconocido'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <a 
                            href="https://titulos-edusuperior.minedec.gob.ec/consulta-titulos-web/faces/vista/consulta/consulta.xhtml" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--cyan)] hover:text-cyan-700 bg-cyan-50 px-3 py-1.5 rounded-full transition-colors"
                          >
                            Validar <ExternalLink size={12} />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-[var(--line)] p-12 text-center mt-6">
              <FormInput className="mx-auto text-[var(--muted)] mb-4" size={48} opacity={0.2} />
              <h3 className="text-lg font-semibold text-[var(--ink)]">No se encontraron resultados</h3>
              <p className="text-[var(--muted)] mt-1">Intenta ajustando los filtros de búsqueda.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

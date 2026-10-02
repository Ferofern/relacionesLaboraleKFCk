import { useState, useEffect } from 'react';
import { FormInput, Download, CheckCircle2, Clock, Users } from 'lucide-react';
import { mediator } from '../services/api';

export default function VisorFormularios() {
  const [formType, setFormType] = useState('Actualización Académica');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [formType]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await mediator.obtener_actualizacion_academica();
      // Verificamos que la respuesta tenga la estructura esperada
      if (res && res.kpis && res.data) {
        setData(res);
      } else {
        // Mock data temporal si el backend no retorna la estructura correcta
        setData({
          kpis: { total: 0, culminados: 0, enCurso: 0 },
          data: []
        });
        console.warn("El backend no retornó la estructura esperada para Visor Formularios", res);
      }
    } catch (err) {
      console.error(err);
      setError("Error al cargar los datos del formulario. Es posible que el endpoint del backend aún no esté listo.");
      // Proveer un mock vacío para evitar crash
      setData({
        kpis: { total: 0, culminados: 0, enCurso: 0 },
        data: []
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--ink)]">Visor de Formularios</h2>
          <p className="text-[var(--muted)] mt-1">Consulta el estado de los formularios enviados por los colaboradores.</p>
        </div>
        <div className="w-full md:w-64">
          <label className="block text-xs font-semibold text-[var(--muted)] mb-1 uppercase tracking-wider">Seleccionar Formulario</label>
          <select 
            value={formType}
            onChange={e => setFormType(e.target.value)}
            className="w-full border border-[var(--line)] rounded-lg px-4 py-2 text-sm outline-none focus:border-[var(--cyan)] bg-white font-medium"
          >
            <option>Actualización Académica</option>
            <option>Evaluación de Desempeño</option>
            <option>Solicitud de Vacaciones</option>
          </select>
        </div>
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
          {data && data.kpis && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 metrics">
              <div className="format-card bg-white p-6 rounded-xl border border-[var(--line)] shadow-sm accent-violet flex items-center justify-between">
                <div>
                  <p className="text-[var(--muted)] font-semibold text-sm mb-1 uppercase">Total Registros</p>
                  <h3 className="text-3xl font-bold text-[var(--ink)]">{data.kpis.total}</h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-[var(--paper)] flex items-center justify-center text-[var(--ink)]">
                  <Users size={24} />
                </div>
              </div>
              <div className="format-card bg-white p-6 rounded-xl border border-[var(--line)] shadow-sm accent-cyan flex items-center justify-between">
                <div>
                  <p className="text-[var(--muted)] font-semibold text-sm mb-1 uppercase">Culminados</p>
                  <h3 className="text-3xl font-bold text-[var(--ink)]">{data.kpis.culminados}</h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-[#fbeaec] flex items-center justify-center text-[var(--cyan)]">
                  <CheckCircle2 size={24} />
                </div>
              </div>
              <div className="format-card bg-white p-6 rounded-xl border border-[var(--line)] shadow-sm accent-orange flex items-center justify-between">
                <div>
                  <p className="text-[var(--muted)] font-semibold text-sm mb-1 uppercase">En Curso</p>
                  <h3 className="text-3xl font-bold text-[var(--ink)]">{data.kpis.enCurso}</h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-[var(--orange)]">
                  <Clock size={24} />
                </div>
              </div>
            </div>
          )}

          {data && data.data && data.data.length > 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-[var(--line)] overflow-hidden mt-6">
              <div className="p-4 border-b border-[var(--line)] bg-[var(--paper)] flex justify-between items-center">
                <h3 className="font-semibold text-[var(--ink)] flex items-center gap-2">
                  <FormInput className="text-[var(--cyan)]" size={18} /> Detalle de Registros
                </h3>
                <button className="download-all flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90">
                  <Download size={16} />
                  <span>Exportar a Excel (.xlsx)</span>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-[var(--muted)] uppercase bg-white border-b border-[var(--line)]">
                    <tr>
                      <th className="px-6 py-3 font-semibold">ID</th>
                      <th className="px-6 py-3 font-semibold">Empleado</th>
                      <th className="px-6 py-3 font-semibold">Fecha</th>
                      <th className="px-6 py-3 font-semibold text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.data.map((item: any, i: number) => (
                      <tr key={i} className="border-b border-[var(--line)] hover:bg-[var(--paper)] transition-colors">
                        <td className="px-6 py-4 font-medium text-[var(--muted)]">#{item.id}</td>
                        <td className="px-6 py-4 font-bold text-[var(--ink)]">{item.empleado}</td>
                        <td className="px-6 py-4 text-[var(--muted)]">{item.fecha}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`score-pill ${item.estado !== 'Culminado' ? 'empty' : ''}`}>
                            {item.estado}
                          </span>
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
              <h3 className="text-lg font-semibold text-[var(--ink)]">No hay datos disponibles</h3>
              <p className="text-[var(--muted)] mt-1">El formulario seleccionado no tiene registros o el backend no envió datos.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

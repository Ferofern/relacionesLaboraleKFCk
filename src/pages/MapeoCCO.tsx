import { useState } from 'react';
import { Database, Plus, Trash2, Send } from 'lucide-react';
import { mediator } from '../services/api';
import { useAppStore } from '../store';

export default function MapeoCCO() {
  const { baseCco, setBaseCco } = useAppStore();
  const [isLoadingBase, setIsLoadingBase] = useState(false);
  const [ccos, setCcos] = useState<any[]>([{ id: Date.now(), codigo: '', cedula: '', nombre: '' }]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const loadBase = async () => {
    setIsLoadingBase(true);
    const data = await mediator.load_payroll_cco();
    setBaseCco(data);
    setIsLoadingBase(false);
  };

  const addCcoRow = () => {
    setCcos([...ccos, { id: Date.now(), codigo: '', cedula: '', nombre: '' }]);
  };

  const removeCcoRow = (id: number) => {
    setCcos(ccos.filter(c => c.id !== id));
  };

  const updateCco = async (id: number, field: string, value: string) => {
    const newCcos = [...ccos];
    const index = newCcos.findIndex(c => c.id === id);
    newCcos[index][field] = value;
    
    if (field === 'cedula' && value.length >= 10) {
      const nombre = await mediator.get_nombre_by_cedula(value);
      newCcos[index].nombre = nombre;
    } else if (field === 'cedula') {
      newCcos[index].nombre = '';
    }
    
    setCcos(newCcos);
  };

  const processCcos = async () => {
    const validCcos = ccos.filter(c => c.codigo && c.cedula.length >= 10);
    if (validCcos.length === 0) return;
    
    setIsProcessing(true);
    const data = await mediator.process_cco_individual(validCcos);
    setResults(data);
    setIsProcessing(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-[var(--ink)]">Mapeo de Cargos CCO</h2>
        <p className="text-[var(--muted)] mt-1">Generación de correos de liquidación por Centro de Costo.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[var(--line)] p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={loadBase}
            disabled={isLoadingBase}
            className="flex items-center gap-2 bg-[var(--navy)] text-white px-4 py-2 rounded-lg font-medium hover:bg-[var(--cyan)] transition-colors disabled:opacity-50"
          >
            <Database size={16} />
            {isLoadingBase ? 'Cargando...' : 'Cargar Base Payroll'}
          </button>
          
          {baseCco.length > 0 && (
            <div className="status-pill ready flex items-center gap-2 text-sm font-medium text-[var(--ink)]">
              <i className="w-2 h-2 rounded-full block"></i>
              Base Activa en Sesión ({baseCco.length} registros)
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--muted)]">Fecha de Proceso:</span>
          <input type="date" className="border border-[var(--line)] rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[var(--cyan)]" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[var(--line)] overflow-hidden">
        <div className="p-4 border-b border-[var(--line)] bg-[var(--paper)] flex justify-between items-center">
          <h3 className="font-semibold text-[var(--ink)]">Centros de Costo</h3>
          <button onClick={addCcoRow} className="flex items-center gap-1 text-[var(--cyan)] text-sm font-medium hover:underline">
            <Plus size={16} /> Añadir Fila
          </button>
        </div>
        
        <div className="p-4 space-y-3 bg-[var(--paper)]/30">
          {ccos.map((c) => (
            <div key={c.id} className="flex gap-4 items-start bg-white p-4 rounded-lg border border-[var(--line)] shadow-sm">
              <div className="w-1/4">
                <label className="block text-xs font-semibold text-[var(--muted)] mb-1">CÓDIGO CCO</label>
                <input 
                  type="text" 
                  value={c.codigo}
                  onChange={(e) => updateCco(c.id, 'codigo', e.target.value)}
                  className="w-full border border-[var(--line)] rounded-md px-3 py-2 text-sm focus:border-[var(--cyan)] outline-none" 
                  placeholder="Ej: UIO-001"
                />
              </div>
              <div className="w-1/4">
                <label className="block text-xs font-semibold text-[var(--muted)] mb-1">CÉDULA RESPONSABLE</label>
                <input 
                  type="text" 
                  value={c.cedula}
                  onChange={(e) => updateCco(c.id, 'cedula', e.target.value)}
                  maxLength={10}
                  className="w-full border border-[var(--line)] rounded-md px-3 py-2 text-sm focus:border-[var(--cyan)] outline-none" 
                  placeholder="10 dígitos"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-[var(--muted)] mb-1">NOMBRE AUTODETECTADO</label>
                <input 
                  type="text" 
                  value={c.nombre}
                  readOnly
                  className="w-full border border-[var(--line)] bg-[var(--paper)] rounded-md px-3 py-2 text-sm text-[var(--muted)] font-medium outline-none" 
                  placeholder="Esperando cédula..."
                />
              </div>
              <div className="pt-6">
                <button 
                  onClick={() => removeCcoRow(c.id)} 
                  className="text-[var(--muted)] hover:text-[var(--cyan)] p-2 transition-colors"
                  disabled={ccos.length === 1}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t border-[var(--line)] flex justify-between bg-white">
          <button onClick={() => setCcos([{ id: Date.now(), codigo: '', cedula: '', nombre: '' }])} className="text-sm font-medium text-[var(--muted)] hover:text-[var(--ink)] px-4 py-2">
            Limpiar Todo
          </button>
          <button 
            onClick={processCcos}
            disabled={isProcessing || ccos.every(c => !c.codigo)}
            className="generate-btn text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            {isProcessing ? 'Procesando...' : 'Procesar CCOs'}
          </button>
        </div>
      </div>

      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((r, i) => (
            <div key={i} className="bg-white rounded-xl border border-[var(--line)] p-5 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="font-bold text-lg text-[var(--ink)]">{r.codigo}</span>
                  <span className="score-pill">{r.status}</span>
                </div>
                <p className="text-sm text-[var(--muted)] mb-1">Responsable: <strong className="text-[var(--ink)]">{r.nombre}</strong></p>
                <p className="text-sm text-[var(--muted)]">Cédula: {r.cedula}</p>
              </div>
              <a 
                href={`mailto:${r.emailTo}?subject=Liquidación CCO ${r.codigo}&body=Estimado ${r.nombre}, adjunto el reporte de liquidación.`}
                className="mt-4 flex items-center justify-center gap-2 w-full py-2 bg-white border-2 border-[var(--cyan)] text-[var(--cyan)] rounded-lg font-semibold hover:bg-[var(--cyan)] hover:text-white transition-colors"
              >
                <Send size={16} /> Abrir en Cliente de Correo
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState, useRef } from 'react';
import { Upload, Shirt, Download } from 'lucide-react';
import { useAppStore } from '../store';
import { useMetricasTiempo } from '../hooks/useMetricasTiempo';
import { mediator } from '../services/api';

export default function GeneradorDotaciones() {
  const [negocio, setNegocio] = useState('Multimarcas');
  const [fecha, setFecha] = useState('');
  const [leccionario, setLeccionario] = useState<File | null>(null);
  const [stocks, setStocks] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const refLeccionario = useRef<HTMLInputElement>(null);
  const refStocks = useRef<HTMLInputElement>(null);
  
  const { user } = useAppStore();
  const { getTiempoInteraccion, resetTimer } = useMetricasTiempo();

  const processFiles = async () => {
    if (!leccionario || !stocks || !fecha) return;
    setIsProcessing(true);
    try {
      const data = await mediator.process_dotacion_files(negocio, leccionario, stocks, fecha, { usuario_id: user?.id || 0, proyecto_id: 107, tiempo_interaccion_segundos: getTiempoInteraccion() });
      setResults(data);
      resetTimer();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-[var(--ink)]">Generador Uniformes BOT SAP</h2>
        <p className="text-[var(--muted)] mt-1">Cálculo y asignación de uniformes en base a leccionarios y stocks.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[var(--line)] p-6">
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="w-full md:w-1/3 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[var(--ink)] mb-2">Línea de Negocio</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="negocio" checked={negocio === 'Multimarcas'} onChange={() => setNegocio('Multimarcas')} className="text-[var(--cyan)] accent-[var(--cyan)]" />
                  <span className="text-sm font-medium">Multimarcas</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="negocio" checked={negocio === 'Int Food Service'} onChange={() => setNegocio('Int Food Service')} className="text-[var(--cyan)] accent-[var(--cyan)]" />
                  <span className="text-sm font-medium">Int Food Service</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--ink)] mb-2">Fecha de Corte</label>
              <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} className="w-full border border-[var(--line)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--cyan)]" />
            </div>
          </div>

          <div className="w-full md:w-2/3 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[var(--ink)] mb-2">Leccionario (.xlsx)</label>
              <div 
                onClick={() => refLeccionario.current?.click()}
                className="upload-card border-2 border-dashed border-[var(--line)] rounded-xl h-28 flex flex-col items-center justify-center cursor-pointer hover:border-[var(--cyan)] bg-[var(--paper)] transition-colors"
              >
                <input type="file" accept=".xlsx" className="hidden" ref={refLeccionario} onChange={e => e.target.files && setLeccionario(e.target.files[0])} />
                {leccionario ? (
                  <span className="text-sm font-medium text-[var(--ink)] text-center px-2">{leccionario.name}</span>
                ) : (
                  <>
                    <Upload size={18} className="text-[var(--muted)] mb-1" />
                    <span className="text-xs text-[var(--muted)]">Cargar Archivo</span>
                  </>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--ink)] mb-2">Stocks (.xlsx)</label>
              <div 
                onClick={() => refStocks.current?.click()}
                className="upload-card border-2 border-dashed border-[var(--line)] rounded-xl h-28 flex flex-col items-center justify-center cursor-pointer hover:border-[var(--cyan)] bg-[var(--paper)] transition-colors"
              >
                <input type="file" accept=".xlsx" className="hidden" ref={refStocks} onChange={e => e.target.files && setStocks(e.target.files[0])} />
                {stocks ? (
                  <span className="text-sm font-medium text-[var(--ink)] text-center px-2">{stocks.name}</span>
                ) : (
                  <>
                    <Upload size={18} className="text-[var(--muted)] mb-1" />
                    <span className="text-xs text-[var(--muted)]">Cargar Archivo</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-[var(--line)]">
          <button 
            onClick={processFiles}
            disabled={!leccionario || !stocks || !fecha || isProcessing}
            className="generate-btn text-white px-6 py-2.5 rounded-lg font-medium flex items-center space-x-2 disabled:opacity-50 transition-colors shadow-sm"
          >
            <Shirt size={18} />
            <span>{isProcessing ? 'Procesando...' : 'Procesar Archivos de Uniformes'}</span>
          </button>
        </div>
      </div>

      {results.length > 0 && !isProcessing && (
        <div className="bg-white rounded-xl shadow-sm border border-[var(--line)] overflow-hidden">
          <div className="p-4 border-b border-[var(--line)] flex justify-between items-center bg-[var(--paper)]">
            <h3 className="font-semibold text-[var(--ink)]">Vista Previa de Uniformes</h3>
            <button className="download-all flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-opacity hover:opacity-90">
              <Download size={16} />
              <span>Descargar Matriz Salida (.xlsx)</span>
            </button>
          </div>
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-[var(--muted)] uppercase bg-white border-b border-[var(--line)]">
              <tr>
                <th className="px-6 py-3 font-semibold">Empleado</th>
                <th className="px-6 py-3 font-semibold">Prenda/Artículo Asignado</th>
                <th className="px-6 py-3 font-semibold text-center">Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {results.map((item, i) => (
                <tr key={i} className="border-b border-[var(--line)] hover:bg-[var(--paper)] transition-colors">
                  <td className="px-6 py-4 font-medium text-[var(--ink)]">{item.empleado}</td>
                  <td className="px-6 py-4 text-[var(--muted)]">{item.dotacion}</td>
                  <td className="px-6 py-4 text-center font-bold text-[var(--cyan)]">{item.cantidad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

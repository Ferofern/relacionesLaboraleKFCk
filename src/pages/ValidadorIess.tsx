import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, FileText, Download, Activity, Check, AlertCircle } from 'lucide-react';
import { useAppStore } from '../store';
import { useMetricasTiempo } from '../hooks/useMetricasTiempo';
import { mediator } from '../services/api';

export default function ValidadorIess() {
  const [payrollFile, setPayrollFile] = useState<File | null>(null);
  const [iessFiles, setIessFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any[]>([]);
  
  const payrollInputRef = useRef<HTMLInputElement>(null);
  const iessInputRef = useRef<HTMLInputElement>(null);
  
  const { user } = useAppStore();
  const { getTiempoInteraccion, resetTimer } = useMetricasTiempo();

  const processValidation = async () => {
    if (!payrollFile || iessFiles.length === 0) return;
    setIsProcessing(true);
    try {
      const data = await mediator.process_validador_files(payrollFile, iessFiles, setProgress, { usuario_id: user?.id || 0, proyecto_id: 2, tiempo_interaccion_segundos: getTiempoInteraccion() });
      setResults(data);
      resetTimer();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-[var(--ink)]">Validador IESS vs Payroll</h2>
        <p className="text-[var(--muted)] mt-1">Cruce de información entre la base de nómina y los comprobantes del IESS.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-[var(--line)] p-6">
          <h3 className="font-semibold text-[var(--ink)] mb-4 flex items-center gap-2">
            <FileSpreadsheet className="text-[var(--cyan)]" size={18} /> Base Payroll (.xlsx)
          </h3>
          <div 
            className="upload-card border-2 border-dashed border-[var(--line)] rounded-xl p-6 text-center hover:border-[var(--cyan)] transition-colors cursor-pointer bg-[var(--paper)] h-48 flex flex-col items-center justify-center"
            onClick={() => payrollInputRef.current?.click()}
          >
            <input 
              type="file" 
              accept=".xlsx,.xls" 
              className="hidden" 
              ref={payrollInputRef} 
              onChange={(e) => e.target.files && setPayrollFile(e.target.files[0])}
            />
            {payrollFile ? (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-3">
                  <Check size={24} />
                </div>
                <span className="font-medium text-[var(--ink)] truncate max-w-[200px]">{payrollFile.name}</span>
              </div>
            ) : (
              <>
                <div className="upload-icon w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-3">
                  <Upload size={20} />
                </div>
                <span className="text-sm font-medium text-[var(--ink)]">Cargar Archivo Payroll</span>
              </>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-[var(--line)] p-6">
          <h3 className="font-semibold text-[var(--ink)] mb-4 flex items-center gap-2">
            <FileText className="text-[var(--cyan)]" size={18} /> Comprobantes IESS (.pdf)
          </h3>
          <div 
            className="upload-card border-2 border-dashed border-[var(--line)] rounded-xl p-6 text-center hover:border-[var(--cyan)] transition-colors cursor-pointer bg-[var(--paper)] h-48 flex flex-col items-center justify-center"
            onClick={() => iessInputRef.current?.click()}
          >
            <input 
              type="file" 
              multiple
              accept=".pdf" 
              className="hidden" 
              ref={iessInputRef} 
              onChange={(e) => e.target.files && setIessFiles(Array.from(e.target.files))}
            />
            {iessFiles.length > 0 ? (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-[var(--paper)] text-[var(--cyan)] rounded-full flex items-center justify-center mb-3">
                  <FileText size={24} />
                </div>
                <span className="font-medium text-[var(--ink)]">{iessFiles.length} archivos seleccionados</span>
              </div>
            ) : (
              <>
                <div className="upload-icon w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-3">
                  <Upload size={20} />
                </div>
                <span className="text-sm font-medium text-[var(--ink)]">Seleccionar PDFs múltiples</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={processValidation}
          disabled={!payrollFile || iessFiles.length === 0 || isProcessing}
          className="generate-btn file-action text-white px-8 py-3 rounded-lg font-medium flex items-center space-x-2 disabled:opacity-50 transition-colors shadow-sm"
        >
          <Activity size={18} />
          <span>Ejecutar Comparación</span>
        </button>
      </div>

      {isProcessing && (
        <div className="bg-white p-6 rounded-xl border border-[var(--line)]">
          <div className="flex justify-between text-sm text-[var(--ink)] mb-2">
            <span className="font-medium">Cruzando información...</span>
            <span className="font-bold text-[var(--cyan)]">{progress}%</span>
          </div>
          <div className="h-2.5 w-full bg-[var(--paper)] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[var(--cyan)] transition-all duration-300 ease-out" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {results.length > 0 && !isProcessing && (
        <div className="bg-white rounded-xl shadow-sm border border-[var(--line)] overflow-hidden">
          <div className="p-4 border-b border-[var(--line)] flex justify-between items-center bg-[var(--paper)]">
            <h3 className="font-semibold text-[var(--ink)]">Resultados del Cruce</h3>
            <button className="download-all flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90">
              <Download size={16} />
              <span>Exportar Reporte (.xlsx)</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-[var(--muted)] uppercase bg-[var(--paper)] border-b border-[var(--line)]">
                <tr>
                  <th className="px-6 py-3 font-semibold">Cédula</th>
                  <th className="px-6 py-3 font-semibold">Nombre Empleado</th>
                  <th className="px-6 py-3 font-semibold">Estado</th>
                  <th className="px-6 py-3 font-semibold">Detalle</th>
                  <th className="px-6 py-3 font-semibold text-center">Score</th>
                </tr>
              </thead>
              <tbody>
                {results.map((item, i) => (
                  <tr 
                    key={i} 
                    className={`border-b border-[var(--line)] transition-colors ${item.estado === 'Error Crítico' || item.estado === 'Ausente' ? 'absent-row' : 'hover:bg-[var(--paper)]'}`}
                  >
                    <td className="px-6 py-4 font-medium">{item.cedula}</td>
                    <td className="px-6 py-4">
                      {item.estado === 'Error Crítico' || item.estado === 'Ausente' ? (
                        <strong>{item.nombre}</strong>
                      ) : (
                        item.nombre
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {item.estado === 'Error Crítico' && <AlertCircle size={14} />}
                        <span className="font-medium">{item.estado}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{item.error || '-'}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`score-pill ${item.score === 0 ? 'empty' : ''}`}>
                        {item.score}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

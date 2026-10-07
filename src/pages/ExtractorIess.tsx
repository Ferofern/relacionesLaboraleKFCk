import { useState, useRef } from 'react';
import { Upload, File, CheckCircle2, Download, X } from 'lucide-react';
import { useAppStore } from '../store';
import { useMetricasTiempo } from '../hooks/useMetricasTiempo';
import { mediator } from '../services/api';

export default function ExtractorIess() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { user } = useAppStore();
  const { getTiempoInteraccion, resetTimer } = useMetricasTiempo();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      setFiles(Array.from(e.dataTransfer.files));
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const processFiles = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setProgress(0);
    try {
      const data = await mediator.process_iess_files(files, setProgress, { usuario_id: user?.id || 0, proyecto_id: 1, tiempo_interaccion_segundos: getTiempoInteraccion() });
      setResults(data);
      resetTimer();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-[var(--ink)]">EXTRACTOR IESS TP</h2>
          <p className="text-[var(--muted)] mt-1">Procesamiento y extracción de datos desde PDFs del IESS.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[var(--line)] p-6">
        <div 
          className="upload-card border-2 border-dashed border-[var(--line)] rounded-xl p-8 text-center hover:border-[var(--cyan)] transition-colors cursor-pointer bg-[var(--paper)]"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            multiple 
            accept=".pdf" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileChange}
          />
          <div className="upload-icon w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4">
            <Upload size={28} />
          </div>
          <h3 className="text-lg font-semibold text-[var(--ink)]">Haz clic o arrastra archivos PDF aquí</h3>
          <p className="text-[var(--muted)] text-sm mt-2">Soporta múltiples archivos PDF simultáneos.</p>
        </div>

        {files.length > 0 && (
          <div className="mt-6 space-y-3">
            <h4 className="font-medium text-[var(--ink)] text-sm">Archivos seleccionados ({files.length})</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto custom-scrollbar pr-2">
              {files.map((file, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white border border-[var(--line)] rounded-lg">
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <File className="text-[var(--cyan)] shrink-0" size={18} />
                    <span className="text-sm text-[var(--ink)] truncate">{file.name}</span>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); removeFile(i); }} className="text-[var(--muted)] hover:text-[var(--cyan)] p-1">
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
            
            <div className="pt-4 flex justify-end">
              <button 
                onClick={processFiles}
                disabled={isProcessing}
                className="generate-btn file-action text-white px-6 py-2.5 rounded-lg font-medium flex items-center space-x-2 disabled:opacity-50 transition-colors"
              >
                <span>Procesar Archivos IESS</span>
              </button>
            </div>
            
            {isProcessing && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm text-[var(--ink)]">
                  <span>Procesando...</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <div className="h-2 w-full bg-[var(--line)] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[var(--cyan)] transition-all duration-300 ease-out" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {results.length > 0 && !isProcessing && (
        <div className="bg-white rounded-xl shadow-sm border border-[var(--line)] overflow-hidden">
          <div className="p-4 border-b border-[var(--line)] flex justify-between items-center bg-[var(--paper)]">
            <h3 className="font-semibold text-[var(--ink)] flex items-center gap-2">
              <CheckCircle2 className="text-[var(--cyan)]" size={18} />
              Resultados de Extracción
            </h3>
            <button className="download-all flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90">
              <Download size={16} />
              <span>Descargar Consolidado (.xlsx)</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-[var(--muted)] uppercase bg-[var(--paper)] border-b border-[var(--line)]">
                <tr>
                  <th className="px-6 py-3 font-semibold">Cédula</th>
                  <th className="px-6 py-3 font-semibold">Nombre Completo</th>
                  <th className="px-6 py-3 font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody>
                {results.map((item, i) => (
                  <tr key={i} className="border-b border-[var(--line)] hover:bg-[var(--paper)] transition-colors">
                    <td className="px-6 py-4 font-medium text-[var(--ink)]">{item.cedula}</td>
                    <td className="px-6 py-4 text-[var(--muted)]">{item.nombre}</td>
                    <td className="px-6 py-4">
                      <span className="score-pill">{item.estado}</span>
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

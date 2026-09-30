import { useState, useRef } from 'react';
import { FileText, Download, Receipt, X } from 'lucide-react';
import { mediator } from '../services/api';

export default function ExtractorFacturas() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    try {
      const data = await mediator.process_facturas_files(files);
      setResults(data);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-[var(--ink)]">Extractor de Facturas</h2>
        <p className="text-[var(--muted)] mt-1">Sube facturas en formato PDF para extraer automáticamente los totales y consolidarlos.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[var(--line)] p-6">
        <div 
          className="upload-card border-2 border-dashed border-[var(--line)] rounded-xl p-8 text-center hover:border-[var(--cyan)] transition-colors cursor-pointer bg-[var(--paper)]"
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            multiple 
            accept=".pdf" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={(e) => e.target.files && setFiles([...files, ...Array.from(e.target.files)])}
          />
          <div className="upload-icon w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4">
            <Receipt size={28} />
          </div>
          <h3 className="text-lg font-semibold text-[var(--ink)]">Cargar Facturas (PDF)</h3>
        </div>

        {files.length > 0 && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-3">
              <span className="font-medium text-[var(--ink)] text-sm">{files.length} Archivos Listos</span>
              <button 
                onClick={processFiles}
                disabled={isProcessing}
                className="generate-btn file-action text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {isProcessing ? 'Procesando...' : 'Procesar Facturas'}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-2 bg-[var(--paper)] border border-[var(--line)] rounded-full px-3 py-1 text-xs text-[var(--ink)]">
                  <FileText size={12} className="text-[var(--cyan)]" />
                  <span className="max-w-[150px] truncate">{f.name}</span>
                  <button onClick={() => setFiles(files.filter((_, idx) => idx !== i))} className="hover:text-[var(--cyan)]"><X size={12} /></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {results.length > 0 && !isProcessing && (
        <div className="bg-white rounded-xl shadow-sm border border-[var(--line)] overflow-hidden">
          <div className="p-4 border-b border-[var(--line)] flex justify-between items-center bg-[var(--paper)]">
            <h3 className="font-semibold text-[var(--ink)]">Resumen de Facturas</h3>
            <button className="download-all flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90">
              <Download size={16} />
              <span>Consolidado (.xlsx)</span>
            </button>
          </div>
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-[var(--muted)] uppercase bg-[var(--paper)] border-b border-[var(--line)]">
              <tr>
                <th className="px-6 py-3 font-semibold">Proveedor</th>
                <th className="px-6 py-3 font-semibold">Fecha Emisión</th>
                <th className="px-6 py-3 font-semibold text-right">Total Extraído</th>
              </tr>
            </thead>
            <tbody>
              {results.map((item, i) => (
                <tr key={i} className="border-b border-[var(--line)] hover:bg-[var(--paper)] transition-colors">
                  <td className="px-6 py-4 font-medium">{item.proveedor}</td>
                  <td className="px-6 py-4 text-[var(--muted)]">{item.fecha}</td>
                  <td className="px-6 py-4 font-bold text-[var(--ink)] text-right">
                    ${item.total.toFixed(2)}
                  </td>
                </tr>
              ))}
              <tr className="bg-[var(--paper)] font-bold text-[var(--ink)]">
                <td colSpan={2} className="px-6 py-4 text-right">Total Acumulado:</td>
                <td className="px-6 py-4 text-right text-[var(--cyan)] text-lg">
                  ${results.reduce((acc, curr) => acc + curr.total, 0).toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

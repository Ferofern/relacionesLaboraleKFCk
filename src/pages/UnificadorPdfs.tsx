import { useState, useRef } from 'react';
import { Upload, Combine, ArrowUp, ArrowDown, X, Download } from 'lucide-react';
import { mediator } from '../services/api';

export default function UnificadorPdfs() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const addFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles([...files, ...Array.from(e.target.files)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newFiles = [...files];
    const temp = newFiles[index];
    newFiles[index] = newFiles[index - 1];
    newFiles[index - 1] = temp;
    setFiles(newFiles);
  };

  const moveDown = (index: number) => {
    if (index === files.length - 1) return;
    const newFiles = [...files];
    const temp = newFiles[index];
    newFiles[index] = newFiles[index + 1];
    newFiles[index + 1] = temp;
    setFiles(newFiles);
  };

  const processUnification = async () => {
    if (files.length < 2) return;
    setIsProcessing(true);
    try {
      const url = await mediator.process_unificar_pdfs(files);
      setResultUrl(url);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-[var(--ink)]">Unificador de PDFs</h2>
        <p className="text-[var(--muted)] mt-1">Sube múltiples documentos PDF y ordénalos para unirlos en un solo archivo.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[var(--line)] p-6">
        <div 
          onClick={() => fileRef.current?.click()}
          className="upload-card border-2 border-dashed border-[var(--line)] rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-[var(--cyan)] transition-colors bg-[var(--paper)]"
        >
          <input type="file" multiple accept=".pdf" className="hidden" ref={fileRef} onChange={addFiles} />
          <div className="upload-icon w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <Upload size={28} />
          </div>
          <h3 className="text-lg font-semibold text-[var(--ink)]">Haz clic para agregar PDFs</h3>
          <p className="text-sm text-[var(--muted)] mt-1">El orden es importante. Requiere al menos 2 documentos.</p>
        </div>

        {files.length > 0 && (
          <div className="mt-8">
            <h4 className="font-semibold text-[var(--ink)] mb-4 text-sm uppercase tracking-wider">Orden de Fusión</h4>
            <div className="space-y-3">
              {files.map((f, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-[var(--paper)] border border-[var(--line)] rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded bg-white border border-[var(--line)] flex items-center justify-center text-xs font-bold text-[var(--muted)]">{i + 1}</span>
                    <span className="font-medium text-sm text-[var(--ink)]">{f.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => moveUp(i)} disabled={i === 0} className="p-1.5 text-[var(--muted)] hover:text-[var(--ink)] disabled:opacity-30">
                      <ArrowUp size={16} />
                    </button>
                    <button onClick={() => moveDown(i)} disabled={i === files.length - 1} className="p-1.5 text-[var(--muted)] hover:text-[var(--ink)] disabled:opacity-30">
                      <ArrowDown size={16} />
                    </button>
                    <div className="w-px h-4 bg-[var(--line)] mx-1"></div>
                    <button onClick={() => removeFile(i)} className="p-1.5 text-[var(--muted)] hover:text-[var(--cyan)]">
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex justify-end border-t border-[var(--line)] pt-4">
              <button 
                onClick={processUnification}
                disabled={files.length < 2 || isProcessing}
                className="generate-btn file-action text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50 transition-colors shadow-sm"
              >
                <Combine size={18} />
                {isProcessing ? 'Fusionando Documentos...' : 'Unificar PDFs'}
              </button>
            </div>
          </div>
        )}
      </div>

      {resultUrl && !isProcessing && (
        <div className="bg-[var(--cyan)]/10 border border-[var(--cyan)] rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between animate-in zoom-in-95 duration-300">
          <div className="flex items-center gap-4 mb-4 sm:mb-0">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[var(--cyan)] shadow-sm">
              <Combine size={24} />
            </div>
            <div>
              <h4 className="font-bold text-[var(--ink)]">Archivo Unificado Exitosamente</h4>
              <p className="text-sm text-[var(--muted)]">El PDF contiene {files.length} documentos concatenados.</p>
            </div>
          </div>
          <button className="download-all flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 whitespace-nowrap">
            <Download size={18} />
            <span>Descargar PDF Final</span>
          </button>
        </div>
      )}
    </div>
  );
}

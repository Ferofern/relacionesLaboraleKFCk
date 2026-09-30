import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, Download, FileImage } from 'lucide-react';
import { mediator } from '../services/api';

export default function GeneradorClaquetas() {
  const [formData, setFormData] = useState({ region: '', responsable: '', fecha: '' });
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleGenerate = async () => {
    if (!file || !formData.region) return;
    setIsProcessing(true);
    try {
      const url = await mediator.process_claquetas_file(formData.region, formData.responsable, formData.fecha, file);
      setResultUrl(url);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-[var(--ink)]">Generador de Claquetas</h2>
        <p className="text-[var(--muted)] mt-1">Crea carátulas (claquetas) en PDF de forma masiva según la base de Excel proporcionada.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[var(--line)] p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[var(--ink)] mb-1">Región</label>
            <input 
              type="text" 
              value={formData.region}
              onChange={e => setFormData({...formData, region: e.target.value})}
              className="w-full border border-[var(--line)] rounded-lg px-3 py-2 outline-none focus:border-[var(--cyan)]" 
              placeholder="Ej: Costa"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--ink)] mb-1">Responsable</label>
            <input 
              type="text" 
              value={formData.responsable}
              onChange={e => setFormData({...formData, responsable: e.target.value})}
              className="w-full border border-[var(--line)] rounded-lg px-3 py-2 outline-none focus:border-[var(--cyan)]" 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--ink)] mb-1">Fecha de Emisión</label>
            <input 
              type="date" 
              value={formData.fecha}
              onChange={e => setFormData({...formData, fecha: e.target.value})}
              className="w-full border border-[var(--line)] rounded-lg px-3 py-2 outline-none focus:border-[var(--cyan)]" 
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[var(--ink)] mb-1">Base de Datos (.xlsx)</label>
          <div 
            className="upload-card border-2 border-dashed border-[var(--line)] rounded-xl h-48 flex flex-col items-center justify-center cursor-pointer hover:border-[var(--cyan)] transition-colors bg-[var(--paper)]"
            onClick={() => fileRef.current?.click()}
          >
            <input 
              type="file" 
              className="hidden" 
              accept=".xlsx" 
              ref={fileRef}
              onChange={e => e.target.files && setFile(e.target.files[0])}
            />
            {file ? (
              <div className="flex flex-col items-center">
                <FileSpreadsheet className="text-[var(--cyan)] mb-2" size={32} />
                <span className="font-medium text-sm text-[var(--ink)] text-center px-4">{file.name}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="upload-icon w-12 h-12 rounded-full flex items-center justify-center mb-2">
                  <Upload size={20} />
                </div>
                <span className="text-sm text-[var(--muted)]">Cargar Archivo Excel</span>
              </div>
            )}
          </div>
          <button 
            onClick={handleGenerate}
            disabled={!file || !formData.region || isProcessing}
            className="generate-btn w-full mt-4 text-white px-4 py-3 rounded-lg font-semibold disabled:opacity-50 transition-colors flex justify-center items-center gap-2"
          >
            {isProcessing ? 'Procesando Documentos...' : 'Generar PDFs'}
          </button>
        </div>
      </div>

      {resultUrl && !isProcessing && (
        <div className="bg-[var(--paper)] rounded-xl border border-[var(--line)] p-8 text-center animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileImage size={32} />
          </div>
          <h3 className="text-xl font-bold text-[var(--ink)] mb-2">¡Claquetas Generadas con Éxito!</h3>
          <p className="text-[var(--muted)] mb-6">El documento PDF consolidado está listo para ser descargado.</p>
          <button className="download-all inline-flex items-center gap-2 px-8 py-3 rounded-lg text-lg font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
            <Download size={20} />
            <span>Descargar Archivo .pdf</span>
          </button>
        </div>
      )}
    </div>
  );
}

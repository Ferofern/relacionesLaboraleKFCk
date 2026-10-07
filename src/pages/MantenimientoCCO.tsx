import { useState } from 'react';
import { Upload, CheckCircle2 } from 'lucide-react';
import { mediator } from '../services/api';
import { useAppStore } from '../store';
import { useMetricasTiempo } from '../hooks/useMetricasTiempo';

export default function MantenimientoCCO() {
  const { user } = useAppStore();
  const { getTiempoInteraccion, resetTimer } = useMetricasTiempo();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    setSuccess(false);
    try {
      await mediator.actualizar_catalogo_cco(file, { usuario_id: user?.id || 0, proyecto_id: 7, tiempo_interaccion_segundos: getTiempoInteraccion() });
      setSuccess(true);
      setFile(null);
      resetTimer();
    } catch (error) {
      console.error(error);
      alert('Error al actualizar el catálogo. Verifica la consola o intenta de nuevo.');
    }
    setIsProcessing(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-[var(--ink)]">Mantenimiento Catálogo CCO</h2>
        <p className="text-[var(--muted)] mt-1">Sube el archivo Excel para actualizar los correos de líderes y especialistas asociados a cada Centro de Costo.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[var(--line)] overflow-hidden">
        <div className="p-4 border-b border-[var(--line)] bg-[var(--paper)]">
          <h3 className="font-semibold text-[var(--ink)]">Carga de Matriz CCO</h3>
        </div>
        
        <div className="p-5 space-y-4">
          <div className="border-2 border-dashed border-[var(--line)] rounded-xl p-8 text-center hover:bg-[var(--paper)] transition-colors cursor-pointer relative">
            <input 
              type="file" 
              accept=".xlsx,.xls" 
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center gap-3">
              <Upload size={32} className={file ? "text-[var(--cyan)]" : "text-[var(--muted)]"} />
              <p className="font-medium text-[var(--ink)] text-lg">
                {file ? file.name : 'Haz clic o arrastra el archivo Excel aquí'}
              </p>
              {!file && (
                <p className="text-sm text-[var(--muted)]">
                  Encabezados requeridos: CCO, CCO DESCRIPCIÓN, MAIL, correo jefe 1, correo jefe 2, CORREO_LIDER, CORREO LÍDER 2, ESPECIALISTAS, ESPECIALISTAS 2
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-[var(--line)] flex justify-end bg-[var(--paper)]">
          <button 
            onClick={handleUpload}
            disabled={isProcessing || !file}
            className="generate-btn text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {isProcessing ? 'Actualizando...' : 'Actualizar Base de Datos'}
          </button>
        </div>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 size={24} className="text-green-500" />
          <div>
            <p className="font-bold">¡Catálogo actualizado con éxito!</p>
            <p className="text-sm">La base de datos ha procesado y guardado la información correctamente.</p>
          </div>
        </div>
      )}
    </div>
  );
}

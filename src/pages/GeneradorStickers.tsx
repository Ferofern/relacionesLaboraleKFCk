import { useState, useRef } from 'react';
import { Upload, Plus, Trash2, Download, Tag } from 'lucide-react';
import { mediator } from '../services/api';
import { useAppStore } from '../store';
import { useMetricasTiempo } from '../hooks/useMetricasTiempo';
export default function GeneradorStickers() {
  const { user } = useAppStore();
  const { getTiempoInteraccion, resetTimer } = useMetricasTiempo();
  const { stickersData, addSticker, removeSticker, clearStickers } = useAppStore();
  const [baseLoaded, setBaseLoaded] = useState(false);
  const [formato, setFormato] = useState('Costa');
  const [cedulaInput, setCedulaInput] = useState('');
  const [masivoInput, setMasivoInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleAddIndividual = async () => {
    if (cedulaInput.length === 10) {
      const nombre = await mediator.get_nombre_by_cedula(cedulaInput);
      addSticker({ cedula: cedulaInput, nombre });
      setCedulaInput('');
    }
  };

  const handleAddMasivo = async () => {
    const cedulas = masivoInput.split('\n').map(c => c.trim()).filter(c => c.length === 10);
    for (const ced of cedulas) {
      const nombre = await mediator.get_nombre_by_cedula(ced);
      addSticker({ cedula: ced, nombre });
    }
    setMasivoInput('');
  };

  const generatePDF = async () => {
    setIsProcessing(true);
    try {
      await mediator.generate_stickers(stickersData.map(s => s.cedula), formato, { usuario_id: user?.id || 0, proyecto_id: 5, tiempo_interaccion_segundos: getTiempoInteraccion() });
      resetTimer();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-[var(--ink)]">Generador de Stickers</h2>
          <p className="text-[var(--muted)] mt-1">Impresión de etiquetas con formato Costa/Sierra basadas en la matriz principal.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-[var(--line)]">
            <h3 className="font-semibold text-[var(--ink)] mb-3">Cargar Base (Excel)</h3>
            <div 
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors ${baseLoaded ? 'border-[var(--cyan)] bg-[var(--cyan)]/10' : 'border-[var(--line)] hover:border-[var(--cyan)] bg-[var(--paper)]'}`}
            >
              <input type="file" accept=".xlsx,.xls" className="hidden" ref={fileRef} onChange={async (e) => {
                if (e.target.files && e.target.files[0]) {
                  const data = await mediator.process_stickers_file(e.target.files[0]);
                  setBaseLoaded(true);
                }
              }} />
              <Upload className={baseLoaded ? 'text-[var(--cyan)] mb-2' : 'text-[var(--muted)] mb-2'} size={24} />
              <span className="text-sm font-medium text-center">{baseLoaded ? 'Base Cargada' : 'Seleccionar Excel'}</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-[var(--line)]">
            <h3 className="font-semibold text-[var(--ink)] mb-3">Formato de Etiqueta</h3>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="formato" checked={formato === 'Costa'} onChange={() => setFormato('Costa')} className="text-[var(--cyan)] accent-[var(--cyan)]" />
                <span className="text-sm font-medium">Costa</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="formato" checked={formato === 'Sierra'} onChange={() => setFormato('Sierra')} className="text-[var(--cyan)] accent-[var(--cyan)]" />
                <span className="text-sm font-medium">Sierra</span>
              </label>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-[var(--line)]">
            <h3 className="font-semibold text-[var(--ink)] mb-3">Carga Individual</h3>
            <div className="flex gap-2">
              <input 
                type="text" 
                maxLength={10} 
                value={cedulaInput} 
                onChange={e => setCedulaInput(e.target.value.replace(/\D/g, ''))}
                placeholder="Ingresar cédula (10 dig.)" 
                className="flex-1 border border-[var(--line)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--cyan)]" 
              />
              <button 
                onClick={handleAddIndividual}
                disabled={cedulaInput.length !== 10}
                className="bg-[var(--navy)] text-white p-2 rounded-lg hover:bg-[var(--cyan)] disabled:opacity-50 transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-[var(--line)]">
            <h3 className="font-semibold text-[var(--ink)] mb-3">Carga Masiva</h3>
            <textarea 
              rows={4}
              value={masivoInput}
              onChange={e => setMasivoInput(e.target.value)}
              placeholder="Pega las cédulas aquí, una por línea..."
              className="w-full border border-[var(--line)] rounded-lg p-3 text-sm outline-none focus:border-[var(--cyan)] resize-none mb-2"
            ></textarea>
            <button 
              onClick={handleAddMasivo}
              disabled={!masivoInput.trim()}
              className="w-full bg-[var(--paper)] border border-[var(--line)] text-[var(--ink)] py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              Agregar Masivamente
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-[var(--line)] flex flex-col h-[600px]">
          <div className="p-4 border-b border-[var(--line)] flex justify-between items-center bg-[var(--paper)]">
            <h3 className="font-semibold text-[var(--ink)] flex items-center gap-2">
              <Tag className="text-[var(--cyan)]" size={18} /> Stickers a Generar ({stickersData.length})
            </h3>
            <button onClick={clearStickers} className="text-sm text-[var(--muted)] hover:text-[var(--cyan)]">Limpiar Lista</button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar bg-[var(--paper)]/50">
            {stickersData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-[var(--muted)] text-sm">
                No hay cédulas agregadas a la lista.
              </div>
            ) : (
              stickersData.map((s, i) => (
                <div key={i} className="flex gap-3 bg-white p-3 rounded-lg border border-[var(--line)] items-center shadow-sm">
                  <div className="w-1/3">
                    <input type="text" readOnly value={s.cedula} className="w-full bg-[var(--paper)] text-[var(--ink)] px-3 py-1.5 rounded border border-transparent text-sm font-medium" />
                  </div>
                  <div className="flex-1">
                    <input type="text" readOnly value={s.nombre} className="w-full bg-[var(--paper)] text-[var(--muted)] px-3 py-1.5 rounded border border-transparent text-sm" />
                  </div>
                  <button onClick={() => removeSticker(s.cedula)} className="p-1.5 text-[var(--muted)] hover:text-[var(--cyan)] transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-[var(--line)] bg-white">
            <button 
              onClick={generatePDF}
              disabled={stickersData.length === 0 || isProcessing}
              className="generate-btn download-all w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-lg disabled:opacity-50 transition-colors shadow-md hover:shadow-lg"
            >
              <Download size={20} />
              {isProcessing ? 'Generando PDF...' : 'Generar PDF de Stickers'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

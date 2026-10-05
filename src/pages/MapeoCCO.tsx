import { useState } from 'react';
import { Send } from 'lucide-react';
import { mediator } from '../services/api';

export default function MapeoCCO() {
  const [cco, setCco] = useState('');
  const [cedula, setCedula] = useState('');
  const [nombre, setNombre] = useState('');
  const [fecha, setFecha] = useState('');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const processCco = async () => {
    if (!cco || !cedula || !nombre || !fecha) return;
    
    setIsProcessing(true);
    try {
      const data = await mediator.procesar_cco(cco, cedula, nombre, fecha);
      setResult(data);
      
      const to = data.to;
      const cc = data.cc;
      const subject = encodeURIComponent(data.asunto);
      const body = encodeURIComponent(data.cuerpo);
      const mailtoLink = `mailto:${to}?cc=${cc}&subject=${subject}&body=${body}`;
      
      window.location.href = mailtoLink;
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Error procesando el CCO. Verifica la consola o intenta de nuevo.');
    }
    setIsProcessing(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-[var(--ink)]">Bot Mail Liquidaciones</h2>
        <p className="text-[var(--muted)] mt-1">Generación de correos de liquidación por Centro de Costo.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[var(--line)] overflow-hidden">
        <div className="p-4 border-b border-[var(--line)] bg-[var(--paper)]">
          <h3 className="font-semibold text-[var(--ink)]">Datos de Liquidación</h3>
        </div>
        
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--ink)] mb-1">CÓDIGO CCO *</label>
              <input 
                type="text" 
                value={cco}
                onChange={(e) => setCco(e.target.value)}
                className="w-full border border-[var(--line)] rounded-md px-3 py-2 outline-none focus:border-[var(--cyan)]" 
                placeholder="Ej: UIO-001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--ink)] mb-1">CÉDULA EX-COLABORADOR *</label>
              <input 
                type="text" 
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                maxLength={10}
                className="w-full border border-[var(--line)] rounded-md px-3 py-2 outline-none focus:border-[var(--cyan)]" 
                placeholder="10 dígitos"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--ink)] mb-1">NOMBRES COMPLETOS *</label>
              <input 
                type="text" 
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full border border-[var(--line)] rounded-md px-3 py-2 outline-none focus:border-[var(--cyan)]" 
                placeholder="Juan Pérez"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--ink)] mb-1">FECHA DE LIQUIDACIÓN *</label>
              <input 
                type="date" 
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full border border-[var(--line)] rounded-md px-3 py-2 outline-none focus:border-[var(--cyan)]" 
              />
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-[var(--line)] flex justify-end bg-[var(--paper)]">
          <button 
            onClick={processCco}
            disabled={isProcessing || !cco || !cedula || !nombre || !fecha}
            className="generate-btn text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {isProcessing ? 'Procesando...' : 'Generar Correo'}
          </button>
        </div>
      </div>

      {result && (
        <div className="bg-white rounded-xl border border-[var(--line)] p-5 animate-in fade-in">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="font-bold text-xl text-[var(--ink)]">Resultado CCO: {result.cco}</span>
              <p className="text-sm text-[var(--muted)]">{result.desc_cco}</p>
            </div>
          </div>
          <div className="space-y-2 mb-6 bg-[var(--paper)] p-3 rounded-lg text-sm text-[var(--ink)]">
            <p><strong>Para:</strong> {result.to}</p>
            <p><strong>CC:</strong> {result.cc}</p>
          </div>
          <a 
            href={`mailto:${result.to}?cc=${result.cc}&subject=${encodeURIComponent(result.asunto)}&body=${encodeURIComponent(result.cuerpo)}`}
            className="flex items-center justify-center gap-2 w-full py-3 bg-[var(--cyan)] text-white rounded-lg font-semibold hover:bg-cyan-600 transition-colors shadow-sm"
          >
            <Send size={18} /> Abrir en Cliente de Correo (Outlook)
          </a>
        </div>
      )}
    </div>
  );
}

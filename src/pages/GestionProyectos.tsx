import { useState, useEffect } from 'react';
import { Briefcase, Image as ImageIcon, Send, FileText, CheckCircle, Edit, Search } from 'lucide-react';
import { mediator } from '../services/api';

export default function GestionProyectos() {
  const [activeTab, setActiveTab] = useState<'crear' | 'revisar'>('crear');
  const [proyectos, setProyectos] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    codigo: '', nombre: '', solicitante: '', fechaInicio: '', fechaFin: '',
    prioridad: 'Media', tiempoEstimado: '', descripcion: '', uml: '',
    diccionario_datos: '', instructivo: ''
  });

  useEffect(() => {
    if (activeTab === 'revisar') {
      loadProyectos();
    }
  }, [activeTab]);

  const loadProyectos = async () => {
    const data = await mediator.obtener_proyectos();
    setProyectos(data);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await mediator.crear_proyecto(formData);
    setIsSubmitting(false);
    setFormData({ codigo: '', nombre: '', solicitante: '', fechaInicio: '', fechaFin: '', prioridad: 'Media', tiempoEstimado: '', descripcion: '', uml: '', diccionario_datos: '', instructivo: '' });
    setActiveTab('revisar');
  };

  const handleApprove = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Pendiente' ? 'Aprobado' : 'Pendiente';
    await mediator.actualizar_estado(id, newStatus);
    loadProyectos();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-[var(--ink)]">Gestión de Proyectos</h2>
        <p className="text-[var(--muted)] mt-1">Administración de iniciativas, diagramas de procesos y aprobaciones ejecutivas.</p>
      </div>

      <div className="flex border-b border-[var(--line)]">
        <button 
          onClick={() => setActiveTab('crear')}
          className={`px-6 py-3 font-semibold text-sm transition-colors border-b-2 ${activeTab === 'crear' ? 'border-[var(--cyan)] text-[var(--cyan)]' : 'border-transparent text-[var(--muted)] hover:text-[var(--ink)]'}`}
        >
          Crear Iniciativa
        </button>
        <button 
          onClick={() => setActiveTab('revisar')}
          className={`px-6 py-3 font-semibold text-sm transition-colors border-b-2 ${activeTab === 'revisar' ? 'border-[var(--cyan)] text-[var(--cyan)]' : 'border-transparent text-[var(--muted)] hover:text-[var(--ink)]'}`}
        >
          Revisar y Aprobar
        </button>
      </div>

      {activeTab === 'crear' && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl shadow-sm border border-[var(--line)] p-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-[var(--ink)] mb-1">Código</label>
              <input required type="text" value={formData.codigo} onChange={e => setFormData({...formData, codigo: e.target.value})} className="w-full border border-[var(--line)] rounded-lg px-3 py-2 outline-none focus:border-[var(--cyan)]" placeholder="Ej: PRY-001" />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-[var(--ink)] mb-1">Nombre del Proyecto</label>
              <input required type="text" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} className="w-full border border-[var(--line)] rounded-lg px-3 py-2 outline-none focus:border-[var(--cyan)]" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--ink)] mb-1">Solicitante</label>
              <input required type="text" value={formData.solicitante} onChange={e => setFormData({...formData, solicitante: e.target.value})} className="w-full border border-[var(--line)] rounded-lg px-3 py-2 outline-none focus:border-[var(--cyan)]" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--ink)] mb-1">Prioridad</label>
              <select value={formData.prioridad} onChange={e => setFormData({...formData, prioridad: e.target.value})} className="w-full border border-[var(--line)] rounded-lg px-3 py-2 outline-none focus:border-[var(--cyan)] bg-white">
                <option>Alta</option><option>Media</option><option>Baja</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--ink)] mb-1">Tiempo Estimado (Semanas)</label>
              <input type="number" value={formData.tiempoEstimado} onChange={e => setFormData({...formData, tiempoEstimado: e.target.value})} className="w-full border border-[var(--line)] rounded-lg px-3 py-2 outline-none focus:border-[var(--cyan)]" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--ink)] mb-1">Fecha Inicio</label>
              <input type="date" value={formData.fechaInicio} onChange={e => setFormData({...formData, fechaInicio: e.target.value})} className="w-full border border-[var(--line)] rounded-lg px-3 py-2 outline-none focus:border-[var(--cyan)]" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--ink)] mb-1">Fecha Fin</label>
              <input type="date" value={formData.fechaFin} onChange={e => setFormData({...formData, fechaFin: e.target.value})} className="w-full border border-[var(--line)] rounded-lg px-3 py-2 outline-none focus:border-[var(--cyan)]" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[var(--ink)] mb-1">Descripción</label>
            <textarea rows={3} value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} className="w-full border border-[var(--line)] rounded-lg px-3 py-2 outline-none focus:border-[var(--cyan)] resize-none"></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-[var(--ink)] mb-1">Diccionario de Datos</label>
              <textarea rows={4} value={formData.diccionario_datos} onChange={e => setFormData({...formData, diccionario_datos: e.target.value})} className="w-full border border-[var(--line)] rounded-lg px-3 py-2 outline-none focus:border-[var(--cyan)] resize-none" placeholder="Definición de variables..."></textarea>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--ink)] mb-1">Instructivo</label>
              <textarea rows={4} value={formData.instructivo} onChange={e => setFormData({...formData, instructivo: e.target.value})} className="w-full border border-[var(--line)] rounded-lg px-3 py-2 outline-none focus:border-[var(--cyan)] resize-none" placeholder="Paso a paso..."></textarea>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-[var(--ink)] mb-1">Diagrama PlantUML</label>
              <textarea rows={8} value={formData.uml} onChange={e => setFormData({...formData, uml: e.target.value})} className="w-full border border-[var(--line)] rounded-lg px-3 py-2 outline-none focus:border-[var(--cyan)] font-mono text-sm resize-none bg-[var(--navy)] text-green-400" placeholder="@startuml&#10;Alice -> Bob: Test&#10;@enduml"></textarea>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--ink)] mb-1">Imágenes Adjuntas</label>
              <div className="upload-card border-2 border-dashed border-[var(--line)] rounded-xl h-[190px] flex flex-col items-center justify-center cursor-pointer hover:border-[var(--cyan)] bg-[var(--paper)] transition-colors">
                <ImageIcon size={32} className="text-[var(--cyan)] mb-2" />
                <span className="text-sm font-medium text-[var(--ink)]">Cargar Imágenes</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-[var(--line)]">
            <button type="submit" disabled={isSubmitting} className="generate-btn file-action text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50 transition-colors">
              <Briefcase size={18} /> {isSubmitting ? 'Guardando...' : 'Crear Proyecto'}
            </button>
          </div>
        </form>
      )}

      {activeTab === 'revisar' && (
        <div className="bg-white rounded-xl shadow-sm border border-[var(--line)] overflow-hidden">
          <div className="p-4 border-b border-[var(--line)] bg-[var(--paper)] flex justify-between items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={16} />
              <input type="text" placeholder="Buscar proyecto..." className="pl-9 pr-4 py-2 border border-[var(--line)] rounded-lg text-sm outline-none focus:border-[var(--cyan)] w-64" />
            </div>
          </div>
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-[var(--muted)] uppercase bg-white border-b border-[var(--line)]">
              <tr>
                <th className="px-6 py-3 font-semibold">Código</th>
                <th className="px-6 py-3 font-semibold">Nombre</th>
                <th className="px-6 py-3 font-semibold">Solicitante</th>
                <th className="px-6 py-3 font-semibold">Estado</th>
                <th className="px-6 py-3 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {proyectos.map((p, i) => (
                <tr key={i} className="border-b border-[var(--line)] hover:bg-[var(--paper)] transition-colors">
                  <td className="px-6 py-4 font-bold text-[var(--ink)]">{p.id}</td>
                  <td className="px-6 py-4 font-medium">{p.nombre}</td>
                  <td className="px-6 py-4 text-[var(--muted)]">{p.solicitante}</td>
                  <td className="px-6 py-4">
                    <span className={`score-pill ${p.estado === 'Pendiente' ? 'empty' : ''}`}>{p.estado}</span>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button onClick={() => handleApprove(p.id, p.estado)} className="p-2 text-[var(--muted)] hover:text-green-600 transition-colors" title="Cambiar Estado">
                      <CheckCircle size={18} />
                    </button>
                    <button className="p-2 text-[var(--muted)] hover:text-[var(--cyan)] transition-colors" title="Editar">
                      <Edit size={18} />
                    </button>
                    <button className="p-2 text-[var(--muted)] hover:text-blue-600 transition-colors" title="PDF Claqueta">
                      <FileText size={18} />
                    </button>
                    <a href={`mailto:?subject=Aprobación Proyecto ${p.id}`} className="p-2 text-[var(--muted)] hover:text-orange-500 transition-colors" title="Enviar Correo">
                      <Send size={18} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { UserPlus, ShieldPlus, Search, GripVertical, CheckCircle2 } from 'lucide-react';
import { mediator } from '../services/api';

export default function AdminUsuarios() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'crear' | 'accesos'>('dashboard');
  
  // Catálogos
  const [catalogos, setCatalogos] = useState<any>({ apps: [], roles: [], modulos_por_app: {}, usuarios: [] });
  const [registros, setRegistros] = useState<any[]>([]);
  
  // Filtros Dashboard
  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroApp, setFiltroApp] = useState('');
  const [filtroRol, setFiltroRol] = useState('');

  // Form Crear Usuario
  const [nuevoUser, setNuevoUser] = useState({ correo: '', password: '', nombre: '' });
  const [userSuccess, setUserSuccess] = useState(false);

  // Form Accesos
  const [accesoForm, setAccesoForm] = useState({ usuario_id: '', nombre_app: '', rol: '' });
  const [modulosDisponibles, setModulosDisponibles] = useState<string[]>([]);
  const [modulosAsignados, setModulosAsignados] = useState<string[]>([]);
  const [accesoSuccess, setAccesoSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const cats = await mediator.obtener_catalogos_admin();
      const regs = await mediator.obtener_usuarios_accesos();
      setCatalogos(cats);
      setRegistros(regs);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (accesoForm.nombre_app && catalogos.modulos_por_app[accesoForm.nombre_app]) {
      setModulosDisponibles(catalogos.modulos_por_app[accesoForm.nombre_app]);
      setModulosAsignados([]); // Reset al cambiar app
    } else {
      setModulosDisponibles([]);
      setModulosAsignados([]);
    }
  }, [accesoForm.nombre_app, catalogos]);

  const handleCrearUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await mediator.crear_usuario({ ...nuevoUser, password_hash: btoa(nuevoUser.password) }); // Mock hash
      setUserSuccess(true);
      setNuevoUser({ correo: '', password: '', nombre: '' });
      setTimeout(() => setUserSuccess(false), 3000);
    } catch (err) {
      alert("Error al crear usuario");
    }
  };

  const handleAsignarAccesos = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await mediator.asignar_accesos({
        usuario_id: Number(accesoForm.usuario_id),
        nombre_app: accesoForm.nombre_app,
        rol: accesoForm.rol,
        modulos: modulosAsignados.join(', ')
      });
      setAccesoSuccess(true);
      setAccesoForm({ usuario_id: '', nombre_app: '', rol: '' });
      setModulosAsignados([]);
      setTimeout(() => setAccesoSuccess(false), 3000);
      // Recargar tabla
      const regs = await mediator.obtener_usuarios_accesos();
      setRegistros(regs);
    } catch (err) {
      alert("Error al asignar accesos");
    }
  };

  // DND Logic
  const handleDragStart = (e: React.DragEvent, modulo: string, source: 'disponible' | 'asignado') => {
    e.dataTransfer.setData('modulo', modulo);
    e.dataTransfer.setData('source', source);
  };

  const handleDrop = (e: React.DragEvent, target: 'disponible' | 'asignado') => {
    e.preventDefault();
    const modulo = e.dataTransfer.getData('modulo');
    const source = e.dataTransfer.getData('source');
    
    if (source === target) return;

    if (target === 'asignado') {
      setModulosDisponibles(prev => prev.filter(m => m !== modulo));
      setModulosAsignados(prev => [...prev, modulo]);
    } else {
      setModulosAsignados(prev => prev.filter(m => m !== modulo));
      setModulosDisponibles(prev => [...prev, modulo]);
    }
  };

  const filteredRegistros = registros.filter(r => 
    r.nombre_usuario.toLowerCase().includes(filtroNombre.toLowerCase()) &&
    (filtroApp === '' || r.nombre_app === filtroApp) &&
    (filtroRol === '' || r.rol === filtroRol)
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-[var(--ink)]">Administración de Usuarios</h2>
        <p className="text-[var(--muted)] mt-1">Gestiona usuarios y accesos para las distintas aplicaciones del grupo.</p>
      </div>

      <div className="flex space-x-2 border-b border-[var(--line)]">
        <button onClick={() => setActiveTab('dashboard')} className={`py-3 px-4 font-medium transition-colors border-b-2 ${activeTab === 'dashboard' ? 'border-[var(--cyan)] text-[var(--cyan)]' : 'border-transparent text-[var(--muted)] hover:text-[var(--ink)]'}`}>
          Dashboard de Accesos
        </button>
        <button onClick={() => setActiveTab('crear')} className={`py-3 px-4 font-medium transition-colors border-b-2 ${activeTab === 'crear' ? 'border-[var(--cyan)] text-[var(--cyan)]' : 'border-transparent text-[var(--muted)] hover:text-[var(--ink)]'}`}>
          <UserPlus size={16} className="inline mr-2" /> Crear Usuario
        </button>
        <button onClick={() => setActiveTab('accesos')} className={`py-3 px-4 font-medium transition-colors border-b-2 ${activeTab === 'accesos' ? 'border-[var(--cyan)] text-[var(--cyan)]' : 'border-transparent text-[var(--muted)] hover:text-[var(--ink)]'}`}>
          <ShieldPlus size={16} className="inline mr-2" /> Asignar Accesos
        </button>
      </div>

      {activeTab === 'dashboard' && (
        <div className="bg-white rounded-xl border border-[var(--line)] overflow-hidden shadow-sm animate-in fade-in">
          <div className="p-4 bg-[var(--paper)] border-b border-[var(--line)] flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" placeholder="Buscar por nombre..." value={filtroNombre} onChange={e => setFiltroNombre(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:border-[var(--cyan)]" />
            </div>
            <select value={filtroApp} onChange={e => setFiltroApp(e.target.value)} className="px-4 py-2 border rounded-lg outline-none bg-white">
              <option value="">Todas las Apps</option>
              {catalogos.apps.map((a: string) => <option key={a} value={a}>{a}</option>)}
            </select>
            <select value={filtroRol} onChange={e => setFiltroRol(e.target.value)} className="px-4 py-2 border rounded-lg outline-none bg-white">
              <option value="">Todos los Roles</option>
              {catalogos.roles.map((r: string) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[var(--paper)] border-b border-[var(--line)]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Usuario</th>
                  <th className="px-4 py-3 font-semibold">Correo</th>
                  <th className="px-4 py-3 font-semibold">App</th>
                  <th className="px-4 py-3 font-semibold">Rol</th>
                  <th className="px-4 py-3 font-semibold">Módulos Asignados</th>
                </tr>
              </thead>
              <tbody>
                {filteredRegistros.map(r => (
                  <tr key={r.id} className="border-b border-[var(--line)] hover:bg-[var(--paper)] transition-colors">
                    <td className="px-4 py-3 font-medium">{r.nombre_usuario}</td>
                    <td className="px-4 py-3 text-gray-600">{r.correo}</td>
                    <td className="px-4 py-3"><span className="px-2 py-1 bg-gray-100 rounded text-xs">{r.nombre_app}</span></td>
                    <td className="px-4 py-3"><span className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded text-xs font-medium">{r.rol}</span></td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-xs truncate" title={r.modulos}>{r.modulos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'crear' && (
        <div className="bg-white rounded-xl border border-[var(--line)] overflow-hidden shadow-sm max-w-xl animate-in fade-in">
          <div className="p-4 bg-[var(--paper)] border-b border-[var(--line)]">
            <h3 className="font-semibold text-[var(--ink)]">Nuevo Usuario</h3>
          </div>
          <form onSubmit={handleCrearUsuario} className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre Completo</label>
              <input required type="text" value={nuevoUser.nombre} onChange={e => setNuevoUser({...nuevoUser, nombre: e.target.value})} className="w-full p-2 border rounded-lg outline-none focus:border-[var(--cyan)]" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Correo Electrónico</label>
              <input required type="email" value={nuevoUser.correo} onChange={e => setNuevoUser({...nuevoUser, correo: e.target.value})} className="w-full p-2 border rounded-lg outline-none focus:border-[var(--cyan)]" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Contraseña (hash se generará)</label>
              <input required type="password" value={nuevoUser.password} onChange={e => setNuevoUser({...nuevoUser, password: e.target.value})} className="w-full p-2 border rounded-lg outline-none focus:border-[var(--cyan)]" />
            </div>
            
            {userSuccess && (
              <div className="bg-green-50 text-green-700 p-3 rounded-lg flex items-center gap-2 text-sm border border-green-200">
                <CheckCircle2 size={16} /> Usuario creado exitosamente
              </div>
            )}
            
            <button type="submit" className="w-full bg-[var(--cyan)] text-white font-medium py-2 rounded-lg hover:bg-cyan-600 transition-colors">Guardar Usuario</button>
          </form>
        </div>
      )}

      {activeTab === 'accesos' && (
        <div className="bg-white rounded-xl border border-[var(--line)] overflow-hidden shadow-sm animate-in fade-in">
          <div className="p-4 bg-[var(--paper)] border-b border-[var(--line)]">
            <h3 className="font-semibold text-[var(--ink)]">Asignar Accesos y Módulos</h3>
          </div>
          <div className="p-5">
            <form onSubmit={handleAsignarAccesos} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Usuario</label>
                  <select required value={accesoForm.usuario_id} onChange={e => setAccesoForm({...accesoForm, usuario_id: e.target.value})} className="w-full p-2 border rounded-lg bg-white outline-none">
                    <option value="">Seleccione...</option>
                    {catalogos.usuarios.map((u: any) => <option key={u.id} value={u.id}>{u.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Aplicación</label>
                  <select required value={accesoForm.nombre_app} onChange={e => setAccesoForm({...accesoForm, nombre_app: e.target.value})} className="w-full p-2 border rounded-lg bg-white outline-none">
                    <option value="">Seleccione...</option>
                    {catalogos.apps.map((a: string) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Rol</label>
                  <select required value={accesoForm.rol} onChange={e => setAccesoForm({...accesoForm, rol: e.target.value})} className="w-full p-2 border rounded-lg bg-white outline-none">
                    <option value="">Seleccione...</option>
                    {catalogos.roles.map((r: string) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>

              {accesoForm.nombre_app && (
                <div className="pt-4 border-t border-[var(--line)]">
                  <h4 className="font-medium mb-4">Asignación de Módulos (Arrastra y Suelta)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Disponibles */}
                    <div 
                      className="border-2 border-dashed border-gray-300 bg-gray-50 rounded-xl p-4 min-h-[300px]"
                      onDragOver={e => e.preventDefault()}
                      onDrop={e => handleDrop(e, 'disponible')}
                    >
                      <h5 className="text-sm font-semibold text-gray-500 mb-3 uppercase">Módulos Disponibles</h5>
                      <div className="space-y-2">
                        {modulosDisponibles.map(m => (
                          <div 
                            key={m}
                            draggable
                            onDragStart={e => handleDragStart(e, m, 'disponible')}
                            className="bg-white border border-gray-200 p-3 rounded-lg shadow-sm flex items-center cursor-move hover:border-gray-400 transition-colors"
                          >
                            <GripVertical size={16} className="text-gray-400 mr-2" />
                            <span className="text-sm">{m}</span>
                          </div>
                        ))}
                        {modulosDisponibles.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No hay módulos disponibles</p>}
                      </div>
                    </div>

                    {/* Asignados */}
                    <div 
                      className="border-2 border-dashed border-[var(--cyan)] bg-blue-50/30 rounded-xl p-4 min-h-[300px]"
                      onDragOver={e => e.preventDefault()}
                      onDrop={e => handleDrop(e, 'asignado')}
                    >
                      <h5 className="text-sm font-semibold text-[var(--cyan)] mb-3 uppercase">Módulos Asignados</h5>
                      <div className="space-y-2">
                        {modulosAsignados.map(m => (
                          <div 
                            key={m}
                            draggable
                            onDragStart={e => handleDragStart(e, m, 'asignado')}
                            className="bg-white border border-[var(--cyan)] p-3 rounded-lg shadow-sm flex items-center cursor-move hover:bg-blue-50 transition-colors"
                          >
                            <GripVertical size={16} className="text-[var(--cyan)] mr-2 opacity-50" />
                            <span className="text-sm font-medium text-gray-800">{m}</span>
                          </div>
                        ))}
                        {modulosAsignados.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Arrastra módulos aquí</p>}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {accesoSuccess && (
                <div className="bg-green-50 text-green-700 p-3 rounded-lg flex items-center gap-2 text-sm border border-green-200">
                  <CheckCircle2 size={16} /> Accesos asignados exitosamente
                </div>
              )}

              <div className="flex justify-end pt-4">
                <button type="submit" disabled={!accesoForm.usuario_id || !accesoForm.nombre_app || !accesoForm.rol} className="bg-[var(--cyan)] text-white font-medium py-2 px-6 rounded-lg hover:bg-cyan-600 transition-colors disabled:opacity-50">
                  Guardar Accesos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

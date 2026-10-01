import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAppStore } from '../store';
import { 
  Menu, LogOut, FileText, FileCheck, Mail, Receipt, 
  Image as ImageIcon, Tag, Shirt, Combine, Briefcase, 
  FormInput, BarChart3, ShoppingCart, ClipboardList, ShieldAlert, User as UserIcon
} from 'lucide-react';

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const { userRole, setUser, user } = useAppStore();

  const handleLogout = () => {
    setUser(null);
  };

  const modules = [
    {
      category: 'Nómina e IESS',
      items: [
        { path: '/extractor-iess', name: 'Extractor IESS', icon: <FileText size={18} /> },
        { path: '/validador-iess', name: 'Validador IESS vs Payroll', icon: <FileCheck size={18} /> },
        { path: '/mapeo-cco', name: 'Mapeo CCO (Liquidación)', icon: <Mail size={18} /> },
      ]
    },
    {
      category: 'Documentos y Generadores',
      items: [
        { path: '/extractor-facturas', name: 'Extractor Facturas', icon: <Receipt size={18} /> },
        { path: '/generador-stickers', name: 'Generador Stickers', icon: <Tag size={18} /> },
        { path: '/generador-dotaciones', name: 'Generador Uniformes BOT SAP', icon: <Shirt size={18} /> },
      ]
    },
    {
      category: 'Suministros Corporativos',
      items: [
        { path: '/pedir-suministros', name: 'Pedir Suministros', icon: <ShoppingCart size={18} /> },
        { path: '/reportes-suministros', name: 'Reportes Suministros', icon: <ClipboardList size={18} /> },
      ]
    },
    {
      category: 'Gestión y Proyectos',
      items: [
        { path: '/gestion-proyectos', name: 'Gestión de Proyectos', icon: <Briefcase size={18} /> },
      ]
    },
    {
      category: 'Analítica y Dashboards',
      items: [
        { path: '/dashboard', name: 'Dashboard Métricas', icon: <BarChart3 size={18} />, alwaysShow: true },
      ]
    }
  ];

  // Filtramos los módulos según los permisos del usuario
  const filteredModules = modules.map(category => {
    const filteredItems = category.items.filter(item => {
      // Mostrar si tiene alwaysShow (ej. Dashboard) o si su nombre está en los módulos autorizados del usuario
      return item.alwaysShow || (user?.modulos && user.modulos.includes(item.name));
    });
    return { ...category, items: filteredItems };
  }).filter(category => category.items.length > 0);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--paper)]">
      <aside className={`sidebar transition-all duration-300 flex flex-col ${collapsed ? 'w-20' : 'w-64'} shrink-0 text-white`}>
        <div className="p-4 flex items-center justify-between">
          {!collapsed && (
            <div className="brand-logo mb-0">
              <div className="text-[var(--cyan)] font-bold text-xl tracking-tighter">KFC<span className="text-[var(--ink)]">RRHH</span></div>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="p-2 hover:bg-white/10 rounded-lg text-white">
            <Menu size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar pb-20">
          {filteredModules.map((category, idx) => (
            <div key={idx} className="mb-6">
              {!collapsed && (
                <div className="px-4 mb-2 text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                  {category.category}
                </div>
              )}
              <ul>
                {category.items.map((item, i) => (
                  <li key={i}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) => `
                        nav-item flex items-center py-2.5 px-4 mx-2 my-1 rounded-lg transition-colors
                        ${isActive ? 'active bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}
                      `}
                      title={collapsed ? item.name : undefined}
                    >
                      {({ isActive }) => (
                        <>
                          <div className="relative">
                            {item.icon}
                            {isActive && collapsed && <div className="pulse-dot absolute -top-1 -right-1 w-2 h-2 rounded-full"></div>}
                          </div>
                          {!collapsed && (
                            <div className="ml-3 flex-1 flex items-center justify-between whitespace-nowrap overflow-hidden">
                              <span className="text-sm font-medium">{item.name}</span>
                              {isActive && <div className="pulse-dot w-2 h-2 rounded-full"></div>}
                            </div>
                          )}
                        </>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t border-white/10">
          {!collapsed && user && (
            <div className="mb-4 flex items-center gap-3 px-2 overflow-hidden">
              <div className="w-8 h-8 rounded bg-[var(--cyan)] flex items-center justify-center shrink-0">
                <UserIcon size={16} />
              </div>
              <div className="overflow-hidden">
                <div className="text-sm font-medium truncate">{user.nombre}</div>
                <div className="text-xs text-gray-400 truncate">{user.rol}</div>
              </div>
            </div>
          )}
          <button 
            onClick={handleLogout}
            className="flex items-center w-full p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            {!collapsed && <span className="ml-3 text-sm font-medium">Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="topbar bg-white border-b border-[var(--line)] h-16 flex items-center justify-between px-6 shrink-0 z-10 shadow-sm">
          <h1 className="text-xl font-semibold text-[var(--ink)] hidden sm:block">
            Sistema Integrado <em>RRHH</em>
          </h1>
          
          <div className="flex items-center gap-4 ml-auto">
            <div className="demo-banner flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-medium">
              <ShieldAlert size={16} className="text-[var(--cyan)]" />
              Rol: <span className="px-2 py-0.5 rounded text-white text-xs">{userRole || 'Ninguno'}</span>
            </div>
            
            <div className="w-9 h-9 rounded-full bg-[var(--paper)] border border-[var(--line)] flex items-center justify-center text-[var(--ink)] font-bold uppercase overflow-hidden text-sm" title={user?.correo}>
              {user?.nombre?.charAt(0) || userRole?.charAt(0) || 'U'}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

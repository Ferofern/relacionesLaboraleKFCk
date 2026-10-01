import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './store';
import Layout from './components/Layout';
import ExtractorIess from './pages/ExtractorIess';
import ValidadorIess from './pages/ValidadorIess';
import MapeoCCO from './pages/MapeoCCO';
import ExtractorFacturas from './pages/ExtractorFacturas';
import GeneradorClaquetas from './pages/GeneradorClaquetas';
import GeneradorStickers from './pages/GeneradorStickers';
import GeneradorDotaciones from './pages/GeneradorDotaciones';
import GestionProyectos from './pages/GestionProyectos';
import DashboardMetricas from './pages/DashboardMetricas';
import { Shield } from 'lucide-react';

function Login() {
  const setUserRole = useAppStore(state => state.setUserRole);
  
  return (
    <div className="min-h-screen bg-[var(--paper)] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-[var(--shadow)] max-w-md w-full text-center border-t-4 border-[var(--cyan)]">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-[var(--paper)] rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-[var(--cyan)]" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-[var(--ink)] mb-2">Acceso Corporativo</h1>
        <p className="text-[var(--muted)] mb-8">Seleccione su rol para ingresar al sistema</p>
        
        <div className="space-y-4">
          <button 
            onClick={() => setUserRole('Administrador')}
            className="w-full py-3 px-4 bg-[var(--navy)] text-white rounded-lg hover:bg-[var(--cyan)] transition-colors font-medium flex justify-between items-center"
          >
            <span>Administrador</span>
            <span className="text-xs bg-white/20 px-2 py-1 rounded">Acceso Total</span>
          </button>
          <button 
            onClick={() => setUserRole('Aprobador')}
            className="w-full py-3 px-4 bg-white border border-[var(--line)] text-[var(--ink)] rounded-lg hover:border-[var(--cyan)] hover:text-[var(--cyan)] transition-colors font-medium flex justify-between items-center"
          >
            <span>Aprobador</span>
            <span className="text-xs bg-[var(--paper)] text-[var(--muted)] px-2 py-1 rounded">Gestión</span>
          </button>
          <button 
            onClick={() => setUserRole('Operador')}
            className="w-full py-3 px-4 bg-white border border-[var(--line)] text-[var(--ink)] rounded-lg hover:border-[var(--cyan)] hover:text-[var(--cyan)] transition-colors font-medium flex justify-between items-center"
          >
            <span>Operador</span>
            <span className="text-xs bg-[var(--paper)] text-[var(--muted)] px-2 py-1 rounded">Básico</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const userRole = useAppStore(state => state.userRole);

  if (!userRole) {
    return <Login />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          
          <Route path="extractor-iess" element={<ExtractorIess />} />
          <Route path="validador-iess" element={<ValidadorIess />} />
          <Route path="mapeo-cco" element={<MapeoCCO />} />
          
          <Route path="extractor-facturas" element={<ExtractorFacturas />} />
          <Route path="generador-claquetas" element={<GeneradorClaquetas />} />
          <Route path="generador-stickers" element={<GeneradorStickers />} />
          <Route path="generador-dotaciones" element={<GeneradorDotaciones />} />
          
          <Route path="gestion-proyectos" element={<GestionProyectos />} />
          
          <Route path="dashboard" element={<DashboardMetricas />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

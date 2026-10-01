import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './store';
import Layout from './components/Layout';
import ExtractorIess from './pages/ExtractorIess';
import ValidadorIess from './pages/ValidadorIess';
import MapeoCCO from './pages/MapeoCCO';
import ExtractorFacturas from './pages/ExtractorFacturas';
import GeneradorStickers from './pages/GeneradorStickers';
import GeneradorDotaciones from './pages/GeneradorDotaciones';
import GestionProyectos from './pages/GestionProyectos';
import DashboardMetricas from './pages/DashboardMetricas';
import PedirSuministros from './pages/PedirSuministros';
import ReportesSuministros from './pages/ReportesSuministros';
import VisorFormularios from './pages/VisorFormularios';
import Login from './pages/Login';

// Componente para proteger las rutas basado en los módulos autorizados del usuario
function ProtectedRoute({ children, moduleName }: { children: JSX.Element, moduleName?: string }) {
  const user = useAppStore(state => state.user);

  // Si no hay usuario, redirigir al login (aunque el App.tsx general ya debería atajarlo)
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si la ruta requiere un módulo específico y el usuario no lo tiene
  if (moduleName && (!user.modulos || !user.modulos.includes(moduleName))) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">403</h2>
        <p className="text-lg text-gray-600">No estás autorizado para acceder a este módulo.</p>
        <p className="text-sm text-gray-400 mt-2">Módulo requerido: {moduleName}</p>
      </div>
    );
  }

  return children;
}

function App() {
  const user = useAppStore(state => state.user);

  if (!user) {
    return <Login />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          
          <Route path="extractor-iess" element={<ProtectedRoute moduleName="Extractor IESS"><ExtractorIess /></ProtectedRoute>} />
          <Route path="validador-iess" element={<ProtectedRoute moduleName="Validador IESS vs Payroll"><ValidadorIess /></ProtectedRoute>} />
          <Route path="mapeo-cco" element={<ProtectedRoute moduleName="Mapeo de Cargos CCO"><MapeoCCO /></ProtectedRoute>} />
          
          <Route path="extractor-facturas" element={<ProtectedRoute moduleName="Extractor de Facturas"><ExtractorFacturas /></ProtectedRoute>} />
          <Route path="generador-stickers" element={<ProtectedRoute moduleName="Generador de Stickers"><GeneradorStickers /></ProtectedRoute>} />
          <Route path="generador-dotaciones" element={<ProtectedRoute moduleName="Generador de Dotaciones"><GeneradorDotaciones /></ProtectedRoute>} />
          
          <Route path="pedir-suministros" element={<ProtectedRoute moduleName="Pedir Suministros"><PedirSuministros /></ProtectedRoute>} />
          <Route path="reportes-suministros" element={<ProtectedRoute moduleName="Reporte de Suministros"><ReportesSuministros /></ProtectedRoute>} />
          
          <Route path="gestion-proyectos" element={<ProtectedRoute moduleName="Gestion de Proyectos"><GestionProyectos /></ProtectedRoute>} />
          <Route path="visor-formularios" element={<ProtectedRoute moduleName="Visor de Formularios"><VisorFormularios /></ProtectedRoute>} />
          
          <Route path="dashboard" element={<ProtectedRoute moduleName="Dashboard de Metricas"><DashboardMetricas /></ProtectedRoute>} />
          
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

import { useState } from 'react';
import { useAppStore } from '../store';
import { mediator } from '../services/api';
import { KeyRound, Mail, Loader2 } from 'lucide-react';
import logoKFC from '../../logos/logo-grupo-kfc.png';
import logoRRHH from '../../logos/logoRecursosHumanosFirma.png';

export default function Login() {
  const setUser = useAppStore(state => state.setUser);
  
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!correo || !password) {
      setError('Por favor, ingresa tu correo y contraseña.');
      return;
    }

    setLoading(true);
    try {
      const response = await mediator.login(correo, password);
      if (response && response.user) {
        if (response.access_token) {
          response.user.token = response.access_token;
        }
        setUser(response.user);
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Credenciales incorrectas. Verifica tu correo y contraseña.');
      } else {
        setError('Ocurrió un error al intentar iniciar sesión. Intenta más tarde.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-[var(--paper)] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-[var(--shadow)] max-w-md w-full text-center border-t-4 border-[var(--cyan)]">
        <div className="flex justify-center mb-6 gap-6 items-center">
          <img src={logoKFC} alt="Grupo KFC" className="h-16 object-contain" />
          <div className="h-12 w-px bg-gray-200"></div>
          <img src={logoRRHH} alt="Recursos Humanos" className="h-12 object-contain" />
        </div>
        <h1 className="text-2xl font-bold text-[var(--ink)] mb-2">Acceso Corporativo</h1>
        <p className="text-[var(--muted)] mb-6">Ingresa tus credenciales para continuar</p>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-sm font-medium text-[var(--ink)] mb-1">Correo Electrónico</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={16} className="text-gray-400" />
              </div>
              <input
                type="email"
                value={correo}
                onChange={e => setCorreo(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-[var(--line)] rounded-lg focus:outline-none focus:border-[var(--cyan)]"
                placeholder="empleado@grupokfc.com"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[var(--ink)] mb-1">Contraseña</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <KeyRound size={16} className="text-gray-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-[var(--line)] rounded-lg focus:outline-none focus:border-[var(--cyan)]"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-2.5 px-4 bg-[var(--navy)] text-white rounded-lg hover:bg-[var(--cyan)] transition-colors font-medium flex justify-center items-center gap-2 disabled:opacity-70"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <span>Iniciar Sesión</span>}
          </button>
        </form>
      </div>
    </div>
  );
}

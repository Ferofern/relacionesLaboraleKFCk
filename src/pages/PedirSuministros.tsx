import { useState, useEffect } from 'react';
import { mediator, API_URL } from '../services/api';
import { ShoppingCart, CheckCircle } from 'lucide-react';

export default function PedirSuministros() {
  const [catalogo, setCatalogo] = useState<any[]>([]);
  const [carrito, setCarrito] = useState<{ [key: string]: number }>({});
  const [correo, setCorreo] = useState('empleado@grupokfc.com');
  const [nombre, setNombre] = useState('Juan Perez');
  const [yaHizoPedido, setYaHizoPedido] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setIsVerifying(true);
    try {
      const existe = await mediator.verificar_pedido_mes(correo);
      setYaHizoPedido(existe);
      if (!existe) {
        const cat = await mediator.obtener_catalogo();
        setCatalogo(cat || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCantidadChange = (itemNombre: string, cantidad: number) => {
    setCarrito(prev => {
      const nuevo = { ...prev };
      if (cantidad <= 0) {
        delete nuevo[itemNombre];
      } else {
        nuevo[itemNombre] = cantidad;
      }
      return nuevo;
    });
  };

  const enviarPedido = async () => {
    const items = Object.entries(carrito).map(([nombre, cantidad]) => ({ nombre, cantidad }));
    if (items.length === 0) return alert('El carrito está vacío');
    try {
      await mediator.guardar_pedido(items, correo, nombre);
      setYaHizoPedido(true);
    } catch (e) {
      alert('Error al guardar el pedido');
    }
  };

  if (isVerifying) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-[var(--muted)]">Verificando estado del pedido...</div>
      </div>
    );
  }

  if (yaHizoPedido) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-white rounded-xl shadow-sm border border-[var(--line)] p-8 text-center">
          <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
          <h2 className="text-2xl font-bold text-[var(--ink)]">Pedido Registrado</h2>
          <p className="text-[var(--muted)] mt-2">Ya has realizado tu pedido de suministros para este mes. Podrás hacer uno nuevo el próximo mes.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-[var(--ink)]">Catálogo de Suministros</h2>
          <p className="text-[var(--muted)] mt-1">Selecciona los artículos que necesitas para este mes.</p>
        </div>
        <button 
          onClick={enviarPedido}
          className="bg-[var(--navy)] text-white px-6 py-2.5 rounded-lg font-medium flex items-center space-x-2 transition-colors hover:bg-[var(--cyan)] shadow-sm"
        >
          <ShoppingCart size={18} />
          <span>Confirmar Pedido</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {catalogo.map((item, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-[var(--line)] overflow-hidden flex flex-col">
            <div className="h-40 bg-[var(--paper)] flex items-center justify-center p-4">
              {item.imagen ? (
                <img src={`${API_URL}/${item.imagen}`} alt={item.nombre} className="max-h-full object-contain mix-blend-multiply" />
              ) : (
                <div className="text-[var(--muted)]">Sin imagen</div>
              )}
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="font-semibold text-[var(--ink)] flex-1">{item.nombre}</h3>
              {item.variantes && item.variantes.length > 0 && (
                <select className="mt-2 text-sm border border-[var(--line)] rounded p-1 outline-none">
                  {item.variantes.map((v: string) => <option key={v} value={v}>{v}</option>)}
                </select>
              )}
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm font-medium text-[var(--muted)]">Cantidad:</span>
                <input 
                  type="number" 
                  min="0"
                  max="10"
                  className="w-16 border border-[var(--line)] rounded-lg px-2 py-1 outline-none text-center focus:border-[var(--cyan)]"
                  value={carrito[item.nombre] || ''}
                  onChange={e => handleCantidadChange(item.nombre, parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

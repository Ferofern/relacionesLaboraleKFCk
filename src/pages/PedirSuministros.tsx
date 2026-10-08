import { useState, useEffect } from 'react';
import { mediator, API_URL } from '../services/api';
import { ShoppingCart, CheckCircle, Plus, Trash2, X } from 'lucide-react';
import { useAppStore } from '../store';
import { useMetricasTiempo } from '../hooks/useMetricasTiempo';

function ProductoCard({ item, onAdd }: { item: any, onAdd: (nombre: string, cantidad: number) => void }) {
  const [variante, setVariante] = useState(item.variantes && item.variantes.length > 0 ? item.variantes[0] : item.nombre);
  const [cantidad, setCantidad] = useState(1);

  const handleAdd = () => {
    onAdd(variante, cantidad);
    setCantidad(1); // reset after adding
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[var(--line)] overflow-hidden flex flex-col hover:border-[var(--cyan)] transition-colors">
      <div className="h-40 bg-[var(--paper)] flex items-center justify-center p-4">
        {item.imagen ? (
          <img src={`${API_URL}/${item.imagen}`} alt={item.nombre} className="max-h-full object-contain mix-blend-multiply" />
        ) : (
          <div className="text-[var(--muted)]">Sin imagen</div>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-[var(--ink)] uppercase flex-1">{item.nombre}</h3>
        {item.variantes && item.variantes.length > 0 && (
          <select 
            className="mt-2 text-sm border border-[var(--line)] rounded-lg p-2 outline-none focus:border-[var(--cyan)]"
            value={variante}
            onChange={(e) => setVariante(e.target.value)}
          >
            {item.variantes.map((v: string) => <option key={v} value={v}>{v}</option>)}
          </select>
        )}
        <div className="mt-4 flex items-center gap-2">
          <span className="text-sm font-medium text-[var(--muted)]">Cant:</span>
          <input 
            type="number" 
            min="1"
            className="w-16 border border-[var(--line)] rounded-lg px-2 py-1.5 outline-none text-center focus:border-[var(--cyan)]"
            value={cantidad}
            onChange={e => setCantidad(parseInt(e.target.value) || 1)}
          />
          <button 
            onClick={handleAdd}
            className="ml-auto bg-[var(--cyan)] text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors hover:bg-opacity-90 shadow-sm"
          >
            <Plus size={16} /> Añadir
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PedirSuministros() {
  const user = useAppStore(state => state.user);
  const { getTiempoInteraccion, resetTimer } = useMetricasTiempo();
  
  const [catalogo, setCatalogo] = useState<any[]>([]);
  const [carrito, setCarrito] = useState<{ [key: string]: number }>({});
  
  const correo = user?.correo || 'empleado@grupokfc.com';
  const nombre = user?.nombre || 'Juan Perez';
  
  const [yaHizoPedido, setYaHizoPedido] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(window.innerWidth >= 1280);

  useEffect(() => {
    cargarDatos();
    const handleResize = () => {
      if (window.innerWidth >= 1280 && Object.keys(carrito).length > 0) {
        setIsCartOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [carrito]);

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

  const handleAddToCart = (itemNombre: string, cantidad: number) => {
    setCarrito(prev => {
      const nuevo = { ...prev };
      nuevo[itemNombre] = (nuevo[itemNombre] || 0) + cantidad;
      return nuevo;
    });
    // Auto-open cart on mobile when first item added
    if (Object.keys(carrito).length === 0 && window.innerWidth < 1280) {
      setIsCartOpen(true);
    }
  };

  const handleRemoveFromCart = (itemNombre: string) => {
    setCarrito(prev => {
      const nuevo = { ...prev };
      delete nuevo[itemNombre];
      return nuevo;
    });
  };

  const enviarPedido = async () => {
    const items = Object.entries(carrito).map(([nombre, cantidad]) => ({ nombre, cantidad }));
    if (items.length === 0) return alert('El carrito está vacío');
    try {
      await mediator.guardar_pedido(items, correo, nombre, { usuario_id: user?.id || 0, proyecto_id: 108, tiempo_interaccion_segundos: getTiempoInteraccion() });
      setYaHizoPedido(true);
      resetTimer();
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

  const itemsEnCarrito = Object.entries(carrito);

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-[var(--ink)]">Catálogo de Suministros</h2>
        <p className="text-[var(--muted)] mt-1">Selecciona los artículos que necesitas para este mes.</p>
      </div>

      <div className={`grid grid-cols-1 ${isCartOpen ? 'xl:grid-cols-4' : ''} gap-6 relative transition-all duration-300`}>
        <div className={`${isCartOpen ? 'xl:col-span-3' : 'w-full'} grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 ${!isCartOpen ? 'xl:grid-cols-4' : ''} gap-6 transition-all duration-300`}>
          {catalogo.map((item, i) => (
            <ProductoCard key={i} item={item} onAdd={handleAddToCart} />
          ))}
        </div>

        {isCartOpen && (
          <div className="xl:col-span-1">
            <div className="fixed inset-y-0 right-0 z-50 w-80 sm:w-96 bg-white shadow-2xl flex flex-col xl:static xl:w-auto xl:shadow-sm xl:rounded-xl border border-[var(--line)] xl:sticky xl:top-6 xl:max-h-[80vh] transition-transform animate-in slide-in-from-right xl:slide-in-from-bottom-4">
              <div className="p-4 border-b border-[var(--line)] flex justify-between items-center bg-[var(--paper)] xl:rounded-t-xl">
                <div className="flex items-center gap-2 font-bold text-[var(--ink)]">
                  <ShoppingCart size={18} className="text-[var(--cyan)]" />
                  Mi Carrito
                </div>
                <div className="flex items-center gap-3">
                  <span className="bg-[var(--navy)] text-white text-xs px-2 py-1 rounded-full font-bold">
                    {itemsEnCarrito.length} ítems
                  </span>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="p-1 hover:bg-gray-200 rounded-full transition-colors text-[var(--muted)]"
                    title="Minimizar carrito"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              
              <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
                {itemsEnCarrito.length === 0 ? (
                  <div className="text-center text-[var(--muted)] py-8 text-sm">
                    Tu carrito está vacío. Añade productos desde el catálogo.
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {itemsEnCarrito.map(([nombre, cantidad]) => (
                      <li key={nombre} className="flex justify-between items-center text-sm p-3 border border-[var(--line)] rounded-lg bg-[var(--paper)]">
                        <div className="flex-1 pr-2">
                          <div className="font-semibold text-[var(--ink)] break-words">{nombre}</div>
                          <div className="text-[var(--muted)] text-xs mt-0.5">Cant: {cantidad}</div>
                        </div>
                        <button 
                          onClick={() => handleRemoveFromCart(nombre)}
                          className="text-red-400 hover:text-red-600 transition-colors p-1"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="p-4 border-t border-[var(--line)] xl:rounded-b-xl bg-white">
                <button 
                  onClick={enviarPedido}
                  disabled={itemsEnCarrito.length === 0}
                  className="w-full bg-[var(--navy)] disabled:opacity-50 text-white px-6 py-3 rounded-lg font-bold flex items-center justify-center space-x-2 transition-colors hover:bg-[var(--cyan)] shadow-sm"
                >
                  <span>Confirmar Pedido</span>
                </button>
              </div>
            </div>
            
            <div 
              className="fixed inset-0 bg-black/20 z-40 xl:hidden animate-in fade-in" 
              onClick={() => setIsCartOpen(false)}
            />
          </div>
        )}
      </div>

      {!isCartOpen && (
        <button 
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 right-6 bg-[var(--navy)] text-white p-4 rounded-full shadow-xl hover:scale-105 transition-transform z-40 flex items-center justify-center animate-in zoom-in fade-in"
          title="Ver Carrito"
        >
          <ShoppingCart size={24} />
          {itemsEnCarrito.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-[var(--cyan)] text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold border-2 border-white">
              {itemsEnCarrito.length}
            </span>
          )}
        </button>
      )}
    </div>
  );
}

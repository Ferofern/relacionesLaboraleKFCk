import { useState, useEffect } from 'react';
import { mediator, API_URL } from '../services/api';
import { ShoppingCart, CheckCircle, Plus, Trash2 } from 'lucide-react';

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

  const handleAddToCart = (itemNombre: string, cantidad: number) => {
    setCarrito(prev => {
      const nuevo = { ...prev };
      nuevo[itemNombre] = (nuevo[itemNombre] || 0) + cantidad;
      return nuevo;
    });
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

  const itemsEnCarrito = Object.entries(carrito);

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-[var(--ink)]">Catálogo de Suministros</h2>
        <p className="text-[var(--muted)] mt-1">Selecciona los artículos que necesitas para este mes.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {catalogo.map((item, i) => (
            <ProductoCard key={i} item={item} onAdd={handleAddToCart} />
          ))}
        </div>

        <div className="xl:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-[var(--line)] flex flex-col sticky top-6 max-h-[80vh]">
            <div className="p-4 border-b border-[var(--line)] flex justify-between items-center bg-[var(--paper)]">
              <div className="flex items-center gap-2 font-bold text-[var(--ink)]">
                <ShoppingCart size={18} className="text-[var(--cyan)]" />
                Mi Carrito
              </div>
              <span className="bg-[var(--navy)] text-white text-xs px-2 py-1 rounded-full font-bold">
                {itemsEnCarrito.length} ítems
              </span>
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

            <div className="p-4 border-t border-[var(--line)]">
              <button 
                onClick={enviarPedido}
                disabled={itemsEnCarrito.length === 0}
                className="w-full bg-[var(--navy)] disabled:opacity-50 text-white px-6 py-3 rounded-lg font-bold flex items-center justify-center space-x-2 transition-colors hover:bg-[var(--cyan)] shadow-sm"
              >
                <span>Confirmar Pedido</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, X, AlertCircle, ShoppingBag, Send } from 'lucide-react';
import { useAppStore } from '../store';
import { mediator } from '../services/api';

export default function PedirSuministros() {
  const { carritoSum, addToCarrito, removeFromCarrito, clearCarrito, pedidoMesRealizado, setPedidoMesRealizado } = useAppStore();
  const [catalogo, setCatalogo] = useState<any[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [localSelections, setLocalSelections] = useState<Record<string, { variante: string, cantidad: number }>>({});

  useEffect(() => {
    loadCatalogo();
    checkPedido();
  }, []);

  const loadCatalogo = async () => {
    const data = await mediator.obtener_catalogo();
    setCatalogo(data);
    const initialSelections: any = {};
    data.forEach(item => {
      initialSelections[item.id] = { variante: item.variantes[0], cantidad: 1 };
    });
    setLocalSelections(initialSelections);
  };

  const checkPedido = async () => {
    const hecho = await mediator.verificar_pedido_mes();
    setPedidoMesRealizado(hecho);
  };

  const handleUpdateLocal = (id: string, field: string, value: any) => {
    setLocalSelections(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  const handleAddToCart = (item: any) => {
    const sel = localSelections[item.id];
    addToCarrito({
      id: `${item.id}-${sel.variante}-${Date.now()}`,
      nombre: item.nombre,
      variante: sel.variante,
      cantidad: sel.cantidad
    });
    setCartOpen(true);
  };

  const handleConfirmOrder = async () => {
    setIsSubmitting(true);
    await mediator.guardar_pedido(carritoSum);
    clearCarrito();
    setPedidoMesRealizado(true);
    setIsSubmitting(false);
    setCartOpen(false);
  };

  const conImagen = catalogo.filter(c => c.imagen);
  const sinImagen = catalogo.filter(c => !c.imagen);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-[var(--ink)]">Pedir Suministros</h2>
          <p className="text-[var(--muted)] mt-1">Catálogo de artículos de oficina e inventario mensual.</p>
        </div>
        <button onClick={() => setCartOpen(true)} className="relative p-3 bg-white border border-[var(--line)] rounded-full text-[var(--ink)] hover:text-[var(--cyan)] hover:border-[var(--cyan)] transition-colors shadow-sm">
          <ShoppingCart size={24} />
          {carritoSum.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-[var(--cyan)] text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
              {carritoSum.reduce((acc, curr) => acc + curr.cantidad, 0)}
            </span>
          )}
        </button>
      </div>

      <div className="bg-white border border-[var(--line)] rounded-xl p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--paper)] flex items-center justify-center text-[var(--muted)]">
            <AlertCircle size={20} />
          </div>
          <div>
            <h4 className="font-semibold text-[var(--ink)] text-sm">Estado del Pedido Mensual</h4>
            <p className="text-xs text-[var(--muted)]">Solo puedes realizar un pedido consolidado por mes.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-[var(--muted)]">Simular pedido enviado:</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={pedidoMesRealizado} onChange={(e) => setPedidoMesRealizado(e.target.checked)} />
            <div className="w-11 h-6 bg-[var(--line)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--cyan)]"></div>
          </label>
        </div>
      </div>

      {pedidoMesRealizado ? (
        <div className="bg-[#fff0f2] border border-[#e9a6b2] rounded-xl p-8 text-center text-[#a40f29]">
          <ShoppingBag size={48} className="mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold mb-2">Pedido Mensual Registrado</h3>
          <p>Ya has realizado tu solicitud de suministros para este mes. Podrás volver a pedir el próximo mes.</p>
        </div>
      ) : (
        <>
          <div>
            <h3 className="text-lg font-bold text-[var(--ink)] mb-4 flex items-center gap-2">
              Artículos Destacados
            </h3>
            <div className="format-grid">
              {conImagen.map(item => (
                <div key={item.id} className="format-card bg-white border border-[var(--line)] rounded-xl overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-shadow">
                  <div className="h-40 bg-[var(--paper)] flex items-center justify-center border-b border-[var(--line)]">
                    <span className="text-4xl">📦</span>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h4 className="font-bold text-[var(--ink)] truncate mb-3">{item.nombre}</h4>
                    <div className="space-y-3 mt-auto">
                      <select 
                        value={localSelections[item.id]?.variante} 
                        onChange={(e) => handleUpdateLocal(item.id, 'variante', e.target.value)}
                        className="w-full border border-[var(--line)] rounded-md px-2 py-1.5 text-sm bg-[var(--paper)] outline-none focus:border-[var(--cyan)]"
                      >
                        {item.variantes.map((v: string) => <option key={v} value={v}>{v}</option>)}
                      </select>
                      <div className="flex gap-2">
                        <div className="flex items-center border border-[var(--line)] rounded-md bg-[var(--paper)] overflow-hidden">
                          <button 
                            onClick={() => handleUpdateLocal(item.id, 'cantidad', Math.max(1, localSelections[item.id].cantidad - 1))}
                            className="px-2 py-1 text-[var(--muted)] hover:bg-[var(--line)] transition-colors"
                          ><Minus size={14} /></button>
                          <input 
                            type="number" 
                            min="1" 
                            value={localSelections[item.id]?.cantidad} 
                            onChange={(e) => handleUpdateLocal(item.id, 'cantidad', parseInt(e.target.value) || 1)}
                            className="w-10 text-center text-sm font-medium outline-none bg-transparent" 
                          />
                          <button 
                            onClick={() => handleUpdateLocal(item.id, 'cantidad', localSelections[item.id].cantidad + 1)}
                            className="px-2 py-1 text-[var(--muted)] hover:bg-[var(--line)] transition-colors"
                          ><Plus size={14} /></button>
                        </div>
                        <button 
                          onClick={() => handleAddToCart(item)}
                          className="flex-1 bg-[var(--navy)] text-white text-sm font-semibold rounded-md hover:bg-[var(--cyan)] transition-colors py-1.5"
                        >Añadir</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-[var(--ink)] mb-4">Otros Insumos</h3>
            <div className="bg-white rounded-xl border border-[var(--line)] shadow-sm overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-[var(--muted)] uppercase bg-[var(--paper)] border-b border-[var(--line)]">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Artículo</th>
                    <th className="px-6 py-3 font-semibold">Variante</th>
                    <th className="px-6 py-3 font-semibold text-center w-32">Cantidad</th>
                    <th className="px-6 py-3 font-semibold text-right w-24">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {sinImagen.map((item) => (
                    <tr key={item.id} className="border-b border-[var(--line)] hover:bg-[var(--paper)] transition-colors">
                      <td className="px-6 py-3 font-medium text-[var(--ink)]">{item.nombre}</td>
                      <td className="px-6 py-3">
                        <select 
                          value={localSelections[item.id]?.variante} 
                          onChange={(e) => handleUpdateLocal(item.id, 'variante', e.target.value)}
                          className="w-full max-w-[200px] border border-[var(--line)] rounded-md px-2 py-1 text-sm bg-white outline-none focus:border-[var(--cyan)]"
                        >
                          {item.variantes.map((v: string) => <option key={v} value={v}>{v}</option>)}
                        </select>
                      </td>
                      <td className="px-6 py-3">
                        <input 
                          type="number" 
                          min="1" 
                          value={localSelections[item.id]?.cantidad} 
                          onChange={(e) => handleUpdateLocal(item.id, 'cantidad', parseInt(e.target.value) || 1)}
                          className="w-full border border-[var(--line)] text-center rounded-md px-2 py-1 text-sm bg-white outline-none focus:border-[var(--cyan)]" 
                        />
                      </td>
                      <td className="px-6 py-3 text-right">
                        <button 
                          onClick={() => handleAddToCart(item)}
                          className="p-2 bg-[var(--navy)] text-white rounded-md hover:bg-[var(--cyan)] transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setCartOpen(false)}></div>
          <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-4 border-b border-[var(--line)] flex justify-between items-center bg-[var(--paper)]">
              <h3 className="font-bold text-[var(--ink)] flex items-center gap-2">
                <ShoppingCart className="text-[var(--cyan)]" size={20} />
                Mi Carrito
              </h3>
              <button onClick={() => setCartOpen(false)} className="p-1 hover:bg-[var(--line)] rounded-md transition-colors"><X size={20} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {carritoSum.length === 0 ? (
                <div className="text-center text-[var(--muted)] mt-10">
                  <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
                  <p>Tu carrito está vacío.</p>
                </div>
              ) : (
                carritoSum.map(item => (
                  <div key={item.id} className="flex gap-3 bg-[var(--paper)] p-3 rounded-lg border border-[var(--line)] relative">
                    <div className="w-12 h-12 bg-white rounded flex items-center justify-center shrink-0 border border-[var(--line)] text-xl">📦</div>
                    <div className="flex-1 pr-6">
                      <h4 className="font-semibold text-sm text-[var(--ink)] leading-tight">{item.nombre}</h4>
                      <p className="text-xs text-[var(--muted)] mt-1">{item.variante}</p>
                      <p className="text-sm font-bold text-[var(--cyan)] mt-1">Cant: {item.cantidad}</p>
                    </div>
                    <button 
                      onClick={() => removeFromCarrito(item.id)}
                      className="absolute top-2 right-2 p-1 text-[var(--muted)] hover:text-[var(--cyan)] hover:bg-white rounded transition-colors"
                    ><X size={16} /></button>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-[var(--line)] bg-white space-y-3">
              <div className="flex justify-between text-sm font-bold text-[var(--ink)]">
                <span>Total Artículos:</span>
                <span>{carritoSum.reduce((acc, curr) => acc + curr.cantidad, 0)}</span>
              </div>
              <button 
                onClick={handleConfirmOrder}
                disabled={carritoSum.length === 0 || isSubmitting}
                className="w-full generate-btn text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-colors shadow-lg"
              >
                <Send size={18} /> {isSubmitting ? 'Enviando...' : 'Confirmar Pedido'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

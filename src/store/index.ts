import { create } from 'zustand';

type Role = 'Administrador' | 'Aprobador' | 'Operador' | null;

interface SuministroItem {
  id: string;
  nombre: string;
  variante: string;
  cantidad: number;
  imagen?: string;
}

interface StickersData {
  cedula: string;
  nombre: string;
}

interface AppState {
  userRole: Role;
  setUserRole: (role: Role) => void;
  
  carritoSum: SuministroItem[];
  addToCarrito: (item: SuministroItem) => void;
  removeFromCarrito: (id: string) => void;
  clearCarrito: () => void;
  
  stickersData: StickersData[];
  addSticker: (sticker: StickersData) => void;
  removeSticker: (cedula: string) => void;
  clearStickers: () => void;
  
  iessCacheDatos: any[];
  setIessCacheDatos: (data: any[]) => void;
  
  baseCco: any[];
  setBaseCco: (data: any[]) => void;
  
  pedidoMesRealizado: boolean;
  setPedidoMesRealizado: (val: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  userRole: null,
  setUserRole: (role) => set({ userRole: role }),
  
  carritoSum: [],
  addToCarrito: (item) => set((state) => ({ carritoSum: [...state.carritoSum, item] })),
  removeFromCarrito: (id) => set((state) => ({ carritoSum: state.carritoSum.filter(i => i.id !== id) })),
  clearCarrito: () => set({ carritoSum: [] }),
  
  stickersData: [],
  addSticker: (sticker) => set((state) => ({ 
    stickersData: state.stickersData.some(s => s.cedula === sticker.cedula) 
      ? state.stickersData 
      : [...state.stickersData, sticker] 
  })),
  removeSticker: (cedula) => set((state) => ({ stickersData: state.stickersData.filter(s => s.cedula !== cedula) })),
  clearStickers: () => set({ stickersData: [] }),
  
  iessCacheDatos: [],
  setIessCacheDatos: (data) => set({ iessCacheDatos: data }),
  
  baseCco: [],
  setBaseCco: (data) => set({ baseCco: data }),
  
  pedidoMesRealizado: false,
  setPedidoMesRealizado: (val) => set({ pedidoMesRealizado: val }),
}));

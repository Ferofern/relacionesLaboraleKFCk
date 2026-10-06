export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const downloadBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

export const mediator = {
  // ==========================================
  // 0. Auth
  // ==========================================
  login: async (correo: string, password: string) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo, password })
    });
    
    const data = await res.json();
    if (!res.ok) {
      const error = new Error('Error login');
      (error as any).response = { status: res.status, data };
      throw error;
    }
    return data;
  },

  // ==========================================
  // 1. Módulo IESS (Extracción)
  // ==========================================
  process_iess_files: async (files: File[], onProgress: (p: number) => void) => {
    const formData = new FormData();
    files.forEach(f => formData.append('archivos', f));
    onProgress(50);
    const res = await fetch(`${API_URL}/api/iess/extraer`, { method: 'POST', body: formData });
    onProgress(100);
    if (!res.ok) throw new Error('Error extrayendo IESS');
    const blob = await res.blob();
    downloadBlob(blob, 'Extraccion_IESS.xlsx');
    return []; // Devuelve array vacío para que el UI no se rompa si esperaba datos tabulares
  },
  
  // ==========================================
  // 2. Módulo Validador (Comparador IESS vs Payroll)
  // ==========================================
  process_validador_files: async (payroll: File, iessFiles: File[], onProgress: (p: number) => void) => {
    const formData = new FormData();
    formData.append('archivo_payroll', payroll);
    iessFiles.forEach(f => formData.append('archivos_iess', f));
    onProgress(50);
    const res = await fetch(`${API_URL}/api/validador/comparar`, { method: 'POST', body: formData });
    onProgress(100);
    if (!res.ok) throw new Error('Error en el comparador Validador');
    const blob = await res.blob();
    downloadBlob(blob, 'Validacion_Nomina_IESS.xlsx');
    return []; 
  },

  // ==========================================
  // 3. Módulo Facturas
  // ==========================================
  process_facturas_files: async (files: File[]) => {
    const formData = new FormData();
    files.forEach(f => formData.append('archivos', f));
    const res = await fetch(`${API_URL}/api/facturas/extraer`, { method: 'POST', body: formData });
    if (!res.ok) throw new Error('Error procesando facturas');
    const blob = await res.blob();
    downloadBlob(blob, 'Facturas_Extraidas.xlsx');
    return [];
  },

  // ==========================================
  // 5. Módulo Dotaciones
  // ==========================================
  process_dotacion_files: async (tipo: string, leccionario: File, stocks: File, fecha: string) => {
    const formData = new FormData();
    formData.append('leccionario', leccionario);
    formData.append('stocks', stocks);
    formData.append('fecha', fecha);
    formData.append('tipo_facturacion', tipo);
    const res = await fetch(`${API_URL}/api/dotaciones/generar`, { method: 'POST', body: formData });
    if (!res.ok) throw new Error('Error generando dotaciones');
    const blob = await res.blob();
    downloadBlob(blob, 'Dotaciones.xlsx');
    return [];
  },

  // ==========================================
  // 6. Módulo Stickers
  // ==========================================
  generate_stickers: async (cedulas: string[], formato: string) => {
    const formData = new FormData();
    
    // Construir el array de objetos completo que necesita el backend
    const empleadosCompletos = cedulas.map(cedula => {
      const dbEntry = (window as any).stickersDatabase?.[cedula];
      if (dbEntry) {
        return dbEntry; // Contiene Trabajador, Nombre, Compania_Desc, Fecha_Ingreso
      }
      // Fallback de seguridad por si agregaron una cédula manual que no está en el Excel
      return {
        Trabajador: cedula,
        Nombre: 'Desconocido',
        Compania_Desc: 'SIN COMPAÑIA',
        Fecha_Ingreso: 'N/A'
      };
    });

    formData.append('seleccionados', JSON.stringify(empleadosCompletos));
    formData.append('region', formato); 
    const res = await fetch(`${API_URL}/api/stickers/generar`, { method: 'POST', body: formData });
    if (!res.ok) throw new Error('Error generando stickers');
    const blob = await res.blob();
    downloadBlob(blob, 'Stickers.pdf');
    return 'descarga_completada';
  },

  // ==========================================
  // 7. Módulo Proyectos / Dashboard
  // ==========================================
  obtener_proyectos: async () => {
    const res = await fetch(`${API_URL}/api/proyectos`);
    return res.json();
  },

  crear_proyecto: async (data: any) => {
    const res = await fetch(`${API_URL}/api/proyectos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  actualizar_proyecto: async (id: string, data: any) => {
    const res = await fetch(`${API_URL}/api/proyectos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.ok;
  },

  actualizar_estado: async (id: string, estado: string) => {
    const formData = new FormData();
    formData.append('estado', estado);
    const res = await fetch(`${API_URL}/api/proyectos/${id}/estado`, {
      method: 'PUT',
      body: formData
    });
    return res.ok;
  },

  obtener_dashboard_completo: async () => {
    const res = await fetch(`${API_URL}/api/dashboard`);
    return res.json();
  },

  procesar_cco: async (cco: string, cedula_ex: string, nombre_ex: string, fecha_liq: string) => {
    const payload = {
      cco,
      cedula_ex,
      nombre_ex,
      fecha_liq
    };
    const res = await fetch(`${API_URL}/api/cco/procesar`, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload) 
    });
    
    if (res.status === 404) {
       const errorData = await res.json().catch(() => ({}));
       throw new Error(errorData.error || `No se encontró el CCO ${cco} en el catálogo`);
    }

    if (!res.ok) throw new Error('Error procesando CCO');
    return res.json();
  },

  actualizar_catalogo_cco: async (archivo: File) => {
    const formData = new FormData();
    formData.append('archivo', archivo);
    const res = await fetch(`${API_URL}/api/cco/catalogo/actualizar`, { method: 'POST', body: formData });
    if (!res.ok) throw new Error('Error actualizando el catálogo CCO');
    return res.json();
  },

  // ==========================================
  // CONEXIONES A LOS NUEVOS MÓDULOS DEL BACKEND (Suministros y Formularios)
  // ==========================================
  obtener_catalogo: async () => {
    const res = await fetch(`${API_URL}/api/suministros/catalogo`);
    if (!res.ok) throw new Error('Error obteniendo catálogo');
    const data = await res.json();
    return data.catalogo; // Retorna solo el catálogo de imágenes
  },

  verificar_pedido_mes: async (correo: string = 'test@kfc.com.ec', mes: string = new Date().getMonth() + 1 + '', anio: string = new Date().getFullYear() + '') => {
    const res = await fetch(`${API_URL}/api/suministros/verificar-pedido?correo=${correo}&mes=${mes}&anio=${anio}`);
    if (!res.ok) return false;
    const data = await res.json();
    return data.existe;
  },

  guardar_pedido: async (carrito: any[], correo: string = 'test@kfc.com.ec', nombre: string = 'Test Usuario') => {
    const mes = new Date().getMonth() + 1;
    const anio = new Date().getFullYear();
    const payload = {
      correo, nombre, mes, anio,
      carrito: carrito.reduce((acc, curr) => ({ ...acc, [curr.nombre]: curr.cantidad }), {})
    };
    const res = await fetch(`${API_URL}/api/suministros/pedido`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Error guardando pedido');
    return res.json();
  },

  obtener_reporte_general_articulos: async (mes: string, anio: string) => {
    const res = await fetch(`${API_URL}/api/suministros/reportes/general?mes=${mes}&anio=${anio}`);
    if (!res.ok) throw new Error('Error obteniendo reporte');
    const data = await res.json();
    return data.map((d: any) => ({ articulo: d.Articulo, cantidad: d['Cantidad Total Pedida'] }));
  },

  obtener_reporte_por_persona: async (mes: string, anio: string) => {
    const res = await fetch(`${API_URL}/api/suministros/reportes/persona?mes=${mes}&anio=${anio}`);
    if (!res.ok) throw new Error('Error obteniendo reporte por persona');
    return await res.json();
  },

  obtener_actualizacion_academica: async () => {
    const res = await fetch(`${API_URL}/api/formularios/actualizacion-academica`);
    if (!res.ok) throw new Error('Error obteniendo formularios');
    return res.json();
  },

  generar_reporte_ejecutivo_pdf: async () => {
    const res = await fetch(`${API_URL}/api/dashboard/reporte-pdf`);
    if (!res.ok) throw new Error('Error generando reporte');
    const blob = await res.blob();
    downloadBlob(blob, 'Reporte_Ejecutivo_Automatizaciones.pdf');
    return 'descargado';
  },

  // ==========================================
  // 99. Módulo Administrador de Accesos
  // ==========================================
  obtener_catalogos_admin: async () => {
    const res = await fetch(`${API_URL}/api/admin/catalogos`);
    if (!res.ok) throw new Error('Error obteniendo catálogos');
    return res.json();
  },
  
  obtener_usuarios_accesos: async () => {
    const res = await fetch(`${API_URL}/api/admin/accesos`);
    if (!res.ok) throw new Error('Error obteniendo accesos');
    return res.json();
  },
  
  crear_usuario: async (payload: { correo: string, password_hash: string, nombre: string }) => {
    const res = await fetch(`${API_URL}/api/admin/usuarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Error creando usuario');
    return res.json();
  },
  
  asignar_accesos: async (payload: { usuario_id: number, nombre_app: string, rol: string, modulos: string }) => {
    const res = await fetch(`${API_URL}/api/admin/accesos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Error asignando accesos');
    return res.json();
  },

  // ==========================================
  // MÉTODOS MOCK RESTAURADOS PARA EVITAR CRASHES DEL UI (El backend aún no los tiene)
  // ==========================================
  get_nombre_by_cedula: async (cedula: string) => {
    if ((window as any).stickersDatabase && (window as any).stickersDatabase[cedula]) {
      return (window as any).stickersDatabase[cedula].Nombre || 'Desconocido';
    }
    return 'Desconocido';
  },
  process_stickers_file: async (file: File) => {
    const formData = new FormData();
    formData.append('archivo', file);
    const res = await fetch(`${API_URL}/api/stickers/cargar`, { method: 'POST', body: formData });
    if (!res.ok) throw new Error('Error procesando base de stickers');
    const data = await res.json();
    (window as any).stickersDatabase = data.data; // Guardamos en memoria global (o módulo)
    return true;
  },
  process_unificar_pdfs: async (files: File[]) => {
    const formData = new FormData();
    files.forEach(f => formData.append('archivos', f));
    const res = await fetch(`${API_URL}/api/unificador/procesar`, { method: 'POST', body: formData });
    if (!res.ok) throw new Error('Error unificando PDFs');
    const blob = await res.blob();
    downloadBlob(blob, 'Documentos_Unificados.pdf');
    return 'descarga_completada';
  },
  obtener_metricas: async () => {
    return { ahorro: '$0', optimizacion: '0%', alcance: '0 Empleados' };
  },
  downloadFile: (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url.startsWith('http') ? url : `${API_URL}/${url}`;
    a.download = filename;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
};

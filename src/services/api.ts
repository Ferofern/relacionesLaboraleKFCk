const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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
  // 4. Módulo Claquetas
  // ==========================================
  process_claquetas_file: async (region: string, responsable: string, fecha: string, file: File) => {
    const formData = new FormData();
    formData.append('archivo', file);
    formData.append('region', region);
    formData.append('fecha_str', fecha);
    formData.append('responsable', responsable);
    const res = await fetch(`${API_URL}/api/claquetas/generar`, { method: 'POST', body: formData });
    if (!res.ok) throw new Error('Error generando claquetas');
    const blob = await res.blob();
    downloadBlob(blob, 'Claquetas.pdf');
    return 'descarga_completada';
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
    formData.append('seleccionados', JSON.stringify(cedulas));
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

  procesar_cco: async (payroll: File, cco: string, cedula_ex: string, nombre_ex: string, fecha_liq: string) => {
    const formData = new FormData();
    formData.append('archivo_payroll', payroll);
    formData.append('cco', cco);
    formData.append('cedula_ex', cedula_ex);
    if (nombre_ex) formData.append('nombre_ex', nombre_ex);
    formData.append('fecha_liq', fecha_liq);
    const res = await fetch(`${API_URL}/api/cco/procesar`, { method: 'POST', body: formData });
    if (!res.ok) throw new Error('Error procesando CCO');
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
    const data = await res.json();
    // Agrupar por persona para la gráfica
    const agrupado: any = {};
    data.forEach((d: any) => {
      const persona = d.Solicitante;
      agrupado[persona] = (agrupado[persona] || 0) + d.Cantidad;
    });
    return Object.keys(agrupado).map(persona => ({ persona, items: agrupado[persona] }));
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
  // MÉTODOS MOCK RESTAURADOS PARA EVITAR CRASHES DEL UI (El backend aún no los tiene)
  // ==========================================
  get_nombre_by_cedula: async (cedula: string) => {
    return 'Desconocido';
  },
  process_stickers_file: async (file: File) => {
    return true;
  },
  process_unificar_pdfs: async (files: File[]) => {
    return 'URL_PDF_UNIFICADO';
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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const mediator = {
  process_iess_files: async (files: File[], onProgress: (p: number) => void) => {
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));
    onProgress(50);
    const res = await fetch(`${API_URL}/iess/process`, { method: 'POST', body: formData });
    onProgress(100);
    return res.json();
  },
  
  process_validador_files: async (payroll: File, iessFiles: File[], onProgress: (p: number) => void) => {
    const formData = new FormData();
    formData.append('payroll', payroll);
    iessFiles.forEach(f => formData.append('iessFiles', f));
    onProgress(50);
    const res = await fetch(`${API_URL}/validador/process`, { method: 'POST', body: formData });
    onProgress(100);
    return res.json();
  },

  load_payroll_cco: async () => {
    const res = await fetch(`${API_URL}/cco/payroll`);
    return res.json();
  },

  get_nombre_by_cedula: async (cedula: string) => {
    const res = await fetch(`${API_URL}/empleados/${cedula}`);
    const data = await res.json();
    return data.nombre || 'Desconocido';
  },

  process_cco_individual: async (ccos: any[]) => {
    const res = await fetch(`${API_URL}/cco/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ccos })
    });
    return res.json();
  },

  process_facturas_files: async (files: File[]) => {
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));
    const res = await fetch(`${API_URL}/facturas/process`, { method: 'POST', body: formData });
    return res.json();
  },

  process_claquetas_file: async (region: string, responsable: string, fecha: string, file: File) => {
    const formData = new FormData();
    formData.append('region', region);
    formData.append('responsable', responsable);
    formData.append('fecha', fecha);
    formData.append('file', file);
    const res = await fetch(`${API_URL}/claquetas/process`, { method: 'POST', body: formData });
    const data = await res.json();
    return data.url;
  },

  process_stickers_file: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_URL}/stickers/upload`, { method: 'POST', body: formData });
    return res.ok;
  },

  generate_stickers: async (cedulas: string[], formato: string) => {
    const res = await fetch(`${API_URL}/stickers/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cedulas, formato })
    });
    const data = await res.json();
    return data.url;
  },

  process_dotacion_files: async (tipo: string, leccionario: File, stocks: File, fecha: string) => {
    const formData = new FormData();
    formData.append('tipo', tipo);
    formData.append('fecha', fecha);
    formData.append('leccionario', leccionario);
    formData.append('stocks', stocks);
    const res = await fetch(`${API_URL}/dotaciones/process`, { method: 'POST', body: formData });
    return res.json();
  },

  process_unificar_pdfs: async (files: File[]) => {
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));
    const res = await fetch(`${API_URL}/pdfs/unificar`, { method: 'POST', body: formData });
    const data = await res.json();
    return data.url;
  },

  crear_proyecto: async (data: any) => {
    const res = await fetch(`${API_URL}/proyectos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  obtener_proyectos: async () => {
    const res = await fetch(`${API_URL}/proyectos`);
    return res.json();
  },

  actualizar_proyecto: async (id: string, data: any) => {
    const res = await fetch(`${API_URL}/proyectos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.ok;
  },

  actualizar_estado: async (id: string, estado: string) => {
    const res = await fetch(`${API_URL}/proyectos/${id}/estado`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado })
    });
    return res.ok;
  },

  generar_pdf_claqueta: async (id: string) => {
    const res = await fetch(`${API_URL}/proyectos/${id}/pdf`);
    const data = await res.json();
    return data.url;
  },

  obtener_actualizacion_academica: async () => {
    const res = await fetch(`${API_URL}/dashboard/academica`);
    return res.json();
  },

  obtener_dashboard_completo: async () => {
    const res = await fetch(`${API_URL}/dashboard/completo`);
    return res.json();
  },

  obtener_metricas: async () => {
    const res = await fetch(`${API_URL}/dashboard/metricas`);
    return res.json();
  },

  generar_reporte_ejecutivo_pdf: async () => {
    const res = await fetch(`${API_URL}/reportes/ejecutivo`);
    const data = await res.json();
    return data.url;
  },

  verificar_pedido_mes: async () => {
    const res = await fetch(`${API_URL}/pedidos/verificar`);
    const data = await res.json();
    return data.yaRealizado || false;
  },

  obtener_catalogo: async () => {
    const res = await fetch(`${API_URL}/catalogo`);
    return res.json();
  },

  guardar_pedido: async (carrito: any[]) => {
    const res = await fetch(`${API_URL}/pedidos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ carrito })
    });
    return res.ok;
  },

  obtener_reporte_general_articulos: async (mes: string, anio: string) => {
    const res = await fetch(`${API_URL}/reportes/articulos?mes=${mes}&anio=${anio}`);
    return res.json();
  },

  obtener_reporte_por_persona: async (mes: string, anio: string) => {
    const res = await fetch(`${API_URL}/reportes/personas?mes=${mes}&anio=${anio}`);
    return res.json();
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

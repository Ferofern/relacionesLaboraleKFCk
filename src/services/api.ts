export const mediator = {
  process_iess_files: async (_files: File[], onProgress: (p: number) => void) => {
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(r => setTimeout(r, 200));
      onProgress(i);
    }
    return [
      { id: 1, cedula: '0102030405', nombre: 'JUAN PEREZ', estado: 'Procesado' },
      { id: 2, cedula: '0908070605', nombre: 'MARIA GOMEZ', estado: 'Procesado' }
    ];
  },
  
  process_validador_files: async (_payroll: File, _iessFiles: File[], onProgress: (p: number) => void) => {
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(r => setTimeout(r, 250));
      onProgress(i);
    }
    return [
      { id: 1, cedula: '0102030405', nombre: 'JUAN PEREZ', estado: 'OK', error: null, score: 100 },
      { id: 2, cedula: '0908070605', nombre: 'MARIA GOMEZ', estado: 'Error Crítico', error: 'Diferencia en sueldo', score: 0 },
      { id: 3, cedula: '1122334455', nombre: 'CARLOS RUIZ', estado: 'Ausente', error: 'No consta en IESS', score: 0 }
    ];
  },

  load_payroll_cco: async () => {
    await new Promise(r => setTimeout(r, 1000));
    return [{ cedula: '1234567890', nombre: 'EMPLEADO PRUEBA' }, { cedula: '0987654321', nombre: 'OTRO EMPLEADO' }];
  },

  get_nombre_by_cedula: async (cedula: string) => {
    await new Promise(r => setTimeout(r, 300));
    const db: Record<string, string> = {
      '1234567890': 'EMPLEADO PRUEBA',
      '0987654321': 'OTRO EMPLEADO'
    };
    return db[cedula] || 'Desconocido';
  },

  process_cco_individual: async (ccos: any[]) => {
    await new Promise(r => setTimeout(r, 800));
    return ccos.map(c => ({ ...c, status: 'Procesado', emailTo: 'test@kfc.com' }));
  },

  process_facturas_files: async (_files: File[]) => {
    await new Promise(r => setTimeout(r, 1500));
    return [
      { proveedor: 'PROVEEDOR A', total: 1500.50, fecha: '2023-10-01' },
      { proveedor: 'PROVEEDOR B', total: 800.00, fecha: '2023-10-02' }
    ];
  },

  process_claquetas_file: async (_region: string, _responsable: string, _fecha: string, _file: File) => {
    await new Promise(r => setTimeout(r, 2000));
    return 'URL_PDF_CLAQUETAS';
  },

  process_stickers_file: async (_file: File) => {
    await new Promise(r => setTimeout(r, 1000));
    return true;
  },

  generate_stickers: async (_cedulas: string[], _formato: string) => {
    await new Promise(r => setTimeout(r, 1500));
    return 'URL_PDF_STICKERS';
  },

  process_dotacion_files: async (_tipo: string, _leccionario: File, _stocks: File, _fecha: string) => {
    await new Promise(r => setTimeout(r, 2000));
    return [
      { empleado: 'JUAN PEREZ', dotacion: 'Camisa M', cantidad: 2 },
      { empleado: 'MARIA GOMEZ', dotacion: 'Pantalón 32', cantidad: 1 }
    ];
  },

  process_unificar_pdfs: async (_files: File[]) => {
    await new Promise(r => setTimeout(r, 2000));
    return 'URL_PDF_UNIFICADO';
  },

  crear_proyecto: async (data: any) => {
    await new Promise(r => setTimeout(r, 1000));
    return { id: Math.random().toString(), ...data, estado: 'Pendiente' };
  },

  obtener_proyectos: async () => {
    await new Promise(r => setTimeout(r, 800));
    return [
      { id: 'P001', nombre: 'Automatización Nómina', solicitante: 'RRHH', estado: 'Aprobado' },
      { id: 'P002', nombre: 'Migración SAP', solicitante: 'IT', estado: 'Pendiente' }
    ];
  },

  actualizar_proyecto: async (_id: string, _data: any) => {
    await new Promise(r => setTimeout(r, 500));
    return true;
  },

  actualizar_estado: async (_id: string, _estado: string) => {
    await new Promise(r => setTimeout(r, 500));
    return true;
  },

  generar_pdf_claqueta: async (_id: string) => {
    await new Promise(r => setTimeout(r, 1000));
    return 'URL_PDF_CLAQUETA_PROYECTO';
  },

  obtener_actualizacion_academica: async () => {
    await new Promise(r => setTimeout(r, 800));
    return {
      kpis: { total: 150, culminados: 120, enCurso: 30 },
      data: [
        { id: 1, empleado: 'JUAN PEREZ', estado: 'Culminado', fecha: '2023-10-01' },
        { id: 2, empleado: 'MARIA GOMEZ', estado: 'En Curso', fecha: '2023-10-02' }
      ]
    };
  },

  obtener_dashboard_completo: async () => {
    await new Promise(r => setTimeout(r, 1000));
    return {
      roi: [
        { name: 'Nómina', valor: 5000 },
        { name: 'Operaciones', valor: 3000 },
        { name: 'IT', valor: 8000 }
      ],
      tiempos: [
        { name: 'Nómina', manual: 100, auto: 20 },
        { name: 'Operaciones', manual: 80, auto: 15 },
        { name: 'IT', manual: 200, auto: 40 }
      ]
    };
  },

  obtener_metricas: async () => {
    await new Promise(r => setTimeout(r, 500));
    return { ahorro: '$15,000', optimizacion: '85%', alcance: '450 Empleados' };
  },

  generar_reporte_ejecutivo_pdf: async () => {
    await new Promise(r => setTimeout(r, 2000));
    return 'URL_REPORTE_EJECUTIVO';
  },

  verificar_pedido_mes: async () => {
    await new Promise(r => setTimeout(r, 500));
    return false;
  },

  obtener_catalogo: async () => {
    await new Promise(r => setTimeout(r, 800));
    return [
      { id: '1', nombre: 'Esferos Azules', imagen: true, variantes: ['Caja x12', 'Unidad'] },
      { id: '2', nombre: 'Resma de Papel A4', imagen: true, variantes: ['Caja x10', 'Paquete x500'] },
      { id: '3', nombre: 'Grapas 26/6', imagen: false, variantes: ['Caja x5000'] },
      { id: '4', nombre: 'Clips Mariposa', imagen: false, variantes: ['Caja x50'] }
    ];
  },

  guardar_pedido: async (_carrito: any[]) => {
    await new Promise(r => setTimeout(r, 1500));
    return true;
  },

  obtener_reporte_general_articulos: async (_mes: string, _anio: string) => {
    await new Promise(r => setTimeout(r, 1000));
    return [
      { articulo: 'Esferos Azules', total_solicitado: 50 },
      { articulo: 'Resma de Papel A4', total_solicitado: 120 }
    ];
  },

  obtener_reporte_por_persona: async (_mes: string, _anio: string) => {
    await new Promise(r => setTimeout(r, 1000));
    return [
      { persona: 'JUAN PEREZ', articulo: 'Esferos Azules', cantidad: 2 },
      { persona: 'MARIA GOMEZ', articulo: 'Resma de Papel A4', cantidad: 5 }
    ];
  },
  
  downloadFile: (url: string, filename: string) => {
    console.log(`Downloading ${filename} from ${url}`);
  }
};

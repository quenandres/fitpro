export interface DiaDef {
  dia: number;
  nombre: string;
  nombreCorto: string;
}

export const DIAS_SEMANA: DiaDef[] = [
  { dia: 1, nombre: 'Lunes', nombreCorto: 'Lun' },
  { dia: 2, nombre: 'Martes', nombreCorto: 'Mar' },
  { dia: 3, nombre: 'Miércoles', nombreCorto: 'Mié' },
  { dia: 4, nombre: 'Jueves', nombreCorto: 'Jue' },
  { dia: 5, nombre: 'Viernes', nombreCorto: 'Vie' },
  { dia: 6, nombre: 'Sábado', nombreCorto: 'Sáb' },
  { dia: 0, nombre: 'Domingo', nombreCorto: 'Dom' },
];

export const isDiaEntreno = (rutinaId: number | null): boolean =>
  rutinaId !== null && rutinaId !== -1;

export const isDiaNueva = (rutinaId: number | null): boolean =>
  rutinaId === -1 || rutinaId === 0;

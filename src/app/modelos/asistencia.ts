export interface Asistencia {
    id: number;
    administradorId: number;
    nombreAdministrador: string;
    fecha: string;
    horaLlegada: string | null;
    horaSalida: string | null;
}
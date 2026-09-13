//Modelo de Asistencia, interfaz o estructura de datos que necesitamos.
export interface Asistencia {
    id: number;
    administradorId: number;
    nombreAdministrador: string;
    fecha: string;
    horaLlegada: string | null; //Por si no ha llegado todavía, sería null. Igual para la salida
    horaSalida: string | null;
}
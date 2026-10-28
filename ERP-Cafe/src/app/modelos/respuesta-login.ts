export interface RespuestaLogin { // Datos recibidos del backend
    token: string;
    id?: number;
    nombre: string;
    correo: string;
    rol: string;
}
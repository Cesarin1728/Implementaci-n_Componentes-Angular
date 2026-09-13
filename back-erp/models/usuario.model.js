class Usuario {
    constructor(id, rol, nombre, correo, password, salario, rfc) {
        this.id = id;
        this.rol = rol;
        this.nombre = nombre;
        this.correo = correo;
        this.password = password;
        this.salario = salario;
        this.rfc = rfc;
    }
}

module.exports = Usuario;
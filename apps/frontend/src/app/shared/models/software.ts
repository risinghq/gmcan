export class Software {
  constructor(
    public idSoftware: Number,
    public nombre: String,
    public descripcion: String,
    public descripcionEN: String,
    public moreInfo: String,
    public grupo_idGrupo: Number,
    public fechaCreacion: Date,
    public fechaActualizacion: Date,
  ) {}
}

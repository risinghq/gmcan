export class PublicacionHasAutor {
  constructor(
    public publicacion_idPublicacion: Number,
    public autor_idAutor: Number,
    public fechaCreacion: Date,
    public fechaActualizacion: Date,
    public isPrincipal: Number,
  ) {}
}

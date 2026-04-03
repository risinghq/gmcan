import { Autor } from "./autores";
import { Usuario } from "./usuario";

export class Publicacion {
  constructor(
    public idPublicacion: Number,
    public titulo: String,
    public archivo: String,
    public autores: String,
    public resumen: String,
    public resumenEN: String,
    public DOI: number,
    public fecha: string,
    public fechaPublicacionDate: Date,
    public fechaPublicacion: string,
    public fechaCreacion: Date,
    public fechaActualizacion: Date,
    public tipoPublicacion_idTipoPublicacion: Number,
    public tipoPublicacion: String,
    public revista: String,
    public nroRevista: Number,
    public revista_idRevista: Number,
    public universidad_idUniversidad: Number,
    public universidad: String,
    public autor: Array<Autor>,
    public usuario: Array<Usuario>,
    public ciudad_idCiudad: Number,
    public ciudad: String,
    public pais: String,
    public evento_idEvento: Number,
    public evento: String,
    public tipoTesis_idTipoTesis: Number,
    public tipoTesis: String,
  ) {}
}

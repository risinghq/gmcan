import { DatePipe } from "@angular/common";
import { Injectable, inject } from "@angular/core";
import { LookupService } from "@app/shared/services/lookup.service";
import { NoticiaService } from "@app/shared/services/noticia.service";
import { UsuarioService } from "@app/shared/services/usuario.service";
import { firstValueFrom } from "rxjs";

import type { DetailNewsViewModel } from "./types";

@Injectable({ providedIn: "root" })
export class DetailNewsDataService {
  private readonly _noticiaService = inject(NoticiaService);
  private readonly _usuarioService = inject(UsuarioService);
  private readonly _lookup = inject(LookupService);
  private readonly _datePipe = inject(DatePipe);

  async load(idNoticia: number): Promise<DetailNewsViewModel> {
    const noticiaRaw = await firstValueFrom(this._noticiaService.getNoticia(idNoticia));
    const noticia = Array.isArray(noticiaRaw) ? noticiaRaw[0] : noticiaRaw;

    if (!noticia) {
      throw new Error(`Noticia with ID ${idNoticia} not found`);
    }

    const fechaPublicacion = new Date(noticia.fechaPublicacion ?? "");
    if (String(fechaPublicacion) !== "Invalid Date") {
      fechaPublicacion.setMinutes(fechaPublicacion.getMinutes() + fechaPublicacion.getTimezoneOffset());
    }

    const dia = this._datePipe.transform(fechaPublicacion, "dd") ?? "";
    const mes = this._datePipe.transform(fechaPublicacion, "MMMM") ?? "";
    const anio = this._datePipe.transform(fechaPublicacion, "y") ?? "";

    const usuariosRaw = await firstValueFrom(this._usuarioService.getUser(noticia.autorPublicacion ?? ""));
    const usuario = Array.isArray(usuariosRaw) ? usuariosRaw[0] : usuariosRaw || null;

    const tiposNoticia = this._lookup.tiposNoticia();
    const tipoNoticia = tiposNoticia.find((t) => t.idtipoNoticia === noticia.tipoNoticia_idtipoNoticia)?.nombre ?? "";

    return {
      noticia: {
        ...noticia,
        fechaPublicacion: this._datePipe.transform(fechaPublicacion, "MM/dd/y", "es") ?? "",
      },
      usuario: usuario || null,
      tipoNoticia,
      dia,
      mes,
      anio,
    };
  }
}

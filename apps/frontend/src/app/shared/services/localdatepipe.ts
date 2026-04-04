import { formatDate } from "@angular/common";
import { Pipe, PipeTransform, inject } from "@angular/core";

import { SessionService } from "./session.service";

@Pipe({ name: "localDate" })
export class LocalDatePipe implements PipeTransform {
  private session = inject(SessionService);

  transform(value: any, format: string) {
    if (!value) {
      return "";
    }
    if (!format) {
      format = "shortDate";
    }

    return formatDate(value, format, this.session.locale);
  }
}

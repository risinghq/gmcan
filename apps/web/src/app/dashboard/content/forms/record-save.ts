import { type Observable, firstValueFrom } from "rxjs";

/**
 * Remembers the id a create returned. A save that creates the record and then fails on a later
 * step, such as the image upload, retries as an update instead of creating a duplicate.
 */
export class RecordSave {
  constructor(private id: number | null) {}

  get savedId(): number | null {
    return this.id;
  }

  async write(create: () => Observable<{ id: number }>, update: (id: number) => Observable<unknown>): Promise<number> {
    if (this.id === null) {
      this.id = (await firstValueFrom(create())).id;
    } else {
      await firstValueFrom(update(this.id));
    }
    return this.id;
  }
}

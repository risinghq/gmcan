import { Injectable, inject } from "@angular/core";
import { RefService } from "@app/shared/services/ref.service";
import { Observable, map, of, switchMap } from "rxjs";

@Injectable({ providedIn: "root" })
export class NewsCategoryUsecase {
  private readonly refService = inject(RefService);

  canDelete(categoryId: number): Observable<boolean> {
    return this.refService.getNewsTypeCount(categoryId).pipe(map((count) => count.canDelete));
  }

  deleteIfAllowed(categoryId: number): Observable<{ deleted: boolean }> {
    return this.canDelete(categoryId).pipe(
      switchMap((allowed) => {
        if (!allowed) return of({ deleted: false });
        return this.refService.deleteNewsType(categoryId).pipe(map((response) => ({ deleted: response.status === 1 })));
      }),
    );
  }
}

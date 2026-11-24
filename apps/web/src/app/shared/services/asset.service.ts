import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import type { AssetTarget } from "@gmcan/contracts/admin";
import { Observable } from "rxjs";

import { GLOBAL } from "./global";

@Injectable({ providedIn: "root" })
export class AssetService {
  private http = inject(HttpClient);

  /** Stores `file` as the current asset of the target's slot; the previous one stays as an older version. */
  put(target: AssetTarget, file: File): Observable<{ status: number }> {
    const form = new FormData();
    form.append("ownerType", target.ownerType);
    form.append("ownerId", String(target.ownerId));
    form.append("slot", target.slot);
    form.append("file", file, file.name);
    return this.http.put<{ status: number }>(GLOBAL.admin("assets"), form);
  }
}

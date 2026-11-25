import { Injectable, type WritableSignal, inject } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { toNavigationAppError } from "@app/shared/errors/app-error";
import { confirmAction } from "@app/shared/forms/confirm-dialog.component";

const CONTENT_LIST = "/dashboard/contenidos";

@Injectable({ providedIn: "root" })
export class ContentFormFlow {
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  /**
   * Runs one write with `busy` raised, then reports and goes to `returnTo` on success or reports and
   * stays on failure. `work` must leave the form pristine, or the unsaved-changes guard stops the
   * navigation.
   */
  async run(
    busy: WritableSignal<boolean>,
    work: () => Promise<unknown>,
    success: string,
    failure: string,
    returnTo = CONTENT_LIST,
  ): Promise<void> {
    busy.set(true);
    try {
      await work();
      this.notify(success);
      await this.router.navigateByUrl(returnTo);
    } catch (error) {
      this.failed(error, failure);
    } finally {
      busy.set(false);
    }
  }

  private failed(error: unknown, fallback: string): void {
    const { code } = toNavigationAppError(error);
    this.notify(code === "conflict" ? "No se puede eliminar: otros registros lo usan" : fallback);
  }

  confirmDelete(title: string, text: string): Promise<boolean> {
    return confirmAction(this.dialog, { title, text, confirm: "Sí, eliminar", dismiss: "No, cancelar" });
  }

  notify(message: string): void {
    this.snackBar.open(message, undefined, { duration: 2000, horizontalPosition: "right", verticalPosition: "top" });
  }
}

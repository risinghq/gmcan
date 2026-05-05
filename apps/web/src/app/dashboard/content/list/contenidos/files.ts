export type FileSlot = "about" | "fac" | "head" | "foot";

type PreviewValue = string | ArrayBuffer | null;

export class ContenidosFiles {
  private readonly fileMap: Record<FileSlot, File | null> = {
    about: null,
    fac: null,
    head: null,
    foot: null,
  };

  readonly previewMap: Record<FileSlot, PreviewValue> = {
    about: null,
    fac: null,
    head: null,
    foot: null,
  };

  set(slot: FileSlot, file: File | null): void {
    this.fileMap[slot] = file;
  }

  get(slot: FileSlot): File | null {
    return this.fileMap[slot];
  }

  updatePreview(slot: FileSlot): void {
    const file = this.fileMap[slot];
    if (!file || !file.type.match(/image\/*/)) {
      this.previewMap[slot] = null;
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.addEventListener("load", () => {
      this.previewMap[slot] = reader.result;
    });
  }
}

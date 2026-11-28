import { Component, ViewChild } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { RichTextEditorComponent } from "./rich-text-editor.component";

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RichTextEditorComponent],
  template: `
    <form [formGroup]="form">
      <div id="content-label">Contenido</div>
      <app-rich-text-editor formControlName="content" labelledBy="content-label" />
    </form>
  `,
})
class RichTextEditorHostComponent {
  @ViewChild(RichTextEditorComponent) editorComponent!: RichTextEditorComponent;

  readonly form = new FormGroup({
    content: new FormControl("<p>Existing content</p>", {
      nonNullable: true,
      validators: Validators.required,
    }),
  });
}

type Tree = string | { [tag: string]: Tree[] };

/** The element tree of an HTML value: elements by tag name, text as strings. Attributes and formatting are ignored. */
function tree(html: string): Tree[] {
  const template = document.createElement("template");
  template.innerHTML = html;
  const walk = (node: Node): Tree => {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? "";
    const element = node as Element;
    return { [element.tagName.toLowerCase()]: [...element.childNodes].map(walk) };
  };
  return [...template.content.childNodes].map(walk);
}

function clickToolbar(fixture: ComponentFixture<RichTextEditorHostComponent>, action: string): void {
  (fixture.nativeElement as HTMLElement)
    .querySelector(`[data-action="${action}"]`)
    ?.dispatchEvent(new MouseEvent("click"));
  fixture.detectChanges();
}

function selectText(editorComponent: RichTextEditorComponent, from: number, to: number): void {
  editorComponent.editor.commands.setTextSelection({ from, to });
}

describe("RichTextEditorComponent", () => {
  let fixture: ComponentFixture<RichTextEditorHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [RichTextEditorHostComponent] }).compileComponents();
    fixture = TestBed.createComponent(RichTextEditorHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => fixture.destroy());

  it("loads existing HTML into the real editor and keeps the form value", () => {
    const editor = (fixture.nativeElement as HTMLElement).querySelector(".ProseMirror");

    expect(tree(editor?.innerHTML ?? "")).toEqual([{ p: ["Existing content"] }]);
    expect(tree(fixture.componentInstance.form.controls.content.value)).toEqual([{ p: ["Existing content"] }]);
  });

  it("names the editable area by the visible label the form gives it", () => {
    const editor = (fixture.nativeElement as HTMLElement).querySelector(".ProseMirror");
    const labelId = editor?.getAttribute("aria-labelledby") ?? "";

    expect(document.getElementById(labelId)?.textContent).toBe("Contenido");
  });

  it("offers no h1, so the content never repeats the title of the page that shows it", () => {
    const options = [...(fixture.nativeElement as HTMLElement).querySelectorAll("select option")];
    expect(options.map((option) => option.textContent?.trim())).toEqual(["Párrafo", "Título", "Subtítulo"]);

    const editorComponent = fixture.componentInstance.editorComponent;
    editorComponent.editor.commands.setContent("<h1>Pegado</h1>");
    expect(tree(editorComponent.editor.getHTML())).toEqual([{ p: ["Pegado"] }]);
  });

  it("types and formats content through the toolbar before reading its HTML value", () => {
    const editorComponent = fixture.componentInstance.editorComponent;
    editorComponent.editor.commands.setContent("<p></p>", { emitUpdate: false });
    editorComponent.editor.chain().focus().insertContent("Typed content").run();
    editorComponent.editor.commands.setTextSelection({ from: 1, to: 6 });
    (fixture.nativeElement as HTMLElement)
      .querySelector('[data-action="bold"]')
      ?.dispatchEvent(new MouseEvent("click"));
    fixture.detectChanges();

    expect(tree(fixture.componentInstance.form.controls.content.value)).toEqual([
      { p: [{ strong: ["Typed"] }, " content"] },
    ]);
  });

  // StarterKit keeps an empty paragraph after a closing heading or list so the writer can type below it.
  const typeBelow = { p: [] };

  it("applies headings, italic, underline, and both list formats through the toolbar", () => {
    const editorComponent = fixture.componentInstance.editorComponent;
    const content = fixture.componentInstance.form.controls.content;

    editorComponent.editor.commands.setContent("<p>Heading</p>", { emitUpdate: false });
    selectText(editorComponent, 1, 8);
    const heading = (fixture.nativeElement as HTMLElement).querySelector("select") as HTMLSelectElement;
    heading.value = "heading-2";
    heading.dispatchEvent(new Event("change", { bubbles: true }));
    expect(tree(content.value)).toEqual([{ h2: ["Heading"] }, typeBelow]);

    editorComponent.editor.commands.setContent("<p>Italic</p>", { emitUpdate: false });
    selectText(editorComponent, 1, 7);
    clickToolbar(fixture, "italic");
    expect(tree(content.value)).toEqual([{ p: [{ em: ["Italic"] }] }]);

    editorComponent.editor.commands.setContent("<p>Underline</p>", { emitUpdate: false });
    selectText(editorComponent, 1, 10);
    clickToolbar(fixture, "underline");
    expect(tree(content.value)).toEqual([{ p: [{ u: ["Underline"] }] }]);

    editorComponent.editor.commands.setContent("<p>Bullet</p>", { emitUpdate: false });
    selectText(editorComponent, 1, 7);
    clickToolbar(fixture, "bullet-list");
    expect(tree(content.value)).toEqual([{ ul: [{ li: [{ p: ["Bullet"] }] }] }, typeBelow]);

    editorComponent.editor.commands.setContent("<p>Ordered</p>", { emitUpdate: false });
    selectText(editorComponent, 1, 8);
    clickToolbar(fixture, "ordered-list");
    expect(tree(content.value)).toEqual([{ ol: [{ li: [{ p: ["Ordered"] }] }] }, typeBelow]);
  });

  it("adds a link through the toolbar", () => {
    const editorComponent = fixture.componentInstance.editorComponent;
    editorComponent.editor.commands.setContent("<p>Link</p>", { emitUpdate: false });
    selectText(editorComponent, 1, 5);
    vi.spyOn(window, "prompt").mockReturnValue("https://example.com");

    clickToolbar(fixture, "link");

    const value = fixture.componentInstance.form.controls.content.value;
    expect(tree(value)).toEqual([{ p: [{ a: ["Link"] }] }]);
    const link = document.createRange().createContextualFragment(value).querySelector("a");
    expect(link?.getAttribute("href")).toBe("https://example.com");
    vi.restoreAllMocks();
  });

  it("maps a cleared editor to an empty required form value", () => {
    const editorComponent = fixture.componentInstance.editorComponent;
    const content = fixture.componentInstance.form.controls.content;
    editorComponent.editor.commands.clearContent();
    fixture.detectChanges();

    expect(editorComponent.editor.isEmpty).toBe(true);
    expect(content.value).toBe("");
    expect(content.invalid).toBe(true);
  });

  it("accepts text entered through the editor's keyboard input path", async () => {
    const editorComponent = fixture.componentInstance.editorComponent;
    const editor = (fixture.nativeElement as HTMLElement).querySelector(".ProseMirror") as HTMLElement;
    editorComponent.editor.commands.clearContent();
    editorComponent.editor.commands.focus();

    editor.dispatchEvent(new KeyboardEvent("keydown", { key: "K", code: "KeyK", bubbles: true }));
    editor.dispatchEvent(
      new KeyboardEvent("keypress", { key: "K", code: "KeyK", charCode: 75, keyCode: 75, which: 75, bubbles: true }),
    );
    editor.dispatchEvent(new KeyboardEvent("keyup", { key: "K", code: "KeyK", bubbles: true }));
    editor.innerHTML = "<p>K</p>";
    editor.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: "K" }));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(tree(fixture.componentInstance.form.controls.content.value)).toEqual([{ p: ["K"] }]);
  });
});

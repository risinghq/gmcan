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
      <app-rich-text-editor formControlName="content" />
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

    expect(editor?.innerHTML).toBe("<p>Existing content</p>");
    expect(fixture.componentInstance.form.controls.content.value).toBe("<p>Existing content</p>");
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

    expect(fixture.componentInstance.form.controls.content.value).toBe("<p><strong>Typed</strong> content</p>");
  });

  it("applies headings, italic, underline, and both list formats through the toolbar", () => {
    const editorComponent = fixture.componentInstance.editorComponent;
    const content = fixture.componentInstance.form.controls.content;

    editorComponent.editor.commands.setContent("<p>Heading</p>", { emitUpdate: false });
    selectText(editorComponent, 1, 8);
    const heading = (fixture.nativeElement as HTMLElement).querySelector("select") as HTMLSelectElement;
    heading.value = "heading-2";
    heading.dispatchEvent(new Event("change", { bubbles: true }));
    expect(content.value).toContain("<h2>Heading</h2>");

    editorComponent.editor.commands.setContent("<p>Italic</p>", { emitUpdate: false });
    selectText(editorComponent, 1, 7);
    clickToolbar(fixture, "italic");
    expect(content.value).toContain("<em>Italic</em>");

    editorComponent.editor.commands.setContent("<p>Underline</p>", { emitUpdate: false });
    selectText(editorComponent, 1, 10);
    clickToolbar(fixture, "underline");
    expect(content.value).toContain("<u>Underline</u>");

    editorComponent.editor.commands.setContent("<p>Bullet</p>", { emitUpdate: false });
    selectText(editorComponent, 1, 7);
    clickToolbar(fixture, "bullet-list");
    expect(content.value).toContain("<ul>");
    expect(content.value).toContain("<li><p>Bullet</p></li>");

    editorComponent.editor.commands.setContent("<p>Ordered</p>", { emitUpdate: false });
    selectText(editorComponent, 1, 8);
    clickToolbar(fixture, "ordered-list");
    expect(content.value).toContain("<ol>");
    expect(content.value).toContain("<li><p>Ordered</p></li>");
  });

  it("adds a link through the toolbar", () => {
    const editorComponent = fixture.componentInstance.editorComponent;
    editorComponent.editor.commands.setContent("<p>Link</p>", { emitUpdate: false });
    selectText(editorComponent, 1, 5);
    vi.spyOn(window, "prompt").mockReturnValue("https://example.com");

    clickToolbar(fixture, "link");

    expect(fixture.componentInstance.form.controls.content.value).toContain('href="https://example.com"');
    expect(fixture.componentInstance.form.controls.content.value).toContain(">Link</a>");
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

    expect(fixture.componentInstance.form.controls.content.value).toBe("<p>K</p>");
  });
});

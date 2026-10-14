import { ChangeDetectionStrategy, Component, OnDestroy, ViewEncapsulation, forwardRef } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { MatButton } from "@angular/material/button";
import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { TiptapEditorDirective } from "ngx-tiptap";

interface HeadingOption {
  label: string;
  value: "paragraph" | `heading-${number}`;
}

@Component({
  selector: "app-rich-text-editor",
  templateUrl: "./rich-text-editor.component.html",
  styleUrl: "./rich-text-editor.component.scss",
  changeDetection: ChangeDetectionStrategy.Eager,
  encapsulation: ViewEncapsulation.None,
  imports: [MatButton, TiptapEditorDirective],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RichTextEditorComponent),
      multi: true,
    },
  ],
})
export class RichTextEditorComponent implements ControlValueAccessor, OnDestroy {
  readonly headingOptions: HeadingOption[] = [
    { label: "Paragraph", value: "paragraph" },
    { label: "Heading 1", value: "heading-1" },
    { label: "Heading 2", value: "heading-2" },
    { label: "Heading 3", value: "heading-3" },
    { label: "Heading 4", value: "heading-4" },
    { label: "Heading 5", value: "heading-5" },
    { label: "Heading 6", value: "heading-6" },
  ];

  readonly editor = new Editor({
    extensions: [
      StarterKit.configure({
        link: { openOnClick: false },
        underline: {},
      }),
    ],
  });

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string | null): void {
    const content = value ?? "";
    if (this.editor.getHTML() !== content) {
      this.editor.commands.setContent(content, { emitUpdate: false });
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
    this.editor.on("update", this.handleEditorUpdate);
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
    this.editor.on("blur", this.handleEditorBlur);
  }

  setDisabledState(isDisabled: boolean): void {
    this.editor.setEditable(!isDisabled);
  }

  get currentBlock(): HeadingOption["value"] {
    for (const level of [1, 2, 3, 4, 5, 6]) {
      if (this.editor.isActive("heading", { level })) return `heading-${level}`;
    }
    return "paragraph";
  }

  setBlock(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as HeadingOption["value"];
    const chain = this.editor.chain().focus();
    if (value === "paragraph") {
      chain.setParagraph().run();
      return;
    }
    chain.setHeading({ level: Number(value.slice("heading-".length)) as 1 | 2 | 3 | 4 | 5 | 6 }).run();
  }

  toggleBold(): void {
    this.editor.chain().focus().toggleBold().run();
  }

  toggleItalic(): void {
    this.editor.chain().focus().toggleItalic().run();
  }

  toggleUnderline(): void {
    this.editor.chain().focus().toggleUnderline().run();
  }

  toggleBulletList(): void {
    this.editor.chain().focus().toggleBulletList().run();
  }

  toggleOrderedList(): void {
    this.editor.chain().focus().toggleOrderedList().run();
  }

  setLink(): void {
    const currentHref = this.editor.getAttributes("link")["href"] as string | undefined;
    const href = typeof window === "undefined" ? null : window.prompt("Link URL", currentHref ?? "https://");
    if (href === null) return;
    const normalizedHref = href.trim();
    if (normalizedHref) {
      this.editor.chain().focus().setLink({ href: normalizedHref }).run();
    } else {
      this.editor.chain().focus().unsetLink().run();
    }
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }

  private readonly handleEditorUpdate = ({ editor }: { editor: Editor }): void => {
    this.onChange(editor.isEmpty ? "" : editor.getHTML());
  };

  private readonly handleEditorBlur = (): void => {
    this.onTouched();
  };
}

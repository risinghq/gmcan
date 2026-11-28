import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  ViewEncapsulation,
  effect,
  forwardRef,
  input,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { TiptapEditorDirective } from "ngx-tiptap";

const HEADING_LEVELS = [2, 3] as const;
type HeadingLevel = (typeof HEADING_LEVELS)[number];

interface HeadingOption {
  label: string;
  value: "paragraph" | `heading-${HeadingLevel}`;
}

@Component({
  selector: "app-rich-text-editor",
  templateUrl: "./rich-text-editor.component.html",
  styleUrl: "./rich-text-editor.component.scss",
  changeDetection: ChangeDetectionStrategy.Eager,
  encapsulation: ViewEncapsulation.None,
  imports: [TiptapEditorDirective],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RichTextEditorComponent),
      multi: true,
    },
  ],
})
export class RichTextEditorComponent implements ControlValueAccessor, OnDestroy {
  /** The id of the visible label that names the editable area. */
  readonly labelledBy = input.required<string>();

  readonly headingOptions: HeadingOption[] = [
    { label: "Párrafo", value: "paragraph" },
    { label: "Título", value: "heading-2" },
    { label: "Subtítulo", value: "heading-3" },
  ];

  /** The page that shows the content owns its only h1. */
  readonly editor = new Editor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [...HEADING_LEVELS] },
        link: { openOnClick: false },
        underline: {},
      }),
    ],
  });

  constructor() {
    effect(() => this.editor.setOptions({ editorProps: { attributes: { "aria-labelledby": this.labelledBy() } } }));
  }

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
    for (const level of HEADING_LEVELS) {
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
    chain.setHeading({ level: Number(value.slice("heading-".length)) as HeadingLevel }).run();
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
    const href =
      typeof window === "undefined" ? null : window.prompt("Dirección del enlace", currentHref ?? "https://");
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

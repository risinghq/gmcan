import { Pipe, PipeTransform } from "@angular/core";

export interface EmphasisPart {
  text: string;
  strong: boolean;
}

/** Splits a content line on `**` markers; an unclosed marker stays literal text. */
export function emphasisParts(line: string): EmphasisPart[] {
  const pieces = line.split("**");
  if (pieces.length % 2 === 0) return [{ text: line, strong: false }];

  return pieces.map((text, index) => ({ text, strong: index % 2 === 1 })).filter((part) => part.text !== "");
}

@Pipe({ name: "emphasis" })
export class EmphasisPipe implements PipeTransform {
  transform(line: string): EmphasisPart[] {
    return emphasisParts(line);
  }
}

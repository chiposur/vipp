import { Folder } from './fileSystem'
import { Point } from './types'

class TerminalState {
  currDir: Folder
  currLinePt: Point
  prompt: string
  fontName: string
  fontSize: string
  fontColor: string
  bgColor: string
  textBaseline: string
  textLines: Array<string>
  textLinePadding: number;

  public constructor() {
    this.currLinePt = new Point(0, 0);
    this.fontName = "sans-serif";
    this.fontSize = "16px";
    this.fontColor = "white";
    this.bgColor = "black";
    this.textLines = [];
    this.textLinePadding = 8;
    this.prompt = "";
  }

  public getFont(): string {
    return `${this.fontSize} ${this.fontName}`;
  }

  public getFontColor(): string {
    return this.fontColor;
  }

  public setCurrDir(folder: Folder) {
    this.currDir = folder;
    this.prompt = `[user@vipp-editor ${this.currDir.name}]$ `
  }

  public getPrompt(): string {
    return this.prompt;
  }

  public getPwd(): string {
    return this.currDir?.getFullName() || "";
  }

  public setCurrTextLine(textLine: string) {
    this.textLines[this.textLines.length - 1] = textLine;
  }
}

export { TerminalState };

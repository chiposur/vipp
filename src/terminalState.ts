import { Folder } from './fileSystem'
import { Point } from './types'

class TerminalState {
  currDir: Folder
  currLinePt: Point
  prompt: string
  fontName: string
  fontSz: string
  fontColor: string
  textBaseline: string
  textLines: Array<string>
  textLinePadding: number;

  public constructor() {
    this.currLinePt = new Point(0, 0);
    this.fontName = "sans-serif";
    this.fontSz = "16px";
    this.fontColor = "white";
    this.textLines = [];
    this.textLinePadding = 8;
    this.prompt = "";
  }

  public getFont(): string {
    return `${this.fontSz} ${this.fontName}`;
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
}

export { TerminalState };

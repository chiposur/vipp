import { Folder } from './fileSystem'
import { Point } from './types'

class TerminalState {
  currDir: Folder
  currLinePos: Point
  cursorPos: Point
  startingPos: Point
  cursorIndex: number
  prompt: string
  fontName: string
  fontSize: string
  fontColor: string
  fontLoaded: boolean
  bgColor: string
  textBaseline: string
  textLines: Array<string>
  cursorPaddingLeft: number
  cursorPaddingTop: number
  currTextLineCmd: string

  public constructor() {
    const framePaddingLeft = 4;
    const framePaddingTop = 8;
    this.startingPos = new Point(framePaddingLeft, framePaddingTop);
    this.currLinePos = Point.from(this.startingPos);
    this.cursorPos = Point.from(this.startingPos);
    this.cursorIndex = 0;
    this.currTextLineCmd = ""
    this.fontName = "Roboto Mono";
    this.fontSize = "16px";
    this.fontColor = "white";
    this.fontLoaded = false;
    this.bgColor = "black";
    this.textLines = [];
    this.currTextLineCmd = ""
    this.cursorPaddingLeft = 0;
    this.cursorPaddingTop = -2;
    this.prompt = "";
  }

  public getDefaultFont(): string {
    return `24px Arial`
  }

  public getFontName(): string {
    return this.fontName;
  }

  public getFont(): string {
    return `${this.fontSize} ${this.fontName}`;
  }

  public getFontColor(): string {
    return this.fontColor;
  }

  public getBgColor(): string {
    return this.bgColor;
  }

  public setFontLoaded(loaded: boolean) {
    this.fontLoaded = loaded;
  }

  public getFontLoaded(): boolean {
    return this.fontLoaded;
  }

  public getCurrDir(): Folder {
    return this.currDir;
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

  public setCursorIndex(index: number) {
    if (index > -1 && index <= this.currTextLineCmd.length) {
      this.cursorIndex = index;
    }
  }

  public getCursorIndex(): number {
    return this.cursorIndex;
  }

  public setCurrTextLineCmd(cmd: string) {
    this.textLines[this.textLines.length - 1] = `${this.prompt}${cmd}`;
    this.currTextLineCmd = cmd;
  }

  public getCurrTextLineCmd(): string {
    return this.currTextLineCmd;
  }

  public getNewStartingPos(): Point {
    return Point.from(this.startingPos);
  }

  public setCurrLinePos(currLinePos: Point) {
    this.currLinePos = currLinePos;
  }

  public getCurrLinePos(): Point {
    return this.currLinePos;
  }

  public setCursorPos(cursorPos: Point) {
    this.cursorPos = cursorPos;
  }

  public getCursorPos(): Point {
    return this.cursorPos;
  }
}

export { TerminalState };

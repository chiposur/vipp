import { Point } from './types'

class TerminalState {
  currLinePt: Point
  prompt: string
  pwd: string
  fontName: string
  fontSz: string
  fontColor: string
  textBaseline: string

  public constructor() {
    this.currLinePt = new Point(0, 0);
    this.fontName = "sans-serif";
    this.fontSz = "16px";
    this.fontColor = "white";
    this.setPwd("~");
  }

  public getFont() {
    return `${this.fontSz} ${this.fontName}`;
  }

  public getFontColor() {
    return this.fontColor;
  }

  public setPwd(pwd: string) {
    this.pwd = pwd;
    this.prompt = `[user@vipp-editor ${this.pwd}]$ `
  }

  public getPrompt() {
    return this.prompt;
  }

  public getPwd() {
    return this.pwd;
  }
}

export { TerminalState };

import { FileSystem } from './fileSystem'
import { TerminalCommands } from './terminalCommands'
import { TerminalState } from './terminalState'
import { Point } from './types'

class Terminal {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  fileSystem: FileSystem
  commands: TerminalCommands
  state: TerminalState
  resizeObserver: ResizeObserver

  public constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.resizeObserver = new ResizeObserver(() => {
      this.syncCanvasResolution();
      this.render();
    });
    this.resizeObserver.observe(this.canvas);
    this.init();
  }

  private init() {
    this.fileSystem = new FileSystem();
    this.state = new TerminalState();
    this.state.setCurrDir(this.fileSystem.root);
    this.commands = new TerminalCommands(this.fileSystem, this.state);
    this.registerHandlers();
    this.syncCanvasResolution();
    this.drawNewPromptRow();
    this.render();
  }

  private registerHandlers() {
    const eventTarget = document.getElementById("canvas-wrapper");
    eventTarget.addEventListener("keydown", (e: KeyboardEvent) => this.onKeyDown(e));
  }

  private clearTerminal() {
    this.state.textLines = [];
    this.state.currLinePt = new Point(0, 0);
    this.drawNewPromptRow();
    this.render();
  }

  private onKeyDown(e: KeyboardEvent) {
    if (e.ctrlKey && e.key == "k") {
      this.clearTerminal();
      e.preventDefault();
      return;
    }
    switch (e.key) {
      case "Enter":
        this.moveToNewline();
        this.drawNewPromptRow();
        break;
      default:
        return;
    }
  }

  private syncCanvasResolution() {
    if (this.canvas.width != this.canvas.clientWidth) {
      this.canvas.width = this.canvas.clientWidth;
    }
    if (this.canvas.height != this.canvas.clientHeight) {
      this.canvas.height = this.canvas.clientHeight;
    }
  }

  private render() {
    this.state.currLinePt = new Point(0, 0);
    this.drawBg();
    this.drawTextLines();
  }

  private drawTextLines() {
    this.setFontStyle();
    this.state.textLines.forEach((line, index) => {
      this.drawTextLine(line);
      if (index != this.state.textLines.length - 1) {
        this.moveToNewline();
      }
    });
  }

  private drawBg() {
    this.ctx.fillStyle = this.state.bgColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private getLineHeight(textLine: string) {
    const textMetrics = this.ctx.measureText(textLine);
    return textMetrics.fontBoundingBoxAscent +
      textMetrics.fontBoundingBoxDescent +
      this.state.textLinePadding;
  }

  private moveToNewline() {
    const lastLine = this.state.textLines[this.state.textLines.length - 1];
    const textMetrics = this.ctx.measureText(lastLine);
    const lineWidth = textMetrics.width;
    const numRows = Math.max(1, Math.ceil(lineWidth / this.canvas.width));
    this.state.currLinePt.x = 0;
    this.state.currLinePt.y += numRows * this.getLineHeight(lastLine);
  }

  private drawTextLine(textLine: string) {
    this.ctx.fillText(
      textLine,
      this.state.currLinePt.x + this.state.textLinePadding,
      this.state.currLinePt.y + this.state.textLinePadding);
  }

  private drawNewPromptRow() {
    this.setFontStyle();
    this.ctx.fillText(
      this.state.prompt,
      this.state.currLinePt.x + this.state.textLinePadding,
      this.state.currLinePt.y + this.state.textLinePadding);
    const textMetrics = this.ctx.measureText(this.state.prompt);
    this.state.currLinePt.x += textMetrics.width;
    this.state.textLines.push(this.state.prompt);
  }

  private setFontStyle() {
    this.ctx.font = this.state.getFont();
    this.ctx.textBaseline = "top";
    this.ctx.fillStyle = this.state.getFontColor();
  }
}

export { Terminal };

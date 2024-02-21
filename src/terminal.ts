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
    this.state = new TerminalState(this.fileSystem);
    this.commands = new TerminalCommands(this.fileSystem, this.state);
    this.registerHandlers();
    this.syncCanvasResolution();
    this.drawBg();
    this.drawNewPromptRow();
  }

  private registerHandlers() {
    // TODO: register input handlers
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
    this.state.textLines.forEach((line) => {
      this.drawTextLine(line);
    });
  }

  private drawBg() {
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private drawTextLine(textLine: string) {
    this.ctx.fillText(
      textLine,
      this.state.currLinePt.x + this.state.textLinePadding,
      this.state.currLinePt.y + this.state.textLinePadding);
    const textMetrics = this.ctx.measureText(textLine);
    this.state.currLinePt.y = textMetrics.actualBoundingBoxDescent;
  }

  private drawNewPromptRow() {
    this.setFontStyle();
    this.ctx.fillText(
      this.state.prompt,
      this.state.currLinePt.x + this.state.textLinePadding,
      this.state.currLinePt.y + this.state.textLinePadding);
    const textMetrics = this.ctx.measureText(this.state.prompt);
    this.state.currLinePt.x = textMetrics.width;
    this.state.textLines.push(this.state.prompt);
  }

  private setFontStyle() {
    this.ctx.font = this.state.getFont();
    this.ctx.textBaseline = "top";
    this.ctx.fillStyle = this.state.getFontColor();
  }
}

export { Terminal };

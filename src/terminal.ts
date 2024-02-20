import { TerminalState } from './terminalState'

class Terminal {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  state: TerminalState

  public constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.init();
  }

  private init() {
    this.state = new TerminalState();
    this.drawBg();
    this.drawNewPromptRow();
  }

  private drawBg() {
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private drawNewPromptRow() {
    this.ctx.font = this.state.getFont();
    this.ctx.textBaseline = "top";
    this.ctx.fillStyle = this.state.getFontColor();
    const padding: number = 8;
    this.ctx.fillText(
      this.state.prompt,
      this.state.currLinePt.x + padding,
      this.state.currLinePt.y + padding);
  }
}

export { Terminal };

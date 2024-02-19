class Terminal {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D

  public constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.init();
  }

  private init() {
    this.drawBg();
  }

  private drawBg() {
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

export { Terminal };
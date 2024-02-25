class Point {
  x: number
  y: number

  public constructor(x: number, y: number) {
    this.x = x;
    this.y = y
  }

  static from(point: Point): Point {
    return new Point(point.x, point.y);
  }
}

export { Point };

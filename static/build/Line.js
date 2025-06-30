export class Line {
    constructor(x1, y1, x2, y2) {
        this.x1 = 0;
        this.y1 = 0;
        this.x2 = 0;
        this.y2 = 0;
        this.setInvariant(x1, y1, x2, y2);
    }
    // Invariant: x1 <= x2
    setInvariant(x1, y1, x2, y2) {
        if (x1 < x2) {
            this.x1 = x1;
            this.y1 = y1;
            this.x2 = x2;
            this.y2 = y2;
        }
        else if (x1 > x2) {
            this.x1 = x2;
            this.y1 = y2;
            this.x2 = x1;
            this.y2 = y1;
        }
        else {
            this.x1 = this.x2 = x1;
            this.y1 = Math.min(y1, y2);
            this.y2 = Math.max(y1, y2);
        }
    }
    // вспомогательные параметры линии для разных формул
    get A() { return this.y2 - this.y1; }
    get B() { return this.x1 - this.x2; }
    get C() { return this.x2 * this.y1 - this.x1 * this.y2; }
    get k() { return (this.y1 - this.y2) / (this.x1 - this.x2); }
    get b() { return this.y1 + this.x1 * (this.y2 - this.y1) / (this.x1 - this.x2); }
    get p1() { return { x: this.x1, y: this.y1 }; }
    get p2() { return { x: this.x2, y: this.y2 }; }
}

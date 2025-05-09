import { glo } from "./globals.js";
import { Geometry as G, Point } from "./Geometry.js";
import { Link } from "./Link.js";
export class Dot extends Point {
    constructor(x, y, from) {
        super(x, y);
        this.from = from;
    }
}
// Ball - куля.
// move() - переміщення кулі. Викликається, коли зібрані усі точки дотику
export class Ball {
    constructor(x, y, r, c, vx, vy, m = 0) {
        this.box = null;
        this.ax = 0;
        this.ay = 0;
        this.dots = [];
        this.x = x;
        this.y = y;
        this.radius = r;
        this.color = c;
        this.vx = vx;
        this.vy = vy;
        // якщо маса не задана, то вона пропорційна площа кулі
        this.m = m ? m : r * r;
    }
    get kinEnergy() {
        let b = this;
        return b.m * (b.vx * b.vx + b.vy * b.vy) / 2;
    }
    get gravEnergy() {
        const b = this, h = b.box.height - b.radius - b.y;
        return b.m * glo.g * h;
    }
    get deformEnergy() {
        const b = this;
        let e = 0;
        let c = new Point(b.x - b.vx / 2, b.y - b.vy / 2); // ще не зрозумів
        b.dots.forEach(dot => {
            let ballDotDistance = G.distance(c, dot);
            // деформація кулі
            let deform = b.radius - ballDotDistance;
            e += glo.K * deform ** 2 / 2;
        });
        return e;
    }
    addDot(x, y, from) {
        //  
        // if (!this.dotShadows.find(d => d.from === from)) {
        //     if (from instanceof Ball)
        //         glo.strikeCounter += 0.5;
        //     if (from instanceof Line)
        //         glo.strikeCounter += 1;
        // }
        let dot = new Dot(x, y, from);
        this.dots.push(dot);
    }
    clearDots() {
        this.dots = [];
    }
    // Переміщення кулі. 
    // Викликається, коли зібрані усі точки дотику
    move() {
        // сумарна сила
        let fx = 0, fy = 0;
        let ball = this;
        if (ball.color === "blue")
            return;
        // складаємо сили від кожної точки дотику
        for (let dot of ball.dots) {
            let ballDotDistance = G.distance(ball, dot);
            // деформація кулі
            let deform = ball.radius - ballDotDistance;
            // одиничний вектор напряму від точки дотику до центру кулі
            let u = G.unit(dot, ball, ballDotDistance);
            // коєфіцієнт втрат енергії при дотику від лінку або від (кулі | лінії)
            let w = dot.from instanceof Link ? glo.U : glo.W;
            // втрата енергії при дотику 
            let scalarProduct = G.scalar(new Point(ball.vx, ball.vy), u);
            let kw = scalarProduct > 0 ? 1 - w : 1; // у фазі зменшення деформації
            // let kw = scalarProduct < 0 ? 1/(1 - w) : 1;   // у фазі збільшення деформації         
            // сила від точки дотику
            let f = glo.K * kw * deform;
            fx += f * u.x;
            fy += f * u.y;
        }
        // сила спротиву повітря ~ vis * radius * velocity
        if (glo.Vis > 0) {
            let rv = ball.radius * glo.Vis;
            fx -= ball.vx * rv;
            fy -= ball.vy * rv;
        }
        // миттєве прискорення
        let ax = fx / ball.m;
        let ay = fy / ball.m + glo.g;
        // зміна швидкості
        ball.vx += ax;
        ball.vy += ay;
        // зміна координат
        ball.x += ball.vx;
        ball.y += ball.vy;
    }
}
//# sourceMappingURL=Ball.js.map
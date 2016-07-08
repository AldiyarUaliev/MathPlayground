import { TweenMax, TimelineMax } from "gsap";

export default class Utils {

    static get numWidth() { return 24; }

    static addClass(element, newClass, duration = 0.6) {
        TweenMax.to(element, duration, {className: "+=" + newClass, ease:Power1.easeNone});
    }

    static removeClass(element, newClass, duration = 0.6) {
        TweenMax.to(element, duration, {className: "-=" + newClass, ease:Power1.easeNone});
    }

    static drawSquare(snap, x, y, width, drawPath = this.drawPlus) {
        const square = snap.rect(x, y, width, width)
            .attr({
                fill: "yellow",
                stroke: "black",
                strokeWidth: 1,
                shapeRendering: "crispEdges"
            });
        if (width > 15) {
            const sign = drawPath(snap, x, y, width);

            return snap.g().add(square, sign);
        }
        return square;
    }

    static toggleInsides (square) {
        const path = $(square).find("path");
        if (path.css("opacity") == 0)
            path.css("opacity", 1);
        else path.css("opacity", 0);
    }
    static drawPlus(snap, x, y, width) {
        return snap.path(
            "M".concat((x + width / 2) + " " + (y + width / 4))
            + "L".concat((x + width / 2) + " " + (y + width - width / 4))
            + "M".concat((x + width / 4) + " " + (y + width / 2))
            + "L".concat((x + width - width / 4) + " " + (y + width / 2))
        ).attr({
            stroke: "red",
            strokeWidth: 1,
            shapeRendering: "crispEdges"
        });
    }

    static drawMinus(snap, x, y, width) {
        return snap.path(
            "M".concat((x + width / 4) + " " + (y + width / 2))
            + "L".concat((x + width - width / 4) + " " + (y + width / 2))
        ).attr({
            stroke: "blue",
            strokeWidth: 1,
            shapeRendering: "crispEdges"
        });
    }

    static deleteSquare(id) {
        $(id).remove();
    }

    static highlightSquare(squareGroup) {
        
    }
}

import { Power3, TweenMax, TimelineMax } from "gsap";
import { Snap } from "snap.svg";
import { RenderedEquals, RenderedObject, RenderedNumber } from "app/js/renderedobjects";
import Utils from "app/js/animatorutils";

export default class LongMultiplyAnimator {
    constructor(containerElement) {
        const elem = containerElement;

        this._container = elem;
        this._timeline = new TimelineMax();
        this._animationId = this._container.attr("id") + "-animation";
        this._svgId = this._container.attr("id") + "-animation";
        this._toRemove = [];
    }

    drawGo() {
        if (this._drawn) {
            this.go();
            
            return;
        }

        this._drawn = true;

        // Utilities
        const negativeClass = Utils.negativeClass;
        const numWidth = Utils.numWidth;

        // Parameters
        const heightCoefficient = 1.4;
        const letterSpacing = 18;
        const leftLine = 0;
        const fadeOpacity = .3;

        const subEquationColor = "blue";

        const times = this._container.find(".operation-text");

        // Boxes
        const leftBox = this._container.children(".snapbox-left");
        const rightBox = this._container.children(".snapbox-right");

        let topBox = leftBox, botBox = rightBox;

        // Box text
        const topOpText = topBox.find(".number-text").text();
        const botOpText = botBox.find(".number-text").text();

        // Operation arrays
        const topOpArray = topOpText.split("").map(c => parseInt(c));
        const botOpArray = botOpText.split("").map(c => parseInt(c));

        const topOpReversed = topOpArray.slice().reverse();
        const botOpReversed = botOpArray.slice().reverse();

        // Detect if answer is positive or negative
        let isNegative = false;

        if (botOpText * topOpText < 0) isNegative = true;

        // Set up HTML for individual numbers
        const topOpTuple = Utils.individualNumberHtml(topOpArray, this);
        const topOpSpans = topOpTuple[0];
        const newTopHtml = topOpTuple[1];

        topBox.find(".number-text").html(newTopHtml);

        const botOpTuple = Utils.individualNumberHtml(botOpArray, this, "botOp");
        const botOpSpans = botOpTuple[0];
        const newBotHtml = botOpTuple[1];

        botBox.find(".number-text").html(newBotHtml);

        // Product of the equation
        const product = topOpText * botOpText;

        // Width of the box
        const topWidth = times.width() + numWidth / 2 + Math.max(topOpArray.length, botOpArray.length)
            * (letterSpacing + numWidth);

        const botWidth = times.width() + numWidth / 2 + String(product).split("").length * (letterSpacing + numWidth);

        const subLeftLine = topWidth - botWidth;

        // Render equal sign
        const equals = new RenderedObject(this._animationId + "-equals",
            0,
            rightBox.height() * heightCoefficient * 2,
            "",
            "<span id='equals'><hr></span>",
            false
        );
        const equalsDiv = equals.createElements(this._container);

        equalsDiv.css({
            "position": "absolute",
            "opacity": 0,
            "width": topWidth,
        });

        this._equals = equals;
        this._toRemove.push(equalsDiv);

        // Render sub equal sign
        const subEquals = new RenderedObject(this._animationId + "-subEquals",
            subLeftLine,
            equalsDiv.height() + rightBox.height() * heightCoefficient * 4,
            "",
            "<span id='subEquals'><hr></span>",
            false
        );
        const subEqualsDiv = subEquals.createElements(this._container);

        subEqualsDiv.css({
            "position": "absolute",
            "opacity": 0,
            "width": botWidth,
        });

        this._toRemove.push(subEqualsDiv);

        // Render sub plus
        const subPlus = new RenderedObject(`${this._animationId}-subPlus`,
            subLeftLine,
            equalsDiv.height() / 2 + 3 * (rightBox.height() * heightCoefficient),
            "",
            "<span>+</span>",
            false
        );
        const subPlusDiv = subPlus.createElements(this._container);

        subPlusDiv.css({
            "position": "absolute",
            "font-size": "3em",
            "color": "#0074D9",
            "font-weight": "bold",
            "opacity": 0,
        });

        this._toRemove.push(subPlusDiv);

        // Render side equation
        const side = new RenderedObject(this._animationId + "-side",
            topWidth,
            rightBox.height() * .75,
            "small",
            "<span id='leftOp'></span><span id='times'>&times</span><span id='rightOp'></span></span>"+
            "<span id='equals'>=</span>",
            false
        );
        const sideDiv = side.createElements(this._container);

        sideDiv.css({
            "font-size": "2em",
            display: "inline-block",
            position: "absolute",
        });

        this._toRemove.push(sideDiv);

        // Side components
        const sideLeft = sideDiv.find("#leftOp");
        const sideRight = sideDiv.find("#rightOp");
        const sideProduct = sideDiv.find("#times");
        const sideEquals = sideDiv.find("#equals");

        sideLeft.css({
            color: "red",
            "padding-right": letterSpacing,
        });
        sideRight.css({
            color: "red",
            "padding-right": letterSpacing,
        });
        sideProduct
            .css({
                "font-weight": "bold",
                "padding-right": letterSpacing,
            })
            .addClass(negativeClass);

        const fade = Power3.easeOut;

        /* Timeline */
        this._timeline
            .to(equalsDiv, 1, {
                opacity: 1,
                ease: fade,
            })                           /* Fade is equal line, sub equal line, and plus */
            .to(leftBox, 1, {
                position: "absolute",
                left: Utils.positionTopBox(leftLine, times, leftBox, numWidth, botOpText, topOpText, letterSpacing),
                ease: fade,
            }, "-=1")            /* Fade in top box */
            .to(rightBox, 1, {
                position: "absolute",
                left: Utils.positionBotBox(leftLine, times, rightBox, numWidth, botOpText, topOpText, letterSpacing),
                top: numWidth * 3,
                ease: fade,
            }, "-=1")           /* Fade in bot box */
            .to(times, 1, {
                position: "absolute",
                left: 0,
                top: rightBox.height() * heightCoefficient,
                ease: fade,
            }, "-=1")              /* Fade in times */
            .to("." + this._animationId + "-operand", 1, {
                "padding-right": letterSpacing,
                ease: fade,
            }, "-=1");    /* Add padding between numbers */

        // Create sub-equations
        let sum = 0;
        let i = 0;
        let topAnswer = null;

        let additionNums = [];

        botOpReversed.forEach((botValue, botIndex) => {
            botValue *= Math.pow(10, botIndex);

            this._timeline.to(botOpSpans[botIndex], .75, {
                color: "red",
                ease: fade,
            });     /* Highlight bot value */

            // Fade unused bot values
            botOpReversed.forEach((value, i) => {
                if (i > botIndex) {
                    this._timeline.to(botOpSpans[i], .75, {
                        opacity: fadeOpacity,
                        ease: fade,
                    }, "-=.75");
                }
            });

            topOpReversed.forEach((topValue, topIndex) => {
                i++;

                this._timeline.to(topOpSpans[topIndex], .75, {
                    color: "red",
                    ease: fade,
                }, "-=.75"); /* Highlight top value */

                // Fade unused top values
                topOpReversed.forEach((value, i) => {
                    if (i > topIndex) {
                        this._timeline.to(topOpSpans[i], .75, {
                            opacity: fadeOpacity,
                            ease: fade,
                        }, "-=.75");
                    }
                });

                topValue *= Math.pow(10, topIndex);

                // Product of current side multiplication
                const product = topValue * botValue;

                additionNums.push(product);

                this._timeline.set(sideLeft, { text: String(topValue) });
                this._timeline.set(sideRight, { text: String(botValue) });

                const digits = String(product).split("").length;

                const answer = new RenderedNumber(`${this._animationId}-answer-${i}`,
                    sideDiv.position().left + sideDiv.width() + letterSpacing + 16 * digits,
                    sideDiv.height() - numWidth / 2,
                    product,
                    false
                );

                let answerDiv = answer.createElements(this._container);
                answer.contentDiv.css("font-size", "2em");
                answerDiv.addClass(Utils.answerClass);

                this._toRemove.push(answerDiv);

                sum += product;

                // Side Equation
                this._timeline
                    .fromTo([sideLeft, sideRight, sideProduct], .75, { opacity: 0 }, {
                        opacity: 1,
                        ease: fade,
                    }, "+=.25") /* Fade in side left, right, and times */
                    .fromTo(sideEquals, .75, { opacity: 0 }, {
                        opacity: 1,
                        ease: fade,
                    })                                  /* Fade in side equals */
                    .fromTo(answerDiv, .75, { opacity: 0 }, {
                        opacity: 1,
                        ease: fade,
                    });                                  /* Fade in side equation product */

                // Move product to top of sub-addition equation
                this._timeline.to(answerDiv, 1.25, {
                    left: topWidth - (product.toString().length * (letterSpacing + numWidth)),
                    top: equalsDiv.height() + (2 + (additionNums.length - 1)) * (rightBox.height() * heightCoefficient),
                    "font-size": numWidth,
                    "letter-spacing": `${letterSpacing}px`,
                    color: subEquationColor,
                    ease: fade,
                });

                if (additionNums.length === 1) topAnswer = answerDiv;

                if (additionNums.length === 2) {
                    this._timeline.to([subEqualsDiv, subPlusDiv], 1, {
                        opacity: 1,
                        ease: fade,
                    }, "-=1.25");

                    additionNums[0] = additionNums[0] + additionNums[1];
                    additionNums.splice(1, 1);

                    const subAnswer = new RenderedNumber(`${this._animationId}-answer-${i}`,
                        topWidth - (additionNums[0].toString().length * (letterSpacing + numWidth)),
                        2 * equalsDiv.height() + rightBox.height() * heightCoefficient * 4,
                        additionNums[0],
                        false
                    );

                    const subAnswerDiv = subAnswer.createElements(this._container);
                    subAnswerDiv.css({
                        opacity: 0,
                        "letter-spacing": `${letterSpacing}px`,
                        color: subEquationColor,
                    });
                    subAnswerDiv.addClass(Utils.answerClass);

                    this._toRemove.push(subAnswerDiv);

                    this._timeline
                        .to(subAnswerDiv, 1, {
                            opacity: 1,
                            ease: fade,
                        }, "+=.25")                     /* Show sum */
                        .to(subAnswerDiv, 1, {
                            left: topWidth - (additionNums[0].toString().length * (letterSpacing + numWidth)),
                            top: equalsDiv.height() + rightBox.height() * heightCoefficient + numWidth * 2,
                            "letter-spacing": `${letterSpacing}px`,
                            ease: fade,
                        })    /* Replace top sub addition with sum */
                        .to([topAnswer, answerDiv], 1, {
                            opacity: 0,
                            ease: fade,
                        }, "-=1")             /* Remove previous addition */
                        .to([subEqualsDiv, subPlusDiv], 1, {
                            opacity: 0,
                            ease: fade,
                        }, "-=1");        /* Fade out sub equation operands */

                    topAnswer = subAnswerDiv;
                }

                this._timeline
                    .to([sideLeft, sideRight, sideProduct, sideEquals], .75, {
                        opacity: 0,
                        ease: fade,
                    })   /* Hide side equation */
                    .to(topOpSpans[topIndex], .75, {
                        color: "black",
                        ease: fade,
                    }, "-=.75");               /* Un-highlight top value */

                // Un-fade unused top values
                topOpReversed.forEach((value, i) => {
                    if (i > topIndex) {
                        this._timeline.to(topOpSpans[i], .75, {
                            opacity: 1,
                            ease: fade,
                        }, "-=.75");
                    }
                })
            });

            // Un-highlight bot value
            this._timeline.to(botOpSpans[botIndex], .75, {
                color: "black",
                ease: fade,
            }, "-=.75");

            // Un-fade unused bot values
            botOpReversed.forEach((value, i) => {
                if (i > botIndex) {
                    this._timeline.to(botOpSpans[i], .5, {
                        opacity: 1,
                        ease: fade,
                    }, "-=.5")
                }
            });
        });

        // Turn answer green
        this._timeline.to(topAnswer, .75, {
            color: "green",
            ease: fade,
        }, "-=2.5");

        $("." + this._animationId + "-operand").css("autoRound", false);
    }

    go() {
        this._equals.value = "";
        this._timeline.timeScale(1);
        this._timeline.play(0);
    }

    goAway() {
        if (this._drawn) {
            this._timeline.reverse();
            this._timeline.timeScale(16);
        }
    }

    removeElements() {
        this._toRemove.forEach(element => $(element).remove());
    }
}
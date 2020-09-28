//#region Classes
class Node {
    constructor(xPos, yPos, nodeWidth, nodeHeight) {
        // Inputs
        this._xPos = xPos;
        this._yPos = yPos;
        this._width = nodeWidth;
        this._height = nodeHeight;

        // Default values
        this._state = states.UnSearched;

        this._parrentNode = null;

        this._ds = 0;
        this._df = 0;
        this._cost = 0;
        this._color = "white";
        this._strokeColor = "black";
        this._strokeWidth = 5;
    }

    //#region get-set

    get state() {
        return this._state;
    }

    set state(newStates) {
        this._state = newStates;
    }

    get color() {
        return this._color;
    }

    set color(newColor) {
        this._color = newColor;
    }

    get ds() {
        return this._ds;
    }

    set ds(newDs) {
        this._ds = newDs;
    }

    get df() {
        return this._df;
    }

    set df(newDf) {
        this._df = newDf;
    }

    get cost() {
        return this._cost;
    }

    set cost(newCost) {
        this._cost = newCost;
    }

    get xPos() {
        return this._xPos;
    }

    set xPos(newXPos) {
        this._xPos = newXPos;
    }

    get yPos() {
        return this._yPos;
    }

    set yPos(newYPos) {
        this._yPos = newYPos;
    }

    get parrentNode() {
        return this._parrentNode;
    }

    set parrentNode(newParrentNode) {
        this._parrentNode = newParrentNode;
    }

    //#endregion

    calculateCost() {
        this._cost = this._ds + this._df;
    }
    draw(ctx) {
        ctx.fillStyle = this._strokeColor;
        ctx.fillRect(this._xPos, this._yPos, this._width, this._height);
        ctx.fillStyle = this._color;
        ctx.fillRect(
            this._xPos + this._strokeWidth,
            this._yPos + this._strokeWidth,
            this._width - this._strokeWidth * 2,
            this._height - this._strokeWidth * 2
        );
    }
}

class NodeText {
    constructor(text, size, color, xPos, yPos) {
        this._text = text;
        this._size = size;
        this._color = color;
        this._xPos = xPos;
        this._yPos = yPos;
    }

    //#region get-set
    get text() {
        return this._text;
    }

    set text(newText) {
        this._text = newText;
    }
    //#endregion

    draw(ctx) {
        ctx.fillStyle = this._color;
        ctx.textAlign = "center";
        ctx.font = this._size + "pt Roboto";
        ctx.fillText(this._text, this._xPos, this._yPos);
    }
}
//#endregion

//#region Initilize variables
var ctx;
var canvas;
var interval;

var screenWidth;
var screenHeight;

var nodeInRow;
var nodeInColumn;

var startNode;
var finishNode;

const drawText = true;
const nodeSize = 100;
const textSizeBig = 20;
const textSizeSmall = 15;

const cn = 10;
const cd = 14;

//#endregion

function start() {
    // Initilize canvas
    canvas = document.getElementById("Screen");
    ctx = canvas.getContext("2d");
    ctx.canvas.width = window.innerWidth - (window.innerWidth / 100) * 10;
    ctx.canvas.height = window.innerHeight - (window.innerHeight / 100) * 10;

    interval = setInterval(updateCanvas, 100);

    screenWidth = ctx.canvas.width;
    screenHeight = ctx.canvas.height;

    // Initilize nodes
    // Enums
    states = {
        Open: "open",
        Closed: "closed",
        UnSearched: "unSearched",
        Blocked: "blocked",
        Path: "path"
    };

    drawPath = false;

    nodes = [];

    nodeTextsDs = [];
    nodeTextsDf = [];
    nodeTextsCost = [];

    // Initilize variables
    for (let i = 0; i * nodeSize + nodeSize < ctx.canvas.width; i++) {
        for (let j = 0; j * nodeSize + nodeSize < ctx.canvas.height; j++) {
            let node = new Node(i * nodeSize, j * nodeSize, nodeSize, nodeSize);
            nodes.push(node);

            let nodeTextCost = new NodeText(
                "0",
                textSizeBig,
                "black",
                (i + 0.5) * nodeSize,
                (j + 0.5) * nodeSize + textSizeBig / 2
            );
            nodeTextsCost.push(nodeTextCost);

            let nodeTextDs = new NodeText(
                "0",
                textSizeSmall,
                "black",
                i * nodeSize + (nodeSize / 100) * 10 + textSizeSmall,
                j * nodeSize + (nodeSize / 100) * 10 + textSizeSmall
            );
            nodeTextsDs.push(nodeTextDs);

            let nodeTextDf = new NodeText(
                "0",
                textSizeSmall,
                "black",
                i * nodeSize + (nodeSize / 100) * 90 - textSizeSmall,
                j * nodeSize + (nodeSize / 100) * 10 + textSizeSmall
            );
            nodeTextsDf.push(nodeTextDf);

            nodeInColumn = j;
        }
        nodeInRow = i;
    }
    // For calculation purposes
    nodeInRow++;
    nodeInColumn++;

    // Temp variable
    pathDrawn = false;

    // Refer to special nodes
    startNode = nodes[0];
    finishNode = nodes[nodeInRow * nodeInColumn - 1];

    // Blocked nodes
    nodes[30].state = states.Blocked;
    nodes[31].state = states.Blocked;
    nodes[29].state = states.Blocked;
    nodes[32].state = states.Blocked;
    nodes[28].state = states.Blocked;

    nodes[47].state = states.Blocked;
    nodes[52].state = states.Blocked;
    nodes[53].state = states.Blocked;
    nodes[46].state = states.Blocked;
    nodes[48].state = states.Blocked;

    // Set start node
    startNode.state = states.Closed;
}

// Do for all nodes
function updateNodes() {
    // Variables
    let minValue = Number.POSITIVE_INFINITY;
    let smallestNode = 0;

    for (let i = 0; i < nodes.length; i++) {
        //#region colors
        if (nodes[i].state == states.Open) {
            nodes[i].color = "green";
        } else if (nodes[i].state == states.Closed) {
            nodes[i].color = "red";
        } else if (nodes[i].state == states.UnSearched) {
            nodes[i].color = "grey";
        } else if (nodes[i].state == states.Blocked) {
            nodes[i].color = "black";
        } else if (nodes[i].state == states.Path) {
            nodes[i].color = "blue";
        }
        startNode.color = "white";
        finishNode.color = "white";
        //#endregion

        // Clalculate g and h costs
        if (nodes[i].state == states.Closed || nodes[i].state == states.Open) {
            // H cost
            let minDistFinish = Math.min(
                Math.abs(nodes[i].xPos - finishNode.xPos),
                Math.abs(nodes[i].yPos - finishNode.yPos)
            );
            let maxDistFinish = Math.max(
                Math.abs(nodes[i].xPos - finishNode.xPos),
                Math.abs(nodes[i].yPos - finishNode.yPos)
            );
            nodes[i].df =
                (cd * minDistFinish + cn * (maxDistFinish - minDistFinish)) /
                nodeSize;

            // G cost
            if (nodes[i] != startNode) {
                let minDistStart = Math.min(
                    Math.abs(nodes[i].parrentNode.xPos - nodes[i].xPos),
                    Math.abs(nodes[i].parrentNode.yPos - nodes[i].yPos)
                );
                let maxDistStart = Math.max(
                    Math.abs(nodes[i].parrentNode.xPos - nodes[i].xPos),
                    Math.abs(nodes[i].parrentNode.yPos - nodes[i].yPos)
                );
                nodes[i].ds =
                    nodes[i].parrentNode.ds +
                    (cd * minDistStart + cn * (maxDistStart - minDistStart)) /
                        nodeSize;
            }
            // F cost
            nodes[i].calculateCost();
        }

        // Finish
        if (pathDrawn && i == nodes.length - 1) {
            clearInterval(interval);
        }

        //#region Draw
        nodes[i].draw(ctx);

        if (drawText) {
            nodeTextsDs[i].text = nodes[i].ds;
            nodeTextsDf[i].text = nodes[i].df;
            nodeTextsCost[i].text = nodes[i].cost;

            if (
                nodes[i].state != states.UnSearched &&
                nodes[i] != startNode &&
                nodes[i] != finishNode
            ) {
                nodeTextsDs[i].draw(ctx);
                nodeTextsDf[i].draw(ctx);
                nodeTextsCost[i].draw(ctx);
            } else if (nodes[i] == startNode) {
                nodeTextsCost[i].text = "S";
                nodeTextsCost[i].draw(ctx);
            } else if (nodes[i] == finishNode) {
                nodeTextsCost[i].text = "F";
                nodeTextsCost[i].draw(ctx);
            }
        }
        //#endregion
    }

    // Cose the node with the smalles f cost
    for (let j = 0; j < nodes.length; j++) {
        if (nodes[j].state == states.Open) {
            if (nodes[j].cost < minValue) {
                minValue = nodes[j].cost;
                smallestNode = nodes[j];
            }
        }
    }

    smallestNode.state = states.Closed;

    // Open the nodes around closed nodes
    for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].state == states.Closed) {
            for (let j = 0; j < nodes.length; j++) {
                if (
                    Math.abs(nodes[j].xPos - nodes[i].xPos) <= nodeSize &&
                    Math.abs(nodes[j].yPos - nodes[i].yPos) <= nodeSize &&
                    nodes[j].state == states.UnSearched
                ) {
                    nodes[j].parrentNode = nodes[i];
                    nodes[j].state = states.Open;
                }
            }
        }
    }

    // Detect if we are done
    if (smallestNode == finishNode && !pathDrawn) {
        drawPath = true;
    }

    // Draw the shortest path
    if (drawPath) {
        let parrent = finishNode.parrentNode;
        while (drawPath) {
            if (parrent == startNode) {
                pathDrawn = true;
                drawPath = false;
            }
            parrent.state = states.Path;
            parrent = parrent.parrentNode;
        }
    }
}

// Updates every Interval
function updateCanvas() {
    // Clear screen every frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Updates
    updateNodes();
}

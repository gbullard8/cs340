"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
class ImageEditor {
    run(args) {
        try {
            if (args.length < 5) {
                console.log("line 7 usage\n");
                this.usage();
                return;
            }
            var inputFile = args[2];
            var outputFile = args[3];
            var filter = args[4];
            var image = this.read(inputFile);
            if (filter === "grayscale" || filter === "greyscale") {
                if (args.length != 5) {
                    console.log("line 20 usage\n");
                    this.usage();
                    return;
                }
                this.greyscale(image);
            }
            else if (filter === "invert") {
                if (args.length != 5) {
                    console.log("line 28 usage\n");
                    this.usage();
                    return;
                }
                this.invert(image);
            }
            else if (filter === "emboss") {
                if (args.length != 5) {
                    console.log("line 36 usage\n");
                    this.usage();
                    return;
                }
                this.emboss(image);
            }
            else if (filter === "motionblur") {
                if (args.length != 6) {
                    console.log("line 44 usage\n");
                    this.usage();
                    return;
                }
                var length = -1;
                try {
                    length = parseInt(args[5]);
                }
                catch (e) {
                    console.log(e);
                }
                if (length < 0) {
                    console.log("line 56 usage\n");
                    this.usage();
                    return;
                }
                this.motionblur(image, length);
            }
            else {
                console.log("line 63 usage\n");
                this.usage();
            }
            this.write(image, outputFile);
        }
        catch (e) {
            console.log("failed");
            console.error(e);
        }
    }
    usage() {
        console.log("USAGE: java ImageEditor <in-file> <out-file> <grayscale|invert|emboss|motionblur> {motion-blur-length}");
    }
    motionblur(image, length) {
        if (length < 1) {
            return;
        }
        for (var x = 0; x < image.getWidth(); x++) {
            for (var y = 0; y < image.getHeight(); y++) {
                var curColor = image.get(x, y);
                var maxX = Math.min(image.getWidth() - 1, x + length - 1);
                for (var i = x + 1; i <= maxX; i++) {
                    var tmpColor = image.get(i, y);
                    curColor.red += tmpColor.red;
                    curColor.green += tmpColor.green;
                    curColor.blue += tmpColor.blue;
                }
                var delta = (maxX - x + 1);
                curColor.red = Math.floor(curColor.red / delta);
                curColor.green = Math.floor(curColor.green / delta);
                curColor.blue = Math.floor(curColor.blue / delta);
            }
        }
    }
    invert(image) {
        for (var x = 0; x < image.getWidth(); x++) {
            for (var y = 0; y < image.getHeight(); y++) {
                var curColor = image.get(x, y);
                curColor.red = 255 - curColor.red;
                curColor.green = 255 - curColor.green;
                curColor.blue = 255 - curColor.blue;
            }
        }
    }
    greyscale(image) {
        for (var x = 0; x < image.getWidth(); x++) {
            for (var y = 0; y < image.getHeight(); y++) {
                var curColor = image.get(x, y);
                var grayLevel = Math.floor((curColor.red + curColor.green + curColor.blue) / 3);
                grayLevel = Math.max(0, Math.min(grayLevel, 255));
                curColor.red = grayLevel;
                curColor.green = grayLevel;
                curColor.blue = grayLevel;
            }
        }
    }
    emboss(image) {
        for (var x = image.getWidth() - 1; x >= 0; --x) {
            for (var y = image.getHeight() - 1; y >= 0; --y) {
                var curColor = image.get(x, y);
                var diff = 0;
                if (x > 0 && y > 0) {
                    var upLeftColor = image.get(x - 1, y - 1);
                    if (Math.abs(curColor.red - upLeftColor.red) > Math.abs(diff)) {
                        diff = curColor.red - upLeftColor.red;
                    }
                    if (Math.abs(curColor.green - upLeftColor.green) > Math.abs(diff)) {
                        diff = curColor.green - upLeftColor.green;
                    }
                    if (Math.abs(curColor.blue - upLeftColor.blue) > Math.abs(diff)) {
                        diff = curColor.blue - upLeftColor.blue;
                    }
                }
                var grayLevel = (128 + diff);
                grayLevel = Math.floor(Math.max(0, Math.min(grayLevel, 255)));
                curColor.red = grayLevel;
                curColor.green = grayLevel;
                curColor.blue = grayLevel;
            }
        }
    }
    read(filePath) {
        var image;
        const input = fs.readFileSync(filePath, 'utf-8').split(/\s+/);
        input.shift();
        var width = parseInt(input.shift());
        var height = parseInt(input.shift());
        image = new ThisImage(width, height);
        input.shift();
        for (var x = 0; x < width; x++) {
            for (var y = 0; y < height; y++) {
                var color = new Color();
                color.red = parseInt(input.shift());
                color.green = parseInt(input.shift());
                color.blue = parseInt(input.shift());
                image.set(x, y, color);
            }
        }
        return image;
    }
    write(image, filePath) {
        const output = fs.createWriteStream(filePath);
        try {
            output.write("P3\n");
            output.write(`${image.getWidth()} ${image.getHeight()}\n`);
            output.write("255\n");
            for (var x = 0; x < image.getWidth(); x++) {
                for (var y = 0; y < image.getHeight(); y++) {
                    var color = image.get(x, y);
                    output.write(`${color.red} ${color.green} ${color.blue} `);
                }
            }
        }
        finally {
            output.close();
        }
    }
}
class Color {
    red;
    green;
    blue;
    constructor() {
        this.red = 0;
        this.green = 0;
        this.blue = 0;
    }
}
class ThisImage {
    pixels;
    constructor(width, height) {
        this.pixels = new Array(width).fill([]).map(() => new Array(height).fill(new Color()));
    }
    getWidth() {
        return this.pixels.length;
    }
    getHeight() {
        return this.pixels[0].length;
    }
    set(x, y, c) {
        if (this.pixels[x] && this.pixels[x][y]) {
            this.pixels[x][y] = c;
        }
        else {
            console.error(`Invalid indices: x=${x}, y=${y}`);
        }
    }
    get(x, y) {
        return this.pixels[x][y];
    }
}
var imageEditor = new ImageEditor();
imageEditor.run(process.argv);
//# sourceMappingURL=ImageEditor.js.map
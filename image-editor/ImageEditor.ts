import * as fs from 'fs';

class ImageEditor {
    run(args:string[]): void{
    

        try{
            if (args.length < 5) {
                console.log("line 7 usage\n");
                this.usage();
                return;
            }

            var inputFile: string = args[2];
            var outputFile: string = args[3];
            var filter: string = args[4];

            var image: ThisImage = this.read(inputFile);

            if (filter === "grayscale" || filter === "greyscale"){
                if(args.length !=5 ){
                    console.log("line 20 usage\n");
                    this.usage();
                    return
                }
                this.greyscale(image);
            }
            else if( filter === "invert"){
                if(args.length !=5 ){
                    console.log("line 28 usage\n");
                    this.usage();
                    return
                }
                this.invert(image);
            }
            else if( filter === "emboss"){
                if(args.length !=5 ){
                    console.log("line 36 usage\n");
                    this.usage();
                    return
                }
                this.emboss(image);
            }
            else if( filter === "motionblur"){
                if(args.length !=6 ){
                    console.log("line 44 usage\n");
                    this.usage();
                    return
                }
                
                var length: number = -1;
                try{
                    length = parseInt(args[5]);
                }catch(e){
                    console.log(e);
                }
                if(length < 0){
                    console.log("line 56 usage\n");
                    this.usage();
                    return;
                }
                this.motionblur(image, length);
            }
            else{
                console.log("line 63 usage\n");
                this.usage();
            }

            this.write(image, outputFile);

        }catch(e){
            console.log("failed")
            console.error(e);
        }
        
    }
    usage():void{
        console.log("USAGE: java ImageEditor <in-file> <out-file> <grayscale|invert|emboss|motionblur> {motion-blur-length}")
    }

    motionblur(image: ThisImage, length: number){
        if(length < 1){
            return;
        }
        for(var x = 0; x < image.getWidth(); x++){
            for(var y = 0; y < image.getHeight(); y++){
                var curColor: Color = image.get(x, y);
                
                var maxX: number = Math.min(image.getWidth() - 1, x + length -1);
                for(var i = x + 1; i <= maxX; i++){
                    var tmpColor: Color = image.get(i, y);
                    curColor.red += tmpColor.red;
                    curColor.green += tmpColor.green;
                    curColor.blue += tmpColor.blue;
                }
                var delta: number = (maxX - x + 1);
                curColor.red = Math.floor(curColor.red / delta);
                curColor.green = Math.floor(curColor.green / delta);
                curColor.blue = Math.floor(curColor.blue / delta);
            }
            

        }
    }
    
    invert (image: ThisImage) {
        for(var x = 0; x < image.getWidth(); x++){
            for(var y = 0; y < image.getHeight(); y++){
                var curColor: Color = image.get(x,y);

                curColor.red = 255 - curColor.red;
                curColor.green = 255 - curColor.green;
                curColor.blue = 255 - curColor.blue;
            }
        }
    }

    greyscale(image: ThisImage){
        for(var x = 0; x < image.getWidth(); x++){
            for(var y = 0; y < image.getHeight(); y++){
                var curColor: Color = image.get(x,y);

                var grayLevel = Math.floor((curColor.red + curColor.green + curColor.blue) / 3);
                grayLevel = Math.max(0, Math.min(grayLevel, 255));

                curColor.red = grayLevel;
				curColor.green = grayLevel;
				curColor.blue = grayLevel;
            }
        }
    }

    emboss(image: ThisImage){     
        for(var x = image.getWidth() - 1; x >= 0; --x){
            for(var y = image.getHeight() - 1; y >= 0; --y){
                var curColor: Color = image.get(x,y);

                var diff: number = 0;
                if(x > 0 && y > 0){
                    var upLeftColor: Color = image.get(x-1, y-1);
                    if(Math.abs(curColor.red - upLeftColor.red) > Math.abs(diff)){
                        diff = curColor.red - upLeftColor.red;
                    }
                    if(Math.abs(curColor.green - upLeftColor.green) > Math.abs(diff)){
                        diff = curColor.green - upLeftColor.green;
                    }
                    if(Math.abs(curColor.blue - upLeftColor.blue) > Math.abs(diff)){
                        diff = curColor.blue - upLeftColor.blue;
                    }
                }
                var grayLevel: number = (128 + diff);
                grayLevel = Math.floor(Math.max(0, Math.min(grayLevel, 255)));

                curColor.red = grayLevel;
				curColor.green = grayLevel;
				curColor.blue = grayLevel;
            }         
        }
    }

    private read(filePath: string): ThisImage {
        var image: ThisImage;
        
       
        const input: string[] = fs.readFileSync(filePath, 'utf-8').split(/\s+/);

       
        input.shift();

        var width: number = parseInt(input.shift()!);
        var height: number = parseInt(input.shift()!);
        
        image = new ThisImage(width, height);

        input.shift();
        for(var x = 0; x < width; x++){
            for(var y = 0; y < height; y++){
                var color: Color = new Color();
                color.red = parseInt(input.shift()!);
                color.green = parseInt(input.shift()!);
                color.blue = parseInt(input.shift()!);
                image.set(x,y,color);
            }          
        }
        return image;
    }



    private write(image: ThisImage, filePath: string){
        const output: fs.WriteStream = fs.createWriteStream(filePath);

        try{
            output.write("P3\n");
            output.write(`${image.getWidth()} ${image.getHeight()}\n`);
            output.write("255\n");
            for(var x = 0; x < image.getWidth(); x++){
                for(var y = 0; y < image.getHeight(); y++){
                    var color: Color = image.get(x, y);
                    output.write(`${color.red} ${color.green} ${color.blue} `);

                }
            }

        }finally{
            output.close();
        }
    }

}



class Color {
    public red: number;
    public green: number;
    public blue: number;

    constructor(){
        this.red = 0;
        this.green = 0;
        this.blue = 0;
    }
}

class ThisImage {
    private pixels: Color[][];

    constructor(width: number, height: number){
        this.pixels = new Array(width).fill([]).map(() => new Array(height).fill(new Color()));

    }

    getWidth(){
        return this.pixels.length;
    }

    getHeight(){
        return this.pixels[0].length;
    }

    set(x: number, y: number, c: Color){
        if (this.pixels[x] && this.pixels[x][y]) {
            this.pixels[x][y] = c;
        } else {
            console.error(`Invalid indices: x=${x}, y=${y}`)
        
        }
    }

    get(x: number, y: number): Color {
        return this.pixels[x][y];
    }

}

var imageEditor = new ImageEditor();
imageEditor.run(process.argv);

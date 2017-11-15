namespace Vectors{
    export class ScreenVector{
        x:number; y:number
        constructor(_x:number,_y:number){this.x=_x;this.y=_y}        
        Plus(sv:ScreenVector):ScreenVector{
            return new ScreenVector(this.x + sv.x,this.y + sv.y)
        }
        Minus(sv:ScreenVector):ScreenVector{
            return new ScreenVector(this.x - sv.x,this.y - sv.y)
        }
    }

    export class Square {
        
        file:number
        rank:number    
    
        constructor(_file:number,_rank:number){this.file=_file;this.rank=_rank}
    
        Plus(sq:Square):Square{
            return new Square(this.file + sq.file,this.rank + sq.rank)
        }
    
        Minus(sq:Square):Square{
            return new Square(this.file - sq.file,this.rank - sq.rank)
        }
        
    }

    export class Piece {

        kind:string="-"
        color:number=0
        
    }
    
    export class Move {
        
        fsq:Square
        tsq:Square    
        prompiece:Piece=new Piece()
    
        constructor(_fsq:Square,_tsq:Square,_prompiece:Piece=new Piece()){
            this.fsq=_fsq;
            this.tsq=_tsq
            this.prompiece=_prompiece
        }

    }

    export class Vect{
        x:number
        y:number

        sin:number
        cos:number

        constructor(_x:number,_y:number){
            this.x = _x
            this.y = _y
        }

        calctrig(r:number,multrby:number=Math.PI){
            this.sin = Math.sin( r * multrby )
            this.cos = Math.cos( r * multrby )
        }

        r(r:number):Vect{this.calctrig(r);return new Vect(
            this.x * this.cos - this.y * this.sin,
            this.x * this.sin + this.y * this.cos
        )}

        n(l:number):Vect{let c = ( l / this.l() );return new Vect(
            this.x * c,
            this.y * c
        )}

        u():Vect{return this.n(1)}

        p(v:Vect):Vect{return new Vect(
            this.x + v.x,
            this.y + v.y
        )}

        m(v:Vect):Vect{return new Vect(
            this.x - v.x,
            this.y - v.y
        )}

        i():Vect{return new Vect(
            -this.x,
            -this.y
        )}

        s(s:number):Vect{return new Vect(
            this.x * s,
            this.y * s
        )}

        l():number{
            return Math.sqrt( this.x * this.x + this.y * this.y )
        }

    }

    let INFINITE_COORD=1E6    

    export class Polygon{
        vects:Vect[]

        shift:Vect
        size:Vect

        constructor(){
            this.vects=[]
        }

        a(v:Vect):Polygon{
            this.vects.push(v)
            return this
        }

        normalize(overwrite:boolean=true):Polygon{
            let minx=INFINITE_COORD
            let miny=INFINITE_COORD
            let maxx=-INFINITE_COORD
            let maxy=-INFINITE_COORD

            this.vects.map(v=>{
                if (v.x < minx) minx = v.x
                if (v.y < miny) miny = v.y
                if (v.x > maxx) maxx = v.x
                if (v.y > maxy) maxy = v.y
            })

            let min = new Vect(minx, miny)
            let max = new Vect(maxx, maxy)

            this.shift = min.i()
            this.size = max.m(min)

            if(overwrite) {this.vects=this.vects.map(v=>
                v.p(this.shift)
            )}

            return this
        }

        // should only be called on a normalized polygon
        reportSvg(bcol:string="#dfdf3f"):string{            
            let points=this.vects.map(v=> ( v.x + "," + v.y ) ).join(" ")
            return `
<svg width="${this.size.x}" height="${this.size.y}" style="position:absolute;top:0px;left:0px;">
<polygon points="${points}" style="fill:${bcol};stroke-width:0px;">
</svg>
`
        }
    }

    export class Arrow{

        svgorig:Vect
        svg:string

        constructor(from:Vect,to:Vect,params:{[id:string]:any}){            
            let widthfactor=params["widthfactor"] || 0.1
            let handlelength=params["handlelength"] || 0.7
            let headfactor=params["headfactor"] || 0.2
            let constantwidth=params["constantwidth"] || 0.0

            let cw = (constantwidth != 0.0)
            let diff = to.m(from)
            let width = cw? constantwidth : diff.l() * widthfactor
            let bottomright = cw? diff.n(constantwidth / 2.0).r(0.5) : diff.n(width / 2.0).r(0.5)
            let bottomleft = bottomright.i()
            let handle = cw? diff.n(diff.l() - 3.0 * constantwidth) : diff.n(diff.l() * handlelength)
            let headfromright = bottomright.p(handle)
            let headfromleft = bottomleft.p(handle)
            let headtoright = headfromright.p(cw? bottomright.s(2.0) : bottomright.n(diff.l() * headfactor))
            let headtoleft = headfromleft.p(cw? bottomleft.s(2.0) : bottomleft.n(diff.l() * headfactor))

            let pg = new Polygon().
                a(bottomright).
                a(headfromright).
                a(headtoright).
                a(diff).
                a(headtoleft).
                a(headfromleft).
                a(bottomleft).
                normalize()

            this.svgorig=to.m(pg.vects[3])
            this.svg=pg.reportSvg(params["color"])
        }

    }

}
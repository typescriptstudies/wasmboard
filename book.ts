class Annotation {
    annotkey:string="-"
    color:string="#000000"
    bcol:string="#ffffff"
    priority:number=0

    constructor(_annotkey:string="-"){
        this.annotkey=_annotkey
    }

    empty():boolean{
        return this.annotkey=="-"
    }

    setColor(_color:string):Annotation{
        this.color=_color
        return this
    }

    setBcol(_bcol:string):Annotation{
        this.bcol=_bcol
        return this
    }

    setPriority(_priority):Annotation{
        this.priority=_priority
        return this
    }

    parseObj(obj:any):Annotation{
        this.annotkey=obj.annotkey
        this.color=obj.color
        this.bcol=obj.bcol
        this.priority=obj.priority
        return this
    }

    getAnnotStr():string{
        if(this.annotkey=="-") return ""
        return this.annotkey
    }
}

namespace BookUtils {
    export let annotations={
        "!!":new Annotation("!!").setColor("#00ff00").setBcol("#7fff7f").setPriority(10),
        "!":new Annotation("!").setColor("#007f00").setBcol("#afffaf").setPriority(9),
        "!?":new Annotation("!?").setColor("#0000ff").setBcol("#7f7fff").setPriority(5),
        "?!":new Annotation("?!").setColor("#00007f").setBcol("#afafff").setPriority(4),
        "?":new Annotation("?").setColor("#7f0000").setBcol("#ffafaf").setPriority(2),
        "??":new Annotation("??").setColor("#ff0000").setBcol("#ff7f7f").setPriority(1),
        "-":new Annotation("-").setColor("#000000").setBcol("#ffffff").setPriority(0)
    }
}

class BookMove {
    san:string
    annot:Annotation=new Annotation()

    constructor(_san:string){
        this.san=_san
    }

    parseObj(obj:any):BookMove {
        this.san=obj.san
        this.annot=new Annotation().parseObj(obj.annot)
        return this
    }

    setAnnot(annot:Annotation):BookMove{
        this.annot.annotkey=annot.annotkey
        this.annot.color=annot.color
        this.annot.bcol=annot.bcol
        this.annot.priority=annot.priority
        return this
    }
}

class BookPosition {
    fen:string
    moves:{[id:string]:BookMove}={}

    constructor(_fen:string){
        this.fen=_fen
    }

    parseObj(obj:any):BookPosition {
        this.fen=obj.fen
        for(let san in obj.moves){
            this.moves[san]=new BookMove(san).parseObj(obj.moves[san])
        }
        return this
    }

    getMove(san:string):BookMove{
        if(!Misc.isDefined(this.moves[san])){
            this.moves[san]=new BookMove(san)
        }
        return this.moves[san]
    }

    delMove(san:string){
        delete this.moves[san]
    }

    sortedSans():string[]{        
        let keys=Object.keys(this.moves)
        let sorted=keys.sort((a,b)=>{
            let ma=this.moves[a].annot
            let mb=this.moves[b].annot
            return mb.priority-ma.priority
        })   
        return sorted
    }
}

class Book {
    variant:string
    name:string
    positions:{[id:string]:BookPosition}={}

    storeid():string{
        return "book_"+this.variant+"_"+this.name
    }

    truncfen(fen:string):string{
        let parts=fen.split(" ")
        return ( parts[0] + " " + parts[1] + " " + parts[2] + " " + parts[3] )
    }

    constructor(_variant:string,_name:string){
        this.variant=_variant
        this.name=_name

        let stored=localStorage.getItem(this.storeid())

        if(Misc.isDefined(stored)){
            let obj=JSON.parse(stored)
            this.parseObj(obj)
        }

        this.store()
    }

    store(){
        let storeid=this.storeid()
        let json=JSON.stringify(this)
        localStorage.setItem(storeid,json)        
    }

    parseObj(obj:any):Book{
        this.variant=obj.variant
        this.name=obj.name
        for(let fen in obj.positions){
            this.positions[fen]=new BookPosition(fen).parseObj(obj.positions[fen])
        }
        return this
    }

    getPosition(fen:string){
        let tfen=this.truncfen(fen)
        if(!Misc.isDefined(this.positions[tfen])){
            this.positions[tfen]=new BookPosition(tfen)            
        }
        return this.positions[tfen]
    }

    delPosition(fen:string){
        let tfen=this.truncfen(fen)
        delete this.positions[tfen]
    }
}
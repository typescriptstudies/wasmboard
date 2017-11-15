class wBoard extends WasmLoader.WasmLoader implements Loadable{    
    MARGIN(){return Config.PREFERRED_BOARD_SIZE/50}
    SQUARE_SIZE(){return (Config.PREFERRED_BOARD_SIZE-2*this.MARGIN())/this.getNumFiles()}    
    SQUARE_PADDING(){return this.SQUARE_SIZE()/10}
    PIECE_SIZE(){return this.SQUARE_SIZE()-2*this.SQUARE_PADDING()}
    static SQUARE_Z_INDEX=10
    static ARROW_Z_INDEX=50
    static SQUARE_OPACITY=0.2
    static PIECE_Z_INDEX=500
    static LIGHT_SQUARE_COLOR="#efefef"
    static DARK_SQUARE_COLOR="#afafaf"
    static PIECE_FILL_COLORS = ["#000000","#ffffff","#ffff00","#ff0000"]
    static PIECE_STROKE_COLORS = ["#ffffff","#dfdfdf","#afafaf","#afafaf"]    
    static INFO_BCOL="#cfcfaf"
    static INFO_DIV_MARGIN=8
    static INFO_DIV_BCOL="#dfdfaf"
    
    isready:boolean=false
    logbuff:WasmLoader.MemView
    inbuff:WasmLoader.MemView
    inbuff2:WasmLoader.MemView
    outbuff:WasmLoader.MemView
    root:HTMLElement_
    boardcontainer:HTMLElement_

    dragstart:Vectors.ScreenVector
	dragstartst:Vectors.ScreenVector
    dragd:Vectors.ScreenVector	

    onload(){
        this.logbuff=this.memview(this.exports._logbuffaddr(),this.exports._logbuffsize()) 
        this.inbuff=this.memview(this.exports._inbuffaddr(),this.exports._inbuffsize()) 
        this.inbuff2=this.memview(this.exports._inbuff2addr(),this.exports._inbuffsize()) 
        this.outbuff=this.memview(this.exports._outbuffaddr(),this.exports._outbuffsize()) 
        this.exports._initModule()
        this.setVariant("standard")
        this.isready=true
    }
    constructor(){
        super("assets/wasm/wboard/wboard.wasm",{
            "setTempRet0":x=>{},
            "getTempRet0":x=>{},                        
            "_i64Add":x=>{}
        })        
        this.importObject.env["_conslog"]=()=>{            
            if(Globals.gui.logger==undefined){
                //console.log(this.logbuff.toString())
            } else {                
                Globals.gui.log(new Misc.Logitem(this.logbuff.toString()))
            }
        }        
    }    
    setRoot(root:HTMLElement_){
        this.root=root
    }
    load(){
        this.fetchThen(this.onload.bind(this))
    }
    ready():boolean{
        return this.isready
    }
    setFromRawFen(rawfen:string){
        this.inbuff.strCpy(rawfen)
        this.exports._setFromRawFenMain()
    }
    reportBoardRep():string{
        this.exports._reportBoardRepMain()
        return this.outbuff.toString()
    }
    getNumFiles():number{
        return this.exports._getNumFiles()
    }
    getNumRanks():number{
        return this.exports._getNumRanks()
    }
    createRegistries(){
        this.exports._createRegistries()
    }
    reset(){
        this.exports._resetMain()
    }
    doreset(){
        Globals.gui.analyzer.stopanalysis()
        this.reset()
        this.draw()
    }
    initVariant(variant:string){
        let vc=Config.variantToVariantCode[variant]
        this.exports._initVariant(vc)
    }
    initVariantManual(variant:string){
        let rawfen=Config.startRawFens[variant]        
        let vc=Config.variantToVariantCode[variant]
        this.exports._setVariant(vc)        
        this.setFromRawFen(rawfen)      
        this.createRegistries()  
        this.reset()
    }
    setVariant(variant:string){        
        this.initVariant(variant)                
        //this.initVariantManual(variant)                

        this.flip=0
    }
    dosetVariant(variant:string,storepgn:boolean=true){
        this.setVariant(variant)
        this.draw(storepgn)
    }
    reportBoardState():string{
        this.exports._reportBoardState();
        return this.outbuff.toString()
    }
    getLastRank(){return this.getNumRanks()-1}
    getLastFile(){return this.getNumFiles()-1}
    rotateSquare(sq:Vectors.Square,rot:number):Vectors.Square{
        if(rot == 0) {return sq}
        if(rot < 0) {rot = 4 + rot}
        if(rot == 1) {return new Vectors.Square(this.getLastRank() - sq.rank,sq.file)}
        if(rot == 2) {return new Vectors.Square(this.getLastFile() - sq.file,this.getLastRank() - sq.rank)}
        return new Vectors.Square(sq.rank,this.getLastFile() - sq.file)
    }
    sortedLegalSanList():string{
        let t=new Misc.Timer("sorted legal sans",Globals.log)
        this.exports._sortedLegalSanListMain();
        //t.report()
        return this.outbuff.toString()
    }
    sanclicked(san:string,e:Event){
        this.domakeSanMove(san)
    }
    movecontent():HTMLElement_{
        let mcdiv=new HTMLDivElement_().fontFamily("monospace")
        let sans=this.sortedLegalSanList().split("\n")
        sans.map(san=>{
            let a=new HTMLAnchorElement_().
                href("#").
                html(san).
                addEventListener("mousedown",this.sanclicked.bind(this,san))
            mcdiv.appendChild(a)
            mcdiv.appendChild(new HTMLBRElement_())
        })        
        return mcdiv
    }
    reportFen():string{
        this.exports._reportFenMain()
        return this.outbuff.toString()
    }
    setFromFen(fen:string){
        this.inbuff.strCpy(fen)
        this.exports._setFromFenMain()
    }
    dosetFromFen(fen:string){
        this.setFromFen(fen)
        this.draw()
    }
    reportPgn():string{
        this.exports._reportPgnMain()
        return this.outbuff.toString()
    }
    setFromPgn(pgn:string){
        let t=new Misc.Timer("set from pgn",Globals.log)
        this.inbuff.strCpy(pgn)
        this.exports._setFromPgnMain()
        //t.report()
    }
    makeRandomMove():boolean{
        let sanlist=this.sortedLegalSanList()
        if(sanlist.length>0){
            let sans=sanlist.split("\n")
            let r=Math.floor(Math.random()*sans.length)
            if(r>=sans.length) r=0
            this.makeSanMove(sans[r])
            this.draw()
            return true
        }
        return false
    }
    dosetFromPgn(pgn:string){
        this.setFromPgn(pgn)
        this.draw()
    }
    isSquareValid(sq:Vectors.Square):boolean{
        return this.exports._fileRankOkMain(sq.file,sq.rank)>0
    }
    editPgn(key:string,value:string){
        this.inbuff.strCpy(key)
        this.inbuff2.strCpy(value)
        this.exports._editPgn()
    }
    getPgnHeader(key:string):string{
        this.inbuff.strCpy(key)
        this.exports._getPgnHeader()
        return this.outbuff.toString()
    }
    doeditPgn(key:string,value:string){
        this.editPgn(key,value)
        this.draw()
    }
    reportLastMove():Vectors.Move{
        this.exports._reportLastMove()
        if(this.outbuff.view[0]==0) return null
        return new Vectors.Move(
            new Vectors.Square(this.outbuff.view[1],this.outbuff.view[2]),
            new Vectors.Square(this.outbuff.view[3],this.outbuff.view[4])
        )
    }
    reportLastMoveSan():string{
        this.exports._reportLastMoveSan()
        return this.outbuff.toString()
    }
    drawMoveArrow(m:Vectors.Move,div:HTMLDivElement_=null,params:{[id:string]:any}={}){
        let fromsq=this.rotateSquare(m.fsq,this.flip)
        let tosq=this.rotateSquare(m.tsq,this.flip)
        let fromv=new Vectors.Vect(fromsq.file+0.5,fromsq.rank+0.5).s(this.SQUARE_SIZE())
        let tov=new Vectors.Vect(tosq.file+0.5,tosq.rank+0.5).s(this.SQUARE_SIZE())
        if(params["scale"]==undefined){
            params["scale"]=1.0
        }
        if(params["constantwidth"]==undefined){
            params["constantwidth"]=this.SQUARE_SIZE()/7.5*params["scale"]
        }                
        let arrow=new Vectors.Arrow(fromv,tov,params)
        let adiv:HTMLDivElement_=(div==null?new HTMLDivElement_():div)
        adiv.
            position("absolute").
            topPx(arrow.svgorig.y).
            leftPx(arrow.svgorig.x).
            zIndexNumber(wBoard.ARROW_Z_INDEX).
            html(arrow.svg)        
        if(div==null) this.boardcontainer.appendChild(adiv)
    }
    letterToFile(letter:string):number{
        return letter.charCodeAt(0)-"a".charCodeAt(0)
    }    
    algebToMove(algeb:string):Vectors.Move{
        let letterparts=algeb.split(new RegExp("[0-9]+","g"))        
        let ff=this.letterToFile(letterparts[0])
        let tf=this.letterToFile(letterparts[1])
        let numranks=this.getNumRanks()
        let numberparts=algeb.split(new RegExp("[a-z]+","g"))        
        let fr=numranks-parseInt(numberparts[1])
        let tr=numranks-parseInt(numberparts[2])
        let promkind="-"
        if(letterparts.length>2) promkind=numberparts[2]
        let prompiece=new Vectors.Piece()
        prompiece.kind=promkind
        return new Vectors.Move(
            new Vectors.Square(ff,fr),
            new Vectors.Square(tf,tr),
            prompiece
        )
    }
    bookMoveClicked(san:string,e:Event){
        this.domakeSanMove(san)
    }
    annotateMove(san:string,akey:string,e:Event){                
        let bpos=Globals.gui.book.getPosition(this.reportFen())
        if(akey=="delete"){
            bpos.delMove(san)
        } else {
            let move=bpos.getMove(san)
            move.setAnnot(BookUtils.annotations[akey])
        }
        Globals.gui.book.store()
        this.draw()
    }
    showBookPage(){
        if(Globals.gui.book==null) return
        let pos=Globals.gui.book.getPosition(this.reportFen())
        let bcd=Globals.gui.bookcontentdiv
        bcd.html("")
        let bt=new HTMLTableElement_()
        let sorted=pos.sortedSans()        
        for(let sani in sorted){
            let san=sorted[sani]
            let tr=new HTMLTableRowElement_()
            let bm=pos.getMove(san)            
            let annot=bm.annot
            let full=san+" "+annot.getAnnotStr()
            let a=new HTMLLabelElement_().                
                html(full).
                fontSizePx(25).
                cursor("pointer").
                fontWeight(annot.empty()?"normal":"bold").
                opacityNumber(annot.empty()?0.5:1.0).
                color(annot.color).                
                addEventListener("mousedown",this.bookMoveClicked.bind(this,san))
            tr.appendChild(new HTMLTableColElement_().
                paddingPx(5).
                widthPx(100).
                appendChild(a))
            let cspan=new HTMLSpanElement_().opacityNumber(0.8)
            for(let akey in BookUtils.annotations){
                let annot=BookUtils.annotations[akey]
                let ab=new HTMLButtonElement_().
                    onmousedown(this.annotateMove.bind(this,san,akey)).
                    value(akey).
                    backgroundColor(annot.bcol)
                cspan.appendChild(ab)
            }
            let ab=new HTMLButtonElement_().
            onmousedown(this.annotateMove.bind(this,san,"delete")).
            value("X").
            backgroundColor("#ffefef")
        cspan.appendChild(ab)
            tr.appendChild(new HTMLTableColElement_().
                verticalAlign("middle").
                appendChild(cspan)
            )
            bt.appendChild(tr)
        }
        bcd.appendChild(bt)
    }
    trueIndexTwoPlayer(i:number){
        return this.flip==0?i:1-i
    }
    getPlayerNameByIndexTwoPlayer(i:number){
        return this.getPgnHeader(i==0?"Black":"White")
    }
    infodivs:HTMLDivElement_[]=[new HTMLDivElement_(),new HTMLDivElement_()]
    draw(storepgn:boolean=true){                
        let t=new Misc.Timer("wboard draw",Globals.log)
        //Globals.gui.log(new Misc.Logitem(this.reportBoardState()))                
        Globals.gui.fentext.setText(this.reportFen())
        let pgn=this.reportPgn()
        Globals.gui.pgntext.setText(pgn)
        if(storepgn) Globals.gui.state.pgn=pgn
        Globals.gui.tabs.setElement_("moves",this.movecontent())
        this.root.html("")
        let numranks=this.getNumRanks()
        let numfiles=this.getNumFiles()
        let infoboardcontainer=new HTMLDivElement_().
            backgroundColor(wBoard.INFO_BCOL).
            widthPx(numfiles*this.SQUARE_SIZE()+2*this.MARGIN()).
            heightPx(numranks*this.SQUARE_SIZE()+2*this.MARGIN()+2*Config.BOARD_INFO_HEIGHT).
            position("relative")
        let outerboardcontainer=new HTMLDivElement_().
            background("url(assets/images/backgrounds/wood.jpg)").
            widthPx(numfiles*this.SQUARE_SIZE()+2*this.MARGIN()).
            heightPx(numranks*this.SQUARE_SIZE()+2*this.MARGIN()).
            topPx(Config.BOARD_INFO_HEIGHT).
            position("relative")
        let boardcontainer=new HTMLDivElement_().
            background("url(assets/images/backgrounds/wood.jpg)").
            widthPx(numfiles*this.SQUARE_SIZE()).
            heightPx(numranks*this.SQUARE_SIZE()).
            position("relative").
            leftPx(this.MARGIN()).
            topPx(this.MARGIN())
        let rep=this.reportBoardRep().split("")        
        for(let r=0;r<numranks;r++){
            for(let f=0;f<numfiles;f++){
                let sq=new Vectors.Square(f,r)
                let rotsq=this.rotateSquare(sq,this.flip)                
                let index=(r*numfiles+f)*2+r
                let kind=rep[index]
                let color=rep[index+1]
                if(this.isSquareValid(sq)){
                    let sqdiv=new HTMLDivElement_().
                        position("absolute").
                        widthPx(this.SQUARE_SIZE()).
                        heightPx(this.SQUARE_SIZE()).
                        topPx(rotsq.rank*this.SQUARE_SIZE()).
                        leftPx(rotsq.file*this.SQUARE_SIZE()).
                        backgroundColor((f+r)%2==0?wBoard.LIGHT_SQUARE_COLOR:wBoard.DARK_SQUARE_COLOR).
                        opacityNumber(wBoard.SQUARE_OPACITY).
                        zIndexNumber(wBoard.SQUARE_Z_INDEX)
                    boardcontainer.appendChild(sqdiv)
                }
                if(kind!="-"){
                    let svg=RawData.pieces[kind]
                    let colori=parseInt(color)
                    let fillcol=wBoard.PIECE_FILL_COLORS[colori]
                    let strokecol=wBoard.PIECE_STROKE_COLORS[colori]
                    svg = svg.replace("fill=\"#101010\"","fill=\""+fillcol+"\"")
                    svg = svg.replace("fill:#ececec","fill:"+strokecol)
                    svg = svg.replace("stroke:#101010","stroke:"+fillcol)                    
                    let pdiv=new HTMLDivElement_().
                        position("absolute").
                        widthPx(this.PIECE_SIZE()).
                        heightPx(this.PIECE_SIZE()).
                        topPx(rotsq.rank*this.SQUARE_SIZE()+this.SQUARE_PADDING()).
                        leftPx(rotsq.file*this.SQUARE_SIZE()+this.SQUARE_PADDING()).
                        zIndexNumber(wBoard.PIECE_Z_INDEX).
                        draggableBoolean(true).
                        html(svg)
                    pdiv.addEventListener("dragstart",this.piecedragstart.bind(this,sq,pdiv))
                    boardcontainer.appendChild(pdiv)
                }
            }            
        }    
        boardcontainer.addEventListener("mousemove",this.boardmousemove.bind(this))
        boardcontainer.addEventListener("mouseup",this.boardmouseup.bind(this))
        outerboardcontainer.appendChild(boardcontainer)

        let scorediv=new HTMLDivElement_()
        boardcontainer.appendChild(scorediv)
        Globals.gui.analyzer.scorediv=scorediv
        let depthdiv=new HTMLDivElement_()
        boardcontainer.appendChild(depthdiv)
        Globals.gui.analyzer.depthdiv=depthdiv
        let enginearrow=new HTMLDivElement_()
        boardcontainer.appendChild(enginearrow)
        Globals.gui.analyzer.enginearrow=enginearrow
        
        infoboardcontainer.appendChild(outerboardcontainer)
        this.root.appendChild(infoboardcontainer)   
        this.boardcontainer=boardcontainer
        let lastmove=this.reportLastMove()
        if(lastmove!=null){
            this.drawMoveArrow(lastmove)
        }
        this.dragz=wBoard.PIECE_Z_INDEX+1

        this.showBookPage()

        for(let i=0;i<2;i++){
            let leftpx=wBoard.INFO_DIV_MARGIN
            let toppx=i==0?
                wBoard.INFO_DIV_MARGIN
                :
                outerboardcontainer.getBottomPx()+wBoard.INFO_DIV_MARGIN
            let widthpx=outerboardcontainer.getWidthPx()-2*wBoard.INFO_DIV_MARGIN
            let heightpx=Config.BOARD_INFO_HEIGHT-2*wBoard.INFO_DIV_MARGIN                
            this.infodivs[i].
                position("absolute").
                topPx(toppx).
                leftPx(leftpx).
                widthPx(widthpx).
                heightPx(heightpx).
                backgroundColor(wBoard.INFO_DIV_BCOL).
                html("")
            infoboardcontainer.appendChild(this.infodivs[i])

            if(this.getNumPlayers()==2){
                let playerlabel=new HTMLDivElement_().
                    html(this.getPlayerNameByIndexTwoPlayer(this.trueIndexTwoPlayer(i))).
                    fontSizePx(Config.BOARD_INFO_HEIGHT/2).
                    marginLeftPx(10).
                    marginTopPx(5)
                this.infodivs[i].appendChild(playerlabel)
            }
        }

        //t.report()        
    }
    draggedsq:Vectors.Square
    dragz:number
    dragunderway:boolean
    draggedpdiv:HTMLDivElement_
    piecedragstart(sq:Vectors.Square,pdiv:HTMLDivElement_,e:Event){        
        let me=<MouseEvent>e
        me.preventDefault()
        this.draggedsq=sq
        this.dragstart=new Vectors.ScreenVector(me.clientX,me.clientY)            
        this.dragz+=1
        
        this.draggedpdiv=pdiv
        this.dragstartst=new Vectors.ScreenVector(pdiv.getLeftPx(),pdiv.getTopPx())               
        this.dragunderway=true        
    }
    boardmousemove(e:Event){
        let me=<MouseEvent>e          
        if(this.dragunderway){            
            let client=new Vectors.ScreenVector(me.clientX,me.clientY)
            this.dragd=client.Minus(this.dragstart)            
            let nsv=this.dragstartst.Plus(this.dragd)            
            this.draggedpdiv.
                leftPx(nsv.x).
                topPx(nsv.y).
                zIndexNumber(this.dragz)            
        }
    }
    HALF_SQUARE_SIZE_SCREENVECTOR(){return new Vectors.ScreenVector(this.SQUARE_SIZE()/2,this.SQUARE_SIZE()/2)}
    screenvectortosquare(sv:Vectors.ScreenVector):Vectors.Square{
        let f = Math.floor( sv.x / this.SQUARE_SIZE() )
        let r = Math.floor( sv.y / this.SQUARE_SIZE() )
        return new Vectors.Square(f,r)
    }    
    squaretoscreenvector(sq:Vectors.Square):Vectors.ScreenVector{
        let x = sq.file * this.SQUARE_SIZE()
        let y = sq.rank * this.SQUARE_SIZE()
        return new Vectors.ScreenVector(x,y)
    }
    kindToNumber(kind:string):number{
        switch(kind){            
            case 'n':return 110
            case 'b':return 98
            case 'r':return 114
            case 'q':return 113
            case 'k':return 107
            default: return 45
        }        
    }
    makeMove(m:Vectors.Move){
        this.exports._makeMoveMain(
            m.fsq.file,
            m.fsq.rank,
            m.tsq.file,
            m.tsq.rank,
            this.kindToNumber(m.prompiece.kind)
        )
        Globals.gui.positionChanged()
    }
    isMovePromotion(m:Vectors.Move):boolean{
        return this.exports._isMovePromotionMain(m.fsq.file,m.fsq.rank,m.tsq.file,m.tsq.rank)>0
    }
    boardmouseup(e:Event){        
        let me=<MouseEvent>e
        if(this.dragunderway){
            this.dragunderway=false
            let dragdcorr=this.dragd.Plus(this.HALF_SQUARE_SIZE_SCREENVECTOR())
            let dragdnom=dragdcorr
            let dsq=this.screenvectortosquare(dragdnom)
            let dsv=this.squaretoscreenvector(dsq)
            let nsv=this.dragstartst.Plus(dsv)
            this.draggedpdiv.
                leftPx(nsv.x).
                topPx(nsv.y)            
            let fromsqorig=this.rotateSquare(this.draggedsq,this.flip)
            let tosq=this.rotateSquare(fromsqorig.Plus(dsq),-this.flip)
            let m=new Vectors.Move(this.draggedsq,tosq)     
            if(this.isMovePromotion(m)){
                let kind=prompt("Enter promotion piece letter [ n / b / r / q ] !")
                if((kind=="undefined")||(kind==null)||(kind=="")) {}                
                else{
                    m.prompiece.kind=kind
                    this.makeMove(m)
                }
            } else {
                this.makeMove(m)           
            }
            this.draw()
        }
    }
    getNumPlayers(){
        return this.exports._getNumPlayers()
    }
    flip=0
    doflip(){        
        this.flip+=(this.getNumPlayers()==4?1:2)
        if(this.flip>=4){
            this.flip=0
        }
        this.draw()
    }
    tobegin(){this.exports._tobegin()}
    back(){this.exports._back()}
    forward(){this.exports._forward()}
    toend(){this.exports._toend()}
    delete(){this.exports._delete()}
    dotobegin(){this.exports._tobegin();this.draw();Globals.gui.positionChanged()}
    doback(){this.exports._back();this.draw();Globals.gui.positionChanged()}
    doforward(){this.exports._forward();this.draw();Globals.gui.positionChanged()}
    dotoend(){this.exports._toend();this.draw();Globals.gui.positionChanged()}
    dodelete(){this.exports._delete();this.draw();Globals.gui.positionChanged()}
    makeSanMove(san:string){        
        this.inbuff.strCpy(san)
        this.exports._makeSanMoveMain()
    }
    domakeSanMove(san:string){        
        this.makeSanMove(san)
        this.draw()
        Globals.gui.positionChanged()
    }
}
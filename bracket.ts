class Player {
    name:string="?"
    score:string="0"
    fromJson(json){
        this.name=json.name
        this.score=json.score
    }
}

class Game {
    i:number
    result:string="result"
    id:string="gameid"
    lgsjson:any=null
    fromJson(json):Game{
        this.i=json.i
        this.result=json.result        
        this.id=json.id        
        this.lgsjson=json.lgsjson
        return this
    }
}

class PairingState {
    static RESULT_BLUE="#0000ff"
    static RESULT_GREEN="#007f00"
    static RESULT_RED="#ff0000"
    players:Player[]=[new Player(),new Player()]
    games:Game[]=[]
    forfeit:boolean=false
    pairingLabel(i:number){
        return this.players[i].name+" - "+this.players[1-i].name
    }
    resultColors(result:string):{[id:string]:string}{        
        let wcolor=PairingState.RESULT_BLUE
        let bcolor=PairingState.RESULT_BLUE
        if(result=="1-0"){wcolor=PairingState.RESULT_GREEN;bcolor=PairingState.RESULT_RED}
        if(result=="0-1"){wcolor=PairingState.RESULT_RED;bcolor=PairingState.RESULT_GREEN}
        return {"wcolor":wcolor,"bcolor":bcolor}
    }
    pairingLabelHtml(i:number,result:string="draw"){
        let rc=this.resultColors(result)
        return `<span style="color:${rc["wcolor"]};">${this.players[i].name}</span>${Misc.nbr(" - ")}<span style="color:${rc["bcolor"]};">${this.players[1-i].name}</span>`        
    }
}

class Pairing {    
    HEIGHT=60  
    BUTTON_HEIGHT=20
    LABEL_HEIGHT=24
    GAME_HEIGHT=30
    TOTAL_HEIGHT=this.HEIGHT+40      
    WIDTH=220    
    EDIT_SEPARATION=10
    LABEL_WIDTH=150
    LABEL_PADDING=4
    TABLE_SPACING=10
    SCORE_WIDTH=30
    RESULT_WIDTH=100
    TOTAL_WIDTH=this.WIDTH+110
    SHOW_GAMES_WIDTH=600
    BAR_WIDTH=8
    BAR_COLOR="#7f7f7f"
    SELECTED_GAME_BCOL="#afffaf"
    CONTROL_BUTTON_PADDING=5

    state:PairingState=new PairingState()

    selectedgame:number=null

    parentbracket:Bracket=null    
    parents:Pairing[]=[null,null]    
    depth:number=0
    index:number=0    
    child:Pairing=null
    absindex:number=0
    constructor(_parentbracket:Bracket){
        this.parentbracket=_parentbracket        
    }
    fromJson(json){
        for(let i in json.players){
            let playerjson=json.players[i]
            this.state.players[i].fromJson(playerjson)
        }
        this.state.games=[]        
        for(let i in json.games){
            let gamejson=json.games[i]
            this.state.games.push(new Game().fromJson(gamejson))            
            if(gamejson.lgsjson!=null){
                let lg=new LichessGame().fromSerializedJson(gamejson.lgsjson)                
                this.parentbracket.lichessgameregistry[lg.gameid]=lg                
            }
        }
        this.state.forfeit=json.forfeit
    }
    createParents(        
        currentchild:Pairing,
        currentdepth:number,
        maxdepth:number,
        depthcounts:{[id:number]:number},        
    ){        
        if(this.parentbracket.pairingregistry[this.depth]==undefined)
            this.parentbracket.pairingregistry[this.depth]={}
        this.parentbracket.pairingregistry[this.depth][this.index]=this

        if(this.parentbracket.pairingstateregistry[this.depth]==undefined)
            this.parentbracket.pairingstateregistry[this.depth]={}
        this.parentbracket.pairingstateregistry[this.depth][this.index]=this.state

        if(currentdepth>maxdepth) return

        if(depthcounts[currentdepth]==undefined){
            depthcounts[currentdepth]=0
        }
        for(let i=0;i<2;i++){
            this.parents[i]=new Pairing(this.parentbracket)
            this.parents[i].depth=currentdepth            
            this.parents[i].index=depthcounts[currentdepth]
            this.parents[i].child=currentchild
            this.parents[i].createParents(
                this.parents[i],
                currentdepth+1,
                maxdepth,
                depthcounts
            )
            depthcounts[currentdepth]++
        }
    }
    middleIndex():number{
        return (Math.pow(2,this.depth)-1)/2
    }
    distFromMiddle():number{
        return this.index-this.middleIndex()
    }
    distFromMiddleMagnified():number{
        return this.distFromMiddle()*Math.pow(2,(this.parentbracket.rounds-1)-this.depth)
    }
    totalHeigtMagnified():number{
        return this.TOTAL_HEIGHT*Math.pow(2,(this.parentbracket.rounds-2)-this.depth)
    }
    distFromMiddlePx():number{
        return this.distFromMiddleMagnified()*this.TOTAL_HEIGHT
    }
    maxMiddleIndex():number{
        return (Math.pow(2,this.parentbracket.rounds-1)-1)/2
    }
    middlePx():number{
        return this.maxMiddleIndex()*this.TOTAL_HEIGHT
    }
    topPx():number{
        return this.middlePx()+this.distFromMiddlePx()
    }
    leftPx():number{
        return (this.parentbracket.rounds-1-this.depth)*this.TOTAL_WIDTH
    }
    barMiddlePx():number{
        return this.topPx()+this.HEIGHT/2
    }
    barMiddleTopPx():number{
        return this.barMiddlePx()-this.BAR_WIDTH/2
    }
    barWidthPx():number{
        return (this.TOTAL_WIDTH-this.WIDTH)/2
    }
    hasParent():boolean{
        return this.parents[0]!=null
    }
    div:HTMLDivElement_
    labels:HTMLElement_[]=[null,null]
    scores:HTMLElement_[]=[null,null]
    gamescores:HTMLElement_[]=[]
    gameids:HTMLElement_[]=[]

    showgamesbutton:HTMLButtonElement_

    playerpressed(handle:string,e:Event){
        Globals.gui.players.load(handle)
    }

    createElement(){
        this.div=new HTMLDivElement_().
            position("absolute").
            topPx(this.topPx()).
            leftPx(this.leftPx()).
            widthPx(this.WIDTH).
            heightPx(this.HEIGHT).
            backgroundColor("#00ff00")
        this.parentbracket.bracketdiv.appendChild(this.div)
        if(this.child!=null){
            let childbar=new HTMLDivElement_().
                position("absolute").
                topPx(this.barMiddleTopPx()).
                leftPx(this.leftPx()+this.WIDTH).
                widthPx(this.barWidthPx()).
                heightPx(this.BAR_WIDTH).
                backgroundColor(this.BAR_COLOR)        
            this.parentbracket.bracketdiv.appendChild(childbar)
        }        
        if(this.hasParent()){
            let parentbar=new HTMLDivElement_().
                position("absolute").
                topPx(this.barMiddleTopPx()).
                leftPx(this.leftPx()-this.barWidthPx()).
                widthPx(this.barWidthPx()).
                heightPx(this.BAR_WIDTH).
                backgroundColor(this.BAR_COLOR)        
            this.parentbracket.bracketdiv.appendChild(parentbar)
            let joinbar=new HTMLDivElement_().
                position("absolute").
                topPx(this.barMiddlePx()-this.totalHeigtMagnified()/2-this.BAR_WIDTH/2).
                leftPx(this.leftPx()-this.barWidthPx()-this.BAR_WIDTH).
                widthPx(this.BAR_WIDTH).
                heightPx(this.totalHeigtMagnified()).
                backgroundColor(this.BAR_COLOR)        
            this.parentbracket.bracketdiv.appendChild(joinbar)
        }        
        this.parents.map(p=>{
            if(p!=null) p.createElement()
        })                
        for(let i=0;i<2;i++){
            let player=this.state.players[i]            
            this.labels[i]=(this.parentbracket.editmode?
                new HTMLInputElement_().
                    setText(player.name).
                    backgroundColor("#efefef")
                :
                new HTMLLabelElement_().
                    setText(player.name).
                    paddingTopPx(this.LABEL_PADDING).
                    paddingLeftPx(this.LABEL_PADDING).
                    cursor("pointer").
                    addEventListener("mousedown",this.playerpressed.bind(this,player.name))                
            )
            this.labels[i].position("absolute").
                topPx((i*2+1)*this.HEIGHT/4-this.LABEL_HEIGHT/2).
                leftPx(3).
                widthPx(this.LABEL_WIDTH).
                heightPx(this.LABEL_HEIGHT)
            this.div.appendChild(this.labels[i])
            this.scores[i]=(this.parentbracket.editmode?
                new HTMLInputElement_().
                    setText(player.score).
                    backgroundColor("#efefef")
                :
                new HTMLLabelElement_().
                    setText(player.score).
                    paddingTopPx(this.LABEL_PADDING).
                    paddingLeftPx(this.LABEL_PADDING)
            )
            this.scores[i].position("absolute").
                topPx((i*2+1)*this.HEIGHT/4-this.LABEL_HEIGHT/2).
                leftPx(8+this.LABEL_WIDTH).
                widthPx(this.SCORE_WIDTH).
                heightPx(this.LABEL_HEIGHT)                
            this.div.appendChild(this.scores[i])
        }        
        this.showgamesbutton=<HTMLButtonElement_>new HTMLButtonElement_().
            value(this.state.forfeit?"Forfeit":">").            
            onmousedown(this.showgamesbuttonpressed.bind(this)).
            position("absolute").
            topPx(this.HEIGHT/2-this.BUTTON_HEIGHT/2).
            leftPx(this.LABEL_WIDTH+this.SCORE_WIDTH+15).
            heightPx(this.BUTTON_HEIGHT).
            zIndexNumber(100)
        this.div.appendChild(this.showgamesbutton)
    }
    newgamebuttonpressed(i:number,e:Event){
        let game=new Game()
        game.i=i
        this.savegames()        
        this.state.games.push(game)        
        this.parentbracket.save()        
        this.showgames()
    }
    gameScoreForPlayer(g:Game,i:number):number{
        let scorewhite=0.5
        let scoreblack=0.5        
        if(g.result=="1-0"){scorewhite=1;scoreblack=0}
        if(g.result=="0-1"){scorewhite=0;scoreblack=1}
        let truei=g.i==0?i:1-i
        return truei==0?scorewhite:scoreblack
    }
    updateMatchScore(){
        for(let i=0;i<2;i++){
            this.state.players[i].score="0"
            for(let gi=0;gi<this.state.games.length;gi++){
                let score=this.gameScoreForPlayer(this.state.games[gi],i)                
                this.state.players[i].score=""+(parseFloat(this.state.players[i].score)+score)
            }            
        }
    }
    updateMatchScoreGui(){
        this.updateMatchScore()
        for(let i=0;i<2;i++) (<HTMLInputElement_>this.scores[i]).setText(this.state.players[i].score)
    }
    checkgameloaded(gi:number,lg:LichessGame,li:Misc.Logitem){
        this.selectedgame=gi
        Globals.gui.log(li)
        Globals.gui.tabs.setSelected("bracket")          
        let lgsjson=lg.toSerializedJson()
        this.state.games[gi].lgsjson=lgsjson
        this.state.games[gi].id=lg.gameid
        this.state.games[gi].result=lg.result
        this.parentbracket.lichessgameregistry[lg.gameid]=lg
        this.updateMatchScoreGui()       
        this.showgames()
    }
    loadgameerror(gi:number,lg:LichessGame){        
        Globals.gui.log(lg.errorLogitem())
        let lgsjson=this.state.games[gi].lgsjson
        if(lgsjson!=null){
            lg.fromSerializedJson(lgsjson)
            this.checkgameloaded(gi,lg,lg.localAvailableLogitem())            
        }
    }
    checkgamebuttonpressed(gi:number,e:Event){              
        let gameid=(<HTMLInputElement_>this.gameids[gi]).getText()
        let lg=new LichessGame(gameid)
        Globals.gui.tabs.setSelected("log")          
        Globals.gui.log(lg.infoLogitem())
        lg.loadThen(
            this.checkgameloaded.bind(this,gi,lg,lg.okLogitem()),
            this.loadgameerror.bind(this,gi,lg)
        )
    }
    deletegamebuttonpressed(gi:number,e:Event){        
        this.selectedgame=null
        let newgames:Game[]=[]
        for(let i=0;i<this.state.games.length;i++){
            if(i!=gi) newgames.push(this.state.games[i])
        }
        this.state.games=newgames
        this.updateMatchScoreGui()       
        this.showgames()
    }
    showgames(){
        this.parentbracket.showngames=null
        this.showgamesbuttonpressed.bind(this)()
    }
    opengamebuttonpressed(gi:number,e:Event){        
        this.selectedgame=gi
        this.showgames()
        let id=this.state.games[gi].id
        let gui=Globals.gui
        gui.gameidtext.setText(id)
        gui.gameloadbuttonpressed(null)
    }   
    savegames(){        
        for(let gi=0;gi<this.state.games.length;gi++){
            this.state.games[gi].result=(<HTMLInputElement_>this.gamescores[gi]).getText()
            this.state.games[gi].id=(<HTMLInputElement_>this.gameids[gi]).getText()
        }        
    }
    savegamesbuttonpressed(e:Event){        
        this.savegames()
        this.updateMatchScoreGui()
        this.showgamesbuttonpressed.bind(this)()
    }
    forfeitbuttonpressed(e:Event){        
        this.state.forfeit=!this.state.forfeit
        this.parentbracket.showngames=null
        this.parentbracket.save()
        this.parentbracket.createElement()
    }
    forfeitbutton:HTMLButtonElement_
    createEditTable():HTMLTableElement_{
        let edittable:HTMLTableElement_        

        edittable=<HTMLTableElement_>new HTMLTableElement_().
            borderCollapse("separate").
            borderSpacingPx(this.TABLE_SPACING).                                
            backgroundColor("#ffff7f")
        
        let et_tr1=new HTMLTableRowElement_()
        let et_td11=new HTMLTableColElement_()
        let et_td12=new HTMLTableColElement_()
        et_tr1.appendChilds([et_td11,et_td12])
        let et_tr2=new HTMLTableRowElement_()            

        let savegamesbutton=new HTMLButtonElement_().
            value("Save games").            
            onmousedown(this.savegamesbuttonpressed.bind(this))            

        et_td11.appendChilds([savegamesbutton])

        this.forfeitbutton=new HTMLButtonElement_().
            value(this.state.forfeit?"Unforfeit":"Forfeit").            
            onmousedown(this.forfeitbuttonpressed.bind(this))            

        et_td12.appendChilds([this.forfeitbutton])

        for(let i=0;i<2;i++){
            let newgamebutton=new HTMLButtonElement_().
                value("New "+this.state.pairingLabel(i)).            
                onmousedown(this.newgamebuttonpressed.bind(this,i))

            let et_td2_=new HTMLTableColElement_()
            et_tr2.appendChild(et_td2_)
            
            et_td2_.appendChilds([
                newgamebutton
            ])
        }

        edittable.appendChilds([et_tr1,et_tr2])

        return edittable
    }

    edittabletop:HTMLTableElement_
    edittablebottom:HTMLTableElement_

    createGameTable():HTMLTableElement_{
        let numgames=this.state.games.length

        let gamepanel=<HTMLTableElement_>new HTMLTableElement_().
            position("absolute").topPx(
                this.topPx()+this.showgamesbutton.getComputedBottomPx()+this.EDIT_SEPARATION/2+
                (this.parentbracket.editmode?this.edittabletop.getComputedHeightPx()+this.EDIT_SEPARATION:0)
            ).
            leftPx(this.leftPx()+this.showgamesbutton.getComputedLeftPx()-this.EDIT_SEPARATION).
            borderCollapse("separate").
            borderSpacingPx(this.TABLE_SPACING).                                
            backgroundColor("#ffff7f")

        this.gamescores=[]
        this.gameids=[]
        for(let gi=0;gi<numgames;gi++){
            let tr=new HTMLTableRowElement_()

            let game=this.state.games[gi]

            let checkgamebutton=new HTMLButtonElement_().
            value("Check").            
            onmousedown(this.checkgamebuttonpressed.bind(this,gi))

            let deletegamebutton=new HTMLButtonElement_().
                value("Delete").            
                onmousedown(this.deletegamebuttonpressed.bind(this,gi))

            let opengamebutton=new HTMLButtonElement_().
                value("Open").            
                onmousedown(this.opengamebuttonpressed.bind(this,gi))
            
            let gamescoreinput=this.parentbracket.editmode?
                new HTMLInputElement_().
                    setText(game.result).
                    widthPx(this.RESULT_WIDTH)
                :
                new HTMLDivElement_().
                    html(Misc.nbr(game.result)).
                    paddingLeftPx(8).
                    paddingRightPx(8)

            this.gamescores.push(gamescoreinput)

            let gameidinput=new HTMLInputElement_().
                setText(game.id).
                widthPx(this.RESULT_WIDTH)

            this.gameids.push(gameidinput)

            let pairinglabel=new HTMLDivElement_().
                paddingTopPx(this.CONTROL_BUTTON_PADDING).
                paddingBottomPx(this.CONTROL_BUTTON_PADDING).
                html(this.state.pairingLabelHtml(game.i,game.result))                

            tr.appendChilds([
                new HTMLTableColElement_().
                    paddingLeftPx(this.CONTROL_BUTTON_PADDING).
                    paddingRightPx(this.CONTROL_BUTTON_PADDING).
                    appendChild(opengamebutton),
                new HTMLTableColElement_().
                    paddingLeftPx(this.CONTROL_BUTTON_PADDING).
                    paddingRightPx(this.CONTROL_BUTTON_PADDING).
                    appendChild(pairinglabel),
                new HTMLTableColElement_().
                    paddingLeftPx(this.CONTROL_BUTTON_PADDING).
                    paddingRightPx(this.CONTROL_BUTTON_PADDING).
                    appendChild(gamescoreinput)
            ])

            if(this.parentbracket.editmode) tr.appendChilds([          
                new HTMLTableColElement_().
                    paddingLeftPx(this.CONTROL_BUTTON_PADDING).
                    paddingRightPx(this.CONTROL_BUTTON_PADDING).
                    appendChild(gameidinput),
                new HTMLTableColElement_().
                    paddingLeftPx(this.CONTROL_BUTTON_PADDING).
                    paddingRightPx(this.CONTROL_BUTTON_PADDING).
                    appendChild(checkgamebutton),
                new HTMLTableColElement_().
                    paddingLeftPx(this.CONTROL_BUTTON_PADDING).
                    paddingRightPx(this.CONTROL_BUTTON_PADDING).
                    appendChild(deletegamebutton)
            ])
            
            if(this.selectedgame!=null){
                if(gi==this.selectedgame){
                    tr.backgroundColor(this.SELECTED_GAME_BCOL)
                }
            }

            gamepanel.appendChild(tr)
        }
        return gamepanel
    }
    showgamesbuttonpressed(e:Event){                
        this.parentbracket.save()        
        if((e!=undefined)&&(e==null)) this.parentbracket.showngames=null        
        let show=this.parentbracket.showngames!=this        
        this.parentbracket.showngames=show?this:null
        let sgd=this.parentbracket.showgamediv                
        sgd.html("").widthPx(0).heightPx(0).leftPx(0).topPx(0).zIndexNumber(200)
        
        if(!show) return

        let etdivtop=new HTMLDivElement_().
            position("absolute").
            topPx(this.topPx()+this.showgamesbutton.getComputedBottomPx()+this.EDIT_SEPARATION/2).
            leftPx(this.leftPx()+this.showgamesbutton.getComputedLeftPx()-this.EDIT_SEPARATION)

        let etdivbottom=new HTMLDivElement_().
            position("absolute").            
            leftPx(this.leftPx()+this.showgamesbutton.getComputedLeftPx()-this.EDIT_SEPARATION)

        if(this.parentbracket.editmode){
            this.edittabletop=this.createEditTable()
            this.edittablebottom=this.createEditTable()

            etdivtop.appendChild(this.edittabletop)
            etdivbottom.appendChild(this.edittablebottom)

            sgd.appendChild(etdivtop)
            sgd.appendChild(etdivbottom)
        }

        let gamepanel=this.createGameTable()

        sgd.appendChild(gamepanel)

        if(this.parentbracket.editmode){
            etdivbottom.
                topPx(gamepanel.getComputedBottomPx()+this.EDIT_SEPARATION)
        }
    }
}

class Bracket {    
    DIV_BUFFER_SIZE=1200

    rounds:number
    maindiv:HTMLDivElement_
    bracketdiv:HTMLDivElement_
    showgamediv:HTMLDivElement_
    showngames:Pairing=null
    root:Pairing

    tabroot:HTMLDivElement_
    dragstart:Vectors.ScreenVector
    scrollstart:Vectors.ScreenVector

    pairingstateregistry:{[id:number]:{[id:number]:PairingState}}={}
    pairingregistry:{[id:number]:{[id:number]:Pairing}}={}
    lichessgameregistry:{[id:string]:LichessGame}={}
    name="default"

    dragunderway:boolean=false

    tabdragstart(e:Event){
        e.preventDefault()
        let me=<MouseEvent>e
        this.dragstart=new Vectors.ScreenVector(me.clientX,me.clientY)            
        this.scrollstart=new Vectors.ScreenVector(this.tabroot.getScrollLeft(),this.tabroot.getScrollTop())            
        this.dragunderway=true        
    }

    tabmousemove(e:Event){  
        let me=<MouseEvent>e      
        if(this.dragunderway){
            let dragd=new Vectors.ScreenVector(me.clientX,me.clientY).Minus(this.dragstart)            
            let scrollcurrent=this.scrollstart.Minus(dragd)
            this.tabroot.scrollTop(scrollcurrent.y)
            this.tabroot.scrollLeft(scrollcurrent.x)
        }
    }

    tabmouseup(e:Event){
        if(this.dragunderway){
            this.dragunderway=false
        }
    }

    constructor(_rounds:number=5){        
        this.rounds=_rounds
        this.root=new Pairing(this)
        this.root.createParents(
            this.root,
            1,
            this.rounds-1,
            {}
        )        
        this.maindiv=new HTMLDivElement_()

        this.tabroot=Globals.gui.tabs.getTabDivById("bracket")
        this.tabroot.draggableBoolean(true).
            addEventListener("dragstart",this.tabdragstart.bind(this)).
            addEventListener("mousemove",this.tabmousemove.bind(this)).
            addEventListener("mouseup",this.tabmouseup.bind(this))
    }

    editmode:boolean=true

    hidecontrols:boolean=false

    createElement():HTMLElement_{        
        //localStorage.setItem(this.storeid(),"null")
        this.maindiv.html("")
        let savebutton=new HTMLButtonElement_().
            value("Save").            
            onmousedown(this.savebuttonpressed.bind(this))            
        let loadbutton:HTMLElement_
        loadbutton=new HTMLButtonElement_().
            value("Load").            
            onmousedown(this.loadbuttonpressed.bind(this))            
        let importbutton=new HTMLButtonElement_().
            value("Import").            
            onmousedown(this.importbuttonpressed.bind(this))            
        if(this.storedjson()==null){
            loadbutton=new HTMLLabelElement_().setText("Nothing saved yet")
        }
        let freezebutton=new HTMLButtonElement_().
            value("Freeze").            
            onmousedown(this.freezebuttonpressed.bind(this))            
        let editbutton=new HTMLButtonElement_().
            value("Edit").            
            onmousedown(this.editbuttonpressed.bind(this))            
        if(!this.hidecontrols) {
            if(this.editmode){
                this.maindiv.appendChilds([                                                
                    freezebutton,
                    savebutton,
                    loadbutton,
                    importbutton
                ])            
            } else {
                this.maindiv.appendChilds([
                    editbutton,
                    loadbutton
                ])
            }
        }
        this.bracketdiv=new HTMLDivElement_().position("relative")        
        this.root.createElement()        
        this.showgamediv=new HTMLDivElement_().
            position("absolute")
        this.bracketdiv.appendChild(this.showgamediv)
        this.maindiv.appendChild(this.bracketdiv)
        this.maindiv.widthPx(this.root.TOTAL_WIDTH*this.rounds+this.DIV_BUFFER_SIZE)
        this.maindiv.heightPx(this.root.TOTAL_HEIGHT*Math.pow(2,this.rounds-1)+this.DIV_BUFFER_SIZE)
        return this.maindiv
    }
    storedjson():string{
        let item=localStorage.getItem(this.storeid())
        if((item==undefined)||(item==null)||(item=="null")) return null
        return item
    }
    storeid():string{
        return "bracket_"+this.name
    }
    json:string
    save(){
        if(!this.editmode) return
        for(let ditem in this.pairingregistry)
        for(let iitem in this.pairingregistry[ditem])
        {
            let pairing=this.pairingregistry[ditem][iitem]
            for(let i=0;i<2;i++){
                let player=this.pairingstateregistry[ditem][iitem].players[i]
                player.name=(<HTMLInputElement_>pairing.labels[i]).getText()
                player.score=(<HTMLInputElement_>pairing.scores[i]).getText()
            }
        }
        this.json=JSON.stringify(this.pairingstateregistry,null,1)   
        localStorage.setItem(this.storeid(),this.json)        
        Globals.gui.srctext.setText(this.json)
    }
    savebuttonpressed(e:Event){
        this.save()        
        Globals.gui.tabs.setSelected("src")
    }    
    load(setjson:string=null){        
        let storedjson=setjson!=null?setjson:this.storedjson()        
        if(storedjson!=null){
            let json=JSON.parse(storedjson)
            for(let ditem in json)
            for(let iitem in json[ditem])
            {
                let pairingjson=json[ditem][iitem]
                this.pairingregistry[ditem][iitem].fromJson(pairingjson)                
            }
            Globals.gui.srctext.setText(storedjson)
        }
        this.createElement()        
    }
    loadbuttonpressed(e:Event){
        this.load()        
        this.createElement()
    }    
    importbuttonpressed(e:Event){
        this.load(Globals.gui.srctext.getText())        
        this.save()
        this.createElement()
    }    
    freezebuttonpressed(e:Event){                
        this.save()        
        this.showngames=null
        this.editmode=false
        this.createElement()
    }
    editbuttonpressed(e:Event){
        this.editmode=true
        this.showngames=null
        this.createElement()
    }
}
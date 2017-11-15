namespace Config {
    export let GuiConfig=new DomConfig().
        add("CONTROL_BUTTON_WIDTH",new SizePx(24)).
        add("PADDING",new SizePx(3)).
        add("CONTROL_BUTTON_PADDING_LEFT",new SizePx(3))
}

class GUIState{    
    _variant:string
    _pgn:string
    variantid():string{
        return "guistate_variant"
    }
    pgnid():string{
        return "guistate_"+this._variant+"_pgn"
    }
    set variant(variant:string){
        this._variant=variant
        localStorage.setItem(this.variantid(),variant)        
        this.pgn=localStorage.getItem(this.pgnid())
    }    
    set pgn(pgn:string){        
        this._pgn=pgn
        localStorage.setItem(this.pgnid(),pgn)                
    }

    hasVariant():boolean{                
        return ((this._variant!=undefined)&&(this._variant!=null)&&(this._variant!="null"))
    }
    hasPgn():boolean{
        return ((this._pgn!=undefined)&&(this._pgn!=null)&&(this._pgn!="null"))
    }

    constructor(){        
        this.variant=localStorage.getItem("guistate_variant")        
    }
}

class GUI{
    config=Config.GuiConfig

    LABEL_BCOL="#efefef"    

    book:Book=null
    bracket:Bracket=null
    players:LichessUsers=new LichessUsers()
    setup:Setup=new Setup()
    bookdiv:HTMLDivElement_
    bookcontentdiv:HTMLDivElement_
    controlpanel:HTMLDivElement_
    econtrolpanel:HTMLDivElement_

    state:GUIState=new GUIState()
    root:HTMLDivElement_    
    wboardroot:HTMLDivElement_
    saninputtext:HTMLInputElement_
    tabs:TabPane_
    logger:Misc.Logger
    fentext:HTMLInputElement_
    pgntext:HTMLTextAreaElement_
    pgnkeytext:HTMLInputElement_
    pgnvaluetext:HTMLInputElement_
    pgndiv:HTMLDivElement_
    srcdiv:HTMLDivElement_
    srctext:HTMLTextAreaElement_
    enginediv:HTMLDivElement_
    gamediv:HTMLDivElement_
    gameidtext:HTMLInputElement_
    bracketdiv:HTMLDivElement_
    variantcombo:ComboBox_

    analyzer:Analysis.Analyzer

    constructor(){
        this.root=new HTMLDivElement_()        
        document.body.appendChild(this.root.e)
    }

    log(li:Misc.Logitem){
        this.logger.log(li)
        //let text="<pre>"+this.logger.reportText()+"</pre>"        
        let html=this.logger.reportHtml()
        this.tabs.getTabDivById("log").fontFamily("monospace")
        this.tabs.setContent("log",html)
    }

    logstr(str:string){
        this.log(new Misc.Logitem(str))
    }

    // create elements
    createEngineControlPanel(){
        this.econtrolpanel=new HTMLDivElement_()
        
        let startenginebutton=new HTMLButtonElement_().
            value(">").            
            onmousedown(this.startenginebuttonpressed.bind(this)).
            widthPx(this.config.getPx("CONTROL_BUTTON_WIDTH")).            
            paddingLeftPx(this.config.getPx("CONTROL_BUTTON_PADDING_LEFT"))
        let makeanalyzedmovebutton=new HTMLButtonElement_().
            value("*").            
            onmousedown(this.makeanalyzedmovebuttonpressed.bind(this,false)).
            widthPx(this.config.getPx("CONTROL_BUTTON_WIDTH")).
            paddingLeftPx(this.config.getPx("CONTROL_BUTTON_PADDING_LEFT"))
        let makeandstoreanalyzedmovebutton=new HTMLButtonElement_().
            value("*!").            
            onmousedown(this.makeanalyzedmovebuttonpressed.bind(this,true)).
            widthPx(this.config.getPx("CONTROL_BUTTON_WIDTH")).
            paddingLeftPx(this.config.getPx("CONTROL_BUTTON_PADDING_LEFT"))
        let stopenginebutton=new HTMLButtonElement_().
            value("_").            
            onmousedown(this.stopenginebuttonpressed.bind(this)).
            widthPx(this.config.getPx("CONTROL_BUTTON_WIDTH")).
            paddingLeftPx(this.config.getPx("CONTROL_BUTTON_PADDING_LEFT"))
        let restartenginebutton=new HTMLButtonElement_().
            value("!").            
            onmousedown(this.restartenginebuttonpressed.bind(this)).
            widthPx(this.config.getPx("CONTROL_BUTTON_WIDTH")).
            paddingLeftPx(this.config.getPx("CONTROL_BUTTON_PADDING_LEFT"))
        let connectenginebutton=new HTMLButtonElement_().
            value("Connect").            
            onmousedown(this.connectenginebuttonpressed.bind(this))
        let rndbutton=new HTMLButtonElement_().
            value("Rnd").            
            onmousedown(this.rndbuttonpressed.bind(this))
        this.econtrolpanel.appendChilds([
            startenginebutton,
            makeanalyzedmovebutton,
            makeandstoreanalyzedmovebutton,
            stopenginebutton,
            restartenginebutton,
            connectenginebutton,
            rndbutton
        ])
    }
    createControlPanel(){
        this.controlpanel=new HTMLDivElement_()        
        this.variantcombo=new ComboBox_().
            setOptions(Config.variantToDisplayName).
            setSelected(this.state.hasVariant()?this.state._variant:"standard").
            onChange(this.variantChanged.bind(this))
        let flipbutton=new HTMLButtonElement_().
            value("F").
            onmousedown(this.flipbuttonpressed.bind(this)).
            widthPx(this.config.getPx("CONTROL_BUTTON_WIDTH"))
        let resetbutton=new HTMLButtonElement_().
            value("R").
            onmousedown(this.resetbuttonpressed.bind(this)).
            widthPx(this.config.getPx("CONTROL_BUTTON_WIDTH"))
        let tobeginbutton=new HTMLButtonElement_().
            value("|<").
            onmousedown(this.tobeginbuttonpressed.bind(this)).
            widthPx(this.config.getPx("CONTROL_BUTTON_WIDTH")).
            paddingLeftPx(this.config.getPx("CONTROL_BUTTON_PADDING_LEFT"))
        let backbutton=new HTMLButtonElement_().
            value("<").
            onmousedown(this.backbuttonpressed.bind(this)).
            widthPx(this.config.getPx("CONTROL_BUTTON_WIDTH")).
            paddingLeftPx(this.config.getPx("CONTROL_BUTTON_PADDING_LEFT"))
        let forwardbutton=new HTMLButtonElement_().
            value(">").
            onmousedown(this.forwardbuttonpressed.bind(this)).
            widthPx(this.config.getPx("CONTROL_BUTTON_WIDTH"))
        let toendbutton=new HTMLButtonElement_().
            value(">|").
            onmousedown(this.toendbuttonpressed.bind(this)).
            widthPx(this.config.getPx("CONTROL_BUTTON_WIDTH")).
            paddingLeftPx(this.config.getPx("CONTROL_BUTTON_PADDING_LEFT"))
        let deletebutton=new HTMLButtonElement_().
            value("X").
            onmousedown(this.deletebuttonpressed.bind(this)).
            widthPx(this.config.getPx("CONTROL_BUTTON_WIDTH")).
            paddingLeftPx(this.config.getPx("CONTROL_BUTTON_PADDING_LEFT"))
        this.saninputtext=new HTMLInputElement_()
        this.saninputtext.widthPx(50)
        let makesanbutton=new HTMLButtonElement_().
            value("M").            
            onmousedown(this.makesanbuttonpressed.bind(this))
        let setfromfenbutton=new HTMLButtonElement_().
            value("F").            
            onmousedown(this.setfromfenbuttonpressed.bind(this))
        let setfrompgnbutton=new HTMLButtonElement_().
            value("P").            
            onmousedown(this.setfrompgnbuttonpressed.bind(this))
        this.controlpanel.appendChilds([
            this.variantcombo,
            flipbutton,
            resetbutton,
            tobeginbutton,
            backbutton,
            forwardbutton,
            toendbutton,
            deletebutton,
            this.saninputtext,
            makesanbutton,
            setfromfenbutton,
            setfrompgnbutton
        ])
    }
    createTabs(){
        this.tabs=new TabPane_(
            "tabs",
            Config.PREFERRED_TAB_SIZE,
            Config.TOTAL_BOARD_HEIGHT,
            [
                new Tab("pgn","Pgn"),
                new Tab("book","Book"),            
                new Tab("moves","Moves"),            
                new Tab("engine","Engine"),
                new Tab("game","Game"),            
                new Tab("bracket","Bracket"),            
                new Tab("players","Players"),            
                new Tab("setup","Setup"),
                new Tab("src","Src"),            
                new Tab("log","Log")
            ]
        )

        this.createPgnDiv()
        this.tabs.setElement_("pgn",this.pgndiv)

        this.createEngineDiv()
        this.tabs.setElement_("engine",this.enginediv)

        this.createBookDiv()
        this.tabs.setElement_("book",this.bookdiv)

        this.createGameDiv()
        this.tabs.setElement_("game",this.gamediv)

        this.tabs.setElement_("players",this.players.createElement())

        this.tabs.setElement_("setup",this.setup.createElement())

        this.createBracketDiv()
        this.tabs.setElement_("bracket",this.bracketdiv)

        this.createSrcDiv()
        this.tabs.setElement_("src",this.srcdiv)
    }
    createEngineDiv(){
        this.enginediv=new HTMLDivElement_
        this.enginediv.fontFamily("monospace")
    }
    createPgnDiv(){
        this.pgndiv=new HTMLDivElement_
        this.pgntext=new HTMLTextAreaElement_()
        this.pgntext.
            widthPx(Config.PREFERRED_TAB_SIZE-25).
            heightPx(Config.TOTAL_BOARD_HEIGHT-65)
        this.pgnkeytext=new HTMLInputElement_
        this.pgnvaluetext=new HTMLInputElement_        
        this.pgnvaluetext.widthPx(465)
        let pgneditbutton=new HTMLButtonElement_().
            value("Edit").
            onmousedown(this.pgneditbuttonpressed.bind(this))
        this.pgndiv.appendChild(new HTMLLabelElement_().setText("Header name:").
            backgroundColor(this.LABEL_BCOL).            
            paddingPx(this.config.getPx("PADDING"))
        )
        this.pgndiv.appendChild(this.pgnkeytext)
        this.pgndiv.appendChild(new HTMLLabelElement_().setText("Header value:").
            backgroundColor(this.LABEL_BCOL).
            paddingPx(this.config.getPx("PADDING"))
        )
        this.pgndiv.appendChild(this.pgnvaluetext)
        this.pgndiv.appendChild(pgneditbutton)
        this.pgndiv.appendChild(this.pgntext)
    }
    createBookDiv(){
        this.bookdiv=new HTMLDivElement_()        
        let addmovebutton=new HTMLButtonElement_().
            value("+ M").
            onmousedown(this.addmovebuttonpressed.bind(this,false,false,null))
        let addmovebackbutton=new HTMLButtonElement_().
            value("+ M <").
            onmousedown(this.addmovebuttonpressed.bind(this,true,false,null))
        let delbookmovebutton=new HTMLButtonElement_().
            value("- M <").
            onmousedown(this.addmovebuttonpressed.bind(this,true,true,null))
        let delallmovesbutton=new HTMLButtonElement_().
            value("- P").
            onmousedown(this.delallmovesbuttonpressed.bind(this))
        this.bookdiv.appendChilds([
            addmovebutton,
            addmovebackbutton,
            delbookmovebutton,
            delallmovesbutton
        ])
        this.bookcontentdiv=new HTMLDivElement_()
        this.bookdiv.appendChild(this.bookcontentdiv)
    }
    createGameDiv(){
        this.gamediv=new HTMLDivElement_()
        let gameidlabel=new HTMLLabelElement_().setText("Lichess game id : ")
        this.gameidtext=new HTMLInputElement_()
        this.gameidtext.widthPx(300)
        let gameloadbutton=new HTMLButtonElement_().
            value("Load").            
            onmousedown(this.gameloadbuttonpressed.bind(this))            
        this.gamediv.appendChilds([
            gameidlabel,
            this.gameidtext,
            gameloadbutton
        ])
    }
    createBracketDiv(){
        this.bracketdiv=new HTMLDivElement_()        
    }
    createSrcDiv(){
        this.srcdiv=new HTMLDivElement_
        this.srctext=new HTMLTextAreaElement_()
        this.srctext.
            widthPx(Config.PREFERRED_TAB_SIZE-25).
            heightPx(Config.TOTAL_BOARD_HEIGHT-45)
        this.srcdiv.appendChild(this.srctext)
    }

    startup:any
    firstdraw:boolean=true

    draw(){
        //////////////////////////////////////////////////////////

        this.startup=Globals.startup.asJson()

        //////////////////////////////////////////////////////////

        this.logger=new Misc.Logger()        

        //////////////////////////////////////////////////////////

        this.root.
            html("")

        //////////////////////////////////////////////////////////
        // table

        let table=new HTMLTableElement_().
            borderCollapse("separate").
            borderSpacingPx(6).
            borderPx(3).
            borderStyle("solid").
            borderColor("#dfdfdf").
            marginPx(5).
            backgroundColor("#efefef")

        let tr1=new HTMLTableRowElement_()        
        let tr2=new HTMLTableRowElement_()
        let tr3=new HTMLTableRowElement_()

        table.appendChilds([tr1,tr2,tr3])

        let td11=new HTMLTableColElement_()
        let td12=new HTMLTableColElement_().verticalAlign("top")       
        
        tr1.appendChilds([td11,td12])      

        let td21=new HTMLTableColElement_()
        let td22=new HTMLTableColElement_()
        
        tr2.appendChilds([td21,td22])

        let td31=new HTMLTableColElement_()

        tr3.appendChilds([td31])

        //////////////////////////////////////////////////////////

        this.wboardroot=new HTMLDivElement_()
        td11.appendChild(this.wboardroot)

        this.createTabs()
        td12.appendChild(this.tabs)

        this.createControlPanel()
        td21.appendChild(this.controlpanel)        
        
        this.fentext=new HTMLInputElement_()
        this.fentext.widthPx(Config.PREFERRED_TAB_SIZE).fontFamily("monospace")
        td22.appendChild(this.fentext)

        this.createEngineControlPanel()        
        td31.appendChild(this.econtrolpanel)

        //////////////////////////////////////////////////////////

        this.analyzer=new Analysis.Analyzer()
        this.analyzer.log=this.log.bind(this)

        //////////////////////////////////////////////////////////

        this.bracket=new Bracket()
        this.bracket.load()

        //////////////////////////////////////////////////////////

        setTimeout((e=>{
            wboard.setRoot(gui.wboardroot)    
            this.setVariant()            
            wboard.draw()            
            this.bracketdiv.appendChild(this.bracket.createElement())
            this.root.appendChild(table)                    
            Globals.log=this.log.bind(this)            
            this.doStartup()
        }).bind(this),0)

        //////////////////////////////////////////////////////////
    }
    bracketjsonasset:TextAsset=new TextAsset("bracket.json")
    brackeJsonLoaded(){
        this.bracket.hidecontrols=true
        this.bracket.editmode=false
        this.bracket.load(this.bracketjsonasset.text)
    }
    doStartup(){
        if(this.firstdraw){
            this.firstdraw=false
            let su=this.startup            
            if(Misc.isDefined(su.selectedTab)){
                this.tabs.setSelected(su.selectedTab)
            }
            if(Misc.isDefined(su.setBracketJson)){
                if(su.setBracketJson){
                    new AssetLoader().
                        add(this.bracketjsonasset).
                        setcallback(this.brackeJsonLoaded.bind(this)).
                        load()    
                }
            }
        }
    }
    startDefaultEngine(){
        let defaultengine=this.setup.defaultengines[this.state._variant]        
        if(defaultengine!="[None]"){
            this.analyzer.startengine(defaultengine)
        }
    }
    setVariant(variant:string=this.state._variant):boolean{
        if(!Misc.isDefined(variant)) variant="standard"
        if(!Config.isSupportedVariant(variant)) return false     
        this.analyzer.stopanalysis()   
        this.variantcombo.setSelected(variant)
        this.state.variant=variant
        Globals.wboard.dosetVariant(variant,false)
        if(this.state.hasPgn()){            
            Globals.wboard.dosetFromPgn(this.state._pgn)
        }        
        this.book=new Book(this.state._variant,"default")
        Globals.wboard.draw()
        this.startDefaultEngine()
        return true
    }
    variantChanged(e:Event){
        let t=<any>e.target
        let variant=t.selectedOptions[0].value        
        this.setVariant(variant)
    }    
    flipbuttonpressed(e:Event){
        Globals.wboard.doflip()
    }
    resetbuttonpressed(e:Event){
        Globals.wboard.doreset()
    }
    tobeginbuttonpressed(e:Event){
        Globals.wboard.dotobegin()
    }
    backbuttonpressed(e:Event){
        Globals.wboard.doback()
    }
    forwardbuttonpressed(e:Event){
        Globals.wboard.doforward()
    }
    toendbuttonpressed(e:Event){
        Globals.wboard.dotoend()
    }
    deletebuttonpressed(e:Event){
        Globals.wboard.dodelete()
    }
    makesanbuttonpressed(e:Event){
        let san=this.saninputtext.getText()
        this.saninputtext.setText("")
        Globals.wboard.domakeSanMove(san)
    }
    setfromfenbuttonpressed(e:Event){
        let fen=this.fentext.getText()        
        Globals.wboard.dosetFromFen(fen)
    }
    setfrompgnbuttonpressed(e:Event){
        let pgn=this.pgntext.getText()        
        Globals.wboard.dosetFromPgn(pgn)
    }
    pgneditbuttonpressed(e:Event){
        let key=this.pgnkeytext.getText()        
        this.pgnkeytext.setText("")
        let value=this.pgnvaluetext.getText()        
        this.pgnvaluetext.setText("")
        Globals.wboard.doeditPgn(key,value)
    }
    oldtabid:string=null
    startenginebuttonpressed(e:Event){
        this.oldtabid=this.tabs.selid
        this.analyzer.analyze()
    }
    positionChanged(){
        if(this.analyzer.enginerunning){
            this.analyzer.stopanalysis()
            this.analyzer.analyze()
        }
    }
    makeanalyzedmovebuttonpressed(store:boolean,e:Event){        
        this.analyzer.makeanalyzedmove()
        if(store){
            this.addmovebuttonpressed.bind(this,false,false,"!")()
        }
        this.positionChanged()
    }
    stopenginebuttonpressed(e:Event){
        this.analyzer.stopanalysis()                
        if(this.oldtabid!=null) Globals.gui.tabs.setSelected(this.oldtabid)
    }
    restartenginebuttonpressed(e:Event){
        this.startDefaultEngine()
    }
    connectenginebuttonpressed(e:Event){
        this.analyzer.connect()
    }
    addmovebuttonpressed(back:boolean,del:boolean,annotkey:string,e:Event){        
        let san=Globals.wboard.reportLastMoveSan()               
        if(san!=""){
            if(back) Globals.wboard.doback(); else Globals.wboard.back()
            let fen=Globals.wboard.reportFen()            
            if(!back) Globals.wboard.forward()
            let pos=this.book.getPosition(fen)
            let move=pos.getMove(san)
            if(annotkey!=null) move.setAnnot(BookUtils.annotations[annotkey])
            if(del) pos.delMove(san)
            this.book.store()
            Globals.wboard.draw()
        }
    }
    delallmovesbuttonpressed(e:Event){
        let fen=Globals.wboard.reportFen()
        this.book.delPosition(fen)
        this.book.store()
        Globals.wboard.draw()
    }
    rndon:boolean=false
    makerandom(){
        if(this.rndon){
            if(Globals.wboard.makeRandomMove()) setTimeout(this.makerandom.bind(this),100)
            else this.rndon=false
        }
    }
    rndbuttonpressed(e:Event){
        if(this.rndon){
            this.rndon=false
        } else {
            this.rndon=true
            this.makerandom()
        }
    }    
    ongameload(lg:LichessGame){        
        this.log(lg.okLogitem())

        let variant=lg.getHeader("GameVariant")
        if(!this.setVariant(variant)){
            this.log(new Misc.Logitem("error setting up game: unsupported variant "+variant).error())
            return
        }

        let moves=lg.moves
        this.logstr(moves)        
        Globals.wboard.setFromPgn(moves)

        for(let key in lg.pgnHeaders){
            let value=lg.getHeader(key)
            Globals.wboard.editPgn(key,value)
        }

        Globals.wboard.draw()
        this.tabs.setSelected("pgn")
    }
    gameloaderror(lg:LichessGame){        
        this.log(lg.errorLogitem())
        let storedlg=this.bracket.lichessgameregistry[lg.gameid]
        if(storedlg!=undefined){
            this.log(lg.localAvailableLogitem())
            this.ongameload(storedlg)
        }
    }
    gameloadbuttonpressed(e:Event){
        let gameid=this.gameidtext.getText()        
        let lg=new LichessGame(gameid)

        this.gameidtext.setText("")        
        this.tabs.setSelected("log")        
        this.log(lg.infoLogitem())

        lg.loadThen(
            this.ongameload.bind(this,lg),
            this.gameloaderror.bind(this,lg)
        )
    }
}
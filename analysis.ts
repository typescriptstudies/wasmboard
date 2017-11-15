namespace Analysis {

export class ThinkingOutput{
    prot:string
    variant:string

    bestmove:string=""
    scorecp:boolean=true
    scoremate:boolean=false
    score=0
    depth=0

    constructor(_prot:string="uci",_variant:string="standard"){
        this.prot=_prot
        this.variant=_variant
    }

    parseuci(buffer:string){
        let parts=buffer.split(new RegExp("^info "))
        if(parts.length<2){
            //console.log("uci string without info "+buffer)
            return
        }            
        let infoparts=parts[1].split(" ")            
        let parsekey:boolean=true
        let key:string
        let pvitems:string[]=[]
        for(let i in infoparts){                
            if(parsekey){
                key=infoparts[i]
                parsekey=false
            }
            else {
                let value=infoparts[i]
                if(key=="score"){
                    if(value=="cp"){
                        this.scorecp=true
                    } else if(value=="mate") {
                        this.scoremate=true
                    } else {
                        this.score=parseInt(value)
                        parsekey=true
                    }
                }
                else if(key=="depth"){
                    this.depth=parseInt(value)
                    parsekey=true
                }
                else if(key=="pv")                    
                {
                    pvitems.push(value)
                }
                else{
                    parsekey=true
                }
            }
        }
        if(pvitems.length>0){
            this.bestmove=pvitems[0]
        }
    }

    parse(buffer:string){
        let buffercleaned=buffer.replace(new RegExp("\\r","g"),"")
        if(this.prot=="uci"){
            this.parseuci(buffercleaned)
        }
    }
}

class EngineMessage{
    action:string
    name:string
    command:string
    buffer:string
    available:string[]
    _action(_action):EngineMessage{this.action=_action;return this}    
    _command(_command):EngineMessage{this.command=_command;return this}    
    _name(_name):EngineMessage{this.name=_name;return this}    
    parseJson(data:string):EngineMessage{
        let pd=JSON.parse(data)
        this.action=pd.action
        this.available=pd.available
        this.buffer=pd.buffer
        return this
    }
}

export class Analyzer {
    static POS_EVAL_MOVE_COL = "#00ff00"
    static NEG_EVAL_MOVE_COL = "#ff0000"
    static ENGINE_DEPTH_COL = "#0000ff"

    log:(logitem:Misc.Logitem)=>void

    depthdiv:HTMLDivElement_
    scorediv:HTMLDivElement_
    enginearrow:HTMLDivElement_

    ws:WebSocket
    connectid:number=0
    logws(msg:string,connectid:number,details:string=""){
        this.log(new Misc.Logitem("[ "+connectid+" ] "+msg+(details!=""?" : ":"")+details))
    }
    sendem(em:EngineMessage,connectid:number){
        if(!Misc.isDefined(this.ws)) return

        let json=JSON.stringify(em)
        this.logws("sending message",connectid,json)
        
        /////////////////////////////////////////////
        this.ws.send(json)
        /////////////////////////////////////////////        
    }    
    startengine(name:string){        
        let em=new EngineMessage().
            _action("start").
            _name(name)
        this.connect(em,null)        
    }
    tolog:Misc.Logger=new Misc.Logger()
    thinkingoutput:ThinkingOutput
    getenginecolor():string{
        return (this.thinkingoutput.score>0?Analyzer.POS_EVAL_MOVE_COL:Analyzer.NEG_EVAL_MOVE_COL)
    }
    displayenginescore(){
        let ecol=this.getenginecolor()
        this.depthdiv.
        position("absolute").
        topPx(Config.PREFERRED_BOARD_SIZE/5.0).
        leftPx(Config.PREFERRED_BOARD_SIZE/5.0).
        zIndexNumber(wBoard.ARROW_Z_INDEX+1).
        fontSizePx(Globals.wboard.SQUARE_SIZE()).
        color(Analyzer.ENGINE_DEPTH_COL).
        html(""+this.thinkingoutput.depth)
        this.scorediv.
        position("absolute").
        topPx(Config.PREFERRED_BOARD_SIZE/3.0).
        leftPx(Config.PREFERRED_BOARD_SIZE/3.0).
        zIndexNumber(wBoard.ARROW_Z_INDEX+1).
        fontSizePx(Globals.wboard.SQUARE_SIZE()*2.0).
        color(ecol).
        html(""+this.thinkingoutput.score)
    }
    available:string[]=[]
    onmessage(connectid:number,e:MessageEvent){
        //this.logws("connection sent",connectid,e.data)
        let em=new EngineMessage().parseJson(e.data)        
        if(em.action=="available"){
            this.available=em.available            
            this.logws("available",connectid,em.available.join(", "))            
            Globals.gui.startDefaultEngine()
            Globals.gui.setup.onanalyzerconnect()            
        }
        if(em.action=="thinkingoutput"){
            this.tolog.log(new Misc.Logitem(em.buffer))            
            Globals.gui.enginediv.html(
                "<pre>"+
                this.tolog.items.slice().reverse().map(x=>x.content).join("\n")+
                "</pre>"
            )
            if(this.enginerunning){            
                let to=this.thinkingoutput                
                to.parse(em.buffer)
                let algeb=this.thinkingoutput.bestmove
                if(algeb!=""){
                    let m=Globals.wboard.algebToMove(algeb)
                    
                    let color=this.getenginecolor()
                    let params={"color":color,"scale":1.5}
                    Globals.wboard.drawMoveArrow(m,this.enginearrow,params)
                    this.displayenginescore()                    
                }
            }
        }
    }
    wsopen(connectid:number,em:EngineMessage=null,e:Event){
        this.logws("connection opened",connectid)
        if(em!=null) this.sendem(em,connectid)     
    }
    connect(em:EngineMessage=new EngineMessage()._action("sendavailable"),tabid:string="log"){
        if(tabid!=null) Globals.gui.tabs.setSelected(tabid)
        this.connectid++
        this.logws("connecting to server...",this.connectid)
        this.ws=new WebSocket("ws://localhost:9000/ws")        
        this.ws.onopen=this.wsopen.bind(this,this.connectid,em)
        this.ws.onmessage=this.onmessage.bind(this,this.connectid)
    }
    enginerunning:boolean=false
    analyze(){
        Globals.gui.tabs.setSelected("engine")        
        this.thinkingoutput=new ThinkingOutput()
        this.stopanalysis()
        let fen=Globals.wboard.reportFen()
        let em=new EngineMessage().
            _action("issue").
            _command(`position fen ${fen}\ngo infinite\n`)
        this.sendem(em,this.connectid)
        this.enginerunning=true
    }
    stopanalysis(){        
        this.enginerunning=false        
        let em=new EngineMessage().
            _action("issue").
            _command(`stop`)
        this.sendem(em,this.connectid)        
    }
    makeanalyzedmove(){        
        if(this.thinkingoutput==undefined){
            this.log(new Misc.Logitem("no thinking output"))
            return
        }
        let algeb=this.thinkingoutput.bestmove
        if(algeb!=""){
            let m=Globals.wboard.algebToMove(algeb)
            
            Globals.wboard.makeMove(m)
            Globals.wboard.draw()
        }
    }
}
        
}
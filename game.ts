class LichessGame {
    gameid:string

    constructor(_gameid:string=""){
        this.gameid=_gameid
    }

    url():string{
        let url="https://lichess.org/api/game/"+this.gameid+"?with_moves=1"
        return url
    }

    onLoad(){
        this.fromTextAsset(this.textasset)

        this.callback()
    }

    errorLogitem():Misc.Logitem{
        return new Misc.Logitem("error loading game: "+this.url()+" timed out").error()
    }

    infoLogitem():Misc.Logitem{
        return new Misc.Logitem("loading game "+this.url()).info()
    }

    okLogitem():Misc.Logitem{
        return new Misc.Logitem("game loaded "+this.url()).ok()
    }

    localAvailableLogitem():Misc.Logitem{
        return new Misc.Logitem("local version is available for "+this.url()).info()
    }

    textasset:TextAsset
    callback:any
    
    loadThen(_callback:any,errorcallback:any){   
        this.callback=_callback             
        this.textasset=new TextAsset(this.url())
        new AssetLoader().
            add(this.textasset).
            setcallback(this.onLoad.bind(this)).
            seterrorcallback(errorcallback).
            load()    
    }

    pgnHeaders:{[id:string]:string}={}
    moves:string=""
    result:string="result"

    fromSerializedJson(json):LichessGame{
        this.gameid=json.gameid
        this.pgnHeaders=json.pgnHeaders
        this.moves=json.moves
        this.result=json.result
        return this
    }

    toSerializedJson():any{
        let json:any={}
        json.gameid=this.gameid
        json.pgnHeaders=this.pgnHeaders
        json.moves=this.moves
        json.result=this.result
        return json
    }

    fromJson(json):LichessGame{
        this.pgnHeaders={}

        let moves=json.moves        
        this.moves=moves

        let variant=json.variant
        this.pgnHeaders["GameVariant"]=variant        
        let players=json.players
        let white=players.white
        let black=players.black        
        this.pgnHeaders["White"]=white.userId
        this.pgnHeaders["Black"]=black.userId
        let gameid=json.id
        this.gameid=gameid
        this.pgnHeaders["GameId"]=gameid        
        let gameurl=json.url
        this.pgnHeaders["Url"]=gameurl
        let rated=json.rated
        this.pgnHeaders["Rated"]=""+rated
        let speed=json.speed
        this.pgnHeaders["Speed"]=speed
        let createdat=json.createdAt
        this.pgnHeaders["CreatedAt"]=new Date(createdat).toLocaleString()
        let lastmoveat=json.lastMoveAt
        this.pgnHeaders["LastMoveAt"]=new Date(lastmoveat).toLocaleString()
        let duration=lastmoveat-createdat
        this.pgnHeaders["Duration"]=Misc.formatDurationMilliSeconds(duration)
        let status=json.status
        this.pgnHeaders["Status"]=status
        let turns=json.turns
        this.pgnHeaders["Turns"]=turns
        let winner=json.winner
        this.pgnHeaders["Winner"]=winner        
        this.result="draw"
        if(winner=="white"){
            this.pgnHeaders["WinnerName"]=white.userId
            this.result="1-0"
        }
        if(winner=="black"){
            this.pgnHeaders["WinnerName"]=black.userId
            this.result="0-1"
        }

        return this
    }

    fromTextAsset(textasset:TextAsset):LichessGame{
        this.fromJson(textasset.asJson())
        return this
    }

    getHeader(key:string):string{
        let value=this.pgnHeaders[key]
        return value
    }
}

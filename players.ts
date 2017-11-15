class LichessUserData {    
    atomicrating:number=1500    
    atomicgames:number=0    
    membersince:number
    followers:number
}

class LichessUser {
    handle:string="Anonymous"

    data:LichessUserData=new LichessUserData()

    constructor(_handle:string){
        this.handle=_handle
    }

    textasset:TextAsset
    callback:any

    url():string{
        let url="https://lichess.org/api/user/"+this.handle
        return url
    }

    loadThen(_callback:any,errorcallback:any){   
        this.callback=_callback             
        this.textasset=new TextAsset(this.url())
        new AssetLoader().
            add(this.textasset).
            setcallback(this.onLoad.bind(this)).
            seterrorcallback(errorcallback).
            load()    
    }

    onLoad(){
        this.fromTextAsset(this.textasset)

        this.callback()
    }

    errorLogitem():Misc.Logitem{
        return new Misc.Logitem("error loading user: "+this.url()+" timed out").error()
    }

    infoLogitem():Misc.Logitem{
        return new Misc.Logitem("loading user "+this.url()).info()
    }

    okLogitem():Misc.Logitem{
        return new Misc.Logitem("user loaded "+this.url()).ok()
    }

    fromTextAsset(textasset:TextAsset):LichessUser{
        return this.fromJsonText(textasset.text)
    }

    fromJsonText(storedjsontext:string):LichessUser{        
        return this.fromJson(JSON.parse(storedjsontext))
    }

    fromJson(json:any):LichessUser{
        let perfs=json.perfs
        if(Misc.isDefined(perfs)){
            let atomic=perfs.atomic
            if(Misc.isDefined(atomic)){
                this.data.atomicrating=atomic.rating
                this.data.atomicgames=atomic.games
            }
        }
        //console.log(json)
        this.data.membersince=json.createdAt
        this.data.followers=json.nbFollowers
        return this
    }
}

namespace PlayerUtils {

    export class paddedTd extends HTMLTableColElement_{
        constructor(){
            super()
            this.paddingPx(3)
            this.backgroundColor("#afffaf")
        }
    }

}

import paddedTd=PlayerUtils.paddedTd

class LichessUsers {
    users:{[id:string]:LichessUserData}={}
    maindiv:HTMLDivElement_
    table:HTMLTableElement_
    name:string="players"

    textasset:TextAsset

    storeid():string{
        return "lichessusers_"+this.name
    }

    constructor(){
        let storedjsontext=localStorage.getItem(this.storeid())
        if(Misc.isDefined(storedjsontext)){
            this.fromJsonText(storedjsontext)
        }
        this.maindiv=new HTMLDivElement_().
            backgroundColor("#ffffaf")
    }

    fromJsonText(storedjsontext:string):LichessUsers{
        this.users=JSON.parse(storedjsontext)
        return this
    }

    sortedHandles():string[]{        
        let keys=Object.keys(this.users)
        let sorted=keys.sort((a,b)=>{
            let ua=this.users[a]
            let ub=this.users[b]
            return ub.atomicrating - ua.atomicrating
        }) 
        return sorted
    }

    createElement():HTMLElement_{        
        this.maindiv.html("")
        this.table=new HTMLTableElement_().
            borderCollapse("separate").
            borderSpacingPx(3)
            let htr=new HTMLTableRowElement_()
        htr.appendChilds([
            new paddedTd().html("Rank"),
            new paddedTd().html("Player"),
            new paddedTd().html("Rating"),
            new paddedTd().html("Games"),
            new paddedTd().html("Followers"),
            new paddedTd().html("Member since"),
            new paddedTd().html("Load")
        ])
        this.table.appendChild(htr)

        let i=1
        
        this.sortedHandles().map(handle=>{
            let tr=new HTMLTableRowElement_()
            let data=this.users[handle]                        
            tr.appendChilds([
                new paddedTd().html(""+i+"."),
                new paddedTd().html(handle),
                new paddedTd().html(""+data.atomicrating),
                new paddedTd().html(""+data.atomicgames),
                new paddedTd().html(""+data.followers),
                new paddedTd().html(""+new Date(data.membersince).toLocaleString()),
                new paddedTd().appendChild(new HTMLButtonElement_().
                    value("Load").
                    onmousedown(this.loade.bind(this,handle))
                )
            ])  
            this.table.appendChild(tr)
            i++
        })

        this.maindiv.appendChild(this.table)
        return this.maindiv
    }

    onplayerload(lu:LichessUser){
        Globals.gui.log(lu.okLogitem())    
        Globals.gui.tabs.setSelected("players")
        this.addSaveDraw(lu)
    }

    onplayererror(lu:LichessUser){
        Globals.gui.log(lu.errorLogitem())
    }

    load(handle:string){
        let lu=new LichessUser(handle)

        Globals.gui.tabs.setSelected("log")
        Globals.gui.log(lu.infoLogitem())

        lu.loadThen(
            this.onplayerload.bind(this,lu),
            this.onplayererror.bind(this,lu)
        )
    }

    loade(handle:string,e:Event){
        this.load(handle)
    }

    save(){
        let jsontext=JSON.stringify(this.users)
        localStorage.setItem(this.storeid(),jsontext)
    }

    add(lu:LichessUser){
        this.users[lu.handle]=lu.data
    }

    addSave(lu:LichessUser){
        this.add(lu)
        this.save()
    }

    addSaveDraw(lu:LichessUser){
        this.addSave(lu)
        this.createElement()
    }
}
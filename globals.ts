namespace Globals {

    export let gui=new GUI()
    export let wboard=new wBoard()
    export let startup=new TextAsset("startup.json")

    export let log:(li:Misc.Logitem)=>void=function(li:Misc.Logitem){}
    
}
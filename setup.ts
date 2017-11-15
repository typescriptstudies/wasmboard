namespace SetupUtils {
    export class paddedTd extends HTMLTableColElement_ {
        constructor(){
            super()
            this.paddingPx(3).
            backgroundColor("#ffffaf")
        }
    }
    export function createPaddedHeadTd():paddedTd{
        return new paddedTd().backgroundColor("#afffaf")
    }
}

import ptd=SetupUtils.paddedTd
import phtd=SetupUtils.createPaddedHeadTd

class Setup {
    defaultengines:{[id:string]:string}={}
    availableengines:string[]=["[None]"]
    maindiv:HTMLDivElement_        
    constructor(){
        this.maindiv=new HTMLDivElement_()
        let stored=localStorage.getItem("setup")
        Config.supportedVariants().map(variant=>{
            this.defaultengines[variant]="[None]"
        })
        if(Misc.isDefined(stored)){
            let storedjson=JSON.parse(stored)
            this.defaultengines=storedjson.defaultengines
            this.availableengines=storedjson.availableengines
        }
    }
    onanalyzerconnect(){
        Globals.gui.tabs.setSelected("setup")
        this.availableengines=Globals.gui.analyzer.available
        this.availableengines.unshift("[None]")
        this.save()
        this.createElement()
    }
    connectbuttonpressed(e:Event){
        Globals.gui.analyzer.connect()
    }
    save(){
        localStorage.setItem("setup",JSON.stringify(this))
    }
    defaultEngineChanged(variant:string,e:Event){
        let t=<any>e.target
        let selectedengine=t.selectedOptions[0].value    
        this.defaultengines[variant]=selectedengine
        this.save()
        this.createElement()
    }
    createElement():HTMLElement_{        
        this.maindiv.html("")
        let connectbutton=new HTMLButtonElement_().
            value("Connect to engine server").            
            onmousedown(this.connectbuttonpressed.bind(this))     
        this.maindiv.appendChilds([
            connectbutton
        ])       
        let variantenginetable=new HTMLTableElement_().
            borderCollapse("separate").
            borderSpacingPx(3)            
        variantenginetable.appendChild(new HTMLTableRowElement_().appendChilds([
            phtd().html("Variant"),
            phtd().html("Select default engine"),
            phtd().html("Current default engine")
        ]))
        Config.supportedVariants().map(variant=>{
            let tr=new HTMLTableRowElement_()
            let defaultengine=this.defaultengines[variant]            
            let selectdefaultcombo=new ComboBox_().
                setOptionsFromList(this.availableengines).
                setSelected(defaultengine).
                onChange(this.defaultEngineChanged.bind(this,variant))
            tr.appendChilds([
                new ptd().html(Config.variantToDisplayName[variant]),
                new ptd().appendChild(selectdefaultcombo),
                new ptd().html(defaultengine)
            ])
            variantenginetable.appendChild(tr)
        })
        this.maindiv.appendChilds([
            variantenginetable
        ])
        return this.maindiv
    }
}
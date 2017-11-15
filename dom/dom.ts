// custom wrapper for the DOM

abstract class DomConfigElement {

}

class SizePx extends DomConfigElement {
    px:number
    constructor(_px:number){
        super()
        this.px=_px
    }
}

class DomConfig {
    elements:{[id:string]:DomConfigElement}={}
    add(id:string,e:DomConfigElement):DomConfig{
        this.elements[id]=e
        return this
    }
    getPx(id:string):number{
        return (<SizePx>this.elements[id]).px
    }
}

abstract class HTMLElement_{
    e:HTMLElement
    kind:string
    constructor(_kind:string){
        this.kind=_kind
        this.e=document.createElement(_kind)
    }
    setAttribute(name:string,value:string):HTMLElement_{
        this.e.setAttribute(name,value)
        return this
    }
    removeAttribute(name:string):HTMLElement_{
        this.e.removeAttribute(name)
        return this
    }
    appendChild(child:HTMLElement_):HTMLElement_{
        this.e.appendChild(child.e)
        return this
    }
    appendChilds(childs:HTMLElement_[]):HTMLElement_{
        childs.map(child=>this.appendChild(child))
        return this
    }
    addEventListener(type:string,listener:EventListenerOrEventListenerObject):HTMLElement_{
        this.e.addEventListener(type,listener)
        return this
    }
    get innerHTML():string{
        return this.e.innerHTML
    }
    set innerHTML(content:string){
        this.e.innerHTML=content
    }
    html(content:string):HTMLElement_{
        this.innerHTML=content
        return this
    }  
    getComputedStyle(){
        return getComputedStyle(this.e)
    }
    getComputedHeightPx():number{
        return this.getPx(this.getComputedStyle().height)
    }
    getComputedWidthPx():number{
        return this.getPx(this.getComputedStyle().width)
    }
    getComputedTopPx():number{
        return this.getPx(this.getComputedStyle().top)
    }
    getComputedLeftPx():number{
        return this.getPx(this.getComputedStyle().left)
    }
    getComputedBottomPx():number{
        return this.getComputedTopPx()+this.getComputedHeightPx()
    }
    getComputedRightPx():number{
        return this.getComputedLeftPx()+this.getComputedWidthPx()
    }
    scrollTop(scrolltop:number):HTMLElement_{
        this.e.scrollTop=scrolltop
        return this
    }    
    getScrollTop():number{
        return this.e.scrollTop
    }    
    scrollLeft(scrollleft:number):HTMLElement_{
        this.e.scrollLeft=scrollleft
        return this
    }    
    getScrollLeft():number{
        return this.e.scrollLeft
    }    
    fontSize(fontsize:string):HTMLElement_{
        this.e.style.fontSize=fontsize
        return this
    }
    fontSizePx(fontsizepx):HTMLElement_{
        return this.fontSize(fontsizepx+"px")
    }
    fontFamily(fontfamily:string):HTMLElement_{
        this.e.style.fontFamily=fontfamily
        return this
    }
    fontWeight(fontweight:string):HTMLElement_{
        this.e.style.fontWeight=fontweight
        return this
    }
    borderCollapse(bordercollapse:string){
        this.e.style.borderCollapse=bordercollapse
        return this
    }
    border(border:string){
        this.e.style.border=border
        return this
    }
    borderPx(borderpx:number){
        return this.border(borderpx+"px")
    }
    borderTopStyle(bordertopstyle:string){
        this.e.style.borderTopStyle=bordertopstyle
        return this
    }
    borderLeftStyle(borderleftstyle:string){
        this.e.style.borderLeftStyle=borderleftstyle
        return this
    }
    borderBottomStyle(borderbottomstyle:string){
        this.e.style.borderBottomStyle=borderbottomstyle
        return this
    }
    borderRightStyle(borderrightstyle:string){
        this.e.style.borderBottomStyle=borderrightstyle
        return this
    }
    borderStyle(borderstyle:string){
        this.e.style.borderTopStyle=borderstyle
        this.e.style.borderLeftStyle=borderstyle
        this.e.style.borderBottomStyle=borderstyle
        this.e.style.borderRightStyle=borderstyle
        return this
    }
    borderTopColor(bordertopcolor:string){
        this.e.style.borderTopColor=bordertopcolor
        return this
    }
    borderLeftColor(borderleftcolor:string){
        this.e.style.borderLeftColor=borderleftcolor
        return this
    }
    borderBottomColor(borderbottomcolor:string){
        this.e.style.borderBottomColor=borderbottomcolor
        return this
    }
    borderRightColor(borderrightcolor:string){
        this.e.style.borderBottomColor=borderrightcolor
        return this
    }
    borderColor(bordercolor:string){
        this.e.style.borderTopColor=bordercolor
        this.e.style.borderLeftColor=bordercolor
        this.e.style.borderBottomColor=bordercolor
        this.e.style.borderRightColor=bordercolor
        return this
    }
    borderSpacing(borderspacing:string){
        this.e.style.borderSpacing=borderspacing
        return this
    }
    borderSpacingPx(borderspacingpx:number){
        return this.borderSpacing(borderspacingpx+"px")
    }
    verticalAlign(verticalalign:string){
        this.e.style.verticalAlign=verticalalign
        return this
    }
    padding(padding:string){
        this.e.style.padding=padding                
        return this
    }
    paddingPx(paddingpx:number){
        return this.padding(paddingpx+"px")
    }
    paddingBottom(paddingbottom:string){
        this.e.style.paddingBottom=paddingbottom
        return this
    }   
    paddingBottomPx(paddingbottompx:number){
        return this.paddingBottom(paddingbottompx+"px")
    }
    paddingLeft(paddingleft:string){
        this.e.style.paddingLeft=paddingleft
        return this
    }   
    paddingLeftPx(paddingleftpx:number){
        return this.paddingLeft(paddingleftpx+"px")
    }
    paddingRight(paddingright:string){
        this.e.style.paddingRight=paddingright
        return this
    }   
    paddingRightPx(paddingrightpx:number){
        return this.paddingRight(paddingrightpx+"px")
    }
    paddingTop(paddingtop:string){
        this.e.style.paddingTop=paddingtop
        return this
    }   
    paddingTopPx(paddingtoppx:number){
        return this.paddingTop(paddingtoppx+"px")
    }    
    margin(margin:string):HTMLElement_{
        this.e.style.margin=margin
        return this
    }
    marginPx(marginpx:number){
        return this.margin(marginpx+"px")
    }
    marginTop(margintop:string):HTMLElement_{
        this.e.style.marginTop=margintop
        return this
    }
    marginTopPx(margintoppx:number){
        return this.marginTop(margintoppx+"px")
    }
    marginLeft(marginleft:string):HTMLElement_{
        this.e.style.marginLeft=marginleft
        return this
    }
    marginLeftPx(marginleftpx:number){
        return this.marginLeft(marginleftpx+"px")
    }
    visibility(visibility:string){
        this.e.style.visibility=visibility
        return this
    }
    visibilityBoolean(visibilityboolean:boolean){
        return this.visibility(visibilityboolean?"visible":"hidden")
    }
    cursor(cursor:string):HTMLElement_{
        this.e.style.cursor=cursor
        return this
    }
    overflow(overflow:string):HTMLElement_{
        this.e.style.overflow=overflow
        return this
    }
    draggable(draggable:string){
        this.setAttribute("draggable",draggable)
        return this
    }
    draggableBoolean(draggableboolean:boolean){
        this.setAttribute("draggable",""+draggableboolean)
        return this
    }
    color(color:string):HTMLElement_{
        this.e.style.color=color
        return this
    }
    backgroundColor(color:string):HTMLElement_{
        this.e.style.backgroundColor=color
        return this
    }    
    position(position:string):HTMLElement_{
        this.e.style.position=position
        return this
    }
    width(width:string):HTMLElement_{
        this.e.style.width=width
        return this
    }
    widthPx(widthpx:number):HTMLElement_{
        return(this.width(widthpx+"px"))
    }
    height(height:string):HTMLElement_{
        this.e.style.height=height
        return this
    }
    heightPx(heightpx:number):HTMLElement_{
        return(this.height(heightpx+"px"))
    }
    top(top:string):HTMLElement_{
        this.e.style.top=top
        return this
    }
    topPx(toppx:number):HTMLElement_{
        return(this.top(toppx+"px"))
    }
    left(left:string):HTMLElement_{
        this.e.style.left=left
        return this
    }
    leftPx(leftpx:number):HTMLElement_{
        return(this.left(leftpx+"px"))
    }
    getPx(css:string):number{
        let cssnum=css.replace("px","")
        return parseFloat(css)
    }
    getTop():string{
        return this.e.style.top
    }
    getTopPx():number{
        return this.getPx(this.getTop())
    }
    getLeft():string{
        return this.e.style.left
    }
    getLeftPx():number{
        return this.getPx(this.getLeft())
    }
    getWidth():string{
        return this.e.style.width
    }
    getWidthPx():number{
        return this.getPx(this.getWidth())
    }
    getHeight():string{
        return this.e.style.height
    }
    getHeightPx():number{
        return this.getPx(this.getHeight())
    }
    getBottomPx():number{
        return this.getTopPx()+this.getHeightPx()
    }
    getRightPx():number{
        return this.getLeftPx()+this.getWidthPx()
    }
    zIndex(zindex:string):HTMLElement_{
        this.e.style.zIndex=zindex
        return this
    }
    zIndexNumber(zindexnumber:number):HTMLElement_{
        return(this.zIndex(""+zindexnumber))
    }
    background(background:string):HTMLElement_{
        this.e.style.background=background
        return this
    }
    opacity(opacity:string):HTMLElement_{
        this.e.style.opacity=opacity
        return this
    }
    opacityNumber(opacitynumber:number):HTMLElement_{
        return(this.opacity(""+opacitynumber))
    }
}

class HTMLDivElement_ extends HTMLElement_{
    constructor(){
        super("div")
    }
}

class HTMLButtonElement_ extends HTMLElement_{
    constructor(){
        super("input")        
        this.setAttribute("type","button")
    }
    value(value:string):HTMLButtonElement_{
        this.setAttribute("value",value)        
        return this
    }
    onmousedown(listener:EventListenerOrEventListenerObject):HTMLButtonElement_{
        this.addEventListener("mousedown",listener)
        return this
    }
}

class HTMLTableElement_ extends HTMLElement_{
    constructor(){
        super("table")        
    }
    borderAttribute(border:number):HTMLTableElement_{
        this.setAttribute("border",""+border)
        return this
    }
    cellpaddingAttribute(cellpadding:number):HTMLTableElement_{
        this.setAttribute("cellpadding",""+cellpadding)
        return this
    }
    cellspacingAttribute(cellspacing:number):HTMLTableElement_{
        this.setAttribute("cellspacing",""+cellspacing)
        return this
    }
}

class HTMLTableRowElement_ extends HTMLElement_{
    constructor(){
        super("tr")        
    }
}

class HTMLTableColElement_ extends HTMLElement_{
    constructor(){
        super("td")        
    }
}

class HTMLSelectElement_ extends HTMLElement_{
    constructor(){
        super("select")        
    }
}

class HTMLOptionElement_ extends HTMLElement_{
    constructor(){
        super("option")        
    }
}

class ComboBox_ extends HTMLSelectElement_{
    options:{[id:string]:HTMLOptionElement_}={}
    setOptions(options:{[id:string]:string}):ComboBox_{
        this.html("")
        for(let id in options){
            let o=new HTMLOptionElement_()            
            o.setAttribute("value",id)
            o.innerHTML=options[id]
            this.options[id]=o
            this.appendChild(o)
        }
        return this
    }
    setOptionsFromList(optionlist:string[]):ComboBox_{
        let options={}
        optionlist.map(o=>options[o]=o)
        return this.setOptions(options)
    }
    setSelected(id:string):ComboBox_{
        Object.keys(this.options).map(key=>{
            if(id==key) this.options[key].setAttribute("selected","true")
            else this.options[key].removeAttribute("selected")
        })        
        return this
    }
    onChange(handler:(Event)=>void):ComboBox_{
        this.addEventListener("change",handler)
        return this
    }
}

class HTMLInputElement_ extends HTMLElement_{
    constructor(){
        super("input")        
        this.setAttribute("type","text")
    }
    getText():string{
        let v=(<HTMLInputElement>this.e).value
        return v
    }
    setText(value:string):HTMLInputElement_{
        (<HTMLInputElement>this.e).value=value
        return this
    }
}

class HTMLTextAreaElement_ extends HTMLElement_{
    constructor(){
        super("textarea")
    }
    getText():string{
        let v=(<HTMLTextAreaElement>this.e).value
        return v
    }
    setText(value:string):HTMLTextAreaElement_{
        (<HTMLTextAreaElement>this.e).value=value
        return this
    }
}

class Tab{
    id:string
    caption:string
    constructor(_id:string,_caption:string){
        this.id=_id
        this.caption=_caption
    }
}

class TabPane_ extends HTMLElement_{
    H_MARGIN=4
    V_MARGIN=24
    PADDING=2
    UNSELECTED_TAB_BCOL="#dfdfdf"
    TABHTMLDivElement_BCOL="#afffff"
    SELECTED_TAB_BCOL=this.TABHTMLDivElement_BCOL

    id:string
    tabs:Tab[]
    tabtds:HTMLTableColElement_[]
    tabdivs:HTMLDivElement_[]
    table:HTMLTableElement_
    tr1:HTMLTableRowElement_
    tr2:HTMLTableRowElement_
    selid:string=null
    constructor(
        id:string,
        width:number,
        height:number,
        _tabs:Tab[],
        _selid:string=null
    ){        
        super("div")
        this.id=id
        this.selid=_selid
        this.tabs=_tabs
        this.tabtds=[]
        this.tabdivs=[]
        this.
            widthPx(width-2*this.PADDING).
            heightPx(height-2*this.PADDING).
            backgroundColor("#cfcfcf").
            overflow("hidden").
            paddingPx(this.PADDING)
        this.table=new HTMLTableElement_()
        this.tr1=new HTMLTableRowElement_()
        this.tr2=new HTMLTableRowElement_()
        let ctd=new HTMLTableColElement_()
        let ctddiv=new HTMLDivElement_().position("relative")
        for(let tabi in _tabs){
            let tab=_tabs[tabi]
            let ttd=new HTMLTableColElement_().                
                backgroundColor(this.UNSELECTED_TAB_BCOL).                
                cursor("pointer").
                paddingPx(this.PADDING).
                html(tab.caption)
            ttd.addEventListener("mousedown",this.tabhandler.bind(this,this.tabtdId(tab.id),tab.id))
            this.tabtds.push(ttd)
            this.tr1.appendChild(ttd)            
            let div=new HTMLDivElement_().
                widthPx(width-this.H_MARGIN).
                heightPx(height-this.V_MARGIN).
                position("absolute").
                topPx(0).
                leftPx(0).
                backgroundColor(this.TABHTMLDivElement_BCOL).
                overflow("scroll").
                visibilityBoolean(false)
            ctddiv.appendChild(div)
            this.tabdivs.push(div)            
        }        
        ctd.appendChild(ctddiv)
        this.tr2.appendChild(ctd)
        this.table.appendChild(this.tr1)
        this.table.appendChild(this.tr2)
        this.appendChild(this.table)
        this.setSelected(this.selid)
    }
    setSelected(tabid:string=null){
        if(tabid==null){
            let storedselid=localStorage.getItem(this.id)
            if(storedselid!=undefined) this.selid=storedselid
            else this.selid=this.tabs[0].id
        }
        else this.selid=tabid
        for(let tabdivi in this.tabdivs){
            let tabdiv=this.tabdivs[tabdivi]
            let tab=this.tabs[tabdivi]
            let tabtd=this.tabtds[tabdivi]
            let v=(tab.id==this.selid)
            tabdiv.visibilityBoolean(v)
            tabtd.backgroundColor(v?this.SELECTED_TAB_BCOL:this.UNSELECTED_TAB_BCOL)
        }
        localStorage.setItem(this.id,this.selid)
    }
    tabhandler(tabtdid:string,tabid:string,e:Event){        
        this.setSelected(tabid)
    }
    tabtdId(tabid:string):string{return tabid+"_tabtd"}
    contentId(tabid:string):string{return tabid+"_content"}
    getTabIndexById(tabid:string):number{
        for(let ti in this.tabs){
            let tab=this.tabs[ti]
            if(tab.id==tabid) return parseInt(ti)
        }
        return 0
    }
    getTabDivById(tabid:string){
        return this.tabdivs[this.getTabIndexById(tabid)]
    }
    setContent(tabid:string,content:string){
        let ti=this.getTabIndexById(tabid)
        let tabdiv=this.tabdivs[ti]        
        tabdiv.html(content)
    }
    setElement_(tabid:string,element_:HTMLElement_){
        let ti=this.getTabIndexById(tabid)
        let tabdiv=this.tabdivs[ti]
        tabdiv.html("").appendChild(element_)
    }
}

class HTMLAnchorElement_ extends HTMLElement_{
    constructor(){
        super("a")
    }
    href(href:string):HTMLAnchorElement_{
        this.setAttribute("href",href)
        return this
    }
}

class HTMLBRElement_ extends HTMLElement_{
    constructor(){
        super("br")
    }
}

class HTMLLabelElement_ extends HTMLElement_{
    constructor(){
        super("label")
    }
    setText(value:string):HTMLLabelElement_{
        (<HTMLLabelElement>this.e).innerHTML=value
        return this
    }
}

class HTMLSpanElement_ extends HTMLElement_{
    constructor(){
        super("span")
    }
}
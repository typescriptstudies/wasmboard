import gui=Globals.gui
import wboard=Globals.wboard
import startup=Globals.startup

function main(){    
    gui.draw()
}

function mainloader(){    
    //localStorage.clear()
    new AssetLoader().
        add(wboard).
        add(startup).
        setcallback(main).
        load()    
}

mainloader()
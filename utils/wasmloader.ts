namespace WasmLoader{

    ///////////////////////////////////////////////////////
    // from: https://stackoverflow.com/questions/33702838/how-to-append-bytes-multi-bytes-and-buffer-to-arraybuffer-in-javascript
    function concatTypedArrays(a, b) { // a, b TypedArray of same type
        var c = new (a.constructor)(a.length + b.length)
        c.set(a, 0)
        c.set(b, a.length)
        return c
    }
    ///////////////////////////////////////////////////////

    export class MemView{
        view:Uint8Array        
        constructor(_view:Uint8Array){
            this.view=_view
        }
        toString(){
            let term=this.view.indexOf(0)
            if(term<0) return null // not a C terminated string
            return TextEncodingUtils.decode(this.view.slice(0,term))
        }
        strCpy(str:string){
            let view=TextEncodingUtils.encode(str)
            let viewt=concatTypedArrays(view,new Uint8Array([0]))
            this.view.set(viewt)
        }
    }

    export class WasmLoader{
        
        importObject = {
            env: {
                memoryBase: 0,
                tableBase: 0,                
                memory: new WebAssembly.Memory({ initial:256 }),
                table: new WebAssembly.Table({ initial:0, element:'anyfunc' })
            }
        };

        url

        constructor(_url:string,params:{[id:string]:any}){
            this.url=_url
            for(let key in params){                
                let value=params[key]
                this.importObject.env[key]=value
            }
        }

        module
        exports

        env(){return this.importObject.env}
        memory(){return this.env().memory}
        membuff(){return this.memory().buffer}

        memview(from:number,size:number):MemView{            
            return new MemView(new Uint8Array(this.membuff(), from, size))
        }

        fetchThen(callback:()=>void=null){
            fetch(this.url).then(
                response => response.arrayBuffer()
            ).then(
                bytes => WebAssembly.instantiate(bytes, this.importObject)
            ).then(
                results => {
                    this.module=results.instance
                    this.exports=this.module.exports

                    if(callback!=null) callback()
                }
            )
        }

    }

}
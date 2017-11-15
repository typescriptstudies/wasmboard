declare namespace TextEncoding 
{   
    class TextEncoder 
    {
        constructor(label?: string, options?: TextEncoding.TextEncoderOptions);
        encoding: string;
        encode(input?: string, options?: TextEncoding.TextEncodeOptions): Uint8Array;
    }
    
    class TextDecoder
    {
        constructor(utfLabel?: string, options?: TextEncoding.TextDecoderOptions)
        encoding: string;
        fatal: boolean;
        ignoreBOM: boolean;
        decode(input?: ArrayBufferView, options?: TextEncoding.TextDecodeOptions): string;
    }    

    interface TextDecoderOptions {
        fatal?: boolean;
        ignoreBOM?: boolean;
    }

    interface TextDecodeOptions {
        stream?: boolean;
    }

    interface TextEncoderOptions {
        NONSTANDARD_allowLegacyEncoding?: boolean;
    }

    interface TextEncodeOptions {
        stream?: boolean;
    }
    
    interface TextEncodingStatic {
        TextDecoder: typeof TextDecoder;
        TextEncoder: typeof TextEncoder;
    }
}

namespace TextEncodingUtils{
    declare class TextEncoder 
    {
        constructor(label?: string, options?: TextEncoding.TextEncoderOptions);
        encoding: string;
        encode(input?: string, options?: TextEncoding.TextEncodeOptions): Uint8Array;
    }
    
    declare class TextDecoder
    {
        constructor(utfLabel?: string, options?: TextEncoding.TextDecoderOptions)
        encoding: string;
        fatal: boolean;
        ignoreBOM: boolean;
        decode(input?: ArrayBufferView, options?: TextEncoding.TextDecodeOptions): string;
    }    

    export class TEnc{
        tenc:TextEncoder
        constructor(label?: string, options?: TextEncoding.TextEncoderOptions){
            this.tenc=new TextEncoder(label,options)
        }
        encode(input?: string, options?: TextEncoding.TextEncodeOptions): Uint8Array{
            return this.tenc.encode(input,options)
        }
    }

    export class TDec{
        tdec:TextDecoder
        constructor(label?: string, options?: TextEncoding.TextDecoderOptions){
            this.tdec=new TextDecoder(label,options)
        }
        decode(input?: ArrayBufferView, options?: TextEncoding.TextDecodeOptions): string{
            return this.tdec.decode(input,options)
        }
    }

    let tdec=new TDec()
    let tenc=new TEnc()

    export function encode(input:string){
        return tenc.encode(input)
    }

    export function decode(input:ArrayBufferView){
        return tdec.decode(input)
    }
}
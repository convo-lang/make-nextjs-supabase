export const addPolyfills=()=>{

    // isSpace for markdown-it
    if (typeof window !== 'undefined' && typeof (window as any).isSpace === 'undefined') {
        (window as any).isSpace = function(code:any) {
            return code === 0x20 || code === 0x09 || code === 0x0A || code === 0x0B || code === 0x0C || code === 0x0D;
        };
    }
}
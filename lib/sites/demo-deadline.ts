/** End live demo work before the hosting/client deadlines; saved evidence is handled by the route. */
export async function withDemoDeadline<T>(work:(signal:AbortSignal)=>Promise<T>,timeoutMs=60000):Promise<T>{
 const controller=new AbortController();let timer:ReturnType<typeof setTimeout>|undefined;
 const deadline=new Promise<never>((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(new Error('Live demo deadline reached.'));},timeoutMs);});
 try{return await Promise.race([work(controller.signal),deadline]);}finally{clearTimeout(timer);}
}

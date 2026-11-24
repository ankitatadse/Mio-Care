const CACHE="miocare-shell-v4";
const FILES=["./","./index.html","./app.js","./auth.js","./manifest.json","./icons/icon.svg"];
self.addEventListener("install",event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",event=>{
  event.waitUntil(caches.keys()
    .then(keys=>Promise.all(keys.filter(key=>key.startsWith("miocare-shell-")&&key!==CACHE).map(key=>caches.delete(key))))
    .then(()=>self.clients.claim()));
});
self.addEventListener("fetch",event=>{
  const request=event.request;
  const url=new URL(request.url);
  if(request.method!=="GET"||url.origin!==self.location.origin)return;
  if(url.pathname.includes("/rest/v1/")||url.pathname.includes("/auth/"))return;
  event.respondWith((async()=>{
    const isPage=request.mode==="navigate"||url.pathname.endsWith("/")||url.pathname.endsWith(".html");
    try{
      const response=await fetch(request,{cache:"no-store"});
      if(response&&response.ok){
        const cache=await caches.open(CACHE);
        cache.put(request,response.clone()).catch(()=>{});
      }
      return response;
    }catch(error){
      const cached=await caches.match(request);
      if(cached)return cached;
      if(isPage)return (await caches.match("./index.html"))||Response.error();
      throw error;
    }
  })());
});
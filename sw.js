const CACHE='dailynest-shell-v4';
const ASSETS=['./','./index.html','./styles.css','./app.js','./manifest.webmanifest','./icon.svg'];
self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    await cache.addAll(ASSETS);
    await self.skipWaiting();
  })());
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>key.startsWith('dailynest-shell-')&&key!==CACHE).map(key=>caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin)return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    try{
      const response=await fetch(event.request,{cache:'no-store'});
      if(response&&response.ok)cache.put(event.request,response.clone());
      return response;
    }catch(error){
      const cached=await cache.match(event.request);
      return cached||Response.error();
    }
  })());
});
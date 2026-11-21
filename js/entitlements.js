/* Sprout Hollow entitlement client (read-only).
   Ownership of paid cosmetics is decided ONLY by a backend that verifies payments
   with the provider (webhooks) and returns a signed list. This client never grants
   items, never handles card data and holds no secret keys. Until ENDPOINT is set,
   it does nothing and nobody owns paid items. See docs/MONETIZATION.md. */
(function(){
'use strict';
const ENDPOINT=null; // e.g. 'https://api.sprouthollow.example/v1/entitlements' once the backend exists
let owned=new Set();
async function refresh(){
  if(!ENDPOINT)return owned;
  const token=localStorage.getItem('sh-session'); // short-lived session token from the backend, never a secret key
  if(!token)return owned;
  const res=await fetch(ENDPOINT,{headers:{Authorization:'Bearer '+token},cache:'no-store'});
  if(!res.ok)throw new Error('entitlements '+res.status);
  const body=await res.json();
  // Server returns {items:[...], exp, sig}. The signature is verified server-side on every
  // cosmetic-granting request; the client only uses this list for display.
  if(!body||!Array.isArray(body.items))throw new Error('bad entitlement payload');
  owned=new Set(body.items.map(String));
  return owned;
}
window.SHEnt={has:id=>owned.has(id),list:()=>[...owned],refresh,configured:()=>!!ENDPOINT};
})();

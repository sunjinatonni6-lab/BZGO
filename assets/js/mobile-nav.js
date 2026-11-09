import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

/* Single shared mobile navigation; auth state is observed, never guessed. */
const adminPage = location.pathname.includes("/admin/");
const root = adminPage ? "../" : "";
const itemsFor = (role) => role === "admin" ? [
  ["Home","fa-house",root+"index.html"],
  ["Dashboard","fa-chart-line",root+"admin/dashboard.html"],
  ["Product","fa-box",root+"admin/products.html"],
  ["Orders","fa-clipboard-list",root+"admin/orders.html"],
  ["Hero Banner","fa-image",root+"admin/banner.html"]
] : [
  ["Home","fa-house",root+"index.html"],
  ["Categories","fa-list",root+"index.html#shop-categories"],
  ["Wishlist","fa-heart",root+"index.html#featured"],
  ["Orders","fa-box-open",root+"my-orders.html"],
  ["Cart","fa-cart-shopping",root+"cart.html"]
];

function mount(role) {
  document.querySelectorAll(".bazargo-mobile-bottom-nav").forEach((n,i)=>{if(i)n.remove();});
  const nav=document.querySelector(".bazargo-mobile-bottom-nav") || document.createElement("nav");
  nav.className="bazargo-mobile-bottom-nav";
  nav.setAttribute("aria-label","Mobile navigation");
  nav.innerHTML=itemsFor(role).map(([label,icon,url])=>{
    const current=location.pathname.replace(/\/+$/,"");
    const target=new URL(url,location.href);
    const active=(target.pathname.replace(/\/+$/,"")===current && (!target.hash || target.hash===location.hash))
      || (label==="Home" && current.endsWith("/index.html") && !location.hash);
    return `<a href="${url}" class="${active?"active":""}" ${active?'aria-current="page"':''}><i class="fa-solid ${icon}" aria-hidden="true"></i><span>${label}</span></a>`;
  }).join("");
  if(!nav.isConnected) document.body.appendChild(nav);
  nav.querySelectorAll('a').forEach(link=>{
    if(link.textContent.trim()==="Wishlist" && !link.dataset.wishlistBound){
      link.dataset.wishlistBound="1";
      link.addEventListener("click",event=>{
        if(!adminPage && document.getElementById("wishlist-toggle")){
          event.preventDefault(); document.getElementById("wishlist-toggle").click();
        }
      });
    }
  });
  document.body.classList.add("has-mobile-bottom-nav");
}
onAuthStateChanged(auth, async user=>{
  let role="guest";
  if(user){
    try { const snap=await getDoc(doc(db,"users",user.uid)); role=snap.exists()?(snap.data().role||"customer"):"customer"; }
    catch(error){ role="customer"; console.warn("Mobile navigation role lookup failed",error); }
  }
  mount(role);
});

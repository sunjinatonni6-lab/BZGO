import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { doc, getDoc, setDoc, deleteDoc, collection, getDocs, updateDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

const LOCAL_STORAGE_KEY = "bazargo_cart";

export function getAuthenticatedUser() {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

export function getLocalCart() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function setLocalCart(cart) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cart));
  updateCartBadge();
}

export async function addToCart(product, quantity = 1) {
  const user = await getAuthenticatedUser();
  const unitPrice = typeof product.price === "string" 
    ? Number(product.price.replace(/,/g, "")) 
    : Number(product.price) || 0;

  const itemPayload = {
    productId: String(product.id),
    title: product.title || "Product",
    price: unitPrice,
    imageUrl: product.imageUrl || "assets/images/sample1.jpg",
    quantity: Number(quantity) || 1
  };

  if (user) {
    try {
      const itemRef = doc(db, "users", user.uid, "cart", String(product.id));
      const existing = await getDoc(itemRef);
      if (existing.exists()) {
        itemPayload.quantity = (Number(existing.data().quantity) || 0) + quantity;
      }
      await setDoc(itemRef, itemPayload);
    } catch (err) {
      saveToGuestStorage(itemPayload);
    }
  } else {
    saveToGuestStorage(itemPayload);
  }

  await updateCartBadge();
}

function saveToGuestStorage(itemPayload) {
  const cart = getLocalCart();
  const existing = cart.find(i => String(i.productId) === String(itemPayload.productId));
  if (existing) {
    existing.quantity = (Number(existing.quantity) || 0) + itemPayload.quantity;
  } else {
    cart.push(itemPayload);
  }
  setLocalCart(cart);
}

// Update quantity directly (supports +, -, or typing)
export async function updateCartQuantity(productId, newQuantity) {
  const qty = parseInt(newQuantity, 10);
  if (isNaN(qty) || qty <= 0) {
    await removeCartItem(productId);
    return;
  }

  const user = await getAuthenticatedUser();
  if (user) {
    try {
      const itemRef = doc(db, "users", user.uid, "cart", String(productId));
      await updateDoc(itemRef, { quantity: qty });
    } catch (e) {
      console.warn("Could not update remote quantity, updating locally:", e);
    }
  }

  const cart = getLocalCart();
  const item = cart.find(i => String(i.productId) === String(productId));
  if (item) {
    item.quantity = qty;
  }
  setLocalCart(cart);
  await updateCartBadge();
}

export async function fetchCartItems() {
  const user = await getAuthenticatedUser();
  if (user) {
    try {
      const colRef = collection(db, "users", user.uid, "cart");
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      }
    } catch (e) {
      console.warn("Falling back to local cart:", e);
    }
  }
  return getLocalCart();
}

export async function removeCartItem(productId) {
  const user = await getAuthenticatedUser();
  if (user) {
    try {
      await deleteDoc(doc(db, "users", user.uid, "cart", String(productId)));
    } catch (e) {
      console.error("Error removing document:", e);
    }
  }
  
  const cart = getLocalCart().filter(i => String(i.productId) !== String(productId));
  setLocalCart(cart);
  await updateCartBadge();
}

export async function updateCartBadge() {
  const badge = document.getElementById("cart-count");
  if (!badge) return;
  const items = await fetchCartItems();
  const count = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  badge.textContent = count;
}
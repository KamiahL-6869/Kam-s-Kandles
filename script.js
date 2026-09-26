const clock = document.getElementById("currentTime");

if (clock) {
  const updateClock = () => {
    const now = new Date();
    clock.dateTime = now.toISOString();
    clock.textContent = new Intl.DateTimeFormat(undefined, {
      timeZone: "America/Chicago",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short"
    }).format(now);
  };

  updateClock();
  setInterval(updateClock, 60_000);
}

const cart = new Map();
const cartPanel = document.getElementById("shopping-cart");
const cartToggle = document.querySelector(".cart-toggle");
const cartClose = document.querySelector(".cart-close");
const cartBackdrop = document.querySelector(".cart-backdrop");
const cartContent = document.getElementById("cartContent");
const cartCount = document.getElementById("cartCount");
const cartSummary = document.getElementById("cartSummary");
const cartSubtotal = document.getElementById("cartSubtotal");
const checkoutButton = document.getElementById("checkoutButton");
const checkoutForm = document.getElementById("checkoutForm");
const orderConfirmation = document.getElementById("orderConfirmation");

const money = (amount) => new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
}).format(amount);

function renderCart() {
  const items = [...cart.values()];
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  cartCount.textContent = totalItems;
  cartContent.replaceChildren();
  cartSummary.hidden = items.length === 0;

  if (items.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "cart-empty";
    emptyMessage.textContent = "Your bag is waiting for a little warmth.";
    cartContent.append(emptyMessage);
    return;
  }

  items.forEach((item) => {
    const row = document.createElement("article");
    row.className = "cart-item";

    const name = document.createElement("h3");
    name.textContent = item.name;
    const price = document.createElement("span");
    price.textContent = money(item.price * item.quantity);

    const controls = document.createElement("div");
    controls.className = "quantity-control";
    const decrease = document.createElement("button");
    decrease.type = "button";
    decrease.dataset.action = "decrease";
    decrease.dataset.id = item.id;
    decrease.setAttribute("aria-label", `Remove one ${item.name}`);
    decrease.textContent = "−";
    const quantity = document.createElement("span");
    quantity.textContent = `Qty ${item.quantity}`;
    const increase = document.createElement("button");
    increase.type = "button";
    increase.dataset.action = "increase";
    increase.dataset.id = item.id;
    increase.setAttribute("aria-label", `Add one ${item.name}`);
    increase.textContent = "+";

    controls.append(decrease, quantity, increase);
    row.append(name, price, controls);
    cartContent.append(row);
  });

  cartSubtotal.textContent = money(subtotal);
}

function openCart() {
  cartPanel.hidden = false;
  cartBackdrop.hidden = false;
  cartToggle.setAttribute("aria-expanded", "true");
  cartClose.focus();
}

function closeCart() {
  cartPanel.hidden = true;
  cartBackdrop.hidden = true;
  cartToggle.setAttribute("aria-expanded", "false");
  cartToggle.focus();
}

cartToggle.addEventListener("click", openCart);
cartClose.addEventListener("click", closeCart);
cartBackdrop.addEventListener("click", closeCart);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !cartPanel.hidden) closeCart();
});

document.querySelectorAll(".add-to-cart").forEach((button) => {
  button.addEventListener("click", () => {
    const { id, name, price } = button.dataset;
    const item = cart.get(id) ?? { id, name, price: Number(price), quantity: 0 };
    item.quantity += 1;
    cart.set(id, item);
    renderCart();
    orderConfirmation.hidden = true;
    button.textContent = "Added to bag ✓";
    window.setTimeout(() => { button.textContent = "Add to bag"; }, 1200);
  });
});

cartContent.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const item = cart.get(button.dataset.id);
  if (!item) return;
  item.quantity += button.dataset.action === "increase" ? 1 : -1;
  if (item.quantity <= 0) cart.delete(item.id);
  renderCart();
});

checkoutButton.addEventListener("click", () => {
  checkoutForm.hidden = false;
  checkoutButton.hidden = true;
  checkoutForm.querySelector("input").focus();
});

checkoutForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const customerName = new FormData(checkoutForm).get("name").trim();
  orderConfirmation.textContent = `Thank you, ${customerName}! Your demo order is ready. This preview does not process payment or send orders.`;
  orderConfirmation.hidden = false;
  cart.clear();
  renderCart();
  checkoutForm.reset();
  checkoutForm.hidden = true;
  checkoutButton.hidden = false;
});

renderCart();

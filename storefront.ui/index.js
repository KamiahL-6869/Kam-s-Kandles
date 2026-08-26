/**
 * storefront-ui — the shipped, tested conversion surfaces: cart page, cart
 * drawer, checkout and order-received. They render complete on their own; a
 * store integrates them with a route (or one layout mount for the drawer),
 * a ≤12-token theme block in index.css, and `brand` wording props. Functional
 * labels are localized in ./i18n (repoint one import); brand wording comes in
 * via props and overrides the matching labels.
 *
 * Customize through tokens, `brand`, `sections` and `slots` — these files are
 * plugin-owned and re-copied on kit updates, so direct edits do not survive.
 */
export { CartPage } from "./CartPage.jsx";
export { MiniCart } from "./MiniCart.jsx";
export { CartButton } from "./CartButton.jsx";
export { CheckoutPage } from "./CheckoutPage.jsx";
export { OrderReceivedPage } from "./OrderReceivedPage.jsx";

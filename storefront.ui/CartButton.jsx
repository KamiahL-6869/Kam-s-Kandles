import React from "react";
import { useCart, useCartUI } from "@/commerce/storefront";
import { t } from "./i18n/index.js";

/**
 * Optional header trigger for the MiniCart: a bag icon with a live item-count
 * badge, wired to the cart drawer. The header itself stays the store's brand
 * surface — use this for the wiring and restyle it via .sfui-cart-button /
 * .sfui-cart-badge (or replace it with your own button calling
 * `useCartUI().toggleCart` and rendering `useCart().itemCount`).
 */
export function CartButton({ className = "", label }) {
  const { toggleCart } = useCartUI();
  const { itemCount } = useCart();
  return (
    <button
      type="button"
      className={`sfui sfui-cart-button ${className}`}
      onClick={toggleCart}
      aria-label={label ?? t("minicart.button")}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M6 7h12l-1 13H7L6 7Z" strokeLinejoin="round" />
        <path d="M9 9V6a3 3 0 0 1 6 0v3" strokeLinecap="round" />
      </svg>
      {itemCount > 0 && (
        <span className="sfui-cart-badge" aria-hidden="true">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </button>
  );
}
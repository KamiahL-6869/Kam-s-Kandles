import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCart, useStoreInfo } from "@/commerce/storefront";
import { makeT } from "./i18n/index.js";
import {
  CartLineRow,
  CouponField,
  ErrorState,
  LoadingState,
  SfuiRoot,
  TotalsBlock,
  couponVisible,
  readOrderNote,
  writeOrderNote,
} from "./internal.jsx";

const BRAND_KEYS = {
  title: "cart.title",
  summaryTitle: "cart.summaryTitle",
  checkoutCta: "cart.checkoutCta",
  continueShopping: "cart.continueShopping",
  emptyTitle: "cart.empty.title",
  emptyBody: "cart.empty.body",
  emptyCta: "cart.empty.cta",
  note: "cart.taxNote",
};

/**
 * The routed cart page — complete: line rows with row-scoped quantity editing,
 * the full totals breakdown, coupons, optional order notes, a designed empty
 * state. Mount it on a route inside the store's layout; everything inside is
 * shipped and tested.
 *
 * @param {object} props
 * @param {Record<string,string>} [props.brand] wording overrides (title,
 *   summaryTitle, checkoutCta, continueShopping, emptyTitle, emptyBody,
 *   emptyCta, note) — the store's voice; labels beyond these are localized
 *   via ./i18n.
 * @param {object} [props.sections] `{ coupon: "auto"|true|false, notes: false,
 *   continueShopping: true, taxNote: true }`
 * @param {string} [props.checkoutHref="/checkout"]
 * @param {string} [props.continueHref="/"]
 * @param {(item) => string} [props.productHref] line names link to the product
 *   when given; plain text otherwise (never a guessed route).
 * @param {object} [props.slots] `{ lineExtra?({item,line}), aboveSummary?(),
 *   emptyState?() }`
 */
export function CartPage({
  brand,
  sections = {},
  checkoutHref = "/checkout",
  continueHref = "/",
  productHref,
  slots = {},
}) {
  const tt = makeT(brand, BRAND_KEYS);
  const cartApi = useCart();
  const { info } = useStoreInfo();
  const [note, setNote] = useState(readOrderNote);
  const { status, cart } = cartApi;
  const {
    coupon = "auto",
    notes = false,
    continueShopping = true,
    taxNote = true,
  } = sections;

  return (
    <SfuiRoot className="sfui-cart" aria-labelledby="sfui-cart-title">
      <div className="sfui-cart-inner">
        <div>
          <h1 id="sfui-cart-title" className="sfui-heading sfui-h1" style={{ marginBlockEnd: "1rem" }}>
            {tt("cart.title")}
          </h1>
          {status === "loading" && <LoadingState />}
          {status === "empty" &&
            (slots.emptyState ? (
              slots.emptyState()
            ) : (
              <div className="sfui-state">
                <h2 className="sfui-heading sfui-h2">{tt("cart.empty.title")}</h2>
                <p className="sfui-muted">{tt("cart.empty.body")}</p>
                <Link className="sfui-btn sfui-btn-inline" to={continueHref}>
                  {tt("cart.empty.cta")}
                </Link>
              </div>
            ))}
          {status === "ready" && cartApi.error && <ErrorState onRetry={cartApi.refresh} />}
          {status === "ready" && (
            <ul className="sfui-lines">
              {cart.items.map((item) => (
                <CartLineRow
                  key={item.item_key}
                  item={item}
                  tt={tt}
                  productHref={productHref}
                  lineExtra={slots.lineExtra}
                />
              ))}
            </ul>
          )}
        </div>

        {status === "ready" && (
          <aside className="sfui-panel sfui-summary" aria-label={tt("cart.summaryTitle")}>
            <h2 className="sfui-heading sfui-h2">{tt("cart.summaryTitle")}</h2>
            {slots.aboveSummary && slots.aboveSummary()}
            {couponVisible(coupon, cart, info) && <CouponField tt={tt} />}
            {notes && (
              <div>
                <label className="sfui-label" htmlFor="sfui-cart-note">
                  {tt("cart.notes.label")}
                </label>
                <textarea
                  id="sfui-cart-note"
                  value={note}
                  placeholder={tt("cart.notes.placeholder")}
                  onChange={(e) => {
                    setNote(e.target.value);
                    writeOrderNote(e.target.value);
                  }}
                />
              </div>
            )}
            <TotalsBlock cart={cart} tt={tt} />
            {taxNote && <p className="sfui-note">{tt("cart.taxNote")}</p>}
            <Link className="sfui-btn" to={checkoutHref}>
              {tt("cart.checkoutCta")}
            </Link>
            {continueShopping && (
              <Link className="sfui-btn sfui-btn-ghost" to={continueHref}>
                {tt("cart.continueShopping")}
              </Link>
            )}
          </aside>
        )}
      </div>
    </SfuiRoot>
  );
}

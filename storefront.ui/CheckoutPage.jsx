import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  AddressFields,
  CheckoutProvider,
  PaymentMethodPicker,
  ShippingMethodPicker,
  useCheckoutContext,
  useStoreInfo,
} from "@/commerce/storefront";
import { makeT } from "./i18n/index.js";
import {
  CouponField,
  LoadingState,
  SfuiRoot,
  TotalsBlock,
  couponVisible,
  readOrderNote,
  writeOrderNote,
} from "./internal.jsx";

const BRAND_KEYS = {
  title: "checkout.title",
  contactTitle: "checkout.contactTitle",
  shippingTitle: "checkout.shippingTitle",
  paymentTitle: "checkout.paymentTitle",
  summaryTitle: "checkout.summaryTitle",
  submitLabel: "checkout.placeOrder",
  termsLabel: "checkout.terms",
  emptyTitle: "checkout.empty.title",
  emptyCta: "checkout.empty.cta",
};

/**
 * The complete checkout: contact + billing address (AddressFields), optional
 * separate delivery address, shipping choice, payment choice, order summary,
 * blockers, placeOrder — with the offline payment-instructions flow and the
 * card payment-link redirect handled by useCheckout. Mount it on a route; a
 * store customizes it through the theme tokens, `brand` wording and
 * `sections`, never by editing this file.
 *
 * @param {object} props
 * @param {Record<string,string>} [props.brand] wording overrides (title,
 *   contactTitle, shippingTitle, paymentTitle, summaryTitle, submitLabel,
 *   termsLabel, emptyTitle, emptyCta).
 * @param {"two-column"|"single"} [props.layout="two-column"]
 * @param {object} [props.sections] `{ coupon: "auto"|true|false, notes: false,
 *   phone: "optional"|"required"|"hidden", shipToDifferent: true,
 *   termsCheckbox: false }` — `phone: "required"` is enforced by marking the
 *   field required in the address spec via requiredBillingFields.
 * @param {object} [props.slots] `{ afterContact?(ctx), beforeSubmit?(ctx),
 *   aboveSummary?(ctx) }` — the store's own markup at three fixed points; every
 *   slot receives `{ cart, checkout, note, setNote }`. `setNote` is the one way
 *   a slot puts something on the order: it writes the order note, which submits
 *   as `customer_note` (place-order accepts no other free field).
 * @param {string} [props.continueHref="/"] where the empty state sends people.
 * @param {(order) => void} [props.onPlaced] replaces the default
 *   order-received navigation (advanced; the default flow is complete).
 */
export function CheckoutPage({
  brand,
  layout = "two-column",
  sections = {},
  slots = {},
  continueHref = "/",
  onPlaced,
}) {
  const {
    phone = "optional",
    shipToDifferent: allowShipToDifferent = true,
  } = sections;
  const options = {
    ...(onPlaced ? { orderReceivedPath: null } : {}),
    ...(phone === "required"
      ? { requiredBillingFields: ["first_name", "last_name", "address_1", "city", "country", "email", "phone"] }
      : {}),
  };
  return (
    <CheckoutProvider options={options}>
      <CheckoutBody
        brand={brand}
        layout={layout}
        sections={{ ...sections, phone, shipToDifferent: allowShipToDifferent }}
        slots={slots}
        continueHref={continueHref}
        onPlaced={onPlaced}
      />
    </CheckoutProvider>
  );
}

function CheckoutBody({ brand, layout, sections, slots, continueHref, onPlaced }) {
  const tt = makeT(brand, BRAND_KEYS);
  const checkout = useCheckoutContext();
  const { info } = useStoreInfo();
  const [note, setNote] = useState(readOrderNote);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const { coupon = "auto", notes = false, phone, shipToDifferent, termsCheckbox = false } = sections;
  const { cart, stage, blockers, canPlaceOrder, placing, orderError } = checkout;
  const updateNote = (value) => {
    setNote(value);
    writeOrderNote(value);
  };
  const slotArgs = { cart, checkout, note, setNote: updateNote };

  const submit = async () => {
    const extra = note.trim() ? { customer_note: note.trim() } : {};
    const res = await checkout.placeOrder(extra);
    if (res.ok) {
      writeOrderNote("");
      if (onPlaced) onPlaced(res.result);
    }
  };

  // The submitted guard renders BEFORE the empty-cart branch: placeOrder clears
  // the cart, so checking cart state first repaints "empty" over a just-placed
  // order for the frames before the browser navigates away.
  if (stage === "submitted") {
    return (
      <SfuiRoot className="sfui-checkout">
        <div className="sfui-checkout-inner">
          <LoadingState label={tt("checkout.submitted")} />
        </div>
      </SfuiRoot>
    );
  }

  if (cart === null || (cart && !cart.items?.length)) {
    return (
      <SfuiRoot className="sfui-checkout">
        <div className="sfui-checkout-inner">
          <div className="sfui-state">
            <h1 className="sfui-heading sfui-h1">{tt("checkout.empty.title")}</h1>
            <Link className="sfui-btn sfui-btn-inline" to={continueHref}>
              {tt("checkout.empty.cta")}
            </Link>
          </div>
        </div>
      </SfuiRoot>
    );
  }

  const disabled = !canPlaceOrder || placing || (termsCheckbox && !termsAccepted);

  // AddressFields' built-in labels are English; the shipped checkout localizes
  // them like every other label on the page.
  const addressLabels = {
    first_name: tt("checkout.address.first_name"),
    last_name: tt("checkout.address.last_name"),
    email: tt("checkout.address.email"),
    company: tt("checkout.address.company"),
    address_1: tt("checkout.address.address_1"),
    address_2: tt("checkout.address.address_2"),
    country: tt("checkout.address.country"),
    city: tt("checkout.address.city"),
    state: tt("checkout.address.state"),
    postcode: tt("checkout.address.postcode"),
    phone: tt(phone === "required" ? "checkout.address.phone" : "checkout.address.phoneOptional"),
  };
  const selectPlaceholder = tt("checkout.address.select");

  return (
    <SfuiRoot className="sfui-checkout" aria-labelledby="sfui-checkout-title">
      <div className="sfui-checkout-inner" data-layout={layout}>
        <div className="sfui-checkout-form">
          <h1 id="sfui-checkout-title" className="sfui-heading sfui-h1">
            {tt("checkout.title")}
          </h1>

          <section className="sfui-section sfui-address" aria-label={tt("checkout.contactTitle")}>
            <h2 className="sfui-label">{tt("checkout.contactTitle")}</h2>
            <AddressFields which="billing" includePhone={phone !== "hidden"} labels={addressLabels} selectPlaceholder={selectPlaceholder} />
            {allowsShipToDifferent(shipToDifferent) && (
              <label className="sfui-checkbox">
                <input
                  type="checkbox"
                  checked={checkout.shipToDifferent}
                  onChange={(e) => checkout.setShipToDifferent(e.target.checked)}
                />
                {tt("checkout.shipToDifferent")}
              </label>
            )}
            {checkout.shipToDifferent && (
              <>
                <h2 className="sfui-label">{tt("checkout.shippingAddressTitle")}</h2>
                <AddressFields which="shipping" includePhone={false} labels={addressLabels} selectPlaceholder={selectPlaceholder} />
              </>
            )}
          </section>
          {slots.afterContact && slots.afterContact(slotArgs)}

          <ShippingMethodPicker>
            {({ methods, mustChoose, single, chosen, hint }) => (
              <section className="sfui-section" aria-label={tt("checkout.shippingTitle")}>
                <h2 className="sfui-label">{tt("checkout.shippingTitle")}</h2>
                {mustChoose && (
                  <div className="sfui-choices" role="radiogroup" aria-label={tt("checkout.shippingTitle")}>
                    {methods.map((m) => (
                      <label key={m.id} className="sfui-choice" data-selected={m.selected || undefined}>
                        <input type="radio" name="sfui-shipping" checked={m.selected} onChange={m.select} />
                        <span className="sfui-choice-main">
                          <span className="sfui-choice-title">{m.title}</span>
                        </span>
                        <span className="sfui-choice-cost">
                          {m.cost === 0 ? tt("common.free") : m.costLabel}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
                {single && chosen && (
                  <div className="sfui-chosen-single">
                    <span>{chosen.title}</span>
                    <span>{chosen.cost === 0 ? tt("common.free") : chosen.costLabel}</span>
                  </div>
                )}
                {hint && (
                  <p
                    className={hint.severity === "error" ? "sfui-error" : "sfui-note"}
                    role={hint.severity === "error" ? "alert" : "status"}
                  >
                    {hint.serverMessage ?? tt(`checkout.hint.${hint.code}`)}
                  </p>
                )}
              </section>
            )}
          </ShippingMethodPicker>

          <PaymentMethodPicker>
            {({ gateways, mustChoose, single, selected, hint }) => (
              <section className="sfui-section" aria-label={tt("checkout.paymentTitle")}>
                <h2 className="sfui-label">{tt("checkout.paymentTitle")}</h2>
                {mustChoose && (
                  <div className="sfui-choices" role="radiogroup" aria-label={tt("checkout.paymentTitle")}>
                    {gateways.map((g) => (
                      <label key={g.slug} className="sfui-choice" data-selected={g.selected || undefined}>
                        <input type="radio" name="sfui-payment" checked={g.selected} onChange={g.select} />
                        <span className="sfui-choice-main">
                          <span className="sfui-choice-title">{g.title}</span>
                          {g.description && <span className="sfui-choice-desc">{g.description}</span>}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
                {single && selected && (
                  <div className="sfui-chosen-single">
                    <span className="sfui-choice-main">
                      <span className="sfui-choice-title">{selected.title}</span>
                      {selected.description && <span className="sfui-choice-desc">{selected.description}</span>}
                    </span>
                  </div>
                )}
                {hint && (
                  <p className="sfui-error" role="alert">
                    {tt("checkout.hint.payment_none")}
                  </p>
                )}
              </section>
            )}
          </PaymentMethodPicker>

          {notes && (
            <section className="sfui-section">
              <label className="sfui-label" htmlFor="sfui-checkout-note">
                {tt("checkout.notes.label")}
              </label>
              <textarea
                id="sfui-checkout-note"
                value={note}
                placeholder={tt("checkout.notes.placeholder")}
                onChange={(e) => updateNote(e.target.value)}
              />
            </section>
          )}
          {slots.beforeSubmit && slots.beforeSubmit(slotArgs)}
        </div>

        <aside className="sfui-panel sfui-summary" aria-label={tt("checkout.summaryTitle")}>
          <h2 className="sfui-heading sfui-h2">{tt("checkout.summaryTitle")}</h2>
          {slots.aboveSummary && slots.aboveSummary(slotArgs)}
          {couponVisible(coupon, cart, info) && <CouponField tt={tt} />}
          <TotalsBlock cart={cart} tt={tt} />
          {termsCheckbox && (
            <label className="sfui-checkbox">
              <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} />
              {tt("checkout.terms")}
            </label>
          )}
          <button type="button" className="sfui-btn" onClick={submit} disabled={disabled}>
            {placing ? tt("checkout.placing") : tt("checkout.placeOrder")}
          </button>
          {/* A disabled button must say why: one line per blocker, localized. */}
          {!canPlaceOrder && blockers.length > 0 && (
            <ul className="sfui-blockers" aria-live="polite">
              {blockers.map((code) => (
                <li key={code}>{tt(`checkout.blocker.${code}`)}</li>
              ))}
            </ul>
          )}
          {orderError && (
            <p className="sfui-error" role="alert">
              {orderError.code === "card_payment_in_preview"
                ? tt("checkout.error.card_payment_in_preview")
                : orderError.message}
            </p>
          )}
        </aside>
      </div>
    </SfuiRoot>
  );
}

function allowsShipToDifferent(section) {
  return section !== false;
}

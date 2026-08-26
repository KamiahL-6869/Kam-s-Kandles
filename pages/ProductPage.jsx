import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Image } from "@/components/ui/image";
import {
  useProduct,
  useAddToCart,
  useStoreInfo,
  useFormatMoney,
  variantAxes,
  productImages,
  imageIndex,
  productPrice,
  productRibbons,
  productSpecs,
  findSpec,
} from "@/commerce/storefront";

const BUY = {
  ready: "Light the wick",
  adding: "Lighting…",
  sold_out: "Sold out",
  needs_selection: "Select a size",
};

export default function ProductPage() {
  const { slug } = useParams();
  const p = useProduct(slug);
  const buy = useAddToCart(p);
  const { settings } = useStoreInfo();
  const fmt = useFormatMoney();

  const [picked, setPicked] = useState(null);
  const [burn, setBurn] = useState(0);

  useEffect(() => { setPicked(null); }, [p.view?.variation?.id]);

  if (p.status === "loading") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border border-[#4A352D]/20 border-t-[#BC5D37] rounded-full animate-spin" />
      </div>
    );
  }
  if (p.status === "not_found" || p.status === "error") {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 text-center px-6">
        <h1 className="display text-5xl">No such candle</h1>
        <p className="text-[#8E8A5E]">This candle has sold out or doesn't exist.</p>
        <Link to="/" className="btn-ghost">Return to the collection</Link>
      </div>
    );
  }

  const { product, view, price, categories } = p;
  const images = productImages(product);
  const active = picked != null ? images[picked] : (view?.display?.image ?? images[0] ?? null);
  const highlight = picked ?? imageIndex(images, view?.display?.image);
  const axes = variantAxes(view, p.pick);
  const specs = productSpecs(product);
  const ribbons = productRibbons(product);
  const scent = findSpec(specs, "scent");
  const burnSpec = findSpec(specs, "burn");

  const burnHours = Math.round((burn / 100) * (burnSpec ? parseInt(burnSpec.value, 10) || 40 : 40));

  return (
    <div className="mx-auto max-w-[1400px] px-6 lg:px-16 py-10 md:py-16">
      {/* breadcrumbs */}
      <nav className="label-mono mb-10 flex flex-wrap gap-2 items-center">
        <Link to="/" className="hover:text-[#BC5D37]">Collection</Link>
        <span className="text-[#8E8A5E]/50">/</span>
        {categories.map((c) => (
          <Link key={c.id} to={`/?category_id=${c.id}`} className="hover:text-[#BC5D37]">{c.name}</Link>
        ))}
        <span className="text-[#8E8A5E]/50">/</span>
        <span className="text-[#4A352D]">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-12 gap-10 lg:gap-16">
        {/* Gallery — 62% */}
        <div className="md:col-span-7">
          <div className="relative aspect-[4/5] overflow-hidden bg-[#F5EFE4] border border-[#4A352D]/12">
            {active ? (
              <Image
                src={active.src}
                alt={active.alt || product.name}
                fittingType="fill"
                className="w-full h-full object-cover transition-all duration-500"
                style={{
                  filter: `brightness(${1 - burn / 240}) sepia(${burn / 100 * 0.3})`,
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#8E8A5E] label-mono">Unlit</div>
            )}
            <div
              className="absolute inset-0 pointer-events-none transition-opacity duration-500"
              style={{ background: `radial-gradient(circle at 50% 30%, rgba(188,93,55,${burn / 100 * 0.26}), transparent 55%)` }}
            />
          </div>

          {images.length > 1 && (
            <div className="mt-4 flex gap-3">
              {images.map((im, i) => (
                <button
                  key={i}
                  onClick={() => setPicked(i)}
                  className={`relative w-20 h-24 overflow-hidden border transition-colors ${
                    highlight === i ? "border-[#BC5D37]" : "border-[#4A352D]/15 hover:border-[#4A352D]/40"
                  }`}
                >
                  <Image src={im.src} alt={im.alt || product.name} fittingType="fill" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Buy box — 38% */}
        <div className="md:col-span-5 md:sticky md:top-28 self-start">
          {ribbons.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {ribbons.map((r) => (
                <Link key={r.id} to={`/?ribbon_id=${r.id}`} className="ribbon">{r.name}</Link>
              ))}
            </div>
          )}

          <h1 className="display text-5xl md:text-6xl leading-[0.95]">{product.name}</h1>
          {scent && <p className="script text-2xl mt-3 text-[#BC5D37]">{scent.value}</p>}

          <div className="mt-6 flex items-baseline gap-3">
            <span className="price-style text-3xl">{price.label}</span>
            {price.onSale && price.compareAtLabel && (
              <span className="label-mono line-through text-[#8E8A5E]">{price.compareAtLabel}</span>
            )}
          </div>

          {product.short_description && (
            <p
              className="mt-6 text-[#8E8A5E] leading-relaxed text-sm"
              dangerouslySetInnerHTML={{ __html: product.short_description }}
            />
          )}

          {/* Variant selector */}
          {axes.map((axis) => (
            <fieldset key={axis.key} className="mt-8">
              <legend className="label-mono mb-3">
                {axis.name} — <span className="text-[#4A352D]">{axis.selectedOption || "select"}</span>
              </legend>
              <div className="flex flex-wrap gap-3">
                {axis.options.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    disabled={o.disabled}
                    aria-pressed={o.selected}
                    onClick={o.pick}
                    className="chip"
                  >
                    {o.value}{o.outOfStock ? " · sold out" : ""}
                  </button>
                ))}
              </div>
            </fieldset>
          ))}

          {/* Burn time slider — signature moment */}
          <div className="mt-8 panel p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="label-mono">Burn simulation</span>
              <span className="label-mono text-[#BC5D37]">{burnHours}h burned</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={burn}
              onChange={(e) => setBurn(Number(e.target.value))}
              className="burn-range"
              aria-label="Burn simulation"
            />
            <p className="text-xs text-[#8E8A5E] mt-3 leading-relaxed">
              Slide to watch the wax warm and the scent deepen through the hours.
            </p>
          </div>

          {/* Buy */}
          <div className="mt-8">
            <button
              type="button"
              onClick={buy.addToCart}
              disabled={buy.disabled}
              className="btn-cta w-full"
            >
              {BUY[buy.state]}
            </button>
            {buy.error?.message && (
              <p role="alert" className="text-[#A14530] text-sm mt-3">{buy.error.message}</p>
            )}
          </div>

          {/* Specs — branch by type */}
          {specs.length > 0 && (
            <dl className="mt-10 divide-y divide-[#4A352D]/10 border-y border-[#4A352D]/10">
              {specs.map((s) =>
                s.type === "list" ? (
                  <div key={s.key} className="py-4">
                    <dt className="label-mono mb-2">{s.titleLabel}</dt>
                    <dd className="flex flex-wrap items-baseline">
                      {s.items.map((it, i) => (
                        <span key={i} className="display text-lg text-[#4A352D]">
                          {i > 0 && <span className="text-[#BC5D37] mx-2">·</span>}{it}
                        </span>
                      ))}
                    </dd>
                  </div>
                ) : s.type === "duration" || s.type === "numeric" ? (
                  <div key={s.key} className="py-4 flex items-baseline justify-between gap-4">
                    <dt className="label-mono">{s.titleLabel}</dt>
                    <dd className="display text-3xl text-[#BC5D37]">
                      {s.number}{s.unit ? <span className="text-base text-[#8E8A5E] ml-1">{s.unit}</span> : null}
                    </dd>
                  </div>
                ) : (
                  <div key={s.key} className="py-4 flex items-baseline justify-between gap-4">
                    <dt className="label-mono">{s.titleLabel}</dt>
                    <dd className="text-sm text-[#4A352D] text-right">{s.value}</dd>
                  </div>
                )
              )}
            </dl>
          )}
        </div>
      </div>

      {/* Top / Base notes */}
      {product.description && (
        <section className="mt-24 grid md:grid-cols-2 gap-px bg-[#4A352D]/10 border border-[#4A352D]/10">
          <div className="p-8 md:p-12 bg-[#FBF7F0]">
            <span className="label-mono text-[#BC5D37]">Top notes — first light</span>
            <div
              className="mt-5 text-[#4A352D] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </div>
          <div className="p-8 md:p-12 bg-[#F5EFE4]">
            <span className="label-mono">Base notes — the dry-down</span>
            <p className="mt-5 text-[#8E8A5E] leading-relaxed">
              As the candle settles, the deeper accord emerges — {scent ? scent.value.toLowerCase() : "warm botanicals"} —
              lingering gently in the room long after the flame is out. Each vessel is poured to burn clean and even,
              a slow descent from light to quiet warmth.
            </p>
          </div>
        </section>
      )}

      {/* Upsells */}
      {p.upsells?.length > 0 && (
        <section className="mt-24">
          <h2 className="display text-4xl mb-8">Pair with</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {p.upsells.slice(0, 4).map((u) => {
              const ui = productImages(u)[0];
              return (
                <Link key={u.id} to={`/product/${u.slug}`} className="product-card group">
                  <div className="aspect-[3/4] overflow-hidden bg-[#F5EFE4]">
                    {ui && <Image src={ui.src} alt={u.name} fittingType="fill" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />}
                  </div>
                  <div className="flex justify-between items-baseline">
                    <h3 className="display text-xl">{u.name}</h3>
                    <span className="price-style text-base">{productPrice(u, { formatMoney: fmt, fromLabel: "From" }).label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
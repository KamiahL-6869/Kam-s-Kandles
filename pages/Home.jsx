import { Link } from "react-router-dom";
import { Image } from "@/components/ui/image";
import {
  useProductList,
  useFormatMoney,
  productPrice,
  productImages,
  productRibbons,
  productSpecs,
  findSpec,
} from "@/commerce/storefront";

const HERO_IMG = "https://media.base44.com/images/public/6a8f3f176eee72373ff7c3e6/f10f5ab12_generated_image.png";

export default function Home() {
  const list = useProductList({ per_page: 24 });
  const fmt = useFormatMoney();

  return (
    <div>
      {/* ===== Hero — split, desktop ===== */}
      <section className="relative overflow-hidden light-leak">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-16 py-16 md:py-24 grid md:grid-cols-12 gap-10 lg:gap-16 items-center">
          <div className="md:col-span-6 lg:col-span-7">
            <div className="flex flex-col leading-none mb-6">
              <span className="script text-3xl text-[#8E8A5E]">homemade</span>
            </div>
            <h1 className="display text-[15vw] md:text-[8vw] leading-[0.92]">
              KAM'S <span className="text-[#BC5D37]">KANDLES</span>
            </h1>
            <div className="mt-2">
              <span className="script text-3xl text-[#8E8A5E]">organic</span>
            </div>
            <p className="mt-8 max-w-md text-[#8E8A5E] leading-relaxed">
              Hand-poured organic candles made in small batches from pure botanical
              oils and clean wax — light, the natural way.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <a href="#collection" className="btn-cta">Shop the collection</a>
              <a href="#ritual" className="btn-ghost">Our story</a>
            </div>
          </div>

          <div className="md:col-span-6 lg:col-span-5">
            <div className="relative aspect-[4/5] overflow-hidden border border-[#4A352D]/15 bg-[#F5EFE4]">
              <Image
                src={HERO_IMG}
                alt="A hand-poured organic candle with botanical stems and flowers"
                fittingType="fill"
                className="w-full h-full object-cover glow-into"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#FBF7F0]/30 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* ===== Value strip ===== */}
      <section className="border-y border-[#4A352D]/10 bg-[#F5EFE4]">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-16 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { t: "100% organic wax", d: "Clean-burning, never synthetic" },
            { t: "Pure botanical oils", d: "Naturally scented" },
            { t: "Hand-poured", d: "In small batches" },
            { t: "Plastic-free", d: "Recyclable vessels" },
          ].map((v) => (
            <div key={v.t} className="text-center md:text-left">
              <div className="display text-xl">{v.t}</div>
              <div className="label-mono mt-1">{v.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Collection ===== */}
      <section id="collection" className="mx-auto max-w-[1400px] px-6 lg:px-16 py-24 md:py-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <span className="label-mono">01 — The Collection</span>
            <h2 className="display text-5xl md:text-6xl mt-4">Small-batch candles</h2>
          </div>
          <p className="max-w-sm text-[#8E8A5E] text-sm leading-relaxed">
            Six organic pours, each blended from pure botanical oils. Hover to release the scent.
          </p>
        </div>

        {list.status === "loading" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-[#F5EFE4] animate-pulse" />
            ))}
          </div>
        )}

        {list.status === "error" && (
          <div className="panel p-10 text-center">
            <p className="text-[#8E8A5E]">The collection failed to load.</p>
            <button onClick={list.reload} className="btn-ghost mt-6">Try again</button>
          </div>
        )}

        {(list.status === "ready" || list.status === "empty") && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {list.products.map((row) => {
              const imgs = productImages(row);
              const img = imgs[0]?.src;
              const price = productPrice(row, { formatMoney: fmt, fromLabel: "From" });
              const ribbons = productRibbons(row);
              const scent = findSpec(productSpecs(row), "scent");
              return (
                <Link
                  key={row.id}
                  to={`/product/${row.slug}`}
                  className="product-card group"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-[#F5EFE4]">
                    {img ? (
                      <Image
                        src={img}
                        alt={imgs[0]?.alt || row.name}
                        fittingType="fill"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#8E8A5E] label-mono">
                        Unlit
                      </div>
                    )}
                    {ribbons.length > 0 && (
                      <span className="ribbon absolute top-4 left-4">{ribbons[0].name}</span>
                    )}
                    <div className="scent-cloud absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-[#FBF7F0] to-transparent">
                      <span className="script text-2xl text-[#BC5D37]">
                        {scent ? scent.value : "Pure botanicals"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="display text-2xl leading-tight">{row.name}</h3>
                      <span className="label-mono mt-2 block">
                        {scent ? scent.value : "Hand-poured"}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="price-style">{price.label}</div>
                      {price.onSale && price.compareAtLabel && (
                        <div className="label-mono line-through text-[#8E8A5E]">{price.compareAtLabel}</div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {list.status === "empty" && (
          <p className="text-[#8E8A5E] text-center py-20">The shelf is bare. Check back soon.</p>
        )}

        {list.hasNext && (
          <div className="flex justify-center mt-14">
            <button onClick={list.next} disabled={list.busy} className="btn-ghost">
              {list.busy ? "Loading…" : "See more"}
            </button>
          </div>
        )}
      </section>

      {/* ===== Our Story ===== */}
      <section id="ritual" className="border-y border-[#4A352D]/10 bg-[#F5EFE4]">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-16 py-24 md:py-32 grid md:grid-cols-12 gap-10">
          <div className="md:col-span-5">
            <span className="label-mono">02 — Our Story</span>
            <h2 className="display text-5xl md:text-6xl mt-4">Homemade,<br />the slow way.</h2>
          </div>
          <div className="md:col-span-7 space-y-8 text-[#8E8A5E] leading-relaxed">
            <p>
              Every Kam's Kandle is poured by hand in small batches from organic wax and
              pure botanical oils — never synthetic fragrance, never paraffin. We keep
              it simple, natural, and made with care.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { n: "01", t: "Blend", d: "Organic wax and pure botanical oils." },
                { n: "02", t: "Pour", d: "Hand-poured in small batches." },
                { n: "03", t: "Rest", d: "Cured slowly for a clean, even burn." },
              ].map((s) => (
                <div key={s.n} className="p-6 bg-[#FBF7F0] border border-[#4A352D]/10">
                  <span className="label-mono text-[#BC5D37]">{s.n}</span>
                  <div className="display text-2xl mt-3">{s.t}</div>
                  <p className="text-sm mt-2">{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
import { Link } from "react-router-dom";

function providerSlug(provider) {
  return String(provider || "")
    .toLowerCase()
    .replace(/\(isc\)2/g, "isc2")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function providerImageCandidates(provider) {
  const raw = String(provider || "").trim();
  const slug = providerSlug(raw);
  const splitParts = raw
    .split(/[\/|&]/)
    .map((item) => item.trim())
    .filter(Boolean);
  const normalizedSpaces = raw
    .replace(/[\/|&]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const knownAliases = {
    "british-council-idp": ["british-council", "idp", "british-council-idp"],
  };
  const aliasKey = providerSlug(normalizedSpaces);
  const aliases = knownAliases[aliasKey] || [];

  const variants = Array.from(
    new Set([
      normalizedSpaces,
      normalizedSpaces.toLowerCase(),
      normalizedSpaces.replace(/\s+/g, "-"),
      normalizedSpaces.replace(/\s+/g, "_"),
      normalizedSpaces.replace(/[^a-zA-Z0-9]/g, ""),
      normalizedSpaces.toLowerCase().replace(/[^a-z0-9]/g, ""),
      slug,
      slug.replace(/-/g, ""),
      ...splitParts,
      ...splitParts.map((item) => item.toLowerCase()),
      ...splitParts.map((item) => providerSlug(item)),
      ...aliases,
    ]),
  ).filter(Boolean);

  return variants.flatMap((name) => [
    `/images/${name}.png`,
    `/images/${name}.jpg`,
    `/images/${name}.jpeg`,
    `/images/${name}.webp`,
  ]);
}

function CertificationCard({ cert, selectedType, currencyFormatter }) {
  const providerImages = providerImageCandidates(cert.provider);

  return (
    <article className="certification-photo-card">
      <div className="certification-visual">
        <img
          src={providerImages[0]}
          alt={`${cert.provider} visual`}
          className="certification-main-image"
          loading="lazy"
          onError={(event) => {
            const currentIndex = Number(
              event.currentTarget.dataset.imageIndex || "0",
            );
            const nextIndex = currentIndex + 1;

            if (nextIndex < providerImages.length) {
              event.currentTarget.dataset.imageIndex = String(nextIndex);
              event.currentTarget.src = providerImages[nextIndex];
              return;
            }

            event.currentTarget.onerror = null;
            event.currentTarget.src = "/images/Logo.png";
          }}
        />
        <div className="provider-badge">
          <img
            src={providerImages[0]}
            alt={`${cert.provider} logo`}
            className="provider-logo"
            loading="lazy"
            onError={(event) => {
              const currentIndex = Number(
                event.currentTarget.dataset.imageIndex || "0",
              );
              const nextIndex = currentIndex + 1;

              if (nextIndex < providerImages.length) {
                event.currentTarget.dataset.imageIndex = String(nextIndex);
                event.currentTarget.src = providerImages[nextIndex];
                return;
              }

              event.currentTarget.onerror = null;
              event.currentTarget.src = "/images/Logo.png";
            }}
          />
          <span>{cert.provider}</span>
        </div>
      </div>

      <div className="certification-card-content">
        <h4>{cert.name}</h4>
        <div className="certification-tags">
          {cert.isFree && <span className="tag tag-free">Free</span>}
          {cert.isAffordable && (
            <span className="tag tag-affordable">Affordable</span>
          )}
          {!cert.isFree && cert.discountRate === 0.5 ? (
            <span className="tag tag-discount-50">50% OFF</span>
          ) : null}
          {!cert.isFree && cert.discountRate !== 0.5 ? (
            <span className="tag tag-discount-20">20% OFF</span>
          ) : null}
        </div>
      </div>

      <div className="certification-item-actions">
        {cert.isFree ? (
          <span className="certification-item-price free">FREE</span>
        ) : (
          <div className="certification-price-block">
            <span className="certification-item-price-old">
              {currencyFormatter.format(cert.priceTnd)}
            </span>
            <span className="certification-item-price">
              {currencyFormatter.format(cert.discountedPriceTnd)}
            </span>
          </div>
        )}

        <Link
          to={`/payment?name=${encodeURIComponent(cert.name)}&provider=${encodeURIComponent(cert.provider)}&type=${encodeURIComponent(selectedType)}&price=${cert.isFree ? 0 : cert.discountedPriceTnd}`}
          className="certification-purchase-btn"
        >
          <span className="purchase-icon" aria-hidden="true" />
          Purchase
        </Link>
      </div>
    </article>
  );
}

export default CertificationCard;

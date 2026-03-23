import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { certificationCatalog } from "../data/certifications";
import CertificationCard from "./Certification_Card";

const AFFORDABLE_LIMIT_TND = 500;

function CertificationTypePage() {
  const { type } = useParams();
  const [search, setSearch] = useState("");
  const [showFreeOnly, setShowFreeOnly] = useState(false);
  const [showAffordableOnly, setShowAffordableOnly] = useState(false);

  const selectedType = useMemo(() => decodeURIComponent(type || ""), [type]);

  const selectedDomain = useMemo(
    () =>
      certificationCatalog.find(
        (entry) => entry.type.toLowerCase() === selectedType.toLowerCase(),
      ),
    [selectedType],
  );

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("fr-TN", {
        style: "currency",
        currency: "TND",
        maximumFractionDigits: 0,
      }),
    [],
  );

  const filteredCertifications = useMemo(() => {
    if (!selectedDomain) {
      return [];
    }

    return selectedDomain.certifications
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((cert) => {
        const discountRate = cert.priceTnd > 1000 ? 0.5 : 0.2;
        const discountedPriceTnd = Math.round(
          cert.priceTnd * (1 - discountRate),
        );
        return {
          ...cert,
          discountRate,
          discountedPriceTnd,
          isFree: cert.priceTnd === 0,
          isAffordable:
            cert.priceTnd > 0 && cert.priceTnd <= AFFORDABLE_LIMIT_TND,
        };
      })
      .filter((cert) => {
        const matchesSearch =
          cert.name.toLowerCase().includes(search.toLowerCase()) ||
          cert.provider.toLowerCase().includes(search.toLowerCase());
        const matchesFree = !showFreeOnly || cert.isFree;
        const matchesAffordable = !showAffordableOnly || cert.isAffordable;
        return matchesSearch && matchesFree && matchesAffordable;
      });
  }, [search, selectedDomain, showAffordableOnly, showFreeOnly]);

  if (!selectedType) {
    return (
      <div className="certification-placeholder">
        Select a certification type.
      </div>
    );
  }

  return (
    <section className="certification-type-page">
      <h2>{selectedType}</h2>
      {!selectedDomain ? (
        <p className="certification-empty">
          No certifications found for this type.
        </p>
      ) : (
        <>
          <p className="discount-banner">
            Discount applied: 20% OFF on all certifications, and 50% OFF on
            certifications above 1000 DT.
          </p>

          <div className="certification-filters">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search certification or provider"
            />
            <label>
              <input
                type="checkbox"
                checked={showFreeOnly}
                onChange={(event) => setShowFreeOnly(event.target.checked)}
              />
              Free only
            </label>
            <label>
              <input
                type="checkbox"
                checked={showAffordableOnly}
                onChange={(event) =>
                  setShowAffordableOnly(event.target.checked)
                }
              />
              Affordable only (≤ {AFFORDABLE_LIMIT_TND} DT)
            </label>
          </div>

          <h3>Professional Certifications</h3>
          {filteredCertifications.length === 0 ? (
            <p className="certification-empty">
              No certifications match your current filters.
            </p>
          ) : (
            <div className="certification-card-grid">
              {filteredCertifications.map((cert) => (
                <CertificationCard
                  key={`${cert.provider}-${cert.name}`}
                  cert={cert}
                  selectedType={selectedType}
                  currencyFormatter={currencyFormatter}
                />
              ))}
            </div>
          )}

          <h3>Free Courses</h3>
          <ul className="free-course-list">
            {selectedDomain.freeCourses.map((course) => (
              <li key={course.title}>
                <a href={course.url} target="_blank" rel="noreferrer">
                  {course.title}
                </a>
                <span className="free-course-meta">
                  {course.university} · {course.platform}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

export default CertificationTypePage;

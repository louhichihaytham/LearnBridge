import { Link } from "react-router-dom";
import { certificationCatalog } from "../data/certifications";
import "../CSS/HomePage.css";

function HomePage({ isAuthenticated }) {
  const supportedDomains = certificationCatalog
    .map((domain) => domain.type)
    .sort((a, b) => a.localeCompare(b));

  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="home-branding">
          <img
            src="/images/Logo.png"
            alt="LearnBridge logo"
            className="home-logo"
          />
          <div>
            <h1>LearnBridge</h1>
            <p>
              LearnBridge is a career guidance platform that helps students and
              graduates discover the right certification path, build in-demand
              skills, and move faster toward employment opportunities.
            </p>
          </div>
        </div>
        <div className="home-hero-actions">
          {isAuthenticated ? (
            <Link to="/certifications/Cloud" className="home-primary-button">
              Go to Certifications
            </Link>
          ) : (
            <Link to="/signin" className="home-primary-button">
              Sign In to Unlock Certifications
            </Link>
          )}
          <Link to="/get-hired" className="home-secondary-button">
            Open Get Hired
          </Link>
        </div>
      </section>

      <section className="home-block">
        <h2>Project Mission</h2>
        <p className="home-mission">
          We connect learning to real market demand using AI-powered role
          matching, certification recommendations, and practical job discovery
          support.
        </p>
      </section>

      <section className="home-block">
        <h2>Supported Domains</h2>
        <div className="domain-grid">
          {supportedDomains.map((domainType) => (
            <Link
              key={domainType}
              className="domain-chip"
              to={
                isAuthenticated
                  ? `/certifications/${encodeURIComponent(domainType)}`
                  : "/signin"
              }
              state={
                isAuthenticated
                  ? undefined
                  : {
                      from: `/certifications/${encodeURIComponent(domainType)}`,
                    }
              }
            >
              {domainType}
            </Link>
          ))}
        </div>
      </section>

      <section className="home-block">
        <h2>Supporters</h2>
        <p className="home-support-text">
          This project is supported by national institutions committed to
          education, research, and professional development.
        </p>
        <div className="supporters-grid">
          <a
            className="supporter-link"
            href="https://www.mes.tn"
            target="_blank"
            rel="noreferrer"
          >
            <article className="supporter-card">
              <img
                src="/images/Ministere-Enseignement.png"
                alt="Ministry of Higher Education and Scientific Research"
              />
              <h3>Ministry of Higher Education and Scientific Research</h3>
            </article>
          </a>

          <a
            className="supporter-link"
            href="https://www.finances.gov.tn"
            target="_blank"
            rel="noreferrer"
          >
            <article className="supporter-card">
              <img
                src="/images/Ministere-Finances.png"
                alt="Ministry of Finance"
              />
              <h3>Ministry of Finance</h3>
            </article>
          </a>
        </div>
      </section>
    </main>
  );
}

export default HomePage;

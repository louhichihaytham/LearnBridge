import "../CSS/CertificationBar.css";
import { NavLink } from "react-router-dom";
import { certificationTypes } from "../data/certifications";

function CertificationBar() {
  return (
    <aside className="certification-sidebar">
      <h1>Certification Types</h1>
      <ul>
        {certificationTypes.map((type) => (
          <li key={type}>
            <NavLink
              to={`/certifications/${encodeURIComponent(type)}`}
              className={({ isActive }) =>
                isActive
                  ? "certification-type-link active"
                  : "certification-type-link"
              }
            >
              {type}
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default CertificationBar;

import "../CSS/Navbar.css";
import { Link, NavLink } from "react-router-dom";

function Navbar({ isAuthenticated, username, userEmail, onSignOut }) {
  const displayName = username || userEmail || "User";

  return (
    <nav className="navbar">
      <Link to="/" className="brand-link">
        <img
          src="/images/Logo.png"
          alt="LearnBridge logo"
          className="brand-logo"
        />
        <span className="brand-text">LearnBridge</span>
      </Link>
      <ul className="nav-links">
        <li>
          <NavLink to="/" className="top-nav-link">
            Home
          </NavLink>
        </li>
        <li>
          <NavLink
            to={isAuthenticated ? "/certifications/Cloud" : "/signin"}
            className="top-nav-link"
          >
            Certifications
          </NavLink>
        </li>
        <li>
          <NavLink to="/get-hired" className="top-nav-link">
            Get Hired
          </NavLink>
        </li>
        {isAuthenticated ? (
          <li>
            <NavLink to="/dashboard" className="top-nav-link">
              Dashboard
            </NavLink>
          </li>
        ) : null}
        {isAuthenticated ? (
          <>
            <li className="user-email">{displayName}</li>
            <li>
              <button type="button" onClick={onSignOut}>
                Sign Out
              </button>
            </li>
          </>
        ) : (
          <li>
            <Link to="/signin" className="signin-link-button">
              Sign In
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}
export default Navbar;

import { useEffect, useState } from "react";
import "./App.css";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import Navbar from "./component/Navbar.jsx";
import CertificationBar from "./component/Certification_Bar.jsx";
import CertificationTypePage from "./component/Certification_Type_Page.jsx";
import HomePage from "./component/HomePage.jsx";
import HelpPage from "./component/HelpPage.jsx";
import PaymentPage from "./component/PaymentPage.jsx";
import UniversityLogin from "./component/UniversityLogin.jsx";
import CareerDashboard from "./component/CareerDashboard.jsx";

const AUTH_STORAGE_KEY = "learnbridge-auth";

function ProtectedCertificationLayout({ isAuthenticated }) {
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate to="/signin" replace state={{ from: location.pathname }} />
    );
  }

  return (
    <section className="certification-layout">
      <CertificationBar />
      <main className="certification-content">
        <CertificationTypePage />
      </main>
    </section>
  );
}

function App() {
  const [auth, setAuth] = useState(() => {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (auth?.verified) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
      return;
    }

    localStorage.removeItem(AUTH_STORAGE_KEY);
  }, [auth]);

  return (
    <BrowserRouter>
      <div className="App">
        <Navbar
          isAuthenticated={Boolean(auth?.verified)}
          username={auth?.username}
          userEmail={auth?.email}
          onSignOut={() => setAuth(null)}
        />
        <Routes>
          <Route
            path="/"
            element={<HomePage isAuthenticated={Boolean(auth?.verified)} />}
          />
          <Route
            path="/signin"
            element={
              <UniversityLogin
                onVerified={setAuth}
                isAuthenticated={Boolean(auth?.verified)}
              />
            }
          />
          <Route
            path="/get-hired"
            element={<HelpPage isAuthenticated={Boolean(auth?.verified)} />}
          />
          <Route
            path="/payment"
            element={<PaymentPage isAuthenticated={Boolean(auth?.verified)} />}
          />
          <Route
            path="/dashboard"
            element={
              <CareerDashboard isAuthenticated={Boolean(auth?.verified)} />
            }
          />
          <Route
            path="/certifications/:type"
            element={
              <ProtectedCertificationLayout
                isAuthenticated={Boolean(auth?.verified)}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;

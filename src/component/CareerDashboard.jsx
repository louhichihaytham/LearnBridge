import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../CSS/CareerDashboard.css";
import { readList, storage, writeList } from "../utils/careerData";

const statusOptions = ["Saved", "Applied", "Interview", "Rejected", "Offer"];

function getStatusClass(status) {
  return `status-chip ${String(status || "Saved").toLowerCase()}`;
}

function CareerDashboard({ isAuthenticated }) {
  const [savedSearches, setSavedSearches] = useState(() =>
    readList(storage.savedSearches),
  );
  const [savedPlans, setSavedPlans] = useState(() =>
    readList(storage.savedPlans),
  );
  const [paymentHistory] = useState(() => readList(storage.paymentHistory));
  const [jobTracker, setJobTracker] = useState(() =>
    readList(storage.jobTracker),
  );

  const [jobTitleInput, setJobTitleInput] = useState("");
  const [companyInput, setCompanyInput] = useState("");

  const analytics = useMemo(() => {
    const totalSpent = paymentHistory.reduce(
      (sum, item) => sum + Number(item.amountTnd || 0),
      0,
    );

    const statusCounts = statusOptions.reduce((acc, status) => {
      acc[status] = jobTracker.filter((item) => item.status === status).length;
      return acc;
    }, {});

    return {
      savedSearches: savedSearches.length,
      savedPlans: savedPlans.length,
      trackedJobs: jobTracker.length,
      totalSpent,
      statusCounts,
    };
  }, [paymentHistory, jobTracker, savedPlans.length, savedSearches.length]);

  const updateJobTracker = (next) => {
    setJobTracker(next);
    writeList(storage.jobTracker, next);
  };

  const addJob = () => {
    const role = jobTitleInput.trim();
    const company = companyInput.trim();

    if (!role || !company) {
      return;
    }

    const next = [
      {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        role,
        company,
        status: "Saved",
        createdAt: new Date().toISOString(),
      },
      ...jobTracker,
    ];

    updateJobTracker(next);
    setJobTitleInput("");
    setCompanyInput("");
  };

  const updateJobStatus = (id, status) => {
    const next = jobTracker.map((item) =>
      item.id === id ? { ...item, status } : item,
    );
    updateJobTracker(next);
  };

  const removeJob = (id) => {
    const next = jobTracker.filter((item) => item.id !== id);
    updateJobTracker(next);
  };

  const removeSavedSearch = (id) => {
    const next = savedSearches.filter((item) => item.id !== id);
    setSavedSearches(next);
    writeList(storage.savedSearches, next);
  };

  const removeSavedPlan = (id) => {
    const next = savedPlans.filter((item) => item.id !== id);
    setSavedPlans(next);
    writeList(storage.savedPlans, next);
  };

  const exportProfile = () => {
    const payload = {
      generatedAt: new Date().toISOString(),
      analytics,
      savedSearches,
      savedPlans,
      jobTracker,
      paymentHistory,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "learnbridge-career-profile.json";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  if (!isAuthenticated) {
    return (
      <main className="dashboard-page">
        <section className="dashboard-card">
          <h1>Career Dashboard</h1>
          <p>
            Sign in to access your saved plans, tracker, and payment history.
          </p>
          <Link to="/signin" className="dashboard-link-button">
            Sign In
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="dashboard-page">
      <section className="dashboard-hero">
        <div>
          <h1>Career Dashboard</h1>
          <p>
            Manage your saved AI searches, certification plans, application
            tracker, and spending in one place.
          </p>
        </div>
        <button
          type="button"
          className="dashboard-export"
          onClick={exportProfile}
        >
          Export Recruiter Profile
        </button>
      </section>

      <section className="dashboard-metrics">
        <article>
          <h3>Saved Searches</h3>
          <strong>{analytics.savedSearches}</strong>
        </article>
        <article>
          <h3>Saved Plans</h3>
          <strong>{analytics.savedPlans}</strong>
        </article>
        <article>
          <h3>Tracked Jobs</h3>
          <strong>{analytics.trackedJobs}</strong>
        </article>
        <article>
          <h3>Total Spend (TND)</h3>
          <strong>{analytics.totalSpent.toFixed(2)}</strong>
        </article>
      </section>

      <section className="dashboard-grid">
        <article className="dashboard-card">
          <h2>Saved Searches</h2>
          {!savedSearches.length ? (
            <p className="empty-copy">
              No saved searches yet. Save one from Get Hired.
            </p>
          ) : (
            <ul className="dashboard-list">
              {savedSearches.map((item) => (
                <li key={item.id}>
                  <div>
                    <strong>{item.selectedRole || "Untitled role"}</strong>
                    <span>{item.skillsText || "No skills text"}</span>
                    <span>{new Date(item.savedAt).toLocaleString()}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSavedSearch(item.id)}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="dashboard-card">
          <h2>Saved Certification Plans</h2>
          {!savedPlans.length ? (
            <p className="empty-copy">
              No saved plans yet. Save one from Get Hired.
            </p>
          ) : (
            <ul className="dashboard-list">
              {savedPlans.map((plan) => (
                <li key={plan.id}>
                  <div>
                    <strong>{plan.matchedRole}</strong>
                    <span>
                      {plan.recommendations?.length || 0} recommendations
                    </span>
                    <span>{new Date(plan.savedAt).toLocaleString()}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSavedPlan(plan.id)}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="dashboard-card full-width">
          <h2>Job Application Tracker</h2>
          <div className="tracker-inputs">
            <input
              type="text"
              value={jobTitleInput}
              onChange={(event) => setJobTitleInput(event.target.value)}
              placeholder="Role title"
            />
            <input
              type="text"
              value={companyInput}
              onChange={(event) => setCompanyInput(event.target.value)}
              placeholder="Company"
            />
            <button type="button" onClick={addJob}>
              Add Job
            </button>
          </div>

          <div className="status-summary">
            {statusOptions.map((status) => (
              <span key={status} className={getStatusClass(status)}>
                {status}: {analytics.statusCounts[status] || 0}
              </span>
            ))}
          </div>

          {!jobTracker.length ? (
            <p className="empty-copy">No tracked jobs yet.</p>
          ) : (
            <ul className="dashboard-list tracker-list">
              {jobTracker.map((item) => (
                <li key={item.id}>
                  <div>
                    <strong>{item.role}</strong>
                    <span>{item.company}</span>
                  </div>
                  <div className="tracker-actions">
                    <select
                      value={item.status}
                      onChange={(event) =>
                        updateJobStatus(item.id, event.target.value)
                      }
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <button type="button" onClick={() => removeJob(item.id)}>
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="dashboard-card full-width">
          <h2>Payment History</h2>
          {!paymentHistory.length ? (
            <p className="empty-copy">No purchases yet.</p>
          ) : (
            <ul className="dashboard-list">
              {paymentHistory.map((item) => (
                <li key={item.id}>
                  <div>
                    <strong>{item.certificationName}</strong>
                    <span>{item.certificationProvider}</span>
                    <span>{new Date(item.paidAt).toLocaleString()}</span>
                  </div>
                  <strong>{Number(item.amountTnd).toFixed(2)} TND</strong>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>
    </main>
  );
}

export default CareerDashboard;

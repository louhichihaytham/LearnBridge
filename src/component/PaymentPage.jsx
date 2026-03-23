import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import "../CSS/PaymentPage.css";
import { appendItem, storage } from "../utils/careerData";
import { apiUrl } from "../utils/api";

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

function PaymentPage({ isAuthenticated }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [certification, setCertification] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [email, setEmail] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  const providerImages = providerImageCandidates(certification?.provider);

  useEffect(() => {
    // Get certification data from URL params
    const certName = searchParams.get("name");
    const certProvider = searchParams.get("provider");
    const certType = searchParams.get("type");
    const certPrice = searchParams.get("price");

    if (certName && certProvider && certType) {
      setCertification({
        name: certName,
        provider: certProvider,
        type: certType,
        price: certPrice ? parseFloat(certPrice) : 99.99, // Default price if not provided
      });
    } else {
      setPaymentError("Missing certification information. Please try again.");
    }
  }, [searchParams]);

  const handleBackNavigation = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/get-hired", { replace: true });
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setPaymentError("Please enter a valid email address.");
      return;
    }

    if (!certification) {
      setPaymentError("Certification information is missing.");
      return;
    }

    if (!cardholderName.trim()) {
      setPaymentError("Please enter the cardholder name.");
      return;
    }

    const normalizedCardNumber = cardNumber.replace(/\s+/g, "");
    if (!/^\d{16}$/.test(normalizedCardNumber)) {
      setPaymentError("Please enter a valid 16-digit card number.");
      return;
    }

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryDate)) {
      setPaymentError("Please enter a valid expiry date (MM/YY).");
      return;
    }

    if (!/^\d{3,4}$/.test(cvv)) {
      setPaymentError("Please enter a valid CVV.");
      return;
    }

    setIsProcessing(true);
    setPaymentError("");

    try {
      // Call backend to create payment intent
      const response = await fetch(apiUrl("/api/payments/create-intent"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          certificationName: certification.name,
          certificationProvider: certification.provider,
          certificationPrice: certification.price,
          cardholderName: cardholderName.trim(),
          cardLast4: normalizedCardNumber.slice(-4),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setPaymentError(
          data?.message || "Payment setup failed. Please try again.",
        );
        setIsProcessing(false);
        return;
      }

      // In a real implementation, you would redirect to Stripe checkout here
      // For now, we'll show a success message
      setPaymentSuccess(true);

      appendItem(storage.paymentHistory, {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        paidAt: new Date().toISOString(),
        email: email.trim(),
        certificationName: certification.name,
        certificationProvider: certification.provider,
        amountTnd: Number(certification.price || 0),
        cardLast4: normalizedCardNumber.slice(-4),
      });

      // Simulate transaction
      console.log("Payment Intent Created:", data);

      // Show success and redirect after 3 seconds
      setTimeout(() => {
        navigate("/get-hired", { replace: true });
      }, 3000);
    } catch (error) {
      setPaymentError(
        "Network error. Please check your connection and try again.",
      );
      console.error("Payment error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="payment-page">
        <section className="payment-container">
          <div className="payment-alert">
            <h2>Sign In Required</h2>
            <p>You need to be signed in to purchase certifications.</p>
            <Link to="/signin" className="payment-button primary">
              Sign In
            </Link>
          </div>
        </section>
      </main>
    );
  }

  if (!certification) {
    return (
      <main className="payment-page">
        <section className="payment-container">
          <div className="payment-alert error">
            <h2>Error</h2>
            <p>{paymentError || "Unable to load certification details."}</p>
            <Link to="/get-hired" className="payment-button primary">
              Back to Get Hired
            </Link>
          </div>
        </section>
      </main>
    );
  }

  if (paymentSuccess) {
    return (
      <main className="payment-page">
        <section className="payment-container">
          <div className="payment-success">
            <h2>✓ Payment Successful!</h2>
            <p>Thank you for your purchase!</p>
            <div className="payment-receipt">
              <div className="receipt-item">
                <strong>{certification.name}</strong>
                <span>by {certification.provider}</span>
              </div>
              <div className="receipt-total">
                <strong>Amount Paid:</strong>
                <span>{certification.price.toFixed(2)} TND</span>
              </div>
              <p className="receipt-message">
                A confirmation email has been sent to <strong>{email}</strong>
              </p>
            </div>
            <p className="redirect-message">Redirecting to Get Hired page...</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="payment-page">
      <section className="payment-container">
        <div className="payment-header">
          <button
            type="button"
            className="payment-back-link payment-back-button"
            onClick={handleBackNavigation}
          >
            ← Back
          </button>
          <h1>Purchase Certification</h1>
        </div>

        <div className="payment-content">
          <div className="payment-summary">
            <h2>Order Summary</h2>
            <div className="payment-cert-media">
              <img
                src={providerImages[0] || "/images/Logo.png"}
                alt={`${certification.provider} visual`}
                className="payment-cert-image"
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
            </div>
            <div className="summary-item">
              <span>Certification:</span>
              <strong>{certification.name}</strong>
            </div>
            <div className="summary-item">
              <span>Provider:</span>
              <span>{certification.provider}</span>
            </div>
            <div className="summary-item">
              <span>Category:</span>
              <span>{certification.type}</span>
            </div>
            <div className="summary-item">
              <span>Price:</span>
              <span>{certification.price.toFixed(2)} TND</span>
            </div>
            <div className="summary-total">
              <strong>Total:</strong>
              <strong>{certification.price.toFixed(2)} TND</strong>
            </div>
          </div>

          <form onSubmit={handlePayment} className="payment-form">
            <h2>Payment Information</h2>

            {paymentError && (
              <div className="payment-error">{paymentError}</div>
            )}

            <fieldset>
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </fieldset>

            <fieldset>
              <label htmlFor="cardholderName">Cardholder Name</label>
              <input
                id="cardholderName"
                type="text"
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
                placeholder="Name on card"
                required
              />
            </fieldset>

            <fieldset>
              <label htmlFor="cardNumber">Card Number</label>
              <input
                id="cardNumber"
                type="text"
                value={cardNumber}
                onChange={(e) => {
                  const digitsOnly = e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 16);
                  const grouped = digitsOnly.replace(/(\d{4})(?=\d)/g, "$1 ");
                  setCardNumber(grouped);
                }}
                placeholder="1234 5678 9012 3456"
                inputMode="numeric"
                autoComplete="cc-number"
                required
              />
            </fieldset>

            <fieldset className="card-grid">
              <div>
                <label htmlFor="expiryDate">Expiry Date</label>
                <input
                  id="expiryDate"
                  type="text"
                  value={expiryDate}
                  onChange={(e) => {
                    const digitsOnly = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 4);
                    const formatted =
                      digitsOnly.length > 2
                        ? `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2)}`
                        : digitsOnly;
                    setExpiryDate(formatted);
                  }}
                  placeholder="MM/YY"
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  required
                />
              </div>
              <div>
                <label htmlFor="cvv">CVV</label>
                <input
                  id="cvv"
                  type="password"
                  value={cvv}
                  onChange={(e) =>
                    setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))
                  }
                  placeholder="123"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  required
                />
              </div>
            </fieldset>

            <div
              className="card-example-row"
              aria-label="Accepted card examples"
            >
              <div className="card-example-item">
                <img src="/images/mastercard.png" alt="Mastercard example" />
                <span>Mastercard</span>
              </div>
              <div className="card-example-item">
                <img src="/images/edinar.jpg" alt="e-Dinar card example" />
                <span>e-Dinar</span>
              </div>
            </div>

            <button
              type="submit"
              className="payment-button primary"
              disabled={isProcessing}
            >
              {isProcessing
                ? "Processing..."
                : `Pay ${certification.price.toFixed(2)} TND`}
            </button>

            <p className="payment-disclaimer">
              Your payment information is secure. By clicking Pay, you agree to
              our Terms of Service.
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}

export default PaymentPage;

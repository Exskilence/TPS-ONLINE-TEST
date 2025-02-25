import React, { useState, useEffect } from "react";
import { Container, Card, Spinner, Alert } from "react-bootstrap";

const ThankYou = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://thoughtprocesstestbackend.azurewebsites.net/test/submit/", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ email: sessionStorage.getItem("Email") }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok.");
        }
        return response.json();
      })
      .then((data) => {
        setData(data.message || "Test submitted successfully!");
      })
      .catch((error) => {
        setError("Failed to submit test. Please try again.");
        console.error("Fetch error:", error);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Card className="shadow-lg p-4 text-center" style={{ maxWidth: "400px", width: "100%" }}>
        <Card.Body>
          <h2 className="text-primary fw-bold">Thank You!</h2>
          {loading ? (
            <Spinner animation="border" variant="primary" className="mt-3" />
          ) : error ? (
            <Alert variant="danger" className="mt-3">
              {error}
            </Alert>
          ) : (
            <h4 className="mt-3 text-success">{data}</h4>
          )}
          <p className="mt-3 text-muted">Test Over</p>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ThankYou;
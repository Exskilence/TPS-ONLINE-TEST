import React, { useState, useEffect } from "react";
import { Button, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Header() {
  const [time, setTime] = useState(() => {
    const storedTime = sessionStorage.getItem("time");
    return storedTime ? parseInt(storedTime, 10) : 3600;
  });
  const [showSkipConfirmation, setShowSkipConfirmation] = useState(false);
  const navigate = useNavigate();
  const [duration, setDuration] = useState();

  useEffect(() => {
    trigger();
    const interval = setInterval(trigger, 120000 / 4);

    return () => clearInterval(interval);
  }, []);

  const trigger = async () => {
    try {
      const response = await axios.post(
        "https://thoughtprocesstestbackend.azurewebsites.net/duration/",
        {
          email: sessionStorage.getItem("Email"),
        }
      );
      console.log("Response received:", response.data);
    } catch (error) {
      console.error("Error fetching the data:", error);
    }
  };

  const handleTestSubmit = () => {
    const postData = {
      email: sessionStorage.getItem("Email"),
    };

    fetch("https://thoughtprocesstestbackend.azurewebsites.net/test/submit/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    })
      .then((response) => {
        if (!response.ok) {
          navigate("/ThankYou");
          return Promise.reject("Network response was not ok.");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Submission successful:", data);
        navigate("/ThankYou");
      })
      .catch((error) => console.error("Error submitting:", error));
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prevTime) => {
        const remainingTime = prevTime;
        if (remainingTime-sessionStorage.getItem('duration') <= 0) {
          handleTestSubmit();
          return 0;
        }
        sessionStorage.setItem("time", remainingTime.toString());
        return prevTime - 1;
      });
    }, 1000);

    // const handleUnload = () => {
    //   sessionStorage.setItem("time", time.toString());
    // };
    // window.addEventListener("beforeunload", handleUnload);

    return () => {
      clearInterval(interval);
      // window.removeEventListener("beforeunload", handleUnload);
    };
  }, [time, duration]);

  const confirmModal = () => {
    setShowSkipConfirmation(true);
  };

  return (
    <div>
      <header className="bg-dark text-white py-3 px-4 d-flex justify-content-between align-items-center shadow-sm">
        <h4 className="m-0 fw-bold">Thought Process Coding Assessment</h4>
        <div className="d-flex align-items-center">
          <i className="bi bi-clock me-2"></i>
          <span>Time Left: {time - duration <= 0 ? "00:00" : formatTime(time - sessionStorage.getItem("duration"))}</span>
        </div>
        <button className="btn btn-secondary" onClick={confirmModal}>
          Submit Assessment
        </button>
      </header>
      <Modal show={showSkipConfirmation} onHide={() => setShowSkipConfirmation(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm End test</Modal.Title>
        </Modal.Header>
        <Modal.Body>Do you want to end the test?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSkipConfirmation(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleTestSubmit}>
            Yes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Header;

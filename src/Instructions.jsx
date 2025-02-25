import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import timer from "./components/images/Timer.png";
import problems from "./components/images/problems.png";

function Instructions() {
  const location = useLocation();
  const title = location.state?.title;
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [duration, setDuration] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state
  const [user_on, setUserOn] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(
          "https://thoughtprocesstestbackend.azurewebsites.net/get/coding/",
          {
            email: sessionStorage.getItem('Email')
          }
        );
        // console.log("Varun", response.data.data)
        if (response.data.data == "Test Already Completed"){
          
          navigate("/ThankYou")
        }
        setData(response.data);
        setDuration(response.data.duration);
        sessionStorage.setItem('duration', response.data.duration);
        sessionStorage.setItem('questionData', JSON.stringify(response.data));
        console.log("SUGHRHGDFHKHK")
        console.log("VARIJSHJS",response.data.data[1].User_ans)
        sessionStorage.setItem('JSUserAnswer', response.data.data[1].User_ans || "");
        sessionStorage.setItem('HTMLUserAnswer', response.data.data[0].User_HTML_ans || "")
        sessionStorage.setItem('CSSUserAnswer', response.data.data[0].User_CSS_ans || "")
        sessionStorage.setItem('PYUserAnswer', response.data.data[3].User_ans || "")
        sessionStorage.setItem('SQLUserAnswer', response.data.data[2].User_SQL_ans || "")
        setUserOn(response.data.user_on);
      } catch (error) {
        console.error("Error fetching the data:", error);
      } finally {
        setLoading(false); 
      }
    };
    sessionStorage.setItem('time', 3600)
    fetchData();
  }, []);

  const handleStartTest = () => {
    if (data && data.data && data.data.length > 0) {
      const htmlcss = data.data[0];
      const js = data.data[1];
      const sql = data.data[2];
      const py = data.data[3];
      
      if (data && data.data && data.data.length > 0) {
 
        if (data.user_on === 0) {
          navigate("/HTMLCSSEditor", { state: { questionData: data.data } });
        } else if (data.user_on === 1) {
          navigate("/JSEditor", { state: { questionData: data.data } });
        } else if (data.user_on === 2) {
          navigate("/SQLEditor", { state: { questionData: data.data } });
        } else if (data.user_on === 3) {
          navigate("/PYEditor", { state: { questionData: data.data } });
        }
      }
    }
  };

  return (
    <div className="container-fluid mt-5">
      <div className="row m-3 border rounded-1 py-4" style={{ boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)", backgroundColor: "white" }}>
        <div className="col d-flex justify-content-center align-items-center">
          <div>
            <img src={timer} alt="Timer" style={{ width: "50px", height: "50px" }} />
          </div>
          <div className="ms-2">
            <p className="m-0 fs-5 fw-bold">1 hr</p>
            <p className="m-0">test duration</p>
          </div>
        </div>
        <div className="col d-flex justify-content-center align-items-center">
          <div>
            <img src={problems} alt="Problems" style={{ width: "50px", height: "50px" }} />
          </div>
          <div className="ms-2">
            <p className="m-0 fs-5 fw-bold">4</p>
            <p className="m-0">questions to be solved</p>
          </div>
        </div>
      </div>
      <div className="row m-3 border rounded-1" style={{ boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)", backgroundColor: "white" }}>
        <span className="p-0 m-0 py-2 px-4" style={{ backgroundColor: "#FCFCFC" }}>
          Instructions
        </span>
        <div className="py-1 ps-4">
          <p>To enjoy the best experience on our platform, please ensure</p>
          <p className="p-0 m-0 fw-bold ps-2">1. The operating system on your computer is one of the 3 mentioned below:</p>
          <ul className="ps-5">
            <li>Windows 7 and above</li>
            <li>Linux distributions or </li>
            <li>Mac OS X 10.6 and above</li>
          </ul>
          <p className="p-0 m-0 fw-bold ps-2">2. You are opening the assessment in the latest versions of one of the browsers mentioned below:</p>
          <ul className="ps-5" style={{ color: "green" }}>
            <li style={{ color: "black" }}>Chrome/ Chromium</li>
            <li style={{ color: "black" }}>Mozilla Firefox</li>
            <li style={{ color: "black" }}>Microsoft Edge</li>
            <li style={{ color: "black" }}>Apple Safari</li>
          </ul>
          <p className="ps-5">After completing four questions, please press the submit button to finalize your test.</p>
        </div>
      </div>
      <div className="d-flex justify-content-end pe-4 mt-3">
        <button
          className="btn border border-black fw-bold"
          style={{ borderRadius: "10px", width: "150px", boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)" }}
          onClick={handleStartTest}
          disabled={loading} // Disable button while loading
        >
          {loading ? "Loading..." : "Start Test"}
        </button>
      </div>
    </div>
  );
}

export default Instructions;

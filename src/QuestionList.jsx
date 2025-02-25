import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ClimbingBoxLoader } from "react-spinners";
 
const QuestionList = () => {
  const navigate = useNavigate();
  const location = useLocation();
 
  // Get data from sessionStorage that was set in the Instructions component
  const getStoredData = () => {
    const storedData = sessionStorage.getItem('questionData');
    return storedData ? JSON.parse(storedData) : null;
  };
 
  const handleQuestionClick = (questionNumber) => {
 
    console.log("Question number:", questionNumber);
    const data = getStoredData();
   
    if (!data || !data.data || !data.data[questionNumber - 1]) {
      console.error("Question data not available");
      return;
    }
 
    const questionData = data.data;
   
    switch (questionNumber) {
      case 1:
        navigate("/HTMLCSSEditor", { state: { questionData } });
        break;
      case 2:
        navigate("/JSEditor", { state: { questionData } });
        break;
      case 3:
        navigate("/SQLEditor", { state: { questionData } });
        break;
      case 4:
        navigate("/PYEditor", { state: { questionData } });
        break;
      default:
        break;
    }
  };
 
  const getButtonStyle = (questionNumber) => {
    const pathMap = {
      1: "/HTMLCSSEditor",
      2: "/JSEditor",
      3: "/SQLEditor",
      4: "/PYEditor",
    };
 
    return location.pathname === pathMap[questionNumber]
      ? { width: "40px", height: "40px", backgroundColor: "#42FF58", color: "#000", cursor: "pointer" }
      : { width: "40px", height: "40px", backgroundColor: "transparent", color: "#000", cursor: "pointer" };
  };
 
  return (
    <div className="col-auto ps-0 d-flex flex-column align-items-center" style={{ width: "60px", marginLeft: "-15px" }}>
      {[1, 2, 3, 4].map((number) => (
        <button
          key={number}
          className="btn border border-dark rounded-2 my-1 px-2 mx-auto"
          style={getButtonStyle(number)}
          onClick={() => handleQuestionClick(number)}
 
        >
          Q{number}
        </button>
      ))}
    </div>
  );
};
 
export default QuestionList;
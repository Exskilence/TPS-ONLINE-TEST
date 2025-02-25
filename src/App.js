import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from './Login';
import Instructions from './Instructions';
import SQLEditor from "./SQLEditor";
import PyEditor from "./PyEditor";
import HTMLCSSEditor from "./HTMLCSSEditor";
import JSEditor from "./JSEditor";
import QuestionList from "./QuestionList";
import 'bootstrap/dist/css/bootstrap.min.css';
import ThankYou from "./ThankYou";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/Instruction" element={<Instructions />} />
        <Route path="/SQLEditor" element={<SQLEditor />} />
        <Route path="/PyEditor" element={<PyEditor />} />
        <Route path="/HTMLCSSEditor" element={<HTMLCSSEditor />} />
        <Route path="/JSEditor" element={<JSEditor />} />
        <Route path="/ThankYou" element={<ThankYou />} />
      </Routes>
      
    </Router>
  );
}

export default App;

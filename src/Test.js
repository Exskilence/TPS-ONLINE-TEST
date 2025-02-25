import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Form, ProgressBar, Alert } from "react-bootstrap";
import './Test.css';

const Test = () => {
    const navigate = useNavigate();
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [shuffledOptions, setShuffledOptions] = useState([]);
    const [timeLeft, setTimeLeft] = useState(3600);
    const [selectedOption, setSelectedOption] = useState("");
    const [questions, setQuestions] = useState([]);
    const [duration, setDuration] = useState(0);
    const [loading, setLoading] = useState(false);

    const shuffleArray = (array) => {
        let shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    // useEffect(() => {
    //     fetch("https://thoughtprocesstestbackend.azurewebsites.net/get/questions/", {
    //         headers: {
    //             "Content-Type": "application/json",
    //         },
    //         method: "POST",
    //         body: JSON.stringify({ email: sessionStorage.getItem("Email") })
    //     })
    //     .then((response) => response.ok ? response.json() : Promise.reject("Network response was not ok."))
    //     .then((data) => {
    //         setQuestions(data.data);
    //         setDuration(data.duration);
    //         setTimeLeft(Math.max(3600 - data.duration, 0));
    //         setCurrentQuestion(data.user_on);
    //     })
    //     .catch((error) => console.error("Fetch error:", error));
    // }, []);

    useEffect(() => {    
        fetch("https://thoughtprocesstestbackend.azurewebsites.net/get/questions/", {
            headers: {
                "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({ email: sessionStorage.getItem("Email") })
        })
        .then((response) => {
            if (response.ok) {
                return response.json();
            } else {
                navigate('/ThankYou'); 
                return response.json();
            }
        })
        .then((data) => {
            if (data.status === "error") { navigate('/ThankYou'); }
            setQuestions(data.data);
            setDuration(data.duration);
            setTimeLeft(Math.max(3600 - data.duration, 0));
            setCurrentQuestion(data.user_on);
        })
        .catch((error) => console.error("Fetch error:", error));
    }, []);

    // useEffect(() => {
    //     if (timeLeft === 0 ) {
    //         fetch("https://thoughtprocesstestbackend.azurewebsites.net/test/submit/", {
    //             headers: {
    //                 "Content-Type": "application/json",
    //             },
    //             method: "POST",
    //             body: JSON.stringify({ email: sessionStorage.getItem("Email") })
    //         })
    //         .then((response) => response.ok ? response.json() : Promise.reject("Network response was not ok."))
    //         .then((data) => {
    //             console.log("Test submitted successfully:", data);
    //             handleSubmit();
    //         })
    //         .catch((error) => console.error("Fetch error:", error));
    //     }
    // }, [timeLeft, duration]);

    useEffect(() => {
        if (timeLeft === 0) {
            fetch("https://thoughtprocesstestbackend.azurewebsites.net/test/submit/", {
                headers: {
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify({ email: sessionStorage.getItem("Email") })
            })
            .then((response) => {
                if (!response.ok) {
                    navigate('/ThankYou');
                    return Promise.reject("Network response was not ok.");
                }
                return response.json();
            })
            .then((data) => {
                console.log("Test submitted successfully:", data);
                handleSubmit();
            })
            .catch((error) => console.error("Fetch error:", error));
        }
    }, [timeLeft, duration, navigate]);

    useEffect(() => {
        if (questions.length > 0) {
            const currentQuestionData = questions[currentQuestion];
            if (currentQuestionData) {
                if (!shuffledOptions.length || answers[currentQuestion] === undefined) {
                    setShuffledOptions(shuffleArray([
                        currentQuestionData.Opt01,
                        currentQuestionData.Opt02,
                        currentQuestionData.Opt03,
                        currentQuestionData.Opt04,
                    ]));
                }
                setSelectedOption(answers[currentQuestion] || "");
            }
        }
    }, [questions, currentQuestion]);

    useEffect(() => {
        const timer = timeLeft > 0 && setInterval(() => {
            setTimeLeft(prev => Math.max(prev - 1, 0));
        }, 1000);
        if (timeLeft === 0) {
            handleSubmit();
        }
        return () => clearInterval(timer);
    }, [timeLeft]);

    const handleOptionChange = (e) => {
        const value = e.target.value;
        setSelectedOption(value);
        setAnswers(prev => ({ ...prev, [currentQuestion]: value }));
    };

    // const nextQuestion = () => {
    //     if (currentQuestion < questions.length - 1) {
    //         setCurrentQuestion(currentQuestion + 1);
    //     } else {
    //         handleSubmit();
    //     }
    //     fetch("https://thoughtprocesstestbackend.azurewebsites.net/questions/submit/", {
    //         headers: {
    //           "Content-Type": "application/json",
    //         },
    //         method: "POST",
    //         body: JSON.stringify({ 
    //             email: sessionStorage.getItem("Email"),
    //             Qn : questions[currentQuestion].Qn_name,
    //             CorrectAnswer : questions[currentQuestion].Opt01,
    //             EnteredAnswer : selectedOption
    //          })
    //       })
    //         .then((response) => {
    //           if (response.ok) {
    //             return response.json();
    //           } else {
    //             throw new Error("Network response was not ok.");
    //           }
    //         })
    //         .then((data) => {
    //           console.log(data.data);
    //         //   setQuestions(data.data);
    //         })
    //         .catch((error) => console.error("Fetch error:", error));
    // };

    // const skipQuestion = () => {
    //     if (currentQuestion < questions.length - 1) {
    //         setCurrentQuestion(currentQuestion + 1);
    //     } else {
    //         handleSubmit();
    //     }
    //     fetch("https://thoughtprocesstestbackend.azurewebsites.net/questions/submit/", {
    //         headers: {
    //           "Content-Type": "application/json",
    //         },
    //         method: "POST",
    //         body: JSON.stringify({ 
    //             email: sessionStorage.getItem("Email"),
    //             Qn : questions[currentQuestion].Qn_name,
    //             CorrectAnswer : questions[currentQuestion].Opt01,
    //             EnteredAnswer : ""
    //          })
    //       })
    //         .then((response) => {
    //           if (response.ok) {
    //             return response.json();
    //           } else {
    //             throw new Error("Network response was not ok.");
    //           }
    //         })
    //         .then((data) => {
    //           console.log(data.data);
    //         //   setQuestions(data.data);
    //         })
    //         .catch((error) => console.error("Fetch error:", error));
    // };


    const nextQuestion = () => {
        if (loading) return; // Prevent multiple clicks
        setLoading(true);
    
        fetch("https://thoughtprocesstestbackend.azurewebsites.net/questions/submit/", {
            headers: {
              "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({ 
                email: sessionStorage.getItem("Email"),
                Qn : questions[currentQuestion].Qn_name,
                CorrectAnswer : questions[currentQuestion].Opt01,
                EnteredAnswer : selectedOption
             })
          })
          .then((response) => response.ok ? response.json() : Promise.reject("Network response was not ok."))
          .then((data) => {
            console.log(data.data);
            if (currentQuestion < questions.length - 1) {
                setCurrentQuestion(currentQuestion + 1);
            } else {
                handleSubmit();
            }
          })
          .catch((error) => console.error("Fetch error:", error))
          .finally(() => setLoading(false));
    };
    
    const skipQuestion = () => {
        if (loading) return; 
        setLoading(true);
    
        fetch("https://thoughtprocesstestbackend.azurewebsites.net/questions/submit/", {
            headers: {
              "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({ 
                email: sessionStorage.getItem("Email"),
                Qn : questions[currentQuestion].Qn_name,
                CorrectAnswer : questions[currentQuestion].Opt01,
                EnteredAnswer : ""
             })
          })
          .then((response) => response.ok ? response.json() : Promise.reject("Network response was not ok."))
          .then((data) => {
            console.log(data.data);
            if (currentQuestion < questions.length - 1) {
                setCurrentQuestion(currentQuestion + 1);
            } else {
                handleSubmit();
            }
          })
          .catch((error) => console.error("Fetch error:", error))
          .finally(() => setLoading(false));
    };

    const handleSubmit = () => {
        localStorage.setItem("answers", JSON.stringify(answers));
        navigate("/ThankYou");
    };

    const formatTime = (seconds) => {
        const totalSeconds = Math.floor(seconds); 
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    
    
    
    return (
        <div className="container-fluid min-vh-100 py-5">
            <div className="row mb-4">
                <div className="col-md-12 text-center">
                    <h1 className="font-weight-bold mb-3">Aptitude Test</h1>
                </div>
            </div>
            <div className="row mb-4">
                <div className="col-md-12">
                    <Alert variant={timeLeft <= 300 ? "danger" : "info"} className="text-center">
                        Time Remaining: {formatTime(timeLeft)}
                    </Alert>
                </div>
            </div>
            <div className="row mb-4">
                <div className="col-md-12">
                    <ProgressBar
                        variant="success"
                        now={((currentQuestion) / questions.length) * 100}
                        className="w-75 mx-auto"
                    />
                </div>
            </div>
            <div className="row justify-content-center">
                <div className="col-lg-8 col-md-10">
                    <div className="card shadow-lg p-5">
                        <div className="card-header bg-white">
                            <h5 className="mb-0">Question {currentQuestion + 1} of {questions.length}</h5>
                        </div>
                        <div className="card-body p-5">
                        <h4 className="font-weight-bold mb-4" style={{ pointerEvents: "none", userSelect: "none" }}>
                            <pre style={{ whiteSpace: "pre-wrap", userSelect: "none" }}>{questions[currentQuestion]?.Qn}</pre>
                        </h4>
                            <Form className="ps-3">
                                {shuffledOptions.map((option, index) => (
                                    <Form.Check
                                        key={index}
                                        type="radio"
                                        label={<span style={{ cursor: "pointer" }}>{option}</span>}
                                        name="option"
                                        value={option}
                                        checked={selectedOption === option}
                                        onChange={handleOptionChange}
                                        className="mb-3"
                                        id={`option-${index}`}
                                    />
                                ))}
                            </Form>
                        </div>
                        {/* <div className="d-flex justify-content-between mt-5">
                            <Button variant="outline-secondary" onClick={skipQuestion} className="px-4">
                                Skip
                            </Button>
                            <Button variant={currentQuestion < questions.length - 1 ? "primary" : "primary"} onClick={nextQuestion} className="px-4" disabled={!selectedOption}>
                                {currentQuestion < questions.length - 1 ? "Submit" : "Submit"}
                            </Button>
                        </div> */}

                        <div className="d-flex justify-content-between mt-5">
                            <Button variant="outline-secondary" onClick={skipQuestion} className="px-4" disabled={loading}>
                                Skip
                            </Button>
                            <Button variant="primary" onClick={nextQuestion} className="px-4" disabled={loading || !selectedOption}>
                                {currentQuestion < questions.length - 1 ? "Submit" : "Submit"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Test;

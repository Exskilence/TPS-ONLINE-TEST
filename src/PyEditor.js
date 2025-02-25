import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button, Modal } from "react-bootstrap";
import AceEditor from "react-ace";
import axios from "axios";
import { MoonLoader } from "react-spinners";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/theme-dreamweaver";
import Sk from "skulpt";
import { useLocation, useNavigate } from "react-router-dom";
import QuestionList from "./QuestionList";
import Header from "./Header";
import { ViewUpdate } from "@codemirror/view";

const PyEditor = () => {
  const location = useLocation();
  const questionData = location.state?.questionData[3];
  const navigate = useNavigate();
  const [isSkipDisabled, setIsSkipDisabled] = useState(false);
  const [pythonCode, setPythonCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [output, setOutput] = useState("");
  const [isWaitingForInput, setIsWaitingForInput] = useState(false);
  const [currentInput, setCurrentInput] = useState("");
  const inputResolver = useRef(null);
  const outputRef = useRef(null);
  const [runResponseTestCases, setRunResponseTestCases] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [additionalMessage, setAdditionalMessage] = useState("");
  const [processing, setProcessing] = useState(false);
  const [template, setTemplate] = useState("");
  const [isRunClicked, setIsRunClicked] = useState(false);
  const [isCheckClicked, setIsCheckClicked] = useState(false);
  const [functionCall, setFunctionCall] = useState('');
  const [showOutput, setShowOutput] = useState(false);
  const [pyRun, setPyRun] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [showSkipConfirmation, setShowSkipConfirmation] = useState(false);
  const [submitBtnOn, setSubmitBtnOn] = useState(false);
  const [submitButtonText, setSubmitButtonText] = useState("SUBMIT");
  const [backupEnabledPYTHON, setBackupEnabledPYTHON] = useState(true);
  const [isSubmittedPYTHON, setIsSubmittedPYTHON] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/skulpt@1.1.0/dist/skulpt.min.js";
    script.async = true;
    script.onload = () => {
      const builtinScript = document.createElement('script');
      builtinScript.src = "https://cdn.jsdelivr.net/npm/skulpt@1.1.0/dist/skulpt-stdlib.js";
      builtinScript.async = true;
      document.body.appendChild(builtinScript);
    };
    document.body.appendChild(script);

    const checkStatus = async () => {
      try {
        const response = await axios.post(
          "https://thoughtprocesstestbackend.azurewebsites.net/stat/",
          { UID: sessionStorage.getItem('UID') }
        );
        if(response.data.status === "Completed"){
          navigate('/ThankYou');
        }
        if (response.data.status.Python === true) {
          setSubmitButtonText("Submitted");
          setIsSkipDisabled(true);
        }
      } catch (error) {
        console.error("Error fetching the status:", error);
      }
    };

    if (questionData) {
      setFunctionCall(questionData.FunctionCall || '');
      setTemplate(questionData.Template || '');

      const storedPythonCode = sessionStorage.getItem(`PY_${questionData.Qn_name}`);
      if (storedPythonCode) {
        setPythonCode(storedPythonCode);
        setSubmitButtonText("Submitted");
        setIsSkipDisabled(true);
      } else if (questionData.User_ans) {
        setPythonCode(questionData.User_ans);
      } else {
        setPythonCode(questionData?.Template + '\n' + questionData?.FunctionCall || '');
      }
    }

    checkStatus();
    setLoading(false);
  }, [questionData]);

  const handleKeyPress = (event) => {
    if (!isWaitingForInput) return;

    if (event.key === 'Enter') {
      event.preventDefault();
      if (inputResolver.current) {
        const inputValue = currentInput;
        setOutput(prev => prev + '\n');
        inputResolver.current(inputValue);
        inputResolver.current = null;
        setIsWaitingForInput(false);
        setCurrentInput("");
      }
    } else if (event.key === 'Backspace') {
      event.preventDefault();
      if (currentInput.length > 0) {
        setCurrentInput(prev => prev.slice(0, -1));
        setOutput(prev => prev.slice(0, -1));
      }
    } else if (event.key.length === 1) {
      event.preventDefault();
      setCurrentInput(prev => prev + event.key);
      setOutput(prev => prev + event.key);
    }
  };

  const promptInput = (prompt) => {
    return new Promise((resolve) => {
      setOutput(prev => prev + prompt);
      setIsWaitingForInput(true);
      inputResolver.current = resolve;
      if (outputRef.current) {
        outputRef.current.focus();
      }
    });
  };


    useEffect(() => {
      if (backupEnabledPYTHON) {
        console.log("dfdfudsfkjdsf")
        const intervalHTML = setInterval(() => backupCode('Python'), 120000/4);
        return () => clearInterval(intervalHTML);
      }
    }, [pythonCode, backupEnabledPYTHON]);


  const backupCode = async (subject) => {
    if ((subject === 'Python' && !backupEnabledPYTHON)) return;
    try {
      const response1 = await axios.post(
        `https://thoughtprocesstestbackend.azurewebsites.net/code/backup/`,
        {
          UID: sessionStorage.getItem('UID'),
          Subject: "Python",
          Qn: questionData.Qn_name,
          code: pythonCode
        }
      );

      if (response1.data.status === "Already submitted") {
        if (subject === 'Python') {
          setBackupEnabledPYTHON(false);
          setIsSubmittedPYTHON(true);
        } 
        setSubmitButtonText("Submitted");

      }
    } catch (error) {
      console.error("Error fetching the data:", error);
    } finally {
      setLoading(false);
    }
  }

  

  const handleRunPython = () => {
    setShowOutput(true);
    setRunResponseTestCases('');
    setPyRun(true);
    setOutput('');

    function builtinRead(x) {
      if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined) {
        throw "File not found: '" + x + "'";
      }
      return Sk.builtinFiles["files"][x];
    }

    Sk.TurtleGraphics = Sk.TurtleGraphics || {};
    Sk.TurtleGraphics.target = 'output';
    Sk.pre = 'output';

    Sk.configure({
      output: (text) => setOutput((prevOutput) => prevOutput + text),
      read: builtinRead,
      inputfun: (prompt) => {
        return new Promise((resolve) => {
          const input = promptInput(prompt);
          resolve(input);
        });
      },
    });

    const myPromise = Sk.misceval.asyncToPromise(() => {
      return Sk.importMainWithBody('<stdin>', false, pythonCode, true);
    });

    myPromise
      .then(() => {})
      .catch((err) => {
        console.error('Error executing Python code:', err);
      });
  };

  const handleCheckCode = async () => {
    handleRunPython();
    setOutput('');
    setIsWaitingForInput(false);
    setCurrentInput('');
    inputResolver.current = null;
    setProcessing(true);
    setSuccessMessage("");
    setAdditionalMessage("");

    function builtinRead(x) {
      if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined) {
        throw new Error("File not found: '" + x + "'");
      }
      return Sk.builtinFiles["files"][x];
    }

    Sk.configure({
      output: (text) => setOutput(prev => prev + text),
      read: builtinRead,
      inputfun: promptInput,
    });

    const myPromise = Sk.misceval.asyncToPromise(() => {
      return Sk.importMainWithBody('<stdin>', false, pythonCode, true);
    });

    myPromise.then(
      () => {},
      (err) => {
        setOutput(prev => prev + err.toString());
      }
    );

    try {
      const postData = {
        UID: sessionStorage.getItem('UID'),
        Subject: "Python",
        Qn: questionData.Qn_name,
        Code: pythonCode,
        Result: output.trimEnd(),
        CallFunction: "",
        TestCases: questionData.TestCases,
        Attempt: 0
      };

      const response = await axios.post(
        "https://thoughtprocesstestbackend.azurewebsites.net/runpy/",
        postData
      );

      const responseData = response.data;
      const testCases = responseData.TestCases;
      const firstTestCase = testCases[0];
      setAttempt(responseData.Attempt);

      const filteredTestCases = testCases.slice(1).map(({ Result, ...rest }) => rest);

      const updatedTestCases = await Promise.all(
        filteredTestCases.map(async (testCase) => {
          try {
            const testCaseKey = Object.keys(testCase)[0];
            const { Code, Output } = testCase[testCaseKey];

            if (!Code) {
              console.error("Test case has an undefined 'Code' property.");
              return { ...testCase, Result: "Error: Code is undefined" };
            }

            let testCaseOutput = "";
            Sk.configure({
              output: (text) => {
                testCaseOutput += text.replace("<module '__main__' from '<stdin>.py'>", "");
              },
              read: builtinRead,
            });

            const executePython = async () => {
              try {
                await Sk.misceval.asyncToPromise(() =>
                  Sk.importMainWithBody("<stdin>", false, Code, true)
                );
                return testCaseOutput.trim();
              } catch (err) {
                console.error("Error executing Python code for TestCaseId:", testCase.TestCaseId, err);
                return err.toString();
              }
            };

            const actualOutput = await executePython();
            testCase.Result = actualOutput === Output ? "Passed" : "Failed";
            setSubmitBtnOn(true);
            return testCase;
          } catch (error) {
            console.error("Unexpected error while processing test case:", testCase, error);
            return { ...testCase, Result: "Error: Unexpected error occurred" };
          }
        })
      );

      const formattedTestCases = updatedTestCases.map((testCase, index) => {
        return { [`TestCase${index + 2}`]: testCase.Result };
      });

      const newTestCases = [firstTestCase, ...formattedTestCases];
      const otherTestCases = newTestCases.slice(0, -1).map(({ Result, ...rest }) => rest);

      const allPassed = otherTestCases.every((testCase) => {
        return Object.values(testCase)[0] === 'Passed';
      });
      const resultTestCase = { Result: allPassed ? "True" : "False" };
      const updatedTestCases12 = [...otherTestCases, resultTestCase];
      setRunResponseTestCases(updatedTestCases12);

      if (allPassed) {
        setSuccessMessage("Congratulations!");
        setAdditionalMessage("You have passed all the test cases. Click the submit code button.");
      } else {
        setSuccessMessage("Wrong Answer");
        setAdditionalMessage("You have not passed all the test cases.");
      }
    } catch (error) {
      console.error("Error executing the code:", error);
      setSuccessMessage("Error");
      setAdditionalMessage("There was an error executing the code.");
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmit = () => {
    setShowSkipConfirmation(true);
  };

  const handleSkipConfirmation = () => {
    setShowSkipConfirmation(false);

    const updatedPythonCode = pythonCode.trim();
    const postData = {
      UID: sessionStorage.getItem('UID'),
      Subject: "Python",
      Qn: questionData.Qn_name,
      Ans: updatedPythonCode,
      Result: runResponseTestCases,
      Attempt: attempt
    };

    fetch("https://thoughtprocesstestbackend.azurewebsites.net/submit/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    })
    .then(response => response.json())
    .then(data => {
      setIsSkipDisabled(true);
      sessionStorage.setItem(`PY_${questionData.Qn_name}`, updatedPythonCode);
      setSubmitButtonText("Submitted");
      console.log("Submission successful:", data);
    })
    .catch(error => console.error("Error submitting:", error));
  };

  const handleSkip = () => {
    const postData = {
      UID: sessionStorage.getItem('UID'),
      Subject: "Python",
      Qn: questionData.Qn_name,
      Ans: "",
      Result: [
        { "TestCase1": "Failed" },
        { "TestCase2": "Failed" },
        { "TestCase3": "Failed" },
        { "TestCase4": "Failed" },
        { "Result": "False" }
      ],
      Attempt: attempt
    };

    fetch("https://thoughtprocesstestbackend.azurewebsites.net/submit/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    })
    .then(response => response.json())
    .then(data => {
      setIsSkipDisabled(true);
      console.log("Skip successful:", data);
    })
    .catch(error => console.error("Error submitting:", error));
  };

  const onChangePython = useCallback((value, ViewUpdate) => {
    setPythonCode(value);
    sessionStorage.setItem('PYUserAnswer', value);

  },[]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#f2eeee" }}>
        <MoonLoader color="black" loading={loading} size={40} />
      </div>
    );
  }

  return (
    <div className="d-flex flex-column vh-100">
      <Header />

      <div className="container-fluid flex-grow-1 py-3 overflow-hidden">
        <div className="row h-100 g-0">
          <QuestionList />
          <div className="col-5 lg-8" style={{ height: "100%" }}>
            <div className="border border-dark rounded-2 d-flex flex-column" style={{ height: "calc(100% - 5px)", backgroundColor: "#E5E5E533" }}>
              <div className="border-bottom border-dark p-3 d-flex justify-content-between align-items-center">
                <h5 className="m-0">Problem Statement</h5>
              </div>
              <div className="p-3 flex-grow-1 overflow-auto me-1">
                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{questionData.Qn}</pre>

                {questionData.Examples && questionData.Examples.length > 0 && (
                  <div className="mt-3">
                    <h6>Examples:</h6>
                    {questionData.Examples.map((example, index) => (
                      <div key={index} className="border border-dark rounded-2 p-2 mb-2 bg-light">
                        <div className="mb-1">
                          <strong>Input:</strong>
                          <pre className="m-0" style={{ whiteSpace: 'pre-wrap' }}>
                            {example.Example.Inputs && example.Example.Inputs.join('\n')}
                          </pre>
                        </div>
                        <div className="mb-1">
                          <strong>Output:</strong>
                          <pre className="m-0" style={{ whiteSpace: 'pre-wrap' }}>{example.Example.Output}</pre>
                        </div>
                        {example.Example.Explanation && (
                          <div>
                            <strong>Explanation:</strong>
                            <p className="m-0">{example.Example.Explanation}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="d-flex flex-column" style={{ flex: "1", height: "100%", marginLeft: "20px" }}>
            <div className="border border-dark rounded-2 me-3" style={{ height: "45%", backgroundColor: "#E5E5E533" }}>
              <div className="border-bottom border-dark p-3 d-flex justify-content-between align-items-center">
                <h5 className="m-0">Python Code</h5>
              </div>
              <AceEditor
                mode="python"
                theme="dreamweaver"
                value={sessionStorage.getItem('PYUserAnswer') ? sessionStorage.getItem('PYUserAnswer'): pythonCode}
                onChange={(newCode) => {
                  setPythonCode(newCode || sessionStorage.getItem('PYUserAnswer'));
                  setIsRunClicked(false);
                  setIsCheckClicked(false);
                  onChangePython(newCode)
                  
                }}
                fontSize={16}
                showPrintMargin={false}
                showGutter={true}
                highlightActiveLine={true}
                wrapEnabled={true}
                setOptions={{ useWorker: false }}
                style={{ width: "100%", height: "calc(100% - 60px)" }}
              />
            </div>

            <div style={{ height: "9%", padding: "10px 0" }} className="d-flex flex-column justify-content-center me-3">
              <div className="d-flex justify-content-between align-items-center h-100">
                <div className="d-flex flex-column justify-content-center">
                  {processing ? (
                    <h5 className="m-0">Processing...</h5>
                  ) : (
                    <>
                      {successMessage && <h5 className="m-0">{successMessage}</h5>}
                      {additionalMessage && <p className="m-0" style={{ fontSize: "12px" }}>{additionalMessage}</p>}
                    </>
                  )}
                </div>
                <div className="d-flex justify-content-end align-items-center">
                  <button
                    className="btn btn-sm border border-dark me-2"
                    onClick={handleCheckCode}
                    style={{
                      backgroundColor: "#FFF",
                      whiteSpace: "nowrap",
                      minWidth: "100px",
                      boxShadow: "rgb(136, 136, 136) 1px 2px 1px",
                      height: "35px"
                    }}
                  >
                    RUN
                  </button>
                  <button
                    className="btn btn-sm border border-dark me-2"
                    onClick={handleSubmit}
                    style={{
                      backgroundColor: "#FBEFA5DB",
                      whiteSpace: "nowrap",
                      minWidth: "100px",
                      boxShadow: "rgb(136, 136, 136) 1px 2px 1px",
                      height: "35px"
                    }}
                    disabled={!submitBtnOn || isSkipDisabled}
                  >
                    {submitButtonText}
                  </button>
                </div>
              </div>
            </div>

            <div className="border border-dark rounded-2 me-3" style={{ height: "45%", backgroundColor: "#E5E5E533" }}>
              <div className="border-bottom border-dark p-3 d-flex justify-content-between align-items-center">
                <h5 className="m-0">Output</h5>
              </div>
              <div className="p-3 overflow-auto" style={{ height: "calc(100% - 60px)" }}>
                <pre
                  className="m-0"
                  id="output"
                  ref={outputRef}
                  tabIndex={0}
                  onKeyDown={handleKeyPress}
                  style={{ outline: 'none' }}
                >
                  {output}
                </pre>
                {runResponseTestCases && (
                  <div className="col mt-3 mb-5">
                    {runResponseTestCases.map((testCase, index) => (
                      <div
                        key={index}
                        className="d-flex align-items-center mb-2 border border-ligth shadow bg-white rounded p-2 rounded-2"
                        style={{ width: "fit-content", fontSize: "12px" }}
                      >
                        <span className="me-2">{Object.keys(testCase)[0]}:</span>
                        <span style={{ color: Object.values(testCase)[0] === "Passed" ? "blue" : Object.values(testCase)[0] === "True" ? "blue" : "red" }}>
                          {Object.values(testCase)[0]}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal show={showSkipConfirmation} onHide={() => setShowSkipConfirmation(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Submission</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Do you want to submit the Python code?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSkipConfirmation(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSkipConfirmation}>
            Yes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PyEditor;

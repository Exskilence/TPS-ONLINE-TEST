import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button, Modal } from "react-bootstrap";
import CodeMirror from "@uiw/react-codemirror";
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';
import { MoonLoader } from 'react-spinners';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faCircleXmark, faExpand } from '@fortawesome/free-solid-svg-icons';
import { useNavigate, useLocation } from "react-router-dom";
import { EditorView } from '@codemirror/view';
import QuestionList from "./QuestionList";
import Header from "./Header";
import axios from "axios";

const JSEditor = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const questionData = location.state?.questionData[1];
  const completeData = location.state?.questionData;

  const [jsEdit, setJsEdit] = useState('');
  const [htmlEdit, setHtmlEdit] = useState('');
  const [cssEdit, setCssEdit] = useState('');
  const [activeTab, setActiveTab] = useState('js');
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [displ, setdispl] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [validationStatus, setValidationStatus] = useState({ js: { correct: 0, incorrect: 0, closures: 'pending', brackets: 'pending' } });
  const [splitOffset, setSplitOffset] = useState(window.innerWidth / 2);
  const [isDragging, setIsDragging] = useState(false);
  const [initialX, setInitialX] = useState(null);
  const [editorHeightPercentage, setEditorHeightPercentage] = useState(45);
  const [outputHeightPercentage, setOutputHeightPercentage] = useState(45);
  const [isDraggingVertically, setIsDraggingVertically] = useState(false);
  const [initialY, setInitialY] = useState(null);
  const [DOMSTR, setDOMSTR] = useState('HTML DOM structure');
  const [DOMTRUE, setDOMTRUE] = useState(false);
  const [score, setScore] = useState(null);
  const [usercodelength, setUsercodeLength] = useState(0);
  const [KeysLength, setKeysLength] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSkipConfirmation, setShowSkipConfirmation] = useState(false);
  const [submitData, setSubmitData] = useState("Submit");
  const [backupEnabled, setBackupEnabled] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const trigger = async () => {
      try {
        const response = await axios.post(
          "https://thoughtprocesstestbackend.azurewebsites.net/stat/",
          {
            UID: sessionStorage.getItem('UID')
          }
        );
        if(response.data.status === "Completed"){
          navigate('/ThankYou');
        }
        if (response.data.status.JS === true) {
          setBackupEnabled(false);
          setIsSubmitted(true);
          setSubmitData("Submitted");
        }
      } catch (error) {
        console.error("Error fetching the data:", error);
      } finally {
        setLoading(false);
      }
    }
    trigger();
  }, []);

  const backupCode = async () => {
    if (!backupEnabled || isSubmitted) return;

    try {
      console.log("Backup code triggered", jsEdit);
      const response = await axios.post(
        "https://thoughtprocesstestbackend.azurewebsites.net/code/backup/",
        {
          UID: sessionStorage.getItem('UID'),
          "Subject": "JS",
          "Qn": questionData.Qn_name,
          "code": jsEdit
        }
      );

      if (response.data.status === "Already submitted") {
        setBackupEnabled(false);
        setIsSubmitted(true);
        setSubmitData("Submitted");
      } else {
        setSubmitData(response.data.status.JS === true ? "Submitted" : "Submit");
      }
    } catch (error) {
      console.error("Error fetching the data:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (backupEnabled && !isSubmitted) {
      const interval = setInterval(backupCode, 120000/4);
      return () => clearInterval(interval);
    }
  }, [jsEdit, backupEnabled, isSubmitted]);

  useEffect(() => {
    if (!questionData) {
      navigate("/");
    } else {
      setJsEdit(questionData.UserAns || '');
      setHtmlEdit(questionData.html_file || '');
      setCssEdit(questionData.css_file || '');
      const jsFileAsString = Array.isArray(questionData.js_file) ? questionData.js_file.join("\n") : questionData.js_file;
      setKeysLength(jsFileAsString.split("\n").length);

      const storedCode = sessionStorage.getItem(`backup_${questionData.Qn_name}`);
      if (storedCode) {
        setJsEdit(storedCode);
      }
    }
  }, [questionData, navigate]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setInitialX(e.clientX);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !initialX) return;
    const dx = e.clientX - initialX;
    setSplitOffset(splitOffset + dx);
    setInitialX(e.clientX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setInitialX(null);
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, initialX]);

  const handleVerticalMouseDown = (e) => {
    setIsDraggingVertically(true);
    setInitialY(e.clientY);
  };

  const handleVerticalMouseMove = (e) => {
    if (!isDraggingVertically || !initialY) return;

    const dy = e.clientY - initialY;
    const vhUnitChange = (dy / window.innerHeight) * 100;

    setEditorHeightPercentage((prevHeight) => {
      const newHeight = Math.max(30, Math.min(70, prevHeight + vhUnitChange));
      setOutputHeightPercentage(94 - newHeight);
      return newHeight;
    });

    setInitialY(e.clientY);
  };

  const handleVerticalMouseUp = () => {
    setIsDraggingVertically(false);
    setInitialY(null);
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleVerticalMouseMove);
    window.addEventListener('mouseup', handleVerticalMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleVerticalMouseMove);
      window.removeEventListener('mouseup', handleVerticalMouseUp);
    };
  }, [isDraggingVertically, initialY]);

  const handleTabClick = (tabKey) => {
    setActiveTab(tabKey);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleCloseAlert = () => {
    setShowAlert(false);
    setdispl('');
  };

  const Handlepreview = () => {
    setdispl('output');
    setShowAlert(true);
  };

  const onChangeJavaScript = useCallback((value, viewUpdate) => {
    setJsEdit(value);
    sessionStorage.setItem('JSUserAnswer', value);
    handleCheckCode(value); // Validate on key press
  }, []);

  const handleCheckCode = (codeToTest) => {
    if (!questionData) {
      return;
    }

    const jsValidationData = questionData.JS_Messages;
    let newValidationStatus = { correct: 0, incorrect: 0, closures: 'pending', brackets: 'pending' };

    const userCode = typeof codeToTest === 'string' ? codeToTest.split("\n") : codeToTest;
    const jsFileAsString = Array.isArray(questionData.js_file) ? questionData.js_file.join("\n") : questionData.js_file;
    const expectedCode = jsFileAsString.split("\n");

    const standardizeCode = (line) => {
      const trimmedLine = line.trim();
      if (trimmedLine === '}' || trimmedLine === ']' || trimmedLine === ')' || trimmedLine === '' || trimmedLine === '};' || trimmedLine === '];' || trimmedLine === ');') {
        return '';
      }
      return trimmedLine
        .replace(/\n/g, "")
        .replace(/"/g, "'")
        .replace(/\s+/g, '')
        .trim();
    };

    const standardizedUserCode = userCode.map(standardizeCode).filter(line => line !== '');
    const standardizedExpectedCode = expectedCode.map(standardizeCode).filter(line => line !== '');

    if (standardizedUserCode.length === 0) {
      setValidationStatus(prevStatus => ({
        ...prevStatus,
        js: {
          correct: 0,
          incorrect: 0,
          closures: 'pending',
          brackets: 'pending',
        }
      }));
      return;
    }

    let satisfiedRequirementsCount = 0;

    standardizedUserCode.forEach((userLine, index) => {
      if (userLine === '' || typeof standardizedExpectedCode[index] === 'undefined') return;
      const expectedLine = standardizedExpectedCode[index];
      const isMatch = userLine === expectedLine;

      if (isMatch) {
        satisfiedRequirementsCount++;
      }

      newValidationStatus[index] = isMatch ? 'correct' : 'incorrect';
    });

    const validateClosures = (codeArray) => {
      const openingBraces = ['{', '[', '('];
      const closingBraces = ['}', ']', ')'];
      let stack = [];

      for (let line of codeArray) {
        for (let i = 0; i < line.length; i++) {
          const char = line[i];

          if (openingBraces.includes(char)) {
            stack.push(char);
          }

          else if (closingBraces.includes(char)) {
            const lastBrace = stack.pop();

            if (lastBrace !== undefined && closingBraces.indexOf(char) !== openingBraces.indexOf(lastBrace)) {
              return false;
            }

            if (char === '}' && i > 0 && line[i - 1] === ')') {
              const secondLastBrace = stack.pop();
              if (secondLastBrace !== '(') {
                return false;
              }
            }
          }
        }
      }

      return stack.length === 0;
    };

    const userClosuresValid = validateClosures(userCode);
    const expectedClosuresValid = validateClosures(standardizedExpectedCode);

    newValidationStatus.closures = (userClosuresValid && expectedClosuresValid) ? 'correct' : 'incorrect';

    const countBrackets = (codeArray) => {
      let openingCount = 0, closingCount = 0;
      codeArray.forEach(line => {
        openingCount += (line.match(/{/g) || []).length;
        closingCount += (line.match(/}/g) || []).length;
      });
      return { openingCount, closingCount };
    };

    const userBrackets = countBrackets(userCode);
    newValidationStatus.brackets = (userBrackets.openingCount === userBrackets.closingCount) ? 'correct' : 'incorrect';

    setValidationStatus(prevStatus => ({
      ...prevStatus,
      js: newValidationStatus
    }));

    setUsercodeLength(satisfiedRequirementsCount);
  };

  const sendDataToBackend = (type, code) => {
    setLoading(true);
    const subjectType = type.toUpperCase();
    const url = `https://thoughtprocesstestbackend.azurewebsites.net/${type}/`;
    const data = {
      UID: sessionStorage.getItem('UID'),
      Subject: subjectType,
      Qn: questionData.Qn_name,
      KEYS: questionData.js_file,
      Score: (usercodelength + '/' + KeysLength).toString(),
      Ans: code || '',
    };

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
      console.log("Response from backend:", data);
      if (data.Score) {
        setScore(data.Score);
      }
    })
    .catch(error => {
      console.error('Error:', error);
    })
    .finally(() => {
      setLoading(false);
    });
  };

  const sendSkipDataToBackend = (type, code) => {
    setLoading(true);
    const subjectType = type.toUpperCase();
    const url = `https://thoughtprocesstestbackend.azurewebsites.net/${type}/`;
    const data = {
      UID: sessionStorage.getItem('UID'),
      Subject: subjectType,
      Qn: questionData.Qn_name,
      KEYS: questionData.js_file,
      Score: (usercodelength + '/' + KeysLength).toString(),
      Ans: '',
    };

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
      console.log("Response from backend:", data);
      if (data.Score) {
        setScore(data.Score);
      }
    })
    .catch(error => {
      console.error('Error:', error);
    })
    .finally(() => {
      setLoading(false);
    });
  };

  const handleSubmit = () => {
    setShowConfirmation(true);
  };

  const handleSkip = () => {
    setShowSkipConfirmation(true);
  };

  const handleConfirmation = () => {
    setShowConfirmation(false);
    let codeToTest = '';
    switch (activeTab) {
      case 'js':
        codeToTest = jsEdit;
        break;
      default:
        codeToTest = '';
        break;
    }
    setSubmitData("Submitting");
    sendDataToBackend('js', codeToTest);
    setSubmitData("Submitted");
    setIsSubmitted(true);

    // Store the submitted code in session storage
    sessionStorage.setItem(`backup_${questionData.Qn_name}`, codeToTest);
  };

  const handleSkipConfirmation = () => {
    setShowSkipConfirmation(false);
    let codeToTest = '';
    switch (activeTab) {
      case 'js':
        codeToTest = jsEdit;
        break;
      default:
        codeToTest = '';
        break;
    }

    sendSkipDataToBackend('js', codeToTest);
  };

  const codeMirrorConfig = {
    theme: "light",
    height: "100%",
    style: {
      backgroundColor: 'white',
      overflow: 'auto'
    },
    basicSetup: {
      lineNumbers: true,
      foldGutter: true,
      highlightActiveLine: true,
    },
    extensions: [
      EditorView.lineWrapping,
      EditorView.theme({
        "&": {
          maxHeight: "100%"
        },
        ".cm-scroller": {
          overflow: "auto"
        },
        ".cm-line": {
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          lineHeight: "1.6em"
        }
      })
    ]
  };

  const renderEditor = () => {
    switch (activeTab) {
      case 'html':
        return (
          <CodeMirror
            className="text-xl text-start custom-codemirror"
            value={htmlEdit}
            extensions={[html(), ...codeMirrorConfig.extensions]}
            readOnly={true}
            {...codeMirrorConfig}
          />
        );
      case 'css':
        return (
          <CodeMirror
            className="text-xl text-start custom-codemirror"
            value={cssEdit}
            extensions={[css(), ...codeMirrorConfig.extensions]}
            readOnly={true}
            {...codeMirrorConfig}
          />
        );
      case 'js':
        return (
          <CodeMirror
            className="text-xl text-start custom-codemirror"
            value={jsEdit || sessionStorage.getItem('JSUserAnswer')}
            extensions={[javascript(), ...codeMirrorConfig.extensions]}
            onChange={onChangeJavaScript}
            {...codeMirrorConfig}
          />
        );
      default:
        return null;
    }
  };

  const srcCode = `${htmlEdit.replace('</body>', '').replace('</html>', '')} <style>${cssEdit}</style> <script>${jsEdit}</script> </body> </html>`;

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
                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{questionData?.Qn}</pre>
                <div className='d-flex justify-content-start mt-3'>
                  <div className="btn btn-sm" style={{ backgroundColor: '#B8B7B7', color: '#000000' }}>
                    Requirements
                  </div>
                </div>
                <div className='mt-2' style={{ fontSize: '14px', maxHeight: '70vh' }}>
                  {questionData?.JS_Messages.map((message, index) => (
                    <div key={index} className='p-2'>
                      {validationStatus.js && validationStatus.js[index] === 'correct' ? (
                        <FontAwesomeIcon icon={faCheckCircle} className='mx-1 text-success' />
                      ) : (
                        <FontAwesomeIcon icon={faCircleXmark} className='mx-1 text-danger' />
                      )}
                      <span className='pb-1' style={{ fontFamily: '"Segoe UI", Arial, sans-serif' }}>{message}</span>
                    </div>
                  ))}
                  {validationStatus.js && validationStatus.js.brackets === 'correct' ? (
                    <div className="p-2">
                      <FontAwesomeIcon icon={faCheckCircle} className="mx-1 text-success" />
                      <span>Brackets are correctly matched!</span>
                    </div>
                  ) : (
                    <div className="p-2">
                      <FontAwesomeIcon icon={faCircleXmark} className="mx-1 text-danger" />
                      <span>Mismatch in opening/closing brackets!</span>
                    </div>
                  )}
                  {score !== null && (
                    <div className="p-2">
                      <span>Score: {score}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="d-flex flex-column" style={{ flex: "1", height: "100%", marginLeft: "20px" }}>
            <div className="border border-dark rounded-2 me-3" style={{ height: "45%", overflow: 'hidden' }}>
              <div className="border-bottom border-dark p-3 d-flex justify-content-between align-items-center">
                <div>
                  {questionData?.Tabs.map((tab, index) => (
                    <div
                      key={index}
                      style={{
                        width: '70px',
                        height: '30px',
                        borderRadius: '10px',
                        backgroundColor: activeTab === tab.toLowerCase() ? "black" : "transparent",
                        color: activeTab === tab.toLowerCase() ? "white" : "black",
                        border: activeTab === tab.toLowerCase() ? "none" : "1px solid black",
                        display: 'inline-block',
                        textAlign: 'center',
                        lineHeight: '30px',
                        marginRight: '8px',
                        cursor: 'pointer'
                      }}
                      className={`tab-button me-1 ${activeTab === tab.toLowerCase() ? 'selected-tab' : ''}`}
                      onClick={() => handleTabClick(tab.toLowerCase())}
                    >
                      {tab}
                    </div>
                  ))}
                </div>
              </div>
              <div className="col top" style={{ height: `calc(100% - 60px)`, overflowY: 'auto', marginBottom: '10px', whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                {renderEditor()}
              </div>
            </div>

            <div style={{ height: "9%", padding: "10px 0" }} className="d-flex flex-column justify-content-center me-3">
              <div className="d-flex justify-content-between align-items-center h-100">
                <div className="d-flex flex-column justify-content-center">
                  {/* Additional content can go here */}
                </div>
                <div className="d-flex justify-content-end align-items-center">
                  <Button
                    variant="light"
                    className="me-2 border border-dark"
                    onClick={handleSubmit}
                    style={{
                      backgroundColor: "#FBEFA5DB",
                      minWidth: "100px",
                      boxShadow: "1px 2px 1px #888"
                    }}
                    disabled={jsEdit.length <= 0 || isSubmitted}
                  >
                    {submitData.toUpperCase()}
                  </Button>
                </div>
              </div>
            </div>

            <div className="border border-dark rounded-2 me-3" style={{ height: "45%", backgroundColor: "#E5E5E533", overflowY: 'auto' }}>
              <div className="border-bottom border-dark p-3 d-flex justify-content-between align-items-center">
                <h5 className="m-0">Output</h5>
              </div>
              <div className="p-3" style={{ height: "calc(100% - 58px)", overflow: 'auto' }}>
                <div className='d-flex justify-content-start mt-1'>
                  <div className="btn btn-sm mb-2" style={{ backgroundColor: '#B8B7B7', color: '#000000' }}>
                    Your Output
                  </div>
                  <FontAwesomeIcon icon={faExpand} className='px-1 mt-2' onClick={Handlepreview} style={{ cursor: 'pointer' }} />
                </div>
                <iframe
                  style={{ width: '100%', height: '100%', backgroundColor: '', color: 'black', borderColor: 'white', outline: 'none', resize: 'none' }}
                  className="w-full h-full"
                  srcDoc={srcCode}
                  title="output"
                  sandbox="allow-scripts allow-same-origin"
                  width="100%"
                  height="100%"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal show={showAlert} onHide={handleCloseAlert} size='lg' aria-labelledby="contained-modal-title-vcenter" centered>
        <Modal.Body className='text-dark w-100' style={{ height: '250px' }}>
          {displ === 'output' ? (
            <iframe
              style={{ width: '100%', height: '95%', backgroundColor: '', color: 'black', borderColor: 'white', outline: 'none', resize: 'none' }}
              className="w-full h-full"
              srcDoc={srcCode}
              title="output"
              sandbox="allow-scripts allow-same-origin"
              width="100%"
              height="100%"
            ></iframe>
          ) : null}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="dark" onClick={handleCloseAlert}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showConfirmation} onHide={() => setShowConfirmation(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Submission</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Do you want to submit your JavaScript code?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmation(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirmation}>
            Yes
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showSkipConfirmation} onHide={() => setShowSkipConfirmation(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Skip</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Do you want to skip this JS question? Once skipped you cannot revert it back.
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

export default JSEditor;

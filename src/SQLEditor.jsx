import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Modal } from "react-bootstrap";
import axios from "axios";
import AceEditor from "react-ace";
import { MoonLoader } from "react-spinners";
import "ace-builds/src-noconflict/mode-sql";
import "ace-builds/src-noconflict/theme-dreamweaver";
import QuestionList from "./QuestionList";
import Header from "./Header";

const SQLEditor = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const questionData = location.state?.questionData[2];
  const completeData = location.state?.questionData;
  const [isSkipDisabled, setIsSkipDisabled] = useState(false);
  const [question, setQuestion] = useState("");
  const [tableData, setTableData] = useState([]);
  const [expectedOutput, setExpectedOutput] = useState([]);
  const [activeTab, setActiveTab] = useState("");
  const [sqlQuery, setSqlQuery] = useState("");
  const [runResponse, setRunResponse] = useState(null);
  const [runResponseTable, setRunResponseTable] = useState([]);
  const [runResponseTestCases, setRunResponseTestCases] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [additionalMessage, setAdditionalMessage] = useState("");
  const [executingQuery, setExecutingQuery] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [tableName, setTableName] = useState("");
  const [isSelected, setIsSelected] = useState(false);
  const [testCases, setTestCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [submissionAttempts, setSubmissionAttempts] = useState({});
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [responseTestCase, setResponseTestCase] = useState(null);
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [showSkipConfirmation, setShowSkipConfirmation] = useState(false);
  const [submitBtnOn, setSubmitBtnOn] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [submitData, setSubmitData] = useState("SUBMIT");
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
        if (response.data.status.SQL === true) {
          setSubmitData("Submitted");
          setIsSkipDisabled(true);
          setBackupEnabled(false);
          setIsSubmitted(true);
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
      console.log("Backup code triggered", sqlQuery);
      const response = await axios.post(
        "https://thoughtprocesstestbackend.azurewebsites.net/code/backup/",
        {
          UID: sessionStorage.getItem('UID'),
          "Subject": "SQL",
          "Qn": questionData.Qn_name,
          "code": sqlQuery
        }
      );

      if (response.data.status === "Already submitted") {
        setBackupEnabled(false);
        setIsSubmitted(true);
        setSubmitData("Submitted");
      } else {
        setSubmitData(response.data.status.SQL === true ? "Submitted" : "SUBMIT");
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
  }, [sqlQuery, backupEnabled, isSubmitted]);

  useEffect(() => {
    if (questionData) {
      setQuestion(questionData.Qn);
      setTableData(questionData.Qn_Tables);

      if (questionData?.Qn_Tables?.length > 0) {
        const tableNames = questionData.Qn_Tables.map((table) => table.tab_name);
        setTableName(tableNames);
        setActiveTab(questionData.Qn_Tables[0].tab_name);
      }

      setExpectedOutput(questionData.ExpectedOutput || []);
      setTestCases(questionData.TestCases || []);

      const storedSqlQuery = sessionStorage.getItem(`SQL_${questionData.Qn_name}`);
      if (storedSqlQuery) {
        setSqlQuery(storedSqlQuery);
        setSubmitData("Submitted");
        setIsSkipDisabled(true);
      } else if (questionData.User_SQL_ans) {
        setSqlQuery(questionData.User_SQL_ans);
      }

      setLoading(false);
    }
  }, [questionData]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handleTableNameClick = () => {
    setIsSelected(!isSelected);
  };

  const handleRun = async () => {
    setRunResponseTestCases([]);
    setRunResponseTable([]);
    setClickCount((prevCount) => prevCount + 1);
    setActiveTab("output");
    setProcessing(true);
    setSuccessMessage("");
    setAdditionalMessage("");

    try {
      setActiveTab("output");
      const updatedSqlQuery = sqlQuery.trim().replace(/\n/g, " ").replace(/;$/, "");
      const sendData = {
        UID: sessionStorage.getItem('UID'),
        Subject: "SQL",
        Qn: questionData.Qn_name,
        query: sessionStorage.getItem('SQLUserAnswer').replace("/*Write a all SQl commands/clauses in UPPERCASE*/", ""),
        TestCases: testCases,
        ExpectedOutput: expectedOutput
      };
      if (updatedSqlQuery) {
        const url = "https://thoughtprocesstestbackend.azurewebsites.net/runsql/";
        setExecutingQuery(true);
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(sendData),
        });
        const responseData = await response.json();
        setRunResponse(responseData);
        setAttempt(responseData.Attempt);
        setRunResponseTable(responseData.data);
        setRunResponseTestCases(responseData.TestCases);
        setExecutingQuery(false);
        const resultField = responseData.TestCases.find((testCase) => testCase.Result !== undefined);
        if (resultField) {
          if (resultField.Result === "True") {
            setSuccessMessage("Congratulations!");
            setAdditionalMessage("You have passed the test cases. Click the submit code button.");
          } else if (resultField.Result === "False") {
            setSuccessMessage("Wrong Answer");
            setAdditionalMessage("You have not passed the test cases");
          }
        }
        setSubmitBtnOn(true);
      } else {
        console.error("SQL query is empty");
      }
    } catch (error) {
      console.error("Error executing SQL query:", error);
      setSuccessMessage("Error");
      setAdditionalMessage("There was an error executing the SQL query.");
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmit = () => {
    setShowSkipConfirmation(true);
  };

  const handleSkipConfirmation = () => {
    setShowSkipConfirmation(false);

    const updatedSqlQuery = sqlQuery.trim().replace(/\n/g, " ").replace(/;$/, "");
    const postData = {
      UID: sessionStorage.getItem('UID'),
      Subject: "SQL",
      Qn: questionData.Qn_name,
      Ans: updatedSqlQuery.replace("/*Write a all SQl commands/clauses in UPPERCASE*/", ""),
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
      setSubmitData("Submitted");
      sessionStorage.setItem(`SQL_${questionData.Qn_name}`, updatedSqlQuery);
      navigate("/PYEditor", { state: { questionData: completeData } });
    })
    .catch(error => console.error("Error submitting:", error));
  };

  const handleConfirmation = () => {
    setShowConfirmation(false);
    navigate("/PYEditor", { state: { questionData: completeData } });
  };

  const handleSkip = () => {
    const postData = {
      UID: sessionStorage.getItem("UID"),
      Subject: "SQL",
      Qn: questionData.Qn_name,
      Ans: "",
      Result: [
        { TestCase1: "Failed" },
        { TestCase2: "Failed" },
        { TestCase3: "Failed" },
        { TestCase4: "Failed" },
        { Result: "False" }
      ],
      Attempt: 0
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
        navigate("/PYEditor", { state: { questionData: completeData } });
      })
      .catch(error => console.error("Error submitting:", error));
  };

  const onChangeSQL = useCallback((value, viewUpdate) => {
      setSqlQuery(value);
      sessionStorage.setItem('SQLUserAnswer', value);
    }, []);

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
        <div className="row h-100 g-0" style={{flexWrap: "nowrap"}}>
          <QuestionList />

          <div className="col-5 lg-8" style={{
            height: "100%",
            display: "flex",
            flex: "nowrap !important",

            flexDirection: "column"
          }}>
            <div className="border border-dark rounded-2 d-flex flex-column"
                 style={{
                   height: "calc(100% - 20px)",
                   backgroundColor: "#E5E5E533"
                 }}>
              <div className="border-bottom border-dark p-3 d-flex justify-content-between align-items-center">
                <h5 className="m-0">Problem Statement</h5>
              </div>
              <div className="p-3 flex-grow-1 overflow-auto"
                   style={{ maxHeight: "calc(100% - 100px)" }}>
                <p>{question}</p>
              </div>
              <div className="mt-auto">
                <ul className="custom-tabs mt-1 mb-2 mx-3 nav nav-pills" role="tablist" style={{ fontSize: "12px", height: "40px" }}>
                  <li className="nav-item" role="presentation">
                    <button
                      type="button"
                      className={`nav-link me-2 ${tableData.some(t => t.tab_name === activeTab) ? "active" : ""}`}
                      onClick={() => handleTabClick(tableData[0]?.tab_name || "")}
                      style={{
                        backgroundColor: tableData.some(t => t.tab_name === activeTab) ? "black" : "transparent",
                        color: tableData.some(t => t.tab_name === activeTab) ? "white" : "black",
                        border: tableData.some(t => t.tab_name === activeTab) ? "none" : "1px solid black",
                      }}
                    >
                      Tables
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button
                      type="button"
                      className={`nav-link ${activeTab === "output" ? "active" : ""}`}
                      onClick={() => handleTabClick("output")}
                      style={{
                        backgroundColor: activeTab === "output" ? "black" : "transparent",
                        color: activeTab === "output" ? "white" : "black",
                        border: activeTab === "output" ? "none" : "1px solid black",
                      }}
                    >
                      Expected Output
                    </button>
                  </li>
                </ul>

                <div className="tab-content">
                  {tableData.some(t => t.tab_name === activeTab) && (
                    <div role="tabpanel" className="ms-3 fade tab-pane active show" style={{ height: "40vh", overflowX: "auto" }}>
                      <div className="d-flex flex-row mb-2">
                        {tableData.map((table, index) => (
                          <div
                            key={index}
                            className="inline-block me-2"
                            style={{ marginBottom: "-1px" }}
                            onClick={() => handleTabClick(table.tab_name)}
                          >
                            <div
                              className="px-3 py-2 text-white"
                              style={{
                                fontSize: "12px",
                                backgroundColor: activeTab === table.tab_name ? "#333" : "#777",
                                borderTopLeftRadius: "8px",
                                borderTopRightRadius: "8px",
                                boxShadow: "0 -2px 4px rgba(0,0,0,0.1)",
                                position: "relative",
                                zIndex: 1,
                                cursor: "pointer"
                              }}
                            >
                              {table.tab_name}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div>
                        {tableData.map((table, index) => (
                          table.tab_name === activeTab && (
                            <table key={index} className="table table-bordered table-sm rounded" style={{ maxWidth: "100vw", width: "55vw", fontSize: "12px" }}>
                              <thead>
                                <tr>
                                  {Object.keys(table.data[0] || {}).map((header, headerIdx) => (
                                    <th key={headerIdx} className="text-center">
                                      {header}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {table.data.map((row, rowIndex) => (
                                  <tr key={rowIndex}>
                                    {Object.keys(row).map((body, cellIdx) => (
                                      <td key={cellIdx} className="text-center" style={{ whiteSpace: "nowrap", padding: "5px" }}>
                                        {row[body]}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )
                        ))}
                      </div>
                    </div>
                  )}

                  <div role="tabpanel" className={`ms-3 fade tab-pane ${activeTab === "output" ? "active show" : ""}`} style={{ height: "40vh", overflowX: "auto", fontSize: "12px" }}>
                    <div className="table-responsive" style={{ height: "100%" }}>
                      {expectedOutput.length > 0 && (
                        <table className="table table-bordered table-sm rounded" style={{ maxWidth: "100vw", width: "20vw", fontSize: "12px" }}>
                          <thead>
                            <tr>
                              {Object.keys(expectedOutput[0]).map((header) => (
                                <th key={header} className="text-center" style={{ maxWidth: `${100 / Object.keys(expectedOutput[0]).length}vw` }}>
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {expectedOutput.map((row, index) => (
                              <tr key={index}>
                                {Object.keys(row).map((header) => (
                                  <td key={header} className="text-center" style={{ whiteSpace: "nowrap", padding: "5px" }}>
                                    {row[header]}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="RightDiv" style={{
  marginLeft: "20px",
  width: "54%",
  height: "100%",
}}>
  <style jsx>{`
    @media (max-width: 1280px) {
      .RightDiv {
        width: 52%;
      }
    }

    @media (max-width: 1024px) {
      .RightDiv {
        width: 45%;
      }
    }
  `}</style>
            <div className="border border-dark rounded-2 mb-3"
                 style={{
                   height: "45%",
                   backgroundColor: "#E5E5E533"
                 }}>
              <div className="border-bottom border-dark p-3 d-flex justify-content-between align-items-center">
                <h5 className="m-0">SQL</h5>
              </div>
              <AceEditor
                mode="sql"
                theme="dreamweaver"
                onChange={onChangeSQL}
                value={sessionStorage.getItem('SQLUserAnswer')}
                fontSize={14}
                showPrintMargin={false}
                showGutter={true}
                highlightActiveLine={false}
                wrapEnabled={true}
                className="pe-3"
                style={{
                  width: "100%",
                  height: "calc(100% - 60px)"
                }}
              />
            </div>

            <div style={{
              height: "9%",
              padding: "10px 0",
              display: "flex",
              alignItems: "center"
            }}>
              <div className="d-flex justify-content-between align-items-center w-100">
                <div className="d-flex flex-column justify-content-center">
                  {processing ? (
                    <h5 className="m-0">Processing...</h5>
                  ) : (
                    <>
                      {successMessage && <h5 className="m-0">{successMessage}</h5>}
                      {additionalMessage && (
                        <p className="m-0" style={{ fontSize: "12px" }}>
                          {additionalMessage}
                        </p>
                      )}
                    </>
                  )}
                </div>
                <div className="d-flex justify-content-end align-items-center">
                  <button
                    className="btn btn-sm btn-light me-2 border border-dark"
                    style={{
                      whiteSpace: "nowrap",
                      minWidth: "100px",
                      boxShadow: "rgb(136, 136, 136) 1px 2px 1px",
                      height: "35px"
                    }}
                    onClick={handleRun}
                  >
                    RUN
                  </button>
                  <button
                    className="btn btn-sm border border-dark me-2"
                    style={{
    backgroundColor: "#FBEFA5DB",
    minWidth: "100px",
    boxShadow: "1px 2px 1px #888"
  }}
                    onClick={handleSubmit}
                    disabled={!submitBtnOn || isSkipDisabled}
                  >
                    {submitData}
                  </button>
                </div>
              </div>
            </div>

            <div className="border border-dark rounded-2"
                 style={{
                   height: "41%",
                   backgroundColor: "#E5E5E533"
                 }}>
              <div className="border-bottom border-dark p-3 d-flex justify-content-between align-items-center">
                <h5 className="m-0">Output</h5>
              </div>
              <div className="p-3 varun"
                   style={{
                     height: "calc(100% - 80px)",
                     overflowY: "auto",
                     overflowX: "auto",
                     maxWidth: "100%"
                   }}>
                {runResponseTable.length > 0 && (
                  <table className="table table-bordered table-sm rounded"
                         style={{
                           width: "100%",
                           tableLayout: "auto",
                           fontSize: "12px"
                         }}>
                    <thead>
                      <tr>
                        {Object.keys(runResponseTable[0]).map((header) => (
                          <th key={header} className="text-center">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {runResponseTable.map((row, index) => (
                        <tr key={index}>
                          {Object.keys(row).map((header) => (
                            <td key={header} className="text-center">
                              {row[header]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                <div className="mt-3">
                  {runResponseTestCases.map((testCase, index) => (
                    <div
                      key={index}
                      className="d-flex align-items-center mb-2 border border-light shadow bg-white rounded p-2"
                      style={{
                        width: "fit-content",
                        fontSize: "12px"
                      }}
                    >
                      <span className="me-2">{Object.keys(testCase)[0]}:</span>
                      <span style={{
                        color: Object.values(testCase)[0] === "Passed" ||
                               Object.values(testCase)[0] === "True" ?
                               "blue" : "red"
                      }}>
                        {Object.values(testCase)[0]}
                      </span>
                    </div>
                  ))}
                </div>
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
          Do you want to submit SQL query?
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

export default SQLEditor;

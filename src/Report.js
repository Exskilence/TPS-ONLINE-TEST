import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Table, Button, Container } from "react-bootstrap";

const Report = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios
      .get("https://thoughtprocesstestbackend.azurewebsites.net/test/report/")
      .then((response) => {
        setData(response.data.data);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "Report.xlsx");
  };

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between">
        <h2 className="mb-3">Test Report</h2>
        <Button variant="success" className="mb-3" onClick={exportToExcel}>
          Export to Excel
        </Button>        
      </div>
      <Table striped bordered hover responsive>
        <thead className="table-dark">
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>College</th>
            <th>Branch</th>
            <th>Score</th>
            <th>Total Score</th>
            <th>Percentage</th>
            <th>Test Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{item.Name}</td>
              <td>{item.Email}</td>
              <td>{item.College}</td>
              <td>{item.Branch}</td>
              <td>{item.Score}</td>
              <td>{item.Total_Score}</td>
              <td>{item.Percentage}</td>
              <td>{item.Test_status}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default Report;

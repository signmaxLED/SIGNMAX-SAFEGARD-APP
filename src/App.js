import React, { useState } from 'react';
import * as XLSX from 'xlsx';

export default function App() {
  const [tableData, setTableData] = useState([]);
  const [columns, setColumns] = useState([]);

  // எக்செல் ஃபைலை ரீட் செய்யும் ஃபங்ஷன்
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      
      // முதல் ஷீட்டை (Sheet) மட்டும் எடுக்கிறோம்
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      
      // டேட்டாவை JSON வடிவமாக மாற்றுகிறோம்
      const data = XLSX.utils.sheet_to_json(ws);
      setTableData(data);

      // டேபிளின் தலைப்புகளை (Columns) எடுப்பதற்கு
      if (data.length > 0) {
        setColumns(Object.keys(data[0]));
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div style={{ padding: "30px", fontFamily: "Arial, sans-serif", maxWidth: "1200px", margin: "0 auto" }}>
      <h2>Signmax Safeguard - Excel Uploader & Viewer</h2>
      
      {/* எக்செல் ஃபைல் அப்லோட் செய்யும் பாக்ஸ் */}
      <div style={{ margin: "20px 0", padding: "20px", border: "2px dashed #0070f3", borderRadius: "8px", background: "#f9f9f9" }}>
        <label style={{ fontWeight: "bold", display: "block", marginBottom: "10px" }}>
          உங்கள் எக்செல் ஃபைலைத் தேர்ந்தெடுக்கவும் (.xlsx / .xls):
        </label>
        <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
      </div>

      {/* டேட்டா இருந்தால் டேபிள் வடிவத்தில் காட்டுதல் */}
      {tableData.length > 0 ? (
        <div style={{ overflowX: "auto", marginTop: "20px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "white", boxShadow: "0 0 10px rgba(0,0,0,0.1)" }}>
            <thead>
              <tr style={{ background: "#0070f3", color: "white", textAlign: "left" }}>
                {columns.map((col, index) => (
                  <th key={index} style={{ padding: "12px", border: "1px solid #ddd" }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, rowIndex) => (
                <tr key={rowIndex} style={{ background: rowIndex % 2 === 0 ? "#f9f9f9" : "white" }}>
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} style={{ padding: "10px", border: "1px solid #ddd" }}>
                      {row[col]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p style={{ color: "666", fontStyle: "italic", marginTop: "20px" }}>
          எக்செல் ஃபைலை அப்லோட் செய்தவுடன் அதன் தரவுகள் இங்கே அட்டவணையாகக் காட்சியளிக்கும்.
        </p>
      )}
    </div>
  );
}

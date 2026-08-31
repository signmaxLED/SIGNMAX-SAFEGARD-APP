import React, { useState } from 'react';
import * as XLSX from 'xlsx';

export default function App() {
  const [tableData, setTableData] = useState([
    { sno: 1, itemName: "LED Display P4", category: "Displays", qty: 15, status: "In Stock" },
    { sno: 2, itemName: "Power Supply 5V", category: "Electronics", qty: 40, status: "Low Stock" }
  ]);
  
  const [columns, setColumns] = useState(["sno", "itemName", "category", "qty", "status"]);

  // புதிய டேட்டாவை டைப் செய்து சேர்க்கும் ஃபார்ம் ஸ்டேட்
  const [newItem, setNewItem] = useState({
    sno: "",
    itemName: "",
    category: "",
    qty: "",
    status: ""
  });

  // எக்செல் ஃபைலை ரீட் செய்யும் ஃபங்ஷன்
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      
      if (data.length > 0) {
        setTableData(data);
        setColumns(Object.keys(data[0]));
      }
    };
    reader.readAsBinaryString(file);
  };

  // இன்புட்டில் டைப் செய்வதை சேமிக்க
  const handleInputChange = (e) => {
    setNewItem({ ...newItem, [e.target.name]: e.target.value });
  };

  // புதிய ரோவை டேபிளில் சேர்க்க
  const handleAddRow = (e) => {
    e.preventDefault();
    if (!newItem.itemName) return;
    setTableData([...tableData, newItem]);
    // ஃபார்மை க்ளியர் செய்ய
    setNewItem({ sno: tableData.length + 1, itemName: "", category: "", qty: "", status: "" });
  };

  return (
    <div style={{ padding: "30px", fontFamily: "Arial, sans-serif", maxWidth: "1200px", margin: "0 auto" }}>
      <h2>Signmax Safeguard - Dashboard & Excel Viewer</h2>
      
      {/* 1. நேரடியாக டைப் செய்து சேர்க்கும் ஃபார்ம் */}
      <div style={{ margin: "20px 0", padding: "20px", border: "1px solid #ccc", borderRadius: "8px", background: "#fdfdfd", boxShadow: "0 0 5px rgba(0,0,0,0.05)" }}>
        <h3 style={{ marginTop: "0", color: "#333" }}>புதிய தரவை நேரடியாகச் சேர்க்க (Add New Entry):</h3>
        <form onSubmit={handleAddRow} style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          <input 
            type="number" 
            name="sno" 
            placeholder="S.No" 
            value={newItem.sno} 
            onChange={handleInputChange} 
            style={{ padding: "8px", flex: "1", minWidth: "80px" }} 
          />
          <input 
            type="text" 
            name="itemName" 
            placeholder="Item Name" 
            value={newItem.itemName} 
            onChange={handleInputChange} 
            style={{ padding: "8px", flex: "2", minWidth: "150px" }} 
            required 
          />
          <input 
            type="text" 
            name="category" 
            placeholder="Category" 
            value={newItem.category} 
            onChange={handleInputChange} 
            style={{ padding: "8px", flex: "1", minWidth: "120px" }} 
          />
          <input 
            type="text" 
            name="qty" 
            placeholder="Quantity" 
            value={newItem.qty} 
            onChange={handleInputChange} 
            style={{ padding: "8px", flex: "1", minWidth: "80px" }} 
          />
          <input 
            type="text" 
            name="status" 
            placeholder="Status" 
            value={newItem.status} 
            onChange={handleInputChange} 
            style={{ padding: "8px", flex: "1", minWidth: "100px" }} 
          />
          <button type="submit" style={{ padding: "8px 20px", background: "#0070f3", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>
            Add
          </button>
        </form>
      </div>

      {/* 2. எக்செல் ஃபைல் அப்லோட் செய்யும் பாக்ஸ் */}
      <div style={{ margin: "20px 0", padding: "15px", border: "2px dashed #0070f3", borderRadius: "8px", background: "#f9f9f9" }}>
        <label style={{ fontWeight: "bold", display: "block", marginBottom: "8px" }}>
          (அல்லது) எக்செல் ஃபைலை அப்லோட் செய்யவும் (.xlsx / .xls):
        </label>
        <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
      </div>

      {/* 3. டேட்டா டேபிள் */}
      {tableData.length > 0 ? (
        <div style={{ overflowX: "auto", marginTop: "20px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "white", boxShadow: "0 0 10px rgba(0,0,0,0.1)" }}>
            <thead>
              <tr style={{ background: "#0070f3", color: "white", textAlign: "left" }}>
                {columns.map((col, index) => (
                  <th key={index} style={{ padding: "12px", border: "1px solid #ddd" }}>{col.toUpperCase()}</th>
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
        <p style={{ color: "#666", fontStyle: "italic", marginTop: "20px" }}>
          தரவுகள் எதுவும் இல்லை. மேலே உள்ள ஃபார்ம் மூலமாகவோ அல்லது எக்செல் ஃபைல் மூலமாகவோ சேர்க்கவும்.
        </p>
      )}
    </div>
  );
}

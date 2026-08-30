import React, { useState } from 'react';

export default function App() {
  const [data] = useState({
    appName: "Signmax Safeguard App",
    status: "Online",
    message: "System is running successfully!"
  });

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Signmax Safeguard Dashboard</h1>
      <p>System Status: Active</p>
      <pre style={{ background: "#f4f4f4", padding: "15px", borderRadius: "5px" }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

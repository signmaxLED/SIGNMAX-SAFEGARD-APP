import React, { useState } from 'react';
import { Search, Send, Calendar, Building2, Phone, FileSpreadsheet, Share2, Briefcase, Plus, Calculator, Clock } from 'lucide-react';
import * as XLSX from 'xlsx';

// Initial Workers Master
const InitialWorkersMaster = [
  { workerCode: 'Q-101', name: 'Ramesh Kumar', company: 'SIGNMAX TRADING WLL', phone: '97433123456', dept: 'Civil Construction', profession: 'Mason / Bricklayer', monthlyAbsent: 2, yearlyAbsent: 5, regularHours: 208, weekdayOtHours: 20, holidayOtHours: 8, hourlyRate: 15 },
  { workerCode: 'Q-102', name: 'Vijay Anand', company: 'SIGNMAX TRADING WLL', phone: '97455678901', dept: 'MEP (Mechanical)', profession: 'HVAC Technician', monthlyAbsent: 0, yearlyAbsent: 2, regularHours: 208, weekdayOtHours: 10, holidayOtHours: 0, hourlyRate: 18 },
  { workerCode: 'Q-103', name: 'Anitha Roy', company: 'SAFEGARD WLL', phone: '97466789012', dept: 'Electrical', profession: 'Electrician', monthlyAbsent: 3, yearlyAbsent: 11, regularHours: 190, weekdayOtHours: 15, holidayOtHours: 12, hourlyRate: 15 },
  { workerCode: 'Q-104', name: 'Priya Sharma', company: 'SAFEGARD WLL', phone: '97477890123', dept: 'Logistics', profession: 'Heavy Vehicle Driver', monthlyAbsent: 1, yearlyAbsent: 3, regularHours: 208, weekdayOtHours: 0, holidayOtHours: 0, hourlyRate: 20 },
  { workerCode: 'Q-105', name: 'Karthik Raja', company: 'SIGNMAX TRADING WLL', phone: '97455112233', dept: 'Maintenance', profession: 'Welder (6G)', monthlyAbsent: 0, yearlyAbsent: 1, regularHours: 208, weekdayOtHours: 25, holidayOtHours: 10, hourlyRate: 17 },
];

export default function QatarCompanyApp() {
  const [workers, setWorkers] = useState(InitialWorkersMaster);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('ALL');
  
  // Modals & Dynamic OT Calculator States
  const [showAddForm, setShowAddForm] = useState(false);
  const [showOtModal, setShowOtModal] = useState(false);
  const [selectedWorkerForOt, setSelectedWorkerForOt] = useState(null);

  // Dynamic Month OT Entry State
  const [otMonthData, setOtMonthData] = useState({
    year: 2026,
    month: 3, // March by default
    workedHoursInput: 220, // Total hours logged by worker in month
  });

  const [newWorker, setNewWorker] = useState({
    workerCode: '', name: '', company: 'SIGNMAX TRADING WLL', phone: '', dept: '', profession: '',
    monthlyAbsent: 0, yearlyAbsent: 0, regularHours: 208, weekdayOtHours: 0, holidayOtHours: 0, hourlyRate: 15
  });

  const hrPhone = '97433000111';
  const gmPhone = '97433000222';

  // Helper to calculate total days, Fridays, and standard working days for any year & month
  const getMonthCalendarStats = (year, month) => {
    const totalDaysInMonth = new Date(year, month, 0).getDate();
    let fridaysCount = 0;
    
    for (let day = 1; day <= totalDaysInMonth; day++) {
      const dateObj = new Date(year, month - 1, day);
      if (dateObj.getDay() === 5) { // 5 is Friday
        fridaysCount++;
      }
    }
    const workingDaysCount = totalDaysInMonth - fridaysCount;
    const standardRegularHours = workingDaysCount * 8; // standard 8 hours per working day

    return { totalDaysInMonth, fridaysCount, workingDaysCount, standardRegularHours };
  };

  // Dynamic Calculation when user inputs total hours
  const calculateDynamicOtBreakdown = (worker, year, month, totalInputHours) => {
    const stats = getMonthCalendarStats(year, month);
    const regularHours = Math.min(totalInputHours, stats.standardRegularHours);
    const excessHours = Math.max(0, totalInputHours - stats.standardRegularHours);
    
    // Split excess hours between Weekday OT and Holiday/Friday OT based on ratio or default distribution
    // For Qatar law: Fridays are weekly rest days. If worked, paid at holiday rate (1.50x) or regular + premium.
    const holidayOtHours = Math.round(excessHours * 0.4); // Estimated portion on Fridays/Holidays
    const weekdayOtHours = excessHours - holidayOtHours; // Remaining excess as weekday OT (1.25x)

    const weekdayOtPay = weekdayOtHours * worker.hourlyRate * 1.25;
    const holidayOtPay = holidayOtHours * worker.hourlyRate * 1.50;
    const totalOtPay = weekdayOtPay + holidayOtPay;

    return {
      stats,
      regularHours,
      weekdayOtHours,
      holidayOtHours,
      weekdayOtPay,
      holidayOtPay,
      totalOtPay
    };
  };

  // Qatar Labor Law Calculations for general list
  const calculateMonthlyPayout = (w) => {
    const weekdayOtPay = w.weekdayOtHours * w.hourlyRate * 1.25;
    const holidayOtPay = w.holidayOtHours * w.hourlyRate * 1.50;
    const totalOtPay = weekdayOtPay + holidayOtPay;
    return { weekdayOtPay, holidayOtPay, totalOtPay };
  };

  // Save Dynamic OT back to worker record
  const handleSaveDynamicOt = (e) => {
    e.preventDefault();
    if (!selectedWorkerForOt) return;

    const breakdown = calculateDynamicOtBreakdown(selectedWorkerForOt, otMonthData.year, otMonthData.month, otMonthData.workedHoursInput);

    const updatedWorkers = workers.map(w => {
      if (w.workerCode === selectedWorkerForOt.workerCode) {
        return {
          ...w,
          regularHours: breakdown.regularHours,
          weekdayOtHours: breakdown.weekdayOtHours,
          holidayOtHours: breakdown.holidayOtHours
        };
      }
      return w;
    });

    setWorkers(updatedWorkers);
    setShowOtModal(false);
    setSelectedWorkerForOt(null);
    alert(`Successfully updated OT for ${selectedWorkerForOt.name}!\nWorking Days: ${breakdown.stats.workingDaysCount} | Fridays: ${breakdown.stats.fridaysCount}\nWeekday OT: ${breakdown.weekdayOtHours} hrs | Holiday OT: ${breakdown.holidayOtHours} hrs`);
  };

  // Add New Worker Function
  const handleAddWorker = (e) => {
    e.preventDefault();
    if (!newWorker.workerCode || !newWorker.name) return alert('Worker Code and Name are required!');
    setWorkers([...workers, newWorker]);
    setShowAddForm(false);
    setNewWorker({ workerCode: '', name: '', company: 'SIGNMAX TRADING WLL', phone: '', dept: '', profession: '', monthlyAbsent: 0, yearlyAbsent: 0, regularHours: 208, weekdayOtHours: 0, holidayOtHours: 0, hourlyRate: 15 });
  };

  // Export to Excel
  const exportToExcel = () => {
    const excelData = filteredWorkers.map(w => {
      const { weekdayOtPay, holidayOtPay, totalOtPay } = calculateMonthlyPayout(w);
      return {
        'Company Name': w.company,
        'Worker Code': w.workerCode,
        'Worker Name': w.name,
        'Department': w.dept,
        'Profession / Designation': w.profession,
        'WhatsApp Phone': w.phone,
        'Monthly Absent (Days)': w.monthlyAbsent,
        'Yearly Absent (Days)': w.yearlyAbsent,
        'Regular Hours': w.regularHours,
        'Weekday OT Hours (1.25x)': w.weekdayOtHours,
        'Holiday/Friday OT Hours (1.50x)': w.holidayOtHours,
        'Total OT Payout (QR)': totalOtPay.toFixed(2)
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Company OT Report");
    XLSX.writeFile(workbook, `${selectedCompany}_Workers_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Share Individual Worker Report via WhatsApp
  const sendWorkerReport = (worker) => {
    const { totalOtPay } = calculateMonthlyPayout(worker);
    const message = `*${worker.company.toUpperCase()} - OFFICIAL OT STATEMENT*%0A` +
      `----------------------------------%0A` +
      `*Worker Code:* ${worker.workerCode}%0A` +
      `*Name:* ${worker.name}%0A` +
      `*Department:* ${worker.dept}%0A` +
      `*Profession:* ${worker.profession}%0A` +
      `----------------------------------%0A` +
      `*Monthly Absent:* ${worker.monthlyAbsent} Days%0A` +
      `*Yearly Absent:* ${worker.yearlyAbsent} Days%0A` +
      `----------------------------------%0A` +
      `*Regular Hours:* ${worker.regularHours} hrs%0A` +
      `*Weekday OT (1.25x):* ${worker.weekdayOtHours} hrs%0A` +
      `*Holiday/Friday OT (1.50x):* ${worker.holidayOtHours} hrs%0A` +
      `*TOTAL OT PAY:* *QR ${totalOtPay.toFixed(2)}*%0A` +
      `----------------------------------%0A` +
      `Statement generated for Monthly Payroll Cycle. Contact HR for queries.`;

    window.open(`https://wa.me/${worker.phone}?text=${message}`, '_blank');
  };

  // Share Executive Summary
  const shareSummaryToManager = (targetPhone, role) => {
    const totalOTHours = filteredWorkers.reduce((acc, curr) => acc + curr.weekdayOtHours + curr.holidayOtHours, 0);
    const totalOTPayout = filteredWorkers.reduce((acc, curr) => acc + calculateMonthlyPayout(curr).totalOtPay, 0);
    const companyHeader = selectedCompany === 'ALL' ? 'SIGNMAX TRADING WLL & SAFEGARD WLL' : selectedCompany;

    const message = `*${companyHeader.toUpperCase()} - EXECUTIVE OVERTIME REPORT*%0A` +
      `*Role:* ${role}%0A` +
      `----------------------------------%0A` +
      `*Total Workforce Count:* ${filteredWorkers.length} Workers%0A` +
      `*Total OT Hours Logged:* ${totalOTHours} Hours%0A` +
      `*Total OT Amount Disbursed:* *QR ${totalOTPayout.toFixed(2)}*%0A` +
      `----------------------------------%0A` +
      `Master Excel Report generated and ready for salary audit.`;

    window.open(`https://wa.me/${targetPhone}?text=${message}`, '_blank');
  };

  const filteredWorkers = workers.filter(w => {
    const matchesSearch = w.workerCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          w.dept.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          w.profession.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCompany = selectedCompany === 'ALL' || w.company === selectedCompany;
    return matchesSearch && matchesCompany;
  });

  return (
    <div className="min-h-screen bg-sky-100 p-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-white/80 backdrop-blur-md p-5 rounded-2xl shadow-sm border border-sky-200">
        <div>
          <div className="flex items-center gap-2 text-sky-700 font-bold text-xs uppercase tracking-wider mb-1">
            <Building2 size={16} /> SIGNMAX TRADING W.L.L. & SAFEGARD W.L.L. • Qatar
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Worker Management & Dynamic OT Dispatcher</h1>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition shadow-sm"
          >
            <Plus size={16} /> Add Worker
          </button>

          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-medium px-4 py-2 rounded-lg text-sm transition shadow-sm"
          >
            <FileSpreadsheet size={16} /> Export Excel
          </button>

          <button
            onClick={() => shareSummaryToManager(hrPhone, 'HR Manager')}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-2 rounded-lg text-xs transition shadow-sm"
          >
            <Share2 size={14} /> Send HR Report
          </button>

          <button
            onClick={() => shareSummaryToManager(gmPhone, 'General Manager')}
            className="flex items-center gap-1.5 bg-purple-700 hover:bg-purple-800 text-white font-medium px-3 py-2 rounded-lg text-xs transition shadow-sm"
          >
            <Share2 size={14} /> Send GM Report
          </button>
        </div>
      </div>

      {/* Company Filter & Search Input */}
      <div className="bg-white/90 backdrop-blur-md p-4 rounded-xl border border-sky-200 shadow-sm mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search Worker Code, Name, Dept or Profession..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-sky-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
          />
        </div>

        {/* Company Filter Dropdown */}
        <div className="w-full sm:w-auto">
          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="w-full sm:w-auto border border-sky-200 rounded-lg px-3 py-2 text-sm text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500 bg-sky-50"
          >
            <option value="ALL">All Companies (SIGNMAX & SAFEGARD)</option>
            <option value="SIGNMAX TRADING WLL">SIGNMAX TRADING W.L.L.</option>
            <option value="SAFEGARD WLL">SAFEGARD W.L.L.</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-sky-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-sky-50 border-b border-sky-200 text-slate-600 uppercase text-[11px] font-semibold tracking-wider">
                <th className="p-4">Company</th>
                <th className="p-4">Worker Code</th>
                <th className="p-4">Name</th>
                <th className="p-4">Department</th>
                <th className="p-4">Profession</th>
                <th className="p-4">Reg. Hours</th>
                <th className="p-4">OT Breakdown (Wk / Hol)</th>
                <th className="p-4">OT Pay (QR)</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-100">
              {filteredWorkers.map((worker) => {
                const { totalOtPay } = calculateMonthlyPayout(worker);

                return (
                  <tr key={worker.workerCode} className="hover:bg-sky-50/50 transition">
                    <td className="p-4 font-bold text-xs text-slate-600">
                      <span className={`px-2 py-1 rounded ${worker.company.includes('SIGNMAX') ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                        {worker.company}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-bold text-sky-700 bg-sky-50/50">{worker.workerCode}</td>
                    <td className="p-4 font-semibold text-slate-800">{worker.name}</td>
                    <td className="p-4 text-slate-700 font-medium">{worker.dept}</td>
                    <td className="p-4">
                      <span className="flex items-center gap-1.5 text-sky-900 font-semibold bg-sky-50 px-2.5 py-1 rounded-md text-xs border border-sky-100 w-max">
                        <Briefcase size={13} className="text-sky-600" />
                        {worker.profession}
                      </span>
                    </td>
                    <td className="p-4 text-slate-700 font-bold">{worker.regularHours} hrs</td>
                    <td className="p-4 text-xs text-slate-600 font-medium">
                      <span className="text-indigo-600 font-bold">{worker.weekdayOtHours}h Wk</span> / <span className="text-amber-600 font-bold">{worker.holidayOtHours}h Hol</span>
                    </td>
                    <td className="p-4 font-bold text-emerald-600">QR {totalOtPay.toFixed(2)}</td>
                    <td className="p-4 text-center flex items-center justify-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedWorkerForOt(worker);
                          setShowOtModal(true);
                        }}
                        className="bg-sky-600 hover:bg-sky-700 text-white font-medium px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1 transition shadow-sm"
                        title="Calculate Monthly OT with Friday breakdown"
                      >
                        <Calculator size={14} /> OT Setup
                      </button>
                      <button
                        onClick={() => sendWorkerReport(worker)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1 transition shadow-sm"
                      >
                        <Send size={14} /> WhatsApp
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dynamic Monthly OT Calculation Modal */}
      {showOtModal && selectedWorkerForOt && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-sky-100">
            <div className="flex items-center gap-2 text-sky-700 font-bold text-xs uppercase tracking-wider mb-1">
              <Clock size={16} /> Monthly OT & Holiday Split Calculator
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-3">
              {selectedWorkerForOt.name} ({selectedWorkerForOt.workerCode})
            </h3>
            
            <div className="bg-sky-50 p-4 rounded-xl mb-4 text-xs text-sky-900 space-y-1 border border-sky-200">
              <p><strong>Profession:</strong> {selectedWorkerForOt.profession}</p>
              <p><strong>Hourly Rate:</strong> QR {selectedWorkerForOt.hourlyRate} / hr</p>
              <p className="text-sky-700 font-medium">Automatic calculation splits total monthly logged hours into standard working days, Fridays (holidays), and overtime multipliers (1.25x & 1.50x).</p>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Select Year</label>
                  <select
                    value={otMonthData.year}
                    onChange={(e) => setOtMonthData({...otMonthData, year: parseInt(e.target.value)})}
                    className="w-full p-2 border border-sky-200 rounded-lg text-sm mt-1 bg-white"
                  >
                    <option value={2026}>2026</option>
                    <option value={2027}>2027</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Select Month</label>
                  <select
                    value={otMonthData.month}
                    onChange={(e) => setOtMonthData({...otMonthData, month: parseInt(e.target.value)})}
                    className="w-full p-2 border border-sky-200 rounded-lg text-sm mt-1 bg-white"
                  >
                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, idx) => (
                      <option key={idx+1} value={idx+1}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600">Total Monthly Logged Hours</label>
                <input
                  type="number"
                  value={otMonthData.workedHoursInput}
                  onChange={(e) => setOtMonthData({...otMonthData, workedHoursInput: parseFloat(e.target.value) || 0})}
                  className="w-full p-2 border border-sky-200 rounded-lg text-sm mt-1 bg-white"
                  placeholder="e.g. 230"
                />
              </div>

              {/* Live Preview of Calculation */}
              {(() => {
                const preview = calculateDynamicOtBreakdown(selectedWorkerForOt, otMonthData.year, otMonthData.month, otMonthData.workedHoursInput);
                return (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1.5">
                    <p className="font-bold text-slate-700">Calculated Breakdown for Month:</p>
                    <div className="grid grid-cols-2 gap-2 text-slate-600">
                      <p>Total Days in Month: <span className="font-bold text-slate-900">{preview.stats.totalDaysInMonth}</span></p>
                      <p>Fridays (Holidays): <span className="font-bold text-amber-600">{preview.stats.fridaysCount} Days</span></p>
                      <p>Working Days: <span className="font-bold text-emerald-600">{preview.stats.workingDaysCount} Days</span></p>
                      <p>Standard Reg. Hours: <span className="font-bold text-slate-900">{preview.regularHours} hrs</span></p>
                      <p>Weekday OT (1.25x): <span className="font-bold text-indigo-600">{preview.weekdayOtHours} hrs</span></p>
                      <p>Holiday/Friday OT (1.50x): <span className="font-bold text-amber-600">{preview.holidayOtHours} hrs</span></p>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-bold text-emerald-600">
                      <span>Total Calculated OT Payout:</span>
                      <span>QR {preview.totalOtPay.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })()}

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowOtModal(false)}
                  className="px-4 py-2 border border-sky-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-sky-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveDynamicOt}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-medium shadow-sm"
                >
                  Apply & Save OT
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Worker Modal Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-sky-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Add Worker to Company System</h3>
            <form onSubmit={handleAddWorker} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600">Select Company</label>
                <select 
                  value={newWorker.company} 
                  onChange={(e) => setNewWorker({...newWorker, company: e.target.value})}
                  className="w-full p-2 border border-sky-200 rounded-lg text-sm mt-1 bg-white"
                >
                  <option value="SIGNMAX TRADING WLL">SIGNMAX TRADING W.L.L.</option>
                  <option value="SAFEGARD WLL">SAFEGARD W.L.L.</option>
                </select>
              </div>
              <input type="text" placeholder="Worker Code (e.g. Q-106)" value={newWorker.workerCode} onChange={(e) => setNewWorker({...newWorker, workerCode: e.target.value})} className="w-full p-2 border border-sky-200 rounded-lg text-sm" required />
              <input type="text" placeholder="Full Name" value={newWorker.name} onChange={(e) => setNewWorker({...newWorker, name: e.target.value})} className="w-full p-2 border border-sky-200 rounded-lg text-sm" required />
              <input type="text" placeholder="WhatsApp Phone (e.g. 97433000000)" value={newWorker.phone} onChange={(e) => setNewWorker({...newWorker, phone: e.target.value})} className="w-full p-2 border border-sky-200 rounded-lg text-sm" required />
              <input type="text" placeholder="Department (e.g. Logistics)" value={newWorker.dept} onChange={(e) => setNewWorker({...newWorker, dept: e.target.value})} className="w-full p-2 border border-sky-200 rounded-lg text-sm" required />
              <input type="text" placeholder="Profession (e.g. Driver)" value={newWorkflowNameCheck => setNewWorker({...newWorker, profession: newWorkflowNameCheck.target.value})} className="w-full p-2 border border-sky-200 rounded-lg text-sm" required />
              
              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 border border-sky-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-sky-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-medium shadow-sm">Save Worker</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

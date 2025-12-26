const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTimop-MSQF3z2MZNYAthBOQWJmQiZQUbbqCpdDtc1S5GTds0-O7lLiBDoqvcdSMQ/pub?gid=1630704051&single=true&output=csv'; 
let dataStore = [];

async function loadData() {
    try {
        const response = await fetch(csvUrl);
        const text = await response.text();
        
        if (text.includes("<!DOCTYPE")) {
            alert("CRITICAL ERROR: The link provided is a Web Page, not CSV data. Check your 'Publish to Web' settings.");
            return;
        }

        localStorage.setItem('cachedAccountData', text);
        localStorage.setItem('lastSyncTime', new Date().toLocaleString());
        processData(text);
    } catch (e) {
        const savedData = localStorage.getItem('cachedAccountData');
        if (savedData) {
            processData(savedData);
            alert("Viewing Offline Copy (Last Synced: " + localStorage.getItem('lastSyncTime') + ")");
        }
    }
}

function processData(csvText) {
    dataStore = csvText.split('\n').map(row => row.split(','));
    setupPickers();
    updateDisplay();
}

function setupPickers() {
    const monthPicker = document.getElementById('monthPicker');
    const yearPicker = document.getElementById('yearPicker');
    const now = new Date();
    const curMonth = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(now);
    const curYear = now.getFullYear().toString();

    // Setup Year Options
    yearPicker.innerHTML = "";
    for(let y=2024; y<=2026; y++) {
        let opt = document.createElement('option');
        opt.value = y; opt.text = y;
        if(y.toString() === curYear) opt.selected = true;
        yearPicker.appendChild(opt);
    }

    // Setup Month Options from Row 1
    monthPicker.innerHTML = "";
    dataStore[0].forEach((m, i) => {
        if(i > 0 && m.trim()) {
            let opt = document.createElement('option');
            opt.value = i; opt.text = m.trim();
            if(m.trim().toLowerCase() === curMonth.toLowerCase()) opt.selected = true;
            monthPicker.appendChild(opt);
        }
    });
}

function updateDisplay() {
    const col = parseInt(document.getElementById('monthPicker').value);
    const selMonth = document.getElementById('monthPicker').selectedOptions[0].text;
    const selYear = document.getElementById('yearPicker').value;

    const now = new Date();
    const curMonthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(now);
    const curYear = now.getFullYear().toString();
    const curDay = now.getDate();

    const getVal = (r, c) => parseFloat(dataStore[r][c]) || 0;

    // Chain Calculation for Summary
    let pFwd = (col === 1) ? getVal(9, col) : (getVal(9, col-1) + getVal(10, col-1)) - getVal(11, col-1);
    const pIn = getVal(10, col);
    const pOut = getVal(11, col);
    const pEnd = (pFwd + pIn) - pOut;

    // Update UI Totals
    document.getElementById('out-month').innerText = selMonth;
    document.getElementById('out-year').innerText = selYear;
    document.getElementById('p-fwd').innerText = pFwd.toLocaleString(undefined, {minimumFractionDigits: 2});
    document.getElementById('p-in').innerText = pIn.toLocaleString(undefined, {minimumFractionDigits: 2});
    document.getElementById('p-out').innerText = pOut.toLocaleString(undefined, {minimumFractionDigits: 2});
    document.getElementById('p-end').innerText = pEnd.toLocaleString(undefined, {minimumFractionDigits: 2});
    document.getElementById('grand-total').innerText = pEnd.toLocaleString(undefined, {minimumFractionDigits: 2});
    document.getElementById('sync-time').innerText = localStorage.getItem('lastSyncTime');

    // Populate Detailed Ledger (Row 21+)
    const tbody = document.getElementById('ledger-body');
    tbody.innerHTML = "";

    for(let i=20; i < dataStore.length; i++) {
        const row = dataStore[i];
        if(!row || row.length < 8) continue;

        const rowDate = parseInt(row[0]); // Column A: Date
        const rowMonth = row[6]?.trim();  // Column G: Month
        const rowYear = row[7]?.trim();   // Column H: Year

        // Only show if Month and Year match
        if(rowMonth.toLowerCase() === selMonth.toLowerCase() && rowYear === selYear) {
            
            // NEW LOGIC: If viewing the CURRENT month/year, hide future dates
            if (selMonth.toLowerCase() === curMonthName.toLowerCase() && selYear === curYear) {
                if (rowDate > curDay) continue; // Skip if date is in the future
            }

            tbody.innerHTML += `<tr>
                <td>${row[0]}</td><td>${row[1]}</td><td>${row[2]}</td>
                <td>${row[3]}</td><td>${row[4]}</td><td>${row[5]}</td>
            </tr>`;
        }
    }
}

function toggleAccordion(id) {
    const p = document.getElementById(id);
    p.style.display = (p.style.display === "block") ? "none" : "block";
}

loadData();


// Replace this with your Google Sheets Published CSV Link
const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTimop-MSQF3z2MZNYAthBOQWJmQiZQUbbqCpdDtc1S5GTds0-O7lLiBDoqvcdSMQ/pub?output=csv'; 
let dataStore = [];

async function loadData() {
    try {
        const response = await fetch(csvUrl);
        const text = await response.text();
        
        if (text.includes("<!DOCTYPE")) throw new Error("Link error");

        // Save for offline use and record the sync time
        localStorage.setItem('cachedAccountData', text);
        localStorage.setItem('lastSyncTime', new Date().toLocaleString());
        
        processData(text);
    } catch (e) {
        const savedData = localStorage.getItem('cachedAccountData');
        if (savedData) {
            processData(savedData);
            const syncTime = localStorage.getItem('lastSyncTime');
            alert("Offline Mode: Data last updated on " + syncTime);
        } else {
            alert("Connection failed. No offline data available.");
        }
    }
}

function processData(csvText) {
    dataStore = csvText.split('\n').map(row => row.split(','));
    const picker = document.getElementById('monthPicker');
    picker.innerHTML = '';
    
    // Get current month name (e.g., "December")
    const currentMonthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date());

    dataStore[0].forEach((month, i) => {
        const cleanMonth = month.trim();
        if(i > 0 && cleanMonth) {
            let opt = document.createElement('option');
            opt.value = i;
            opt.text = cleanMonth;
            
            // IMPROVED MATCHING: Case-insensitive and trimmed
            if (cleanMonth.toLowerCase() === currentMonthName.toLowerCase()) {
                opt.selected = true;
            }
            picker.appendChild(opt);
        }
    });
    
    updateDisplay();
}

function updateDisplay() {
    const col = parseInt(document.getElementById('monthPicker').value);
    if (!col || dataStore.length === 0) return;

    const getVal = (row, column) => {
        const val = dataStore[row] ? dataStore[row][column] : 0;
        return parseFloat(val) || 0;
    };

    let pFwd;
    if (col === 1) {
        pFwd = getVal(9, col); // Excel Row 10
    } else {
        const prevCol = col - 1;
        // Calculation chain: (Prev Fwd + Prev In) - Prev Out
        pFwd = (getVal(9, prevCol) + getVal(10, prevCol)) - getVal(11, prevCol);
    }

    const pIn  = getVal(10, col); // Row 11
    const pOut = getVal(11, col); // Row 12
    const pEnd = (pFwd + pIn) - pOut;

    document.getElementById('out-month').innerText = dataStore[0][col];
    document.getElementById('p-fwd').innerText = pFwd.toLocaleString(undefined, {minimumFractionDigits: 2});
    document.getElementById('p-in').innerText  = pIn.toLocaleString(undefined, {minimumFractionDigits: 2});
    document.getElementById('p-out').innerText = pOut.toLocaleString(undefined, {minimumFractionDigits: 2});
    document.getElementById('p-end').innerText = pEnd.toLocaleString(undefined, {minimumFractionDigits: 2});
    document.getElementById('grand-total').innerText = pEnd.toLocaleString(undefined, {minimumFractionDigits: 2});
}

loadData();

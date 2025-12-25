// Replace this with your Google Sheets Published CSV Link
const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTimop-MSQF3z2MZNYAthBOQWJmQiZQUbbqCpdDtc1S5GTds0-O7lLiBDoqvcdSMQ/pub?gid=548462238&single=true&output=csv'; 
let dataStore = [];

async function loadData() {
    try {
        const response = await fetch(csvUrl);
        const text = await response.text();
        dataStore = text.split('\n').map(row => row.split(','));
        
        const picker = document.getElementById('monthPicker');
        picker.innerHTML = '';
        
        dataStore[0].forEach((month, i) => {
            if(i > 0 && month.trim()) {
                let opt = document.createElement('option');
                opt.value = i;
                opt.text = month.trim();
                picker.appendChild(opt);
            }
        });
        
        updateDisplay();
    } catch (e) {
        console.error("Error loading data:", e);
    }
}

function updateDisplay() {
    const col = parseInt(document.getElementById('monthPicker').value);
    if (!col || dataStore.length === 0) return;

    // Helper to pull data from specific cells
    const getVal = (row, column) => {
        const val = dataStore[row] ? dataStore[row][column] : 0;
        return parseFloat(val) || 0;
    };

    let pFwd;

    // --- LOGIC FOR PRIMARY BALANCE FORWARD ---
    if (col === 1) {
        // If January (Column B), pull directly from Row 10 (index 9)
        pFwd = getVal(9, col);
    } else {
        // For other months, calculate the Ending Balance of the PREVIOUS month
        const prevCol = col - 1;
        const prevPFwd = getVal(9, prevCol); // Previous Month Forward
        const prevPIn  = getVal(10, prevCol); // Previous Month IN
        const prevPOut = getVal(11, prevCol); // Previous Month OUT
        
        // The "Chain": Prev End becomes Current Forward
        pFwd = (prevPFwd + prevPIn) - prevPOut;
    }

    // --- CURRENT MONTH CALCULATION ---
    const pIn  = getVal(10, col); // Row 11
    const pOut = getVal(11, col); // Row 12
    const pEnd = (pFwd + pIn) - pOut;

    // --- UPDATE THE UI ---
    document.getElementById('out-month').innerText = dataStore[0][col];
    
    document.getElementById('p-fwd').innerText = pFwd.toLocaleString(undefined, {minimumFractionDigits: 2});
    document.getElementById('p-in').innerText  = pIn.toLocaleString(undefined, {minimumFractionDigits: 2});
    document.getElementById('p-out').innerText = pOut.toLocaleString(undefined, {minimumFractionDigits: 2});
    document.getElementById('p-end').innerText = pEnd.toLocaleString(undefined, {minimumFractionDigits: 2});

    // Total Funds on Hand matches the Primary Ending Balance
    document.getElementById('grand-total').innerText = pEnd.toLocaleString(undefined, {minimumFractionDigits: 2});
}

loadData();


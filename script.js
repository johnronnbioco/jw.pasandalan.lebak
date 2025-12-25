// Replace this with your Google Sheets Published CSV Link
const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTimop-MSQF3z2MZNYAthBOQWJmQiZQUbbqCpdDtc1S5GTds0-O7lLiBDoqvcdSMQ/pub?output=csv'; 
let dataStore = [];

async function loadData() {
    try {
        const response = await fetch(csvUrl);
        const text = await response.text();
        
        if (text.includes("<!DOCTYPE")) {
            throw new Error("HTML detected instead of CSV");
        }

        // SAVE TO LOCAL STORAGE for offline use
        localStorage.setItem('cachedAccountData', text);
        console.log("Data synced and saved for offline use.");
        
        processData(text);
    } catch (e) {
        console.warn("Internet offline or link error. Checking for saved data...");
        
        // LOAD FROM LOCAL STORAGE if fetch fails
        const savedData = localStorage.getItem('cachedAccountData');
        if (savedData) {
            processData(savedData);
            alert("Viewing offline copy (last synced version).");
        } else {
            alert("No internet connection and no offline data saved yet.");
        }
    }
}

function processData(csvText) {
    dataStore = csvText.split('\n').map(row => row.split(','));
    const picker = document.getElementById('monthPicker');
    picker.innerHTML = '';
    
    // Auto-select current month logic
    const currentMonthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date());

    dataStore[0].forEach((month, i) => {
        if(i > 0 && month.trim()) {
            let opt = document.createElement('option');
            opt.value = i;
            opt.text = month.trim();
            if (month.trim().toLowerCase() === currentMonthName.toLowerCase()) {
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
        // The "Chain" calculation
        const prevPFwd = getVal(9, prevCol);
        const prevPIn  = getVal(10, prevCol);
        const prevPOut = getVal(11, prevCol);
        pFwd = (prevPFwd + prevPIn) - prevPOut;
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

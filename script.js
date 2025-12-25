// Replace this with your Google Sheets Published CSV Link
const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS2_z4wyXRZ1KbjW7K_eqKeU89HYqYXc80ROCag6KnkxJkgh3tHxFYSn0OYySCUfw/pub?gid=1305726157&single=true&output=csv'; 
let dataStore = [];

async function loadData() {
    try {
        const response = await fetch(csvUrl);
        const text = await response.text();
        
        // Convert CSV text to a 2D Array
        dataStore = text.split('\n').map(row => row.split(','));
        
        const picker = document.getElementById('monthPicker');
        picker.innerHTML = '';
        
        // Populate the dropdown with months from the first row (headers)
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
        alert("Failed to load data. Please check your CSV link.");
    }
}

function updateDisplay() {
    const col = document.getElementById('monthPicker').value;
    if (!col || dataStore.length === 0) return;

    // Helper to pull data by Excel row index (0-indexed)
    const getVal = (row) => {
        const val = dataStore[row] ? dataStore[row][col] : 0;
        return parseFloat(val) || 0;
    };

    // Row Mapping: 
    // Row 4 = index 3, Row 5 = index 4, etc.
    const rFwd = getVal(3);
    const rIn  = getVal(4);
    const rOut = getVal(5);
    const rEnd = (rFwd + rIn) - rOut;

    const pFwd = getVal(9);
    const pIn  = getVal(10);
    const pOut = getVal(11);
    const pEnd = (pFwd + pIn) - pOut;

    // Update the DOM
    document.getElementById('out-month').innerText = dataStore[0][col];
    
    document.getElementById('r-fwd').innerText = rFwd.toLocaleString();
    document.getElementById('r-in').innerText  = rIn.toLocaleString();
    document.getElementById('r-out').innerText = rOut.toLocaleString();
    document.getElementById('r-end').innerText = rEnd.toLocaleString();

    document.getElementById('p-fwd').innerText = pFwd.toLocaleString();
    document.getElementById('p-in').innerText  = pIn.toLocaleString();
    document.getElementById('p-out').innerText = pOut.toLocaleString();
    document.getElementById('p-end').innerText = pEnd.toLocaleString();

    document.getElementById('grand-total').innerText = (rEnd + pEnd).toLocaleString();
}

// Initial data load

loadData();

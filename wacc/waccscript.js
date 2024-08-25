// Cost of Debt Calculator
function calculateCostOfDebt() {
    const rd = parseFloat(document.getElementById('rd').value);
    const tax = parseFloat(document.getElementById('tax').value) / 100;
    const costOfDebt = rd * (1 - tax);
    document.getElementById('cost-debt-result').textContent = costOfDebt.toFixed(2);
}

// WACC Calculator
function calculateWACC() {
    const equity = parseFloat(document.getElementById('equity').value);
    const debt = parseFloat(document.getElementById('debt').value);
    const ke = parseFloat(document.getElementById('ke').value) / 100;
    const kd = parseFloat(document.getElementById('kd').value) / 100;

    // Calculate total value (V)
    const v = equity + debt;

    // Calculate proportions of equity (E/V) and debt (D/V)
    const eOverV = equity / v;
    const dOverV = debt / v;

    // Calculate WACC using the formula
    const wacc = ((eOverV * ke) + (dOverV * kd)) * 100;

    // Display the result
    document.getElementById('wacc-result').textContent = wacc.toFixed(2);
}

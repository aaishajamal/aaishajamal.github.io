// Function to calculate D1
function calculateD1() {
    const d0 = parseFloat(document.getElementById('d0').value);
    const growthRateD1 = parseFloat(document.getElementById('growth-rate-d1').value) / 100;

    const d1 = d0 * (1 + growthRateD1);

    document.getElementById('d1-result').textContent = d1.toFixed(2);
}

// Function to calculate stock price using Gordon Growth Model
function calculateGordonGrowth() {
    const d1Gordon = parseFloat(document.getElementById('d1-gordon').value);
    const keGordon = parseFloat(document.getElementById('ke-gordon').value) / 100;
    const growthRateGordon = parseFloat(document.getElementById('growth-rate-gordon').value) / 100;

    const stockPrice = d1Gordon / (keGordon - growthRateGordon);

    document.getElementById('gordon-result').textContent = stockPrice.toFixed(2);
}

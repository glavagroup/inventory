// Replace with your Google Sheets "Published to web" URL
// Make sure your Google Sheet is published as CSV or TSV
// File > Share > Publish to web > Link > Select the Sheet and format (e.g., Comma-separated values)
const GOOGLE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTy5i4lDWcfnBZmb35uSlgEn3H25iqcfAH_duuVy86SSDiQmjDj2bbUvPs8N9luDpUkDS_N2BrOFqxT/pub?output=csv'; 

async function fetchCarData() {
    try {
        const response = await fetch(GOOGLE_SHEET_URL);
        const data = await response.text();
        return parseCSV(data);
    } catch (error) {
        console.error("Error fetching car data:", error);
        return [];
    }
}

function parseCSV(csvText) {
    const lines = csvText.split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) return [];

    const headers = lines[0].split(',').map(header => header.trim());
    const cars = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(value => value.trim());
        const car = {};
        headers.forEach((header, index) => {
            car[header] = values[index];
        });
        cars.push(car);
    }
    return cars;
}

function createCarCard(car) {
    const card = document.createElement('div');
    card.classList.add('car-card');

    card.innerHTML = `
        <h2>${car.Make} ${car.Model} (${car.Year})</h2>
        <p><strong>Color:</strong> ${car.Color}</p>
        <p><strong>Price:</strong> $${car.Price}</p>
        <p><strong>Mileage:</strong> ${car.Mileage} miles</p>
        <p><strong>Description:</strong> ${car.Description || 'N/A'}</p>
    `;
    return card;
}

async function init() {
    const carContainer = document.getElementById('car-container');
    carContainer.innerHTML = '<p>Fetching car information...</p>'; // Show loading

    const cars = await fetchCarData();

    if (cars.length === 0) {
        carContainer.innerHTML = '<p>No car information found or an error occurred.</p>';
        return;
    }

    carContainer.innerHTML = ''; // Clear loading message

    cars.forEach(car => {
        const carCard = createCarCard(car);
        carContainer.appendChild(carCard);
    });
}

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);
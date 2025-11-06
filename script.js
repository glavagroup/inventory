document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURATION ---
    const googleSheetId = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTy5i4lDWcfnBZmb35uSlgEn3H25iqcfAH_duuVy86SSDiQmjDj2bbUvPs8N9luDpUkDS_N2BrOFqxT/pub?output=csv'; // <--- PASTE YOUR GOOGLE SHEET ID HERE
    const sheetName = 'Sheet1'; // <--- ENSURE THIS MATCHES YOUR SHEET TAB NAME EXACTLY (case-sensitive)
    
    // Construct the Google Visualization API URL for JSON output
    // This endpoint requires the sheet to be "Published to the web" and/or "Shared with anyone with the link"
    const googleSheetUrl = `https://docs.google.com/spreadsheets/d/${googleSheetId}/gviz/tq?tqx=out:json&sheet=${sheetName}`;

    // --- DOM ELEMENTS ---
    const carCardsContainer = document.getElementById('car-cards-container');
    const carModal = document.getElementById('car-modal');
    const imageModal = document.getElementById('image-modal');
    const fullImage = document.getElementById('full-image');
    const closeButtons = document.querySelectorAll('.close-button, .image-close-button');

    // --- FETCH CAR DATA ---
    async function fetchCarData() {
        console.log('Attempting to fetch data from:', googleSheetUrl);
        try {
            const response = await fetch(googleSheetUrl);
            
            // Check for HTTP errors (e.g., 404, 403, 500)
            if (!response.ok) {
                console.error(`HTTP error! status: ${response.status}`);
                throw new Error(`Failed to fetch data: HTTP status ${response.status}`);
            }

            const text = await response.text();
            console.log('Raw response text:', text.substring(0, 500) + '...'); // Log first 500 chars

            // The Google Sheet API returns JSON wrapped in a function call: "google.visualization.Query.setResponse(...)"
            // We need to extract the raw JSON string.
            const jsonString = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
            const data = JSON.parse(jsonString);
            console.log('Parsed JSON data:', data);

            // Extract column headers and rows
            const columns = data.table.cols.map(col => col.label);
            const rows = data.table.rows;
            console.log('Columns:', columns);
            console.log('Rows:', rows);

            const cars = rows.map(row => {
                const car = {};
                // Iterate through cells and map to column headers
                row.c.forEach((cell, index) => {
                    const columnName = columns[index].toLowerCase().trim(); // Ensure lowercase and no extra spaces
                    if (cell && cell.v !== undefined) {
                        car[columnName] = String(cell.v).trim(); // Store as string and trim whitespace
                    } else {
                        car[columnName] = ''; // Ensure all keys exist, even if value is empty
                    }
                });
                return car;
            }).filter(car => car.make && car.model); // Only include cars with at least a make and model

            console.log('Processed car objects:', cars);
            displayCarCards(cars);

            if (cars.length === 0) {
                carCardsContainer.innerHTML = '<p>No car data found or all rows are empty after processing. Please check your sheet data.</p>';
            }

        } catch (error) {
            console.error('Error fetching or parsing car data:', error);
            carCardsContainer.innerHTML = `<p>Failed to load car data. Please check your Google Sheet ID, sharing settings, and console for errors.</p><p>Error: ${error.message}</p>`;
        }
    }

    // --- DISPLAY CAR CARDS ---
    function displayCarCards(cars) {
        carCardsContainer.innerHTML = ''; // Clear previous cards
        cars.forEach(car => {
            const card = document.createElement('div');
            card.classList.add('car-card');
            
            // Use 'image' column for the cover photo. Fallback to placeholder if not available.
            const coverPhotoUrl = car.image && car.image.split(';')[0].trim() 
                                ? car.image.split(';')[0].trim() 
                                : 'https://via.placeholder.com/300x200?text=No+Image';

            card.innerHTML = `
                <img src="${coverPhotoUrl}" alt="${car.make || ''} ${car.model || 'Car'}" class="car-card-image" loading="lazy">
                <div class="car-card-info">
                    <h3>${car.make || ''} ${car.model || ''}</h3>
                    <p>Year: ${car.year || 'N/A'}</p>
                    <p>Price: ${car.price ? `$${car.price}` : 'N/A'}</p>
                </div>
            `;
            card.addEventListener('click', () => openCarModal(car));
            carCardsContainer.appendChild(card);
        });
    }

    // --- OPEN CAR DETAILS MODAL ---
    function openCarModal(car) {
        document.getElementById('modal-car-title').textContent = `${car.make || ''} ${car.model || ''}`;
        
        const detailsContainer = document.getElementById('modal-car-details');
        detailsContainer.innerHTML = `
            <p><strong>Price:</strong> ${car.price ? `$${car.price}` : 'N/A'}</p>
            <p><strong>Transmission:</strong> ${car.transmission || 'N/A'}</p>
            <p><strong>Fuel Type:</strong> ${car['fuel type'] || 'N/A'}</p>
            <p><strong>Year
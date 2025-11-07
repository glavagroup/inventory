document.addEventListener('DOMContentLoaded', () => {
    // === CONFIGURATION ===
    // IMPORTANT: Replace this with your actual Google Sheet CSV URL.
    // Ensure your Google Sheet is published to web as CSV:
    // File > Share > Publish to web > Select sheet > Choose 'Comma-separated values (.csv)'
    // Copy the entire URL provided. It will typically look like:
    // https://docs.google.com/spreadsheets/d/e/2PACX-1vSOVAB4idBjItPEOwxQvOGM4dAaYeWBuY49qlllo9bo-YW11K2e9wHLo3Ul8RKwiswKanQ29XbSMbZ8/pub?gid=0&single=true&output=csv
    const CAR_DATA_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSOVAB4idBjItPEOwxQvOGM4dAaYeWBuY49qlllo9bo-YW11K2e9wHLo3Ul8RKwiswKanQ29XbSMbZ8/pub?gid=0&single=true&output=csv';

    // === DOM ELEMENT REFERENCES ===
    const carCardsContainer = document.getElementById('car-cards-container');
    const loadingMessage = document.getElementById('loading-message');
    const carModal = document.getElementById('car-modal');
    const imageModal = document.getElementById('image-modal');
    const fullImage = document.getElementById('full-image');
    
    // Select all close buttons for both modals
    const closeButtons = document.querySelectorAll('.car-modal-close, .image-modal-close');

    // Car Detail Modal Elements
    const modalMakeModel = document.getElementById('modal-make-model');
    const modalYear = document.getElementById('modal-year');
    const modalPrice = document.getElementById('modal-price');
    const modalTransmission = document.getElementById('modal-transmission');
    const modalFuelType = document.getElementById('modal-fuel-type');
    const modalMileage = document.getElementById('modal-mileage');
    const modalExteriorColor = document.getElementById('modal-exterior-color');
    const modalInterior = document.getElementById('modal-interior');
    const modalDescription = document.getElementById('modal-description');
    const modalFeatures = document.getElementById('modal-features');
    const modalGallery = document.getElementById('modal-gallery');

    // === UTILITY FUNCTIONS ===

    // Parses CSV text into an array of car objects
    function parseCSV(csvText) {
        const lines = csvText.split('\n').filter(line => line.trim() !== ''); // Filter out empty lines
        
        if (lines.length === 0) {
            console.warn("CSV data is empty after filtering.");
            return [];
        }

        const headers = lines[0].split(',').map(header => header.trim().toLowerCase().replace(/\s/g, '')); // Clean headers
        const cars = [];

        for (let i = 1; i < lines.length; i++) {
            const currentLine = lines[i].split(',');
            if (currentLine.length === headers.length) {
                const car = {};
                headers.forEach((header, index) => {
                    car[header] = currentLine[index] ? currentLine[index].trim() : '';
                });
                cars.push(car);
            } else {
                console.warn(`Skipping malformed CSV line: "${lines[i]}". Expected ${headers.length} columns, got ${currentLine.length}.`);
            }
        }
        return cars;
    }

    // Fetches car data from the specified URL
    async function fetchCarData() {
        if (!carCardsContainer || !loadingMessage) {
            console.error("Critical DOM elements are missing. Cannot fetch or display data.");
            return;
        }

        loadingMessage.textContent = 'Loading cars...'; // Reset loading message
        loadingMessage.style.display = 'block';

        try {
            const response = await fetch(CAR_DATA_URL);
            if (!response.ok) {
                // If response is not OK, try to read error message or throw generic error
                const errorText = await response.text();
                throw new Error(`HTTP error! Status: ${response.status}. Message: ${errorText.substring(0, 100)}...`);
            }
            const csvText = await response.text();
            
            const cars = parseCSV(csvText);
            console.log("Parsed car data:", cars); // For debugging
            displayCarCards(cars);

        } catch (error) {
            console.error('Error fetching or parsing car data:', error);
            loadingMessage.textContent = `Failed to load car data. Please check the URL and sharing settings of your Google Sheet. Error: ${error.message}`;
            loadingMessage.style.color = 'red'; // Highlight error message
            carCardsContainer.innerHTML = ''; // Clear any previous content
        } finally {
            // If data loaded successfully, loading message might be hidden by displayCarCards.
            // If it failed, we want it to remain visible with the error.
            if (loadingMessage.textContent === 'Loading cars...') {
                loadingMessage.style.display = 'none'; // Hide if successfully loaded and no error text was set
            }
        }
    }

    // Displays car cards on the page
    function displayCarCards(cars) {
        if (!carCardsContainer) return; // Safeguard

        if (!Array.isArray(cars) || cars.length === 0) {
            carCardsContainer.innerHTML = '<p>No cars found. Check your CSV data.</p>';
            if (loadingMessage) loadingMessage.style.display = 'none'; // Hide if no cars
            return;
        }

        carCardsContainer.innerHTML = ''; // Clear previous content
        cars.forEach(car => {
            const carCard = document.createElement('div');
            carCard.classList.add('car-card');

            // Use the first image from the 'image' field, or a placeholder
            const imageUrl = (car.image && car.image.startsWith('http')) 
                             ? car.image.split(';')[0].trim() 
                             : 'https://via.placeholder.com/300x200?text=No+Image';

            carCard.innerHTML = `
                <img src="${imageUrl}" alt="${car.make || 'Unknown'} ${car.model || 'Car'}" class="car-card-image">
                <div class="car-card-info">
                    <h3>${car.make || 'Unknown'} ${car.model || ''}</h3>
                    <p>Year: ${car.year || 'N/A'}</p>
                    <p class="price">${car.price ? `$${car.price}` : 'N/A'}</p>
                </div>
            `;
            carCard.addEventListener('click', () => openCarModal(car));
            carCardsContainer.appendChild(carCard);
        });
        if (loadingMessage) loadingMessage.style.display = 'none'; // Hide loading after cards are displayed
    }

    // Opens the detailed car modal
    function openCarModal(car) {
        if (!carModal) { console.error("Car modal element not found."); return; }

        // Populate modal with car data
        modalMakeModel.textContent = `${car.make || ''} ${car.model || ''}`;
        modalYear.textContent = car.year || 'N/A';
        modalPrice.textContent = car.price ? `$${car.price}` : 'N/A';
        modalTransmission.textContent = car.transmission || 'N/A';
        modalFuelType.textContent = car.fueltype || 'N/A';
        modalMileage.textContent = car.mileage || 'N/A';
        modalExteriorColor.textContent = car.exteriorcolor || 'N/A';
        modalInterior.textContent = car.interior || 'N/A';
        modalDescription.textContent = car.description || 'No description available.';
        modalFeatures.textContent = car.features || 'No features listed.';

        // Clear and populate image gallery
        if (modalGallery) {
            modalGallery.innerHTML = '';
            let allGalleryImages = [];

            // Add the main image if it exists and is a valid URL
            if (car.image && car.image.startsWith('http')) {
                allGalleryImages.push(car.image.split(';')[0].trim());
            }

            // Add additional gallery images
            if (car.gallery) {
                const splitGallery = car.gallery.split(';').map(url => url.trim()).filter(url => url.startsWith('http'));
                allGalleryImages = [...new Set([...allGalleryImages, ...splitGallery])]; // Ensure unique URLs
            }
            
            if (allGalleryImages.length > 0) {
                allGalleryImages.forEach(imageUrl => {
                    const img = document.createElement('img');
                    img.src = imageUrl;
                    img.alt = `Gallery image for ${car.make || ''} ${car.model || ''}`;
                    img.addEventListener('click', (e) => {
                        e.stopPropagation(); // Prevent car modal from closing
                        openImageModal(imageUrl);
                    });
                    modalGallery.appendChild(img);
                });
            } else {
                modalGallery.innerHTML = '<p>No additional gallery images available.</p>';
            }
        }

        carModal.style.display = 'block'; // Show the car detail modal
    }

    // Opens the full-screen image modal
    function openImageModal(imageUrl) {
        if (!imageModal || !fullImage) { console.error("Image modal elements not found."); return; }
        fullImage.src = imageUrl;
        imageModal.style.display = 'flex'; // Use flex to center the image
    }

    // === EVENT LISTENERS ===

    // Close modals using the 'x' buttons
    closeButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.stopPropagation(); // Stop event from bubbling up to the window click listener
            if (event.target.classList.contains('car-modal-close')) {
                carModal.style.display = 'none';
            } else if (event.target.classList.contains('image-modal-close')) {
                imageModal.style.display = 'none';
            }
        });
    });

    // Close modals when clicking outside their content
    window.addEventListener('click', (event) => {
        if (carModal && event.target === carModal) {
            carModal.style.display = 'non
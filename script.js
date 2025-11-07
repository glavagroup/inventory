document.addEventListener('DOMContentLoaded', () => {
    // Corrected Google Sheet CSV URL structure.
    // Make sure your Google Sheet is published to web as CSV:
    // File > Share > Publish to web > Select sheet > Choose 'Comma-separated values (.csv)'
    // Copy the entire URL provided. It will typically look like:
    // https://docs.google.com/spreadsheets/d/e/2PACX-1vSOVAB4idBjItPEOwxQvOGM4dAaYeWBuY49qlllo9bo-YW11K2e9wHLo3Ul8RKwiswKanQ29XbSMbZ8/pub?gid=0&single=true&output=csv
    const CAR_DATA_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSOVAB4idBjItPEOwxQvOGM4dAaYeWBuY49qlllo9bo-YW11K2e9wHLo3Ul8RKwiswKanQ29XbSMbZ8/pub?gid=0&single=true&output=csv';

    const carCardsContainer = document.getElementById('car-cards-container'); // Changed from carListContainer
    const loadingMessage = document.getElementById('loading-message'); // Assuming you want a loading message if implemented in HTML
    const carModal = document.getElementById('car-modal');
    const imageModal = document.getElementById('image-modal'); // Added for the full-screen image modal
    const fullImage = document.getElementById('full-image');   // Added for the full-screen image modal
    const closeButtons = document.querySelectorAll('.close-button, .image-close-button'); // Use all close buttons

    // Modal elements (referencing the IDs from index.html)
    const modalCarTitle = document.getElementById('modal-car-title'); // Changed to match index.html
    const modalCarDetails = document.getElementById('modal-car-details'); // Changed to match index.html
    const modalGallery = document.getElementById('modal-gallery');

    // Function to parse CSV data
    function parseCSV(csv) {
        const lines = csv.split('\n');
        const headers = lines[0].split(',').map(header => header.trim());
        const cars = [];

        for (let i = 1; i < lines.length; i++) {
            const currentLine = lines[i].split(',');
            if (currentLine.length === headers.length) { // Ensure line has correct number of columns
                const car = {};
                for (let j = 0; j < headers.length; j++) {
                    // Map headers to consistent lowercase keys for easy access
                    const key = headers[j].toLowerCase().replace(/\s/g, ''); // Remove spaces from keys too
                    car[key] = currentLine[j].trim();
                }
                cars.push(car);
            }
        }
        return cars;
    }

    async function fetchCarData() {
        try {
            const response = await fetch(CAR_DATA_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const csvText = await response.text(); // Fetch as plain text (CSV)
            
            // Assuming loadingMessage might be a separate element or just console output
            if (loadingMessage) loadingMessage.style.display = 'none'; 

            const cars = parseCSV(csvText); // Parse the CSV text
            console.log("Parsed car data:", cars); // Debugging
            displayCarCards(cars); // Changed to match original function name
        } catch (error) {
            console.error('Error fetching or parsing car data:', error);
            if (loadingMessage) loadingMessage.textContent = 'Failed to load car data. Please check the URL and sharing settings.';
            else carCardsContainer.innerHTML = '<p>Failed to load car data. Please check the URL and sharing settings.</p>';
        }
    }

    function displayCarCards(cars) { // Changed function name to match original
        if (!Array.isArray(cars) || cars.length === 0) {
            carCardsContainer.innerHTML = '<p>No cars found.</p>';
            return;
        }

        carCardsContainer.innerHTML = ''; // Clear existing content
        cars.forEach(car => {
            const carCard = document.createElement('div');
            carCard.classList.add('car-card');

            // Use 'image' (lowercase) from parsed CSV
            const imageUrl = car.image && car.image.startsWith('http') ? car.image : 'https://via.placeholder.com/300x200?text=No+Image';

            carCard.innerHTML = `
                <img src="${imageUrl}" alt="${car.make || ''} ${car.model || 'Car'}" class="car-card-image">
                <div class="car-card-info">
                    <h3>${car.make || ''} ${car.model || ''}</h3>
                    <p>Year: ${car.year || 'N/A'}</p>
                    <p>Price: ${car.price ? `$${car.price}` : 'N/A'}</p>
                </div>
            `;
            carCard.addEventListener('click', () => openCarModal(car));
            carCardsContainer.appendChild(carCard);
        });
    }

    function openCarModal(car) {
        modalCarTitle.textContent = `${car.make || ''} ${car.model || ''}`; // Use consistent lowercase keys

        // Build details content dynamically
        modalCarDetails.innerHTML = `
            <p><strong>Price:</strong> ${car.price ? `$${car.price}` : 'N/A'}</p>
            <p><strong>Transmission:</strong> ${car.transmission || 'N/A'}</p>
            <p><strong>Fuel Type:</strong> ${car.fueltype || 'N/A'}</p> <!-- key is 'fueltype' after removing space -->
            <p><strong>Year:</strong> ${car.year || 'N/A'}</p>
            <p><strong>Mileage:</strong> ${car.mileage || 'N/A'}</p>
            <p><strong>Exterior Color:</strong> ${car.exteriorcolor || 'N/A'}</p> <!-- key is 'exteriorcolor' -->
            <p><strong>Interior:</strong> ${car.interior || 'N/A'}</p>
            <p><strong>Features:</strong> ${car.features || 'N/A'}</p>
            <p><strong>Description:</strong> ${car.description || 'No description available.'}</p>
        `;

        // Clear previous gallery images
        modalGallery.innerHTML = '';

        // Combine cover image and gallery images
        let allGalleryImages = [];
        if (car.image) {
            allGalleryImages.push(car.image.split(';')[0].trim()); // Add the cover image
        }
        if (car.gallery) {
            const splitGallery = car.gallery.split(';').map(url => url.trim()).filter(url => url);
            allGalleryImages = [...new Set([...allGalleryImages, ...splitGallery])]; // Add unique gallery images
        }
        
        if (allGalleryImages.length > 0) {
            allGalleryImages.forEach(imageUrl => {
                const img = document.createElement('img');
                img.src = imageUrl;
                img.alt = `Gallery image for ${car.make || ''} ${car.model || ''}`;
                img.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent modal from closing if image is clicked
                    openImageModal(imageUrl);
                });
                modalGallery.appendChild(img);
            });
        } else {
            modalGallery.innerHTML = '<p>No additional gallery images.</p>';
        }

        carModal.style.display = 'block'; // Show the modal
    }

    // Open full-screen image modal
    function openImageModal(imageUrl) {
        fullImage.src = imageUrl;
        imageModal.style.display = 'block';
    }

    // Close modals
    closeButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            if (event.target.closest('#car-modal')) {
                carModal.style.display = 'none';
            } else if (event.target.closest('#image-modal')) {
                imageModal.style.display = 'none';
            }
        });
    });

    // Close modals when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === carModal) {
            carModal.style.display = 'none';
        }
        if (event.target === imageModal) {
            imageModal.style.display = 'none';
        }
    });

    // Initial data fetch
    fetchCarData();
});
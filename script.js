document.addEventListener('DOMContentLoaded', () => {
    const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTy5i4lDWcfnBZmb35uSlgEn3H25iqcfAH_duuVy86SSDiQmjDj2bbUvPs8N9luDpUkDS_N2BrOFqxT/pub?output=csv; // *** IMPORTANT: REPLACE THIS URL ***

    const carGallery = document.getElementById('car-gallery');
    const loadingMessage = document.getElementById('loading-message');
    const errorMessage = document.getElementById('error-message');

    const carModal = document.getElementById('car-modal');
    const closeButton = document.querySelector('.close-button');
    const modalMainImage = document.getElementById('modal-main-image');
    const modalThumbnails = document.getElementById('modal-thumbnails');
    const modalMakeModel = document.getElementById('modal-make-model');
    const modalYear = document.getElementById('modal-year');
    const modalPrice = document.getElementById('modal-price');
    const modalMileage = document.getElementById('modal-mileage');
    const modalTransmission = document.getElementById('modal-transmission');
    const modalFuelType = document.getElementById('modal-fuel-type');
    const modalExteriorColor = document.getElementById('modal-exterior-color');
    const modalFeatures = document.getElementById('modal-features');
    const modalInterior = document.getElementById('modal-interior');
    const modalDescription = document.getElementById('modal-description');

    const leftArrow = document.querySelector('.left-arrow');
    const rightArrow = document.querySelector('.right-arrow');

    let currentCarImages = [];
    let currentImageIndex = 0;

    // Function to fetch and parse CSV data
    async function fetchCarData() {
        loadingMessage.classList.remove('hidden');
        errorMessage.classList.add('hidden');
        carGallery.innerHTML = ''; // Clear existing content

        try {
            const response = await fetch(GOOGLE_SHEET_CSV_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const csvText = await response.text();
            return parseCSV(csvText);
        } catch (error) {
            console.error('Error fetching car data:', error);
            loadingMessage.classList.add('hidden');
            errorMessage.classList.remove('hidden');
            return []; // Return empty array on error
        }
    }

    // Function to parse CSV text into an array of objects
    function parseCSV(csv) {
        const lines = csv.split('\n');
        const headers = lines[0].split(',').map(header => header.trim()); // Trim headers

        const cars = [];
        for (let i = 1; i < lines.length; i++) {
            const currentLine = lines[i].trim(); // Trim the entire line
            if (currentLine === '') continue; // Skip empty lines

            // Use a regex to split by comma, but ignore commas inside double quotes
            const values = currentLine.match(/(?:[^,"']+|"[^"]*"|'[^']*')+/g).map(val => val.replace(/^"|"$/g, '').trim());

            if (values.length !== headers.length) {
                console.warn(`Skipping malformed row ${i}: ${currentLine}`);
                continue;
            }

            const car = {};
            headers.forEach((header, index) => {
                car[header] = values[index];
            });
            cars.push(car);
        }
        return cars;
    }

    // Function to create a car card
    function createCarCard(car) {
        const card = document.createElement('div');
        card.classList.add('car-card');
        card.dataset.carId = car.Make + '-' + car.Model + '-' + car.Year; // Simple unique ID for now

        // Get the first image from the gallery, or use a placeholder
        const galleryImages = car.Gallery ? car.Gallery.split(';').map(url => url.trim()).filter(url => url) : [];
        const previewImage = galleryImages[0] || car.Image || 'https://via.placeholder.com/400x200?text=No+Image';

        card.innerHTML = `
            <img src="${previewImage}" alt="${car.Make} ${car.Model}">
            <div class="card-info">
                <h3>${car.Make} ${car.Model}</h3>
                <p><strong>Year:</strong> ${car.Year}</p>
                <p class="price"><strong>Price:</strong> ${car.Price}</p>
                <p><strong>Mileage:</strong> ${car.Mileage}</p>
            </div>
        `;

        card.addEventListener('click', () => openCarModal(car));
        return card;
    }

    // Function to open the modal and populate with car details
    function openCarModal(car) {
        modalMakeModel.textContent = `${car.Make} ${car.Model}`;
        modalYear.textContent = car.Year;
        modalPrice.textContent = car.Price;
        modalMileage.textContent = car.Mileage;
        modalTransmission.textContent = car.Transmission;
        modalFuelType.textContent = car['Fuel type']; // Access with bracket notation for 'Fuel type'
        modalExteriorColor.textContent = car['Exterior Color']; // Access with bracket notation
        modalFeatures.textContent = car.Features || 'N/A';
        modalInterior.textContent = car.Interior || 'N/A';
        modalDescription.textContent = car.Description || 'No description available.';

        // Populate image gallery
        currentCarImages = car.Gallery ? car.Gallery.split(';').map(url => url.trim()).filter(url => url) : [];
        // Fallback to 'Image' column if gallery is empty
        if (currentCarImages.length === 0 && car.Image) {
            currentCarImages.push(car.Image.trim());
        }
        // Fallback to placeholder if no images at all
        if (currentCarImages.length === 0) {
            currentCarImages.push('https://via.placeholder.com/800x600?text=No+Images+Available');
        }

        currentImageIndex = 0;
        updateModalImage();
        populateThumbnails();

        carModal.style.display = 'block';
    }

    // Function to update the main image in the modal
    function updateModalImage() {
        modalMainImage.src = currentCarImages[currentImageIndex];
        modalMainImage.alt = `Image ${currentImageIndex + 1}`;

        // Update active thumbnail state
        const thumbnails = modalThumbnails.querySelectorAll('img');
        thumbnails.forEach((thumb, index) => {
            if (index === currentImageIndex) {
                thumb.classList.add('active-thumbnail');
            } else {
                thumb.classList.remove('active-thumbnail');
            }
        });

        // Show/hide navigation arrows based on image count
        if (currentCarImages.length > 1) {
            leftArrow.style.display = 'block';
            rightArrow.style.display = 'block';
        } else {
            leftArrow.style.display = 'none';
            rightArrow.style.display = 'none';
        }
    }

    // Function to populate thumbnails in the modal
    function populateThumbnails() {
        modalThumbnails.innerHTML = ''; // Clear previous thumbnails
        currentCarImages.forEach((imageUrl, index) => {
            const thumb = document.createElement('img');
            thumb.src = imageUrl;
            thumb.alt = `Thumbnail ${index + 1}`;
            thumb.addEventListener('click', () => {
                currentImageIndex = index;
                updateModalImage();
            });
            modalThumbnails.appendChild(thumb);
        });
        updateModalImage(); // Ensure the correct thumbnail is active initially
    }

    // Navigation arrow handlers
    leftArrow.addEventListener('click', () => {
        currentImageIndex = (currentImageIndex - 1 + currentCarImages.length) % currentCarImages.length;
        updateModalImage();
    });

    rightArrow.addEventListener('click', () => {
        currentImageIndex = (currentImageIndex + 1) % currentCarImages.length;
        updateModalImage();
    });

    // Function to close the modal
    function closeCarModal() {
        carModal.style.display = 'none';
    }

    // Event listeners for closing the modal
    closeButton.addEventListener('click', closeCarModal);
    window.addEventListener('click', (event) => {
        if (event.target === carModal) {
            closeCarModal();
        }
    });

    // Initial load of car data
    fetchCarData().then(cars => {
        loadingMessage.classList.add('hidden');
        if (cars.length > 0) {
            cars.forEach(car => {
                carGallery.appendChild(createCarCard(car));
            });
        } else {
            errorMessage.textContent = "No car data found.";
            errorMessage.classList.remove('hidden');
        }
    });
});
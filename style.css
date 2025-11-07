document.addEventListener('DOMContentLoaded', () => {
    const CAR_DATA_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSOVAB4idBjItPEOwxQvOGM4dAaYeWBuY49qlllo9bo-YW11K2e9wHLo3Ul8RKwiswKanQ29XbSMbZ8/pub?gid=0&single=true&output=csv; // *** IMPORTANT: Replace with your actual JSON URL ***
    const carListContainer = document.getElementById('car-list-container');
    const loadingMessage = document.getElementById('loading-message');
    const carModal = document.getElementById('car-modal');
    const closeModalButton = document.querySelector('.close-button');

    // Modal elements
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

    async function fetchCarData() {
        try {
            const response = await fetch(CAR_DATA_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log("Fetched data:", data); // Debugging
            loadingMessage.style.display = 'none'; // Hide loading message
            displayCars(data);
        } catch (error) {
            console.error('Error fetching car data:', error);
            loadingMessage.textContent = 'Failed to load car data. Please try again later.';
        }
    }

    function displayCars(cars) {
        if (!Array.isArray(cars) || cars.length === 0) {
            carListContainer.innerHTML = '<p>No cars found.</p>';
            return;
        }

        cars.forEach(car => {
            const carCard = document.createElement('div');
            carCard.classList.add('car-card');

            // Set a default image if none is provided or invalid
            const imageUrl = car.Image && car.Image.startsWith('http') ? car.Image : 'https://via.placeholder.com/300x200?text=No+Image';

            carCard.innerHTML = `
                <img src="${imageUrl}" alt="${car.Make} ${car.Model}">
                <div class="card-content">
                    <h2>${car.Make} ${car.Model}</h2>
                    <p><strong>Year:</strong> ${car.Year}</p>
                    <p><strong>Mileage:</strong> ${car.Mileage}</p>
                    <p class="price">${car.Price}</p>
                </div>
            `;
            carCard.addEventListener('click', () => openCarModal(car));
            carListContainer.appendChild(carCard);
        });
    }

    function openCarModal(car) {
        modalMakeModel.textContent = `${car.Make} ${car.Model}`;
        modalYear.textContent = car.Year;
        modalPrice.textContent = car.Price;
        modalTransmission.textContent = car.Transmission || 'N/A';
        modalFuelType.textContent = car['Fuel type'] || 'N/A'; // Access with bracket notation for 'Fuel type'
        modalMileage.textContent = car.Mileage;
        modalExteriorColor.textContent = car['Exterior Color'] || 'N/A';
        modalInterior.textContent = car.Interior || 'N/A';
        modalDescription.textContent = car.Description || 'No description available.';
        modalFeatures.textContent = car.Features || 'No features listed.';

        // Clear previous gallery images
        modalGallery.innerHTML = '';

        // Handle gallery images
        if (car.Gallery) {
            const galleryImages = car.Gallery.split(';').map(link => link.trim()).filter(link => link.startsWith('http'));
            if (galleryImages.length > 0) {
                galleryImages.forEach(imgLink => {
                    const img = document.createElement('img');
                    img.src = imgLink;
                    img.alt = `${car.Make} ${car.Model} gallery image`;
                    modalGallery.appendChild(img);
                });
            } else {
                modalGallery.innerHTML = '<p>No additional gallery images available.</p>';
            }
        } else {
            modalGallery.innerHTML = '<p>No additional gallery images available.</p>';
        }

        carModal.style.display = 'block'; // Show the modal
    }

    function closeCarModal() {
        carModal.style.display = 'none'; // Hide the modal
    }

    // Event listeners for closing the modal
    closeModalButton.addEventListener('click', closeCarModal);
    window.addEventListener('click', (event) => {
        if (event.target === carModal) {
            closeCarModal();
        }
    });

    // Initial data fetch
    fetchCarData();
});
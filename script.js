document.addEventListener('DOMContentLoaded', () => {
    const googleSheetId = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTy5i4lDWcfnBZmb35uSlgEn3H25iqcfAH_duuVy86SSDiQmjDj2bbUvPs8N9luDpUkDS_N2BrOFqxT/pub?output=csv'; // Replace with your Google Sheet ID
    const sheetName = 'Sheet1'; // Replace with your sheet name if different
    const range = 'A:Z'; // Ensure this range covers all your new columns

    const googleSheetUrl = `https://docs.google.com/spreadsheets/d/${googleSheetId}/gviz/tq?tqx=out:json&sheet=${sheetName}`;

    const carCardsContainer = document.getElementById('car-cards-container');
    const carModal = document.getElementById('car-modal');
    const imageModal = document.getElementById('image-modal');
    const fullImage = document.getElementById('full-image');
    const closeButtons = document.querySelectorAll('.close-button, .image-close-button');

    // Fetch data from Google Sheet
    async function fetchCarData() {
        try {
            const response = await fetch(googleSheetUrl);
            const text = await response.text();
            
            const jsonString = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
            const data = JSON.parse(jsonString);

            // Extract rows and column headers
            const columns = data.table.cols.map(col => col.label);
            const rows = data.table.rows;

            const cars = rows.map(row => {
                const car = {};
                row.c.forEach((cell, index) => {
                    // Use lowercase column names for consistent JavaScript property access
                    const columnName = columns[index].toLowerCase(); 
                    if (cell && cell.v !== undefined) {
                        car[columnName] = cell.v;
                    } else {
                        car[columnName] = ''; // Ensure all keys exist, even if empty
                    }
                });
                return car;
            });
            
            displayCarCards(cars);
        } catch (error) {
            console.error('Error fetching car data:', error);
            carCardsContainer.innerHTML = '<p>Failed to load car data. Please check your Google Sheet ID and sharing settings.</p>';
        }
    }

    // Display car cards
    function displayCarCards(cars) {
        carCardsContainer.innerHTML = ''; // Clear previous cards
        cars.forEach(car => {
            const card = document.createElement('div');
            card.classList.add('car-card');
            card.dataset.car = JSON.stringify(car); // Store full car data for modal

            // Use the 'image' column for the cover photo
            const coverPhotoUrl = car.image ? car.image.split(';')[0].trim() : 'https://via.placeholder.com/300x200?text=No+Image';

            card.innerHTML = `
                <img src="${coverPhotoUrl}" alt="${car.make || ''} ${car.model || 'Car'}" class="car-card-image">
                <div class="car-card-info">
                    <h3>${car.make || ''} ${car.model || ''}</h3>
                    <p>Year: ${car.year || 'N/A'}</p>
                    <p>Price: ${car.price ? `$${car.price}` : 'N/A'}</p>
                    <!-- Add more fields from your sheet if you want them on the card itself -->
                </div>
            `;
            card.addEventListener('click', () => openCarModal(car));
            carCardsContainer.appendChild(card);
        });
    }

    // Open car details modal
    function openCarModal(car) {
        document.getElementById('modal-car-title').textContent = `${car.make || ''} ${car.model || ''}`;
        
        const detailsContainer = document.getElementById('modal-car-details');
        detailsContainer.innerHTML = `
            <p><strong>Price:</strong> ${car.price ? `$${car.price}` : 'N/A'}</p>
            <p><strong>Transmission:</strong> ${car.transmission || 'N/A'}</p>
            <p><strong>Fuel Type:</strong> ${car['fuel type'] || 'N/A'}</p>
            <p><strong>Year:</strong> ${car.year || 'N/A'}</p>
            <p><strong>Mileage:</strong> ${car.mileage || 'N/A'}</p>
            <p><strong>Exterior Color:</strong> ${car['exterior color'] || 'N/A'}</p>
            <p><strong>Interior:</strong> ${car.interior || 'N/A'}</p>
            <p><strong>Features:</strong> ${car.features || 'N/A'}</p>
            <p><strong>Description:</strong> ${car.description || 'No description available.'}</p>
        `;

        const galleryContainer = document.getElementById('modal-gallery');
        galleryContainer.innerHTML = ''; // Clear previous gallery images

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
                galleryContainer.appendChild(img);
            });
        } else {
            galleryContainer.innerHTML = '<p>No additional gallery images.</p>';
        }

        carModal.style.display = 'block';
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

    fetchCarData();
});
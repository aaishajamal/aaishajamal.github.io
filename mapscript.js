mapboxgl.accessToken = 'pk.eyJ1IjoiY29vbGlvcyIsImEiOiJjbTJ2MHRwNDEwN21pMmpvb2phdm05eWpwIn0.utUH4JMHH4frxtNUX5Fc4A'; // Replace with your access token

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v10',
    center: [-82.5276, 27.9095], // Center of Westshore Boulevard
    zoom: 14
});

// Add intersections (placeholder coordinates; replace with actual ones)
const intersections = [
    { name: "Gandy Blvd", coordinates: [-82.5263, 27.8921] },
    { name: "El Prado Blvd", coordinates: [-82.5258, 27.8990] },
    { name: "Swann Ave", coordinates: [-82.5269, 27.9291] },
];

// Add markers for each intersection
intersections.forEach(intersection => {
    new mapboxgl.Marker()
        .setLngLat(intersection.coordinates)
        .setPopup(new mapboxgl.Popup().setText(intersection.name))
        .addTo(map);
});

// Traffic slider element
const trafficSlider = document.getElementById('trafficSlider');

// Function to adjust traffic signals
function adjustTrafficLights(density) {
    intersections.forEach(intersection => {
        const popupText = density > 70 ? 
            `${intersection.name}: High Traffic - Green for 30s` : 
            `${intersection.name}: Low Traffic - Green for 10s`;
        
        // Update popup text based on traffic density
        const marker = new mapboxgl.Marker()
            .setLngLat(intersection.coordinates)
            .setPopup(new mapboxgl.Popup().setText(popupText))
            .addTo(map);
    });
}

// Event listener for slider
trafficSlider.addEventListener('input', (e) => {
    const density = e.target.value;
    adjustTrafficLights(density);
});

function updateTrafficDensityColor(density) {
    const color = density > 70 ? 'red' : density > 40 ? 'yellow' : 'green';
    intersections.forEach(intersection => {
        const marker = new mapboxgl.Marker({ color: color })
            .setLngLat(intersection.coordinates)
            .setPopup(new mapboxgl.Popup().setText(intersection.name))
            .addTo(map);
    });
}

// Update color and signal timing when slider changes
trafficSlider.addEventListener('input', (e) => {
    const density = e.target.value;
    adjustTrafficLights(density);
    updateTrafficDensityColor(density);
});



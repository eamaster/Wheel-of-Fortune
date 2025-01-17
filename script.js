let spinSound;
try {
    spinSound = new Audio("data:audio/mpeg;base64,[paste_sound_code_here]");
} catch (error) {
    console.error("Error initializing spin sound:", error);
}

const theWheel = new Winwheel({
    'canvasId': 'canvas',
    'numSegments': 6,
    'segments': [
        { 'fillStyle': '#eae56f', 'text': '10% Off' },
        { 'fillStyle': '#89f26e', 'text': 'Free Shipping' },
        { 'fillStyle': '#7de6ef', 'text': '20% Off' },
        { 'fillStyle': '#e7706f', 'text': 'Free Item' },
        { 'fillStyle': '#eae56f', 'text': '5% Off' },
        { 'fillStyle': '#89f26e', 'text': 'No Prize' }
    ],
    'animation': {
        'type': 'spinToStop',
        'duration': 5,
        'spins': 8,
        'callbackFinished': displayResult,
        'callbackSound': playSound
    }
});

function playSound() {
    if (spinSound) {
        spinSound.play().catch((error) => {
            console.warn("Audio playback failed:", error);
        });
    }
}

async function displayResult(indicatedSegment) {
    if (spinSound) {
        spinSound.pause();
        spinSound.currentTime = 0;
    }

    const prize = indicatedSegment.text;
    const name = localStorage.getItem('customerName');
    const phone = localStorage.getItem('customerPhone');
    const vehicle = localStorage.getItem('customerVehicle');
    const timestamp = new Date().toLocaleString();

    console.log("Prize Data:", { name, phone, vehicle, prize, timestamp });

    // Display prize
    document.getElementById('prizeText').textContent = `${name}, you won: ${prize}!`;
    document.getElementById('modalOverlay').style.display = 'block';
    document.getElementById('prizeModal').style.display = 'block';

    // Send data to backend (Google Sheets Web App)
    try {
        const response = await fetch("https://script.google.com/macros/s/AKfycbwqv6JVdsW5ru0rV3dJwDgELHnh1Iby0nF5pPx_A_teZuf8CN0u-5xWzb0icpIeHdIroQ/exec", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, phone, vehicle, prize, timestamp }),
        });

        const result = await response.json();
        if (result.status === "success") {
            console.log("Data saved successfully:", result.message);
        } else {
            console.error("Error saving data:", result.message);
        }
    } catch (error) {
        console.error("Error during submission:", error);
    }
}

document.getElementById('customerForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const vehicle = document.getElementById('vehicle').value;

    if (name && phone && vehicle) {
        // Save user data in localStorage
        localStorage.setItem('customerName', name);
        localStorage.setItem('customerPhone', phone);
        localStorage.setItem('customerVehicle', vehicle);
        localStorage.setItem('hasSpun', 'false');

        // Show the wheel section
        document.getElementById('form-section').style.display = 'none';
        document.getElementById('wheel-section').style.display = 'block';
    }
});

document.querySelector('.pointer').addEventListener('click', function () {
    if (localStorage.getItem('hasSpun') === 'true') {
        document.getElementById('modalOverlay').style.display = 'block';
        document.getElementById('limitationModal').style.display = 'block';
        return;
    }

    localStorage.setItem('hasSpun', 'true');
    theWheel.startAnimation();
});

document.getElementById('closePrizeModal').addEventListener('click', function () {
    document.getElementById('modalOverlay').style.display = 'none';
    document.getElementById('prizeModal').style.display = 'none';
});

document.getElementById('closeLimitationModal').addEventListener('click', function () {
    document.getElementById('modalOverlay').style.display = 'none';
    document.getElementById('limitationModal').style.display = 'none';
});

// Replace this with your Google Apps Script Web App URL
const googleScriptURL = "https://script.google.com/macros/s/AKfycbxNc9HSwj9lFTddD2zGmbcawufZyDa5eTf1tKiMJXO5XZhLP1W2BsEt0e8yhEhxZ0cA/exec";

let spinSound;

try {
    spinSound = new Audio("data:audio/mpeg;base64,[paste_sound_code_here]");
} catch (error) {
    console.error("Error initializing spin sound:", error);
}

const theWheel = new Winwheel({
    canvasId: 'canvas',
    numSegments: 6,
    segments: [
        { fillStyle: '#eae56f', text: '10% Off' },
        { fillStyle: '#89f26e', text: 'Free Shipping' },
        { fillStyle: '#7de6ef', text: '20% Off' },
        { fillStyle: '#e7706f', text: 'Free Item' },
        { fillStyle: '#eae56f', text: '5% Off' },
        { fillStyle: '#89f26e', text: 'No Prize' }
    ],
    animation: {
        type: 'spinToStop',
        duration: 5,
        spins: 8,
        callbackFinished: displayResult,
        callbackSound: playSound
    }
});

function playSound() {
    if (spinSound) {
        spinSound.play().catch((error) => {
            console.warn("Audio playback failed:", error);
        });
    }
}

function displayResult(indicatedSegment) {
    if (spinSound) {
        spinSound.pause();
        spinSound.currentTime = 0;
    }

    const prize = indicatedSegment.text;
    const name = localStorage.getItem('customerName') || "Unknown";

    document.getElementById('prizeText').textContent = `${name}, you won: ${prize}!`;
    document.getElementById('modalOverlay').style.display = 'block';
    document.getElementById('prizeModal').style.display = 'block';

    // Save the result to Google Sheets
    saveResultToSheet(name, prize);
}

function saveResultToSheet(name, prize) {
    const data = {
        name: name,
        prize: prize,
        date: new Date().toLocaleString()
    };

    fetch(googleScriptURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(response => response.json()) // Parse JSON response
    .then(result => {
        if (result.status === 'success') {
            console.log("Result saved successfully to Google Sheets.");
        } else {
            console.error("Error from server:", result.message || "Unknown error.");
        }
    })
    .catch(error => {
        console.error("Error saving result to Google Sheets:", error);
    });
}

document.getElementById('customerForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const vehicle = document.getElementById('vehicle').value;

    if (name && phone && vehicle) {
        // Save user details to Google Sheets
        const userData = { name, phone, vehicle };

        fetch(googleScriptURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        })
        .then(response => response.json())
        .then(result => {
            if (result.status === 'success') {
                alert("Your details have been saved. You can now spin the wheel!");
                localStorage.setItem('customerName', name);
                localStorage.setItem('hasSpun', 'false');
                document.getElementById('form-section').style.display = 'none';
                document.getElementById('wheel-section').style.display = 'block';
            } else {
                throw new Error(result.message || "Failed to save your details.");
            }
        })
        .catch(error => {
            console.error("Error saving data:", error);
            alert("There was an error saving your details. Please try again later.");
        });
    } else {
        alert("Please fill out all fields before submitting.");
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

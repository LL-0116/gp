// ==========================================
// 1. 获取 DOM 元素
// ==========================================
const preTestScreen = document.getElementById('pre-test-screen');
const videoContainer = document.getElementById('video-container');
const videoPlayer = document.getElementById('bg-video');
const interactionLayer = document.getElementById('interaction-layer');

const hotspotsScene1 = document.getElementById('hotspots-scene1');
const hotspotsScene2L2 = document.getElementById('hotspots-scene2-l2');
const hotspotsScene5 = document.getElementById('hotspots-scene5-sos');
const btnCallStaff = document.getElementById('btn-call-staff');
const btnSosIcon = document.getElementById('btn-sos-icon');

// 全局状态：初始设为第一段引导
let currentStep = 'scene1-intro';

// ==========================================
// 2. 核心辅助函数
// ==========================================

function triggerHaptic() {
    document.body.classList.remove('trigger-shake');
    void document.body.offsetWidth; 
    document.body.classList.add('trigger-shake');
}

// 优化后的视频播放函数：强制 load 并安全处理浏览器播放契约
function playVideo(fileName, stepName) {
    currentStep = stepName;
    videoPlayer.src = `assets/${fileName}`;
    videoPlayer.load();
    let playPromise = videoPlayer.play();
    if (playPromise !== undefined) {
        playPromise.catch(error => {
            console.log("Auto-play blocked or interrupted:", error);
        });
    }
}

// ==========================================
// 3. 自动化调度中心：监听视频播放结束事件
// ==========================================
videoPlayer.addEventListener('ended', () => {
    
    if (currentStep === 'scene2-l1-walking') {
        playVideo('scene2-l1-elevator.mp4', 'scene3-elevator-l1');
    }
    else if (currentStep === 'scene2-l2-walking') {
        playVideo('scene2-l2-elevator.mp4', 'scene3-elevator-l2');
    }
    else if (currentStep === 'scene3-elevator-l1' || currentStep === 'scene3-elevator-l2') {
        playVideo('scene3-arrive-level4.mp4', 'scene3-arrived');
        setTimeout(() => {
            triggerErrorState();
        }, 3000);
    }
    else if (currentStep === 'scene4-error-uturn') {
        playVideo('scene5-crossroad.mp4', 'scene5-hesitation');
        setTimeout(() => {
            activateSosHotspot();
        }, 6000);
    }
    else if (currentStep === 'scene5-staff-arrive') {
        enterWaitingArea();
    }
});

// ==========================================
// 4. 用户交互触发逻辑
// ==========================================

function startTest() {
    preTestScreen.classList.add('hidden');
    interactionLayer.classList.remove('hidden');
    
    // 点击开始时，重置并从头播放第一个视频
    videoPlayer.currentTime = 0;
    let playPromise = videoPlayer.play();
    if (playPromise !== undefined) {
        playPromise.catch(error => { console.log(error); });
    }
    hotspotsScene1.classList.remove('hidden');
}

function chooseRoute(route) {
    triggerHaptic();
    hotspotsScene1.classList.add('hidden'); 

    if (route === 'l1') {
        playVideo('scene2-l1-walking.mp4', 'scene2-l1-walking');
    } 
    else if (route === 'l2') {
        playVideo('scene2-l2-warning.mp4', 'scene2-l2-warning');
        hotspotsScene2L2.classList.remove('hidden'); 
    }
}

function dismissL2Modal() {
    triggerHaptic();
    hotspotsScene2L2.classList.add('hidden');
    playVideo('scene2-l2-walking.mp4', 'scene2-l2-walking'); 
}

function triggerErrorState() {
    triggerHaptic(); 
    videoContainer.classList.add('blue-glow'); 
    playVideo('scene4-error-uturn.mp4', 'scene4-error-uturn');

    setTimeout(() => {
        videoContainer.classList.remove('blue-glow');
    }, 4000);
}

function activateSosHotspot() {
    hotspotsScene5.classList.remove('hidden');
    btnCallStaff.classList.add('hidden'); 
    btnSosIcon.classList.remove('hidden');
}

function showHelpCard() {
    triggerHaptic();
    btnSosIcon.classList.add('hidden'); 
    playVideo('scene5-sos-card.mp4', 'scene5-sos-card');
    btnCallStaff.classList.remove('hidden'); 
}

function callGreenVest() {
    triggerHaptic();
    hotspotsScene5.classList.add('hidden'); 
    playVideo('scene5-staff-arrive.mp4', 'scene5-staff-arrive');
}

function enterWaitingArea() {
    playVideo('scene6-waiting-dashboard.mp4', 'scene6-waiting');
    videoPlayer.loop = true; 
}
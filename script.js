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

// 全局状态：记录当前正在播放的视频片段[cite: 1]
let currentStep = 'idle';

// ==========================================
// 2. 核心辅助函数
// ==========================================

// 封装“视觉触觉”震动反馈 (通过强制重绘保证动画可重复触发)[cite: 1]
function triggerHaptic() {
    document.body.classList.remove('trigger-shake');
    void document.body.offsetWidth; // 触发回流(Reflow)[cite: 1]
    document.body.classList.add('trigger-shake');
}

// 封装播放视频与状态更新[cite: 1]
function playVideo(fileName, stepName) {
    videoPlayer.src = `assets/${fileName}`;
    videoPlayer.play();
    currentStep = stepName;
}

// ==========================================
// 3. 自动化调度中心：监听视频播放结束事件[cite: 1]
// ==========================================
videoPlayer.addEventListener('ended', () => {
    
    // [Scene 2 -> Scene 3] L1 动线：走到导诊台后，自动播放左转进电梯[cite: 1]
    if (currentStep === 'scene2-l1-walking') {
        playVideo('scene2-l1-elevator.mp4', 'scene3-elevator-l1');
    }
    
    // [Scene 2 -> Scene 3] L2 动线：越过承重柱后，自动播放左转进电梯[cite: 1]
    else if (currentStep === 'scene2-l2-walking') {
        playVideo('scene2-l2-elevator.mp4', 'scene3-elevator-l2');
    }
    
    // [Scene 3 -> Scene 4] 出电梯到达 4 楼[cite: 1]
    else if (currentStep === 'scene3-elevator-l1' || currentStep === 'scene3-elevator-l2') {
        playVideo('scene3-arrive-level4.mp4', 'scene3-arrived');
        
        // 模拟受测者走出电梯后走错路，延迟 3 秒后自动触发纠错机制[cite: 1]
        setTimeout(() => {
            triggerErrorState();
        }, 3000);
    }
    
    // [Scene 4 -> Scene 5] U型掉头纠错结束，来到复杂交叉口[cite: 1]
    else if (currentStep === 'scene4-error-uturn') {
        playVideo('scene5-crossroad.mp4', 'scene5-hesitation');
        
        // 模拟受测者在交叉口犹豫 6 秒，自动触发兜底干预图标[cite: 1]
        setTimeout(() => {
            activateSosHotspot();
        }, 6000);
    }
    
    // [Scene 5 -> Scene 6] 绿马甲带路完毕，进入等待区[cite: 1]
    else if (currentStep === 'scene5-staff-arrive') {
        enterWaitingArea();
    }
});

// ==========================================
// 4. 用户交互触发逻辑 (对应点击热区)[cite: 1]
// ==========================================

// 【测试前置引导】：点击开始测试[cite: 1]
function startTest() {
    preTestScreen.classList.add('hidden');
    interactionLayer.classList.remove('hidden');
    
    playVideo('scene1-intro.mp4', 'scene1-intro');
    hotspotsScene1.classList.remove('hidden');
}

// 【Scene 1】：选择 L1 或 L2 起点[cite: 1]
function chooseRoute(route) {
    triggerHaptic();
    hotspotsScene1.classList.add('hidden'); // 隐藏起点选择热区[cite: 1]

    if (route === 'l1') {
        playVideo('scene2-l1-walking.mp4', 'scene2-l1-walking');
    } 
    else if (route === 'l2') {
        playVideo('scene2-l2-warning.mp4', 'scene2-l2-warning');
        hotspotsScene2L2.classList.remove('hidden'); // 激活全屏阻断点击区[cite: 1]
    }
}

// 【Scene 2】：L2 收起阻断弹窗[cite: 1]
function dismissL2Modal() {
    triggerHaptic();
    hotspotsScene2L2.classList.add('hidden');
    playVideo('scene2-l2-walking.mp4', 'scene2-l2-walking'); 
}

// 【Scene 4】：触发纯视觉柔化纠错 (由 4楼到达后的定时器自动调用)[cite: 1]
function triggerErrorState() {
    triggerHaptic(); 
    videoContainer.classList.add('blue-glow'); // 激活边缘淡蓝色光晕[cite: 1]
    
    playVideo('scene4-error-uturn.mp4', 'scene4-error-uturn');

    // 光晕持续闪烁 4 秒后自动关闭[cite: 1]
    setTimeout(() => {
        videoContainer.classList.remove('blue-glow');
    }, 4000);
}

// 【Scene 5】：激活右上角求助图标 (由交叉口犹豫定时器自动调用)[cite: 1]
function activateSosHotspot() {
    hotspotsScene5.classList.remove('hidden');
    btnCallStaff.classList.add('hidden'); 
    btnSosIcon.classList.remove('hidden');
}

// 【Scene 5】：受测者点击了右上角 🆘 图标[cite: 1]
function showHelpCard() {
    triggerHaptic();
    btnSosIcon.classList.add('hidden'); // 隐藏右上角求助热区
    playVideo('scene5-sos-card.mp4', 'scene5-sos-card');
    btnCallStaff.classList.remove('hidden'); // 显示底部的呼叫热区[cite: 1]
}

// 【Scene 5】：受测者点击了 [🔘 呼叫“绿马甲”工作人员][cite: 1]
function callGreenVest() {
    triggerHaptic();
    hotspotsScene5.classList.add('hidden'); // 隐藏所有求助交互组[cite: 1]
    playVideo('scene5-staff-arrive.mp4', 'scene5-staff-arrive');
}

// 【Scene 6】：常驻候诊模式[cite: 1]
function enterWaitingArea() {
    playVideo('scene6-waiting-dashboard.mp4', 'scene6-waiting');
    videoPlayer.loop = true; // 开启无限循环播放[cite: 1]
}
// 全局变量
let timerInterval = null;
let seconds = 0;
let isRunning = false;
let currentActivity = "";

// DOM元素
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');
const playPauseBtn = document.getElementById('play-pause-btn');
const playIcon = playPauseBtn.querySelector('.play-icon');
const pauseIcon = playPauseBtn.querySelector('.pause-icon');
const resetBtn = document.getElementById('reset-btn');
const activityInput = document.getElementById('activity-input');
const recordsList = document.getElementById('records-list');
const clearRecordsBtn = document.getElementById('clear-records');
const recordsBtn = document.getElementById('records-btn');
const backBtn = document.getElementById('back-btn');
const timerPage = document.getElementById('timer-page');
const recordsPage = document.getElementById('records-page');

// 浮窗元素
const floatingWindow = document.getElementById('floating-window');
const floatingMinutes = document.getElementById('floating-minutes');
const floatingSeconds = document.getElementById('floating-seconds');
const floatingActivity = document.getElementById('floating-activity');
const floatPlayPauseBtn = document.getElementById('float-play-pause');
const floatPlayIcon = floatPlayPauseBtn.querySelector('.play-icon');
const floatPauseIcon = floatPlayPauseBtn.querySelector('.pause-icon');
const toggleFloatBtn = document.getElementById('toggle-float');

// 初始化
function init() {
    // 加载保存的记录
    loadRecords();
    // 绑定事件
    bindEvents();
    // 更新浮窗显示
    updateFloatingDisplay();
    // 更新按钮状态
    updateButtonStates();
}

// 绑定事件
function bindEvents() {
    // 主界面按钮
    playPauseBtn.addEventListener('click', togglePlayPause);
    resetBtn.addEventListener('click', resetTimer);
    activityInput.addEventListener('input', updateActivity);
    clearRecordsBtn.addEventListener('click', clearRecords);
    recordsBtn.addEventListener('click', showRecordsPage);
    backBtn.addEventListener('click', showTimerPage);
    
    // 浮窗按钮
    floatPlayPauseBtn.addEventListener('click', togglePlayPause);
    toggleFloatBtn.addEventListener('click', toggleFloatingWindow);
}

// 更新活动
function updateActivity() {
    currentActivity = activityInput.value.trim();
    floatingActivity.textContent = currentActivity || "未设置活动";
}

// 更新状态文本
function updateStatusText() {
    const statusText = document.getElementById('status-text');
    if (isRunning) {
        statusText.textContent = 'RUNNING';
    } else if (seconds > 0) {
        statusText.textContent = 'PAUSED';
    } else {
        statusText.textContent = 'STANDBY';
    }
}

// 更新按钮状态
function updateButtonStates() {
    if (isRunning) {
        // 正在运行状态
        playPauseBtn.classList.add('paused');
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
        
        floatPlayPauseBtn.classList.add('paused');
        floatPlayIcon.style.display = 'none';
        floatPauseIcon.style.display = 'block';
    } else {
        // 暂停或 standby 状态
        playPauseBtn.classList.remove('paused');
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
        
        floatPlayPauseBtn.classList.remove('paused');
        floatPlayIcon.style.display = 'block';
        floatPauseIcon.style.display = 'none';
    }
}

// 切换播放/暂停
function togglePlayPause() {
    if (isRunning) {
        pauseTimer();
    } else {
        startTimer();
    }
}

// 开始计时器
function startTimer() {
    if (!isRunning) {
        isRunning = true;
        
        timerInterval = setInterval(() => {
            seconds++;
            updateDisplay();
            updateFloatingDisplay();
        }, 1000);
        
        updateStatusText();
        updateButtonStates();
    }
}

// 暂停计时器
function pauseTimer() {
    if (isRunning) {
        isRunning = false;
        clearInterval(timerInterval);
        
        // 保存记录
        saveRecord();
        
        updateStatusText();
        updateButtonStates();
    }
}

// 重置计时器
function resetTimer() {
    isRunning = false;
    clearInterval(timerInterval);
    seconds = 0;
    updateDisplay();
    updateFloatingDisplay();
    
    // 保存记录
    if (currentActivity) {
        saveRecord();
    }
    
    updateStatusText();
    updateButtonStates();
}

// 显示记录页面
function showRecordsPage() {
    timerPage.classList.remove('active');
    recordsPage.classList.add('active');
}

// 显示计时器页面
function showTimerPage() {
    recordsPage.classList.remove('active');
    timerPage.classList.add('active');
}

// 更新显示
function updateDisplay() {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    
    minutesEl.textContent = String(minutes).padStart(2, '0');
    secondsEl.textContent = String(secs).padStart(2, '0');
}

// 更新浮窗显示
function updateFloatingDisplay() {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    
    floatingMinutes.textContent = String(minutes).padStart(2, '0');
    floatingSeconds.textContent = String(secs).padStart(2, '0');
    floatingActivity.textContent = currentActivity || "未设置活动";
}

// 保存记录
function saveRecord() {
    if (seconds > 0) {
        const records = getRecords();
        const record = {
            id: Date.now(),
            activity: currentActivity || "未命名活动",
            duration: seconds,
            timestamp: new Date().toISOString()
        };
        records.push(record);
        localStorage.setItem('timer-records', JSON.stringify(records));
        renderRecords();
    }
}

// 获取记录
function getRecords() {
    const recordsJson = localStorage.getItem('timer-records');
    return recordsJson ? JSON.parse(recordsJson) : [];
}

// 加载记录
function loadRecords() {
    renderRecords();
}

// 渲染记录
function renderRecords() {
    const records = getRecords();
    recordsList.innerHTML = '';
    
    if (records.length === 0) {
        recordsList.innerHTML = '<p style="text-align: center; color: rgba(255, 255, 255, 0.6); font-size: 14px;">暂无记录</p>';
        return;
    }
    
    // 按时间倒序排列
    records.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    
    records.forEach(record => {
        const recordEl = document.createElement('div');
        recordEl.className = 'record-item';
        
        const date = new Date(record.timestamp);
        const timeStr = date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
        
        const hours = Math.floor(record.duration / 3600);
        const minutes = Math.floor((record.duration % 3600) / 60);
        const secs = record.duration % 60;
        
        let durationStr = '';
        if (hours > 0) {
            durationStr += `${hours}小时 `;
        }
        if (minutes > 0 || hours > 0) {
            durationStr += `${minutes}分钟 `;
        }
        durationStr += `${secs}秒`;
        
        recordEl.innerHTML = `
            <div class="record-time">${timeStr}</div>
            <div class="record-activity">${record.activity}</div>
            <div class="record-duration">持续时间: ${durationStr}</div>
        `;
        
        recordsList.appendChild(recordEl);
    });
}

// 清空记录
function clearRecords() {
    if (confirm('确定要清空所有记录吗？')) {
        localStorage.removeItem('timer-records');
        renderRecords();
    }
}

// 切换浮窗显示
function toggleFloatingWindow() {
    floatingWindow.classList.toggle('hidden');
    toggleFloatBtn.textContent = floatingWindow.classList.contains('hidden') ? '打开浮窗' : '关闭浮窗';
}

// 初始化应用
init();
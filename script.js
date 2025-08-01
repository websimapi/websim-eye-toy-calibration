class EyeToyCalibration {
    constructor() {
        this.webcam = document.getElementById('webcam');
        this.permissionPrompt = document.getElementById('permission-prompt');
        this.statusTitle = document.getElementById('status-title');
        this.statusMessage = document.getElementById('status-message');
        this.progressFill = document.getElementById('progress-fill');
        this.startBtn = document.getElementById('start-btn');
        this.continueBtn = document.getElementById('continue-btn');
        this.grantPermissionBtn = document.getElementById('grant-permission');
        
        this.calibrationProgress = 0;
        this.isCalibrating = false;
        this.stream = null;
        
        this.init();
    }
    
    init() {
        this.grantPermissionBtn.addEventListener('click', () => this.requestCameraAccess());
        this.startBtn.addEventListener('click', () => this.startCalibration());
        this.continueBtn.addEventListener('click', () => this.proceedToNextStep());
        
        // Auto-request camera access on load
        this.requestCameraAccess();
    }
    
    async requestCameraAccess() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                },
                audio: false
            });
            
            this.webcam.srcObject = this.stream;
            this.permissionPrompt.style.display = 'none';
            this.updateStatus('Camera Ready', 'Position yourself in the outlined area');
            
        } catch (error) {
            console.error('Camera access denied:', error);
            this.updateStatus('Camera Access Denied', 'Please allow camera access to continue');
        }
    }
    
    startCalibration() {
        if (!this.stream) {
            this.requestCameraAccess();
            return;
        }
        
        this.isCalibrating = true;
        this.startBtn.style.display = 'none';
        this.updateStatus('Calibrating...', 'Move around to help us detect your movements');
        
        this.runCalibrationSequence();
    }
    
    runCalibrationSequence() {
        const phases = [
            { message: 'Stand still in the center', duration: 2000 },
            { message: 'Raise your left arm', duration: 2000 },
            { message: 'Raise your right arm', duration: 2000 },
            { message: 'Wave both arms', duration: 3000 },
            { message: 'Step left and right', duration: 3000 },
            { message: 'Jump in place', duration: 2000 },
            { message: 'Calibration complete!', duration: 1000 }
        ];
        
        let currentPhase = 0;
        const totalDuration = phases.reduce((sum, phase) => sum + phase.duration, 0);
        let elapsed = 0;
        
        const runPhase = () => {
            if (currentPhase >= phases.length) {
                this.completeCalibration();
                return;
            }
            
            const phase = phases[currentPhase];
            this.statusMessage.textContent = phase.message;
            
            const phaseStart = Date.now();
            const updateProgress = () => {
                const phaseElapsed = Date.now() - phaseStart;
                const phaseProgress = Math.min(phaseElapsed / phase.duration, 1);
                const totalProgress = ((elapsed + phaseElapsed) / totalDuration) * 100;
                
                this.progressFill.style.width = `${totalProgress}%`;
                
                if (phaseProgress < 1) {
                    requestAnimationFrame(updateProgress);
                } else {
                    elapsed += phase.duration;
                    currentPhase++;
                    setTimeout(runPhase, 100);
                }
            };
            
            updateProgress();
        };
        
        runPhase();
    }
    
    completeCalibration() {
        this.isCalibrating = false;
        this.updateStatus('Calibration Complete!', 'Your Eye Toy is ready for gaming');
        this.progressFill.style.width = '100%';
        this.continueBtn.style.display = 'inline-block';
        
        // Add success animation
        document.querySelector('.silhouette').style.animation = 'none';
        document.querySelector('.silhouette').style.opacity = '1';
        document.querySelector('.silhouette').style.filter = 'drop-shadow(0 0 20px #00ff88)';
    }
    
    updateStatus(title, message) {
        this.statusTitle.textContent = title;
        this.statusMessage.textContent = message;
    }
    
    proceedToNextStep() {
        // This will be implemented in the next phase
        alert('Ready to proceed to the next step! (To be implemented)');
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new EyeToyCalibration();
});

// Handle page visibility changes to manage camera stream
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause video when tab is not visible
        const webcam = document.getElementById('webcam');
        if (webcam && webcam.srcObject) {
            webcam.pause();
        }
    } else {
        // Resume video when tab becomes visible
        const webcam = document.getElementById('webcam');
        if (webcam && webcam.srcObject) {
            webcam.play();
        }
    }
});


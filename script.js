import { Pose, POSE_CONNECTIONS } from '@mediapipe/pose';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { Camera } from '@mediapipe/camera_utils';

class BodyTracker {
    constructor() {
        this.videoElement = document.getElementById('webcam');
        this.canvasElement = document.getElementById('pose-canvas');
        this.canvasCtx = this.canvasElement.getContext('2d');
        this.permissionPrompt = document.getElementById('permission-prompt');
        this.grantPermissionBtn = document.getElementById('grant-permission');

        this.init();
    }

    init() {
        this.grantPermissionBtn.addEventListener('click', () => this.start());
    }

    start() {
        this.permissionPrompt.style.display = 'none';

        const pose = new Pose({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
        });

        pose.setOptions({
            modelComplexity: 1,
            smoothLandmarks: true,
            enableSegmentation: false,
            smoothSegmentation: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        pose.onResults((results) => this.onResults(results));

        const camera = new Camera(this.videoElement, {
            onFrame: async () => {
                this.canvasElement.width = this.videoElement.videoWidth;
                this.canvasElement.height = this.videoElement.videoHeight;
                await pose.send({ image: this.videoElement });
            },
            width: 1280,
            height: 720
        });

        camera.start().catch(err => {
            console.error("Failed to start camera:", err);
            this.permissionPrompt.style.display = 'flex';
        });
    }

    onResults(results) {
        this.canvasCtx.save();
        this.canvasCtx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);

        if (results.poseLandmarks) {
            drawConnectors(this.canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
                color: '#00FF00',
                lineWidth: 4
            });
            drawLandmarks(this.canvasCtx, results.poseLandmarks, {
                color: '#FF0000',
                radius: 6
            });
        }
        
        this.canvasCtx.restore();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new BodyTracker();
});


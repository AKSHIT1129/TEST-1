class MLSimulator {
    constructor() {
        this.totalScanned = 0;
        this.attacksDetected = 0;
        this.isAttackMode = false;
        this.packetSizeThreshold = 1500;
        this.freqThreshold = 50; 
        this.entropyThreshold = 0.8;
    }

    setAttackMode(status) {
        this.isAttackMode = status;
    }
    predict(packetData) {
        this.totalScanned++;
        
        let score = 0;
        if (packetData.size > this.packetSizeThreshold) score += 0.4;
        if (packetData.frequency > this.freqThreshold) score += 0.5;
        if (packetData.entropy > this.entropyThreshold) score += 0.3;
        if (this.isAttackMode && Math.random() > 0.3) {
            score += 0.6; 
        }

        const isMalicious = score > 0.6;
        if (isMalicious) this.attacksDetected++;
        
        return isMalicious ? 1 : 0;
    }

    getMetrics() {
        return {
            scanned: this.totalScanned,
            detected: this.attacksDetected,
            accuracy: (98.4 + (Math.random() * 0.5 - 0.25)).toFixed(2)
        };
    }
}

window.ML = new MLSimulator();

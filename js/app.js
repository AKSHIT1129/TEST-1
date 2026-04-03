document.addEventListener('DOMContentLoaded', () => {
    const btnNormal = document.getElementById('btn-normal');
    const btnAttack = document.getElementById('btn-attack');
    const btnReroute = document.getElementById('btn-reroute');
    
    const packetsCountEl = document.getElementById('packets-count');
    const threatLevelEl = document.getElementById('threat-level');
    const mlStatusBar = document.getElementById('ml-status-bar');
    const eventLog = document.getElementById('event-log');
    
    const currentPathEl = document.getElementById('current-path');
    const payloadStreamEl = document.getElementById('payload-stream');

    const pathfinder = new window.DAA.GraphPathfinder();
    const kmpDetector = new window.DAA.KMPDetector("MALWARE");

    let simulationInterval;
    let attackMode = false;
    let nodeCompromised = false;

    // Default Route Calculation
    let currentRoute = pathfinder.findShortestPath('SRC', 'DEST');
    currentPathEl.innerHTML = currentRoute.join(' &rarr; ');
    window.NetworkGraph.setRoute(currentRoute);

    function logEvent(msg, type="info") {
        const item = document.createElement('div');
        item.className = `log-item ${type}`;
        item.innerText = `[${new Date().toLocaleTimeString()}] ${msg}`;
        eventLog.prepend(item);
    }

    function updateMetrics() {
        const met = window.ML.getMetrics();
        packetsCountEl.innerText = met.scanned.toLocaleString();
        
        if (met.detected > 0) {
            threatLevelEl.innerText = 'CRITICAL';
            threatLevelEl.className = 'value text-red';
        } else {
            threatLevelEl.innerText = 'Low';
            threatLevelEl.className = 'value text-green';
        }
    }

    // Packet Generation Loop
    function triggerPacket() {
        // Generate random features for the packet
        const packetData = {
            size: attackMode ? 1600 : Math.random() * 1000 + 100,
            frequency: attackMode ? 100 : Math.random() * 20 + 5,
            entropy: attackMode ? 0.9 : Math.random() * 0.7
        };

        // ML Inference
        const isMalicious = window.ML.predict(packetData);
        window.NetworkGraph.spawnPacket(isMalicious);
        
        // DAA String Matching (KMP)
        let payload = generateRandomHex(64);
        if (attackMode && Math.random() > 0.7) {
            payload = payload.substring(0, 30) + "MALWARE" + payload.substring(37);
        }
        
        let matches = kmpDetector.search(payload);
        if (matches.length > 0) {
            logEvent("KMP MATCH: Malware signature detected in payload stream!", "danger");
            const hlPayload = payload.substring(0, matches[0]) + 
                `<span class="match">${payload.substring(matches[0], matches[0]+7)}</span>` + 
                payload.substring(matches[0]+7);
            payloadStreamEl.innerHTML = hlPayload;
        } else {
            payloadStreamEl.innerText = payload;
        }

        if (isMalicious) {
            mlStatusBar.className = 'ml-status alert';
            mlStatusBar.innerHTML = `<div class="status-indicator danger"></div><span>Threat Detected - Isolation Forest Triggered</span>`;
            if (Math.random() > 0.9) {
                logEvent(`ML ALERT: Malicious packet flagged from SRC. Score: High`, "danger");
            }
            btnReroute.disabled = false;
            
            // visually compromise a node
            if (!nodeCompromised) {
                nodeCompromised = true;
                pathfinder.setCompromised('R1');
                window.NetworkGraph.setNodeCompromised('R1', true);
                logEvent("CRITICAL: Node Router 1 Compromised by DDoS!", "danger");
            }
        }

        updateMetrics();
    }

    function generateRandomHex(length) {
        let result = '';
        const characters = '0123456789ABCDEF';
        for ( let i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }

    // Start network traffic simulation
    simulationInterval = setInterval(triggerPacket, 300);

    // Event Listeners
    btnNormal.addEventListener('click', () => {
        attackMode = false;
        window.ML.setAttackMode(false);
        btnNormal.className = 'btn btn-outline active';
        btnAttack.className = 'btn btn-danger';
        
        // Reset Visuals
        mlStatusBar.className = 'ml-status';
        mlStatusBar.innerHTML = `<div class="status-indicator safe"></div><span>System Secure - Traffic Normal</span>`;
        logEvent("System resumed normal traffic mode.");
    });

    btnAttack.addEventListener('click', () => {
        attackMode = true;
        window.ML.setAttackMode(true);
        btnAttack.className = 'btn btn-danger active';
        btnNormal.className = 'btn btn-outline';
        logEvent("WARNING: Simulated Attack Initiated on Network Topography.", "warning");
    });

    btnReroute.addEventListener('click', () => {
        logEvent("DAA ACTION: Calculating Dijkstra's Shortest Safe Path...", "info");
        
        setTimeout(() => {
            currentRoute = pathfinder.findShortestPath('SRC', 'DEST');
            const newRouteStr = currentRoute.join(' &rarr; ');
            currentPathEl.innerHTML = `<span class="rerouted">${newRouteStr}</span>`;
            window.NetworkGraph.setRoute(currentRoute);
            logEvent(`MITIGATED: Traffic successfully rerouted automatically: ${currentRoute.join(' -> ')}`, "success");
            btnReroute.disabled = true;
            
            // Stabilize system after mitigation
            attackMode = false;
            window.ML.setAttackMode(false);
            btnNormal.className = 'btn btn-outline active';
            btnAttack.className = 'btn btn-danger';
            mlStatusBar.className = 'ml-status';
            mlStatusBar.innerHTML = `<div class="status-indicator safe"></div><span>Threat Mitigated - Network Stabilized</span>`;
        }, 800);
    });
});

const canvas = document.getElementById('networkCanvas');
const ctx = canvas.getContext('2d');

let width, height;

// Nodes in the network
const nodes = [
    { id: 'SRC', label: 'Internet Gateway', x: 0.1, y: 0.5, type: 'source' },
    { id: 'R1', label: 'Router 1', x: 0.35, y: 0.3, type: 'router' },
    { id: 'R2', label: 'Router 2', x: 0.35, y: 0.7, type: 'router' },
    { id: 'R3', label: 'Core Switch', x: 0.65, y: 0.5, type: 'router' },
    { id: 'PC1', label: 'User PC', x: 0.5, y: 0.15, type: 'pc' },
    { id: 'DEST', label: 'Main Server (Target)', x: 0.9, y: 0.5, type: 'server' }
];

// Edges (connections)
const edges = [
    { from: 'SRC', to: 'R1' },
    { from: 'SRC', to: 'R2' },
    { from: 'R1', to: 'R3' },
    { from: 'R1', to: 'PC1' },
    { from: 'R2', to: 'R3' },
    { from: 'PC1', to: 'R3' },
    { from: 'R3', to: 'DEST' }
];

// Packets currently in transit
let packets = [];
let routePath = ['SRC', 'R1', 'R3', 'DEST']; // Default Route

function resize() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    width = canvas.width;
    height = canvas.height;
}

window.addEventListener('resize', resize);
resize();

function getNode(id) {
    return nodes.find(n => n.id === id);
}

// Spawn a new packet
function spawnPacket(isMalicious = false) {
    // Determine path based on current active route
    packets.push({
        path: [...routePath],
        currentPathIndex: 0,
        progress: 0,
        isMalicious: isMalicious,
        speed: 0.005 + (Math.random() * 0.003)
    });
}

function drawNetwork() {
    ctx.clearRect(0, 0, width, height);

    // Draw Edges
    edges.forEach(edge => {
        const n1 = getNode(edge.from);
        const n2 = getNode(edge.to);
        
        ctx.beginPath();
        ctx.moveTo(n1.x * width, n1.y * height);
        ctx.lineTo(n2.x * width, n2.y * height);
        
        // Highlight active route
        let isActive = false;
        for (let i=0; i<routePath.length-1; i++) {
            if ((routePath[i] === edge.from && routePath[i+1] === edge.to) ||
                (routePath[i] === edge.to && routePath[i+1] === edge.from)) {
                isActive = true;
            }
        }
        
        ctx.strokeStyle = isActive ? 'rgba(0, 210, 255, 0.5)' : 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = isActive ? 3 : 1;
        ctx.stroke();
    });

    // Draw Packets
    for (let i = packets.length - 1; i >= 0; i--) {
        let p = packets[i];
        const n1 = getNode(p.path[p.currentPathIndex]);
        const n2 = getNode(p.path[p.currentPathIndex + 1]);
        
        if (!n1 || !n2) continue;

        const x = (n1.x * width) + (n2.x * width - n1.x * width) * p.progress;
        const y = (n1.y * height) + (n2.y * height - n1.y * height) * p.progress;

        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = p.isMalicious ? '#ff4b4b' : '#00e676';
        ctx.fill();
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.isMalicious ? '#ff4b4b' : '#00e676';

        p.progress += p.speed;
        
        if (p.progress >= 1) {
            p.progress = 0;
            p.currentPathIndex++;
            if (p.currentPathIndex >= p.path.length - 1) {
                // Packet reached destination
                packets.splice(i, 1);
            }
        }
    }
    ctx.shadowBlur = 0; // reset

    // Draw Nodes
    nodes.forEach(node => {
        const x = node.x * width;
        const y = node.y * height;
        
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        
        if (node.isCompromised) {
            ctx.fillStyle = '#ff4b4b';
            ctx.strokeStyle = 'rgba(255, 75, 75, 0.5)';
        } else if (node.type === 'server') {
            ctx.fillStyle = '#3a7bd5';
            ctx.strokeStyle = 'rgba(58, 123, 213, 0.5)';
        } else if (node.type === 'source') {
            ctx.fillStyle = '#00d2ff';
            ctx.strokeStyle = 'rgba(0, 210, 255, 0.5)';
        } else {
            ctx.fillStyle = '#1e293b';
            ctx.strokeStyle = '#475569';
        }
        
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = '12px Rajdhani';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, x, y - 25);
    });

    requestAnimationFrame(drawNetwork);
}

// Start visual loop
drawNetwork();

window.NetworkGraph = {
    spawnPacket,
    setRoute: (newRoute) => routePath = newRoute,
    setNodeCompromised: (id, compromised) => {
        const n = getNode(id);
        if (n) n.isCompromised = compromised;
    }
};

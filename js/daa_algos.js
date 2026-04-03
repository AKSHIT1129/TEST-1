// DAA Algorithms: Dijkstra and KMP

// 1. Dijkstra's Algorithm for Rerouting
class GraphPathfinder {
    constructor() {
        this.graph = {
            'SRC': { 'R1': 2, 'R2': 5 },
            'R1': { 'SRC': 2, 'R3': 3, 'PC1': 1 },
            'R2': { 'SRC': 5, 'R3': 2 },
            'R3': { 'R1': 3, 'R2': 2, 'PC1': 4, 'DEST': 1 },
            'PC1': { 'R1': 1, 'R3': 4 },
            'DEST': { 'R3': 1 }
        };
        this.compromisedNodes = new Set();
    }

    setCompromised(node) {
        this.compromisedNodes.add(node);
    }
    
    resetCompromised() {
        this.compromisedNodes.clear();
    }

    findShortestPath(start, target) {
        const distances = {};
        const prev = {};
        const pq = [];

        Object.keys(this.graph).forEach(node => {
            distances[node] = Infinity;
            prev[node] = null;
        });

        distances[start] = 0;
        pq.push({ node: start, dist: 0 });

        while (pq.length > 0) {
            pq.sort((a, b) => a.dist - b.dist);
            const current = pq.shift().node;

            if (current === target) break;
            
            if (this.compromisedNodes.has(current)) continue; // avoid compromised nodes

            for (let neighbor in this.graph[current]) {
                if (this.compromisedNodes.has(neighbor)) continue;

                let alt = distances[current] + this.graph[current][neighbor];
                if (alt < distances[neighbor]) {
                    distances[neighbor] = alt;
                    prev[neighbor] = current;
                    pq.push({ node: neighbor, dist: alt });
                }
            }
        }

        const path = [];
        let u = target;
        if (prev[u] !== null || u === start) {
            while (u !== null) {
                path.unshift(u);
                u = prev[u];
            }
        }
        return path;
    }
}

// 2. KMP (Knuth-Morris-Pratt) for Payload Signature Matching
class KMPDetector {
    constructor(signature) {
        this.signature = signature;
        this.lps = this.computeLPSArray(signature);
    }

    computeLPSArray(pat) {
        let len = 0;
        let lps = new Array(pat.length).fill(0);
        let i = 1;

        while (i < pat.length) {
            if (pat[i] === pat[len]) {
                len++;
                lps[i] = len;
                i++;
            } else {
                if (len !== 0) {
                    len = lps[len - 1];
                } else {
                    lps[i] = 0;
                    i++;
                }
            }
        }
        return lps;
    }

    search(txt) {
        let n = txt.length;
        let m = this.signature.length;
        let i = 0, j = 0;
        let matches = [];

        while ((n - i) >= (m - j)) {
            if (this.signature[j] === txt[i]) {
                j++;
                i++;
            }
            if (j === m) {
                matches.push(i - j);
                j = this.lps[j - 1];
            } else if (i < n && this.signature[j] !== txt[i]) {
                if (j !== 0) j = this.lps[j - 1];
                else i++;
            }
        }
        return matches;
    }
}

window.DAA = {
    GraphPathfinder,
    KMPDetector
};

import heapq

# This is an example script demonstrating Dijkstra's Algorithm for DAA coursework.
# It is used in the Network Mitigation stage to reroute traffic safely around compromised nodes.

def dijkstra_safe_route(graph, start, target, compromised_nodes):
    print(f"Calculating shortest path from {start} to {target}...")
    print(f"Avoiding compromised nodes: {compromised_nodes}")

    distances = {node: float('infinity') for node in graph}
    distances[start] = 0
    previous_nodes = {node: None for node in graph}

    # Priority queue: (distance, node)
    pq = [(0, start)]

    while pq:
        current_dist, current_node = heapq.heappop(pq)

        # Reached the target
        if current_node == target:
            break
            
        # Already processed a shorter path
        if current_dist > distances[current_node]:
            continue

        for neighbor, weight in graph[current_node].items():
            if neighbor in compromised_nodes:
                continue # Skip this node as it's under attack
                
            distance = current_dist + weight
            
            if distance < distances[neighbor]:
                distances[neighbor] = distance
                previous_nodes[neighbor] = current_node
                heapq.heappush(pq, (distance, neighbor))

    # Reconstruct path
    path = []
    current = target
    while current is not None:
        path.insert(0, current)
        current = previous_nodes[current]
        
    if path[0] == start:
        print(f"Safe Route Found: {' -> '.join(path)}")
        return path
    else:
        print("No safe route available.")
        return []

if __name__ == "__main__":
    # Network Graph Topology representing latency/cost
    network_graph = {
        'SRC': {'R1': 2, 'R2': 5},
        'R1': {'SRC': 2, 'R3': 3, 'PC1': 1},
        'R2': {'SRC': 5, 'R3': 2},
        'R3': {'R1': 3, 'R2': 2, 'PC1': 4, 'DEST': 1},
        'PC1': {'R1': 1, 'R3': 4},
        'DEST': {'R3': 1}
    }

    # First, run when network is safe
    dijkstra_safe_route(network_graph, 'SRC', 'DEST', compromised_nodes=set())

    # Now simulate DDoS Attack on R1
    print("\n--- ATTACK DETECTED ON R1 ---")
    dijkstra_safe_route(network_graph, 'SRC', 'DEST', compromised_nodes={'R1'})

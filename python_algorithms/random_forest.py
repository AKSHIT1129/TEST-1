from sklearn.ensemble import RandomForestClassifier
import numpy as np

# This is an example script for academic demonstration of the Random Forest algorithm
# used to classify Network Intrusion (Normal vs Attack)

def train_and_predict_random_forest():
    print("Initializing Network Random Forest Classifier...")
    
    # Feature columns: [Packet Size, Request Frequency (req/s), Payload Entropy]
    # Synthetic Data representing NORMAL traffic
    normal_traffic = np.array([
        [150, 10, 0.2],
        [200, 15, 0.3],
        [100, 5, 0.1],
        [300, 8, 0.4]
    ])
    labels_normal = [0, 0, 0, 0] # 0 = Normal

    # Synthetic Data representing ATTACK traffic (e.g., DDoS or Payload Injection)
    attack_traffic = np.array([
        [1500, 150, 0.9],
        [2000, 200, 0.85],
        [1800, 100, 0.95],
        [150, 300, 0.8]  # Small packet, high frequency (ping flood)
    ])
    labels_attack = [1, 1, 1, 1] # 1 = Attack

    # Combine datasets
    X_train = np.concatenate((normal_traffic, attack_traffic))
    y_train = labels_normal + labels_attack

    # Initialize and Train Model
    clf = RandomForestClassifier(n_estimators=10, random_state=42)
    clf.fit(X_train, y_train)
    print("Model Trained successfully on Network Dataset.")

    # Simulated incoming live packets
    live_stream = np.array([
        [250, 12, 0.25],   # Normal
        [1600, 180, 0.92]  # Attack
    ])

    print("\nStarting Real-time Classification:")
    predictions = clf.predict(live_stream)
    
    for i, packet in enumerate(live_stream):
        status = "MALICIOUS ALERT" if predictions[i] == 1 else "Normal"
        print(f"Packet {i+1} [Size:{packet[0]}, Freq:{packet[1]}, Entropy:{packet[2]}] -> Classification: {status}")

if __name__ == "__main__":
    train_and_predict_random_forest()

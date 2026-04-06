def compute_lps_array(pattern):
    m = len(pattern)
    lps = [0] * m
    length = 0
    i = 1

    while i < m:
        if pattern[i] == pattern[length]:
            length += 1
            lps[i] = length
            i += 1
        else:
            if length != 0:
                length = lps[length - 1]
            else:
                lps[i] = 0
                i += 1
    return lps

def kmp_search(text, pattern):
    print(f"Scanning stream for signature: '{pattern}'")
    n = len(text)
    m = len(pattern)
    
    lps = compute_lps_array(pattern)
    
    i = 0  
    j = 0  
    found_matches = []

    while (n - i) >= (m - j):
        if pattern[j] == text[i]:
            j += 1
            i += 1

        if j == m:
            print(f"!!! MALWARE SIGNATURE DETECTED at Index {i-j} !!!")
            found_matches.append(i - j)
            j = lps[j - 1]
        elif i < n and pattern[j] != text[i]:
            if j != 0:
                j = lps[j - 1]
            else:
                i += 1
                
    if not found_matches:
        print("Stream is Clean - No signatures detected.")
    return found_matches

if __name__ == "__main__":
    clean_stream = "01A0B12F00C8D9E11F"
    malicious_stream = "01A0B12F00MALWARE00C8D9E11F"
    
    malware_signature = "MALWARE"
    
    print("--- Scanning Clean Stream ---")
    kmp_search(clean_stream, malware_signature)
    
    print("\n--- Scanning Malicious Stream ---")
    kmp_search(malicious_stream, malware_signature)

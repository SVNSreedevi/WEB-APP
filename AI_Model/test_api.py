import requests
import json

def test_predict_endpoint():
    url = "http://127.0.0.1:5000/predict"
    
    # Sample patient data as required
    payload = {
        "Age": 35,
        "Gender": "Female",
        "Weight_kg": 60,
        "Blood_Group": "O+",
        "Surgery_Type": "General Surgery",
        "Small_Gauze_Count": 8,
        "Small_Gauze_Value_ml": 10,
        "Large_Gauze_Count": 2,
        "Large_Gauze_Value_ml": 30,
        "Suction_ml": 700,
        "Irrigation_ml": 300,
        "Duration_hr": 2,
        "Urine_Collected_ml": 200
    }
    
    headers = {
        'Content-Type': 'application/json'
    }
    
    print(f"Sending POST request to {url} with payload:")
    print(json.dumps(payload, indent=4))
    print("-" * 40)
    
    try:
        response = requests.post(url, headers=headers, data=json.dumps(payload))
        
        print(f"Response Status Code: {response.status_code}")
        print("Response JSON:")
        print(json.dumps(response.json(), indent=4))
        
    except requests.exceptions.ConnectionError:
        print("Failed to connect to the server. Make sure ai_service.py is running!")
    except Exception as e:
        print(f"An error occurred: {str(e)}")

if __name__ == "__main__":
    test_predict_endpoint()

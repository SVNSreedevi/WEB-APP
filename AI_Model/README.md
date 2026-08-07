# AI Blood Loss Estimation Model

This repository contains the machine learning model for predicting the `Risk_Level` of intraoperative blood loss and fluid monitoring, as well as a lightweight Flask AI Inference Service to serve the predictions. 

The React frontend, Node.js backend, and MongoDB remain untouched, and the model relies on the medical calculations already provided by the application.

## Folder Structure
```
AI_Model/
├── dataset/
├── models/
│   ├── model.pkl
│   ├── label_encoders.pkl
│   └── scaler.pkl
├── preprocess/
├── training/
├── utils/
├── ai_service.py       # Flask API Service
├── predict.py          # Prediction Logic Helper
├── test_api.py         # Script to test the /predict endpoint
├── train_model.py      # Script to retrain the ML model
├── requirements.txt
└── README.md
```

## Setup Instructions

1. **Navigate to the AI_Model directory**:
   ```bash
   cd AI_Model
   ```

2. **Create a virtual environment** (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use: .\venv\Scripts\activate
   ```

3. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

## Starting the AI Inference Service

To start the Flask AI service locally on port 5000, run:
```bash
python ai_service.py
```
The service will load the models into memory at startup and expose a `POST /predict` endpoint.

## Testing the API

While the `ai_service.py` is running, open a new terminal window, activate the virtual environment, and run:
```bash
python test_api.py
```
This will send a sample JSON payload to the `/predict` endpoint and print the response.

### Example Request
```json
{
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
```

### Example Response
```json
{
    "success": true,
    "risk_level": "Moderate",
    "confidence": 0.9123
}
```

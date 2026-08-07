from flask import Flask, request, jsonify
import joblib
import os
import traceback
from predict import predict_risk

app = Flask(__name__)

# Global variables for models
model = None
label_encoders = None
scaler = None

def load_models():
    """Load all ML models and preprocessing objects during startup."""
    global model, label_encoders, scaler
    base_dir = os.path.dirname(os.path.abspath(__file__))
    models_dir = os.path.join(base_dir, 'models')
    
    try:
        model_path = os.path.join(models_dir, 'model.pkl')
        le_path = os.path.join(models_dir, 'label_encoders.pkl')
        scaler_path = os.path.join(models_dir, 'scaler.pkl')
        
        if os.path.exists(model_path):
            model = joblib.load(model_path)
            print("Successfully loaded model.pkl")
        else:
            raise FileNotFoundError("model.pkl not found!")
            
        if os.path.exists(le_path):
            label_encoders = joblib.load(le_path)
            print("Successfully loaded label_encoders.pkl")
        else:
            raise FileNotFoundError("label_encoders.pkl not found!")
            
        if os.path.exists(scaler_path):
            scaler = joblib.load(scaler_path)
            print("Successfully loaded scaler.pkl")
        else:
            print("No scaler.pkl found. Continuing without scaling.")
            
    except Exception as e:
        print(f"Error loading models during startup: {str(e)}")
        # In production, we might raise or handle this, but we'll print and let the endpoint fail gracefully.

# Load models at startup
load_models()

@app.route('/predict', methods=['POST'])
def predict_endpoint():
    """
    Predict Risk_Level from patient JSON data.
    """
    if model is None or label_encoders is None:
        return jsonify({
            'success': False,
            'error': 'Model loading failure. Service is unavailable.'
        }), 503

    if not request.is_json:
        return jsonify({
            'success': False,
            'error': 'Invalid request. Content-Type must be application/json.'
        }), 400

    try:
        input_data = request.get_json()
        
        if not input_data:
            return jsonify({
                'success': False,
                'error': 'Missing or empty JSON body.'
            }), 400
            
        # Predict using our helper function
        risk_level, confidence = predict_risk(input_data, model, label_encoders, scaler)
        
        return jsonify({
            'success': True,
            'risk_level': str(risk_level),
            'confidence': round(confidence, 4)
        }), 200
        
    except ValueError as ve:
        return jsonify({
            'success': False,
            'error': f"Invalid values or missing fields: {str(ve)}"
        }), 400
    except Exception as e:
        # Catch-all for unexpected preprocessing errors
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': f"An unexpected error occurred during prediction: {str(e)}"
        }), 500

if __name__ == '__main__':
    # Start the Flask app using a production WSGI server
    from waitress import serve
    serve(app, host='127.0.0.1', port=5001)

import pandas as pd

def predict_risk(input_data, model, label_encoders, scaler):
    """
    Predict Risk_Level for the given input_data using the loaded model and preprocessing objects.
    Returns the predicted risk level and the confidence (probability) of the prediction.
    """
    # Convert to DataFrame
    df = pd.DataFrame([input_data])

    # Expected features based on training
    expected_features = [
        'Age', 'Gender', 'Weight_kg', 'Blood_Group', 'Surgery_Type', 
        'Small_Gauze_Count', 'Small_Gauze_Value_ml', 'Large_Gauze_Count', 
        'Large_Gauze_Value_ml', 'Suction_ml', 'Irrigation_ml', 
        'Duration_hr', 'Urine_Collected_ml'
    ]

    # Check for missing features
    missing_features = [f for f in expected_features if f not in df.columns]
    if missing_features:
        raise ValueError(f"Missing required features: {missing_features}")

    # Keep only the expected features in the correct order
    df = df[expected_features]

    # Encode categorical features
    for col, le in label_encoders.items():
        if col != 'target' and col in df.columns:
            try:
                # Handle unseen labels by mapping to a default/first class if necessary
                # We use list comprehension to map unseen labels safely
                df[col] = df[col].map(lambda s: s if s in le.classes_ else le.classes_[0])
                df[col] = le.transform(df[col])
            except Exception as e:
                raise ValueError(f"Error encoding column {col}: {str(e)}")

    # Scale features
    if scaler:
        df_scaled = scaler.transform(df)
    else:
        df_scaled = df
    
    # Predict
    prediction = model.predict(df_scaled)
    
    # Predict probabilities for confidence
    if hasattr(model, 'predict_proba'):
        probabilities = model.predict_proba(df_scaled)[0]
        confidence = float(max(probabilities))
    else:
        confidence = 1.0 # Fallback if model doesn't support probability
        
    # Decode prediction
    target_le = label_encoders['target']
    predicted_risk = target_le.inverse_transform(prediction)[0]
    
    return predicted_risk, confidence

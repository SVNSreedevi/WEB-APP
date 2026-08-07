import pandas as pd
import numpy as np
import os
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, classification_report
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
import xgboost as xgb
import lightgbm as lgb

# Create required directories
directories = ['models', 'preprocess', 'training', 'utils']
for d in directories:
    os.makedirs(d, exist_ok=True)

# 1. Load the dataset
print("Loading dataset...")
df = pd.read_excel('dataset/AI_Blood_Loss_Estimation_Dataset_800_Rows_VideoBased.xlsx')

# 2. Analyze all columns
print("\n--- Dataset Summary ---")
print(f"Total Rows: {df.shape[0]}")
print(f"Total Columns: {df.shape[1]}")
print(f"Column Names: {df.columns.tolist()}")
print(f"Data Types:\n{df.dtypes}")
print(f"Missing Values:\n{df.isnull().sum()}")

# 3. Clean the dataset
if 'Patient_Name' in df.columns:
    df.drop('Patient_Name', axis=1, inplace=True)

# 4. Handle missing values
# (No missing values based on exploration, but adding safe fallback)
df.ffill(inplace=True)

# 5. Encode categorical features & Select Target
target_col = 'Risk_Level' if 'Risk_Level' in df.columns else None
if not target_col:
    raise ValueError("Risk_Level not found in dataset!")

cols_to_drop = [
    target_col,
    'Actual_Blood_Loss_ml',
    'Total_Fluid_Loss_ml',
    'Pct_Blood_Loss_of_EBV',
    'Total_Gauze_Blood_ml',
    'Suction_Blood_ml',
    'Insensible_Loss_ml',
    'Estimated_Blood_Volume_ml'
]
X = df.drop(columns=[col for col in cols_to_drop if col in df.columns])
y = df[target_col]

categorical_cols = X.select_dtypes(include=['object']).columns.tolist()
label_encoders = {}

for col in categorical_cols:
    le = LabelEncoder()
    X[col] = le.fit_transform(X[col])
    label_encoders[col] = le

# Target encoder
target_le = LabelEncoder()
y = target_le.fit_transform(y)
label_encoders['target'] = target_le

joblib.dump(label_encoders, 'models/label_encoders.pkl')

# Scale numeric features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
X_scaled = pd.DataFrame(X_scaled, columns=X.columns)
joblib.dump(scaler, 'models/scaler.pkl')

print(f"\nTarget Variable: {target_col}")
print(f"Input Features: {X.columns.tolist()}")

# 6. Split the dataset into 80% training and 20% testing
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)

# 7. Compare suitable machine learning algorithms
models = {
    'Random Forest': RandomForestClassifier(random_state=42),
    'Gradient Boosting': GradientBoostingClassifier(random_state=42),
    'XGBoost': xgb.XGBClassifier(random_state=42, use_label_encoder=False, eval_metric='mlogloss'),
    'LightGBM': lgb.LGBMClassifier(random_state=42, verbose=-1)
}

best_model_name = ""
best_accuracy = 0
best_model = None

print("\n--- Comparing Algorithms ---")
for name, model in models.items():
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"{name} Accuracy: {acc:.4f}")
    if acc > best_accuracy:
        best_accuracy = acc
        best_model_name = name
        best_model = model

print(f"\n8. Selected Best Algorithm: {best_model_name} with Accuracy {best_accuracy:.4f}")

# 9. Train the model (already trained above, but keeping reference)
model = best_model

# 10. Evaluate the model
y_pred = model.predict(X_test)

print("\n--- Model Evaluation ---")
print(f"Accuracy: {accuracy_score(y_test, y_pred):.4f}")
# using weighted avg for precision, recall, f1 since it's multiclass
print(f"Precision: {precision_score(y_test, y_pred, average='weighted'):.4f}")
print(f"Recall: {recall_score(y_test, y_pred, average='weighted'):.4f}")
print(f"F1 Score: {f1_score(y_test, y_pred, average='weighted'):.4f}")
print("\nConfusion Matrix:")
print(confusion_matrix(y_test, y_pred))
print("\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=target_le.classes_))

# 11. Display feature importance
print("\n--- Feature Importance ---")
if hasattr(model, 'feature_importances_'):
    importances = model.feature_importances_
    feat_imp = pd.Series(importances, index=X.columns).sort_values(ascending=False)
    for feat, imp in feat_imp.items():
        print(f"{feat}: {imp:.4f}")
else:
    print("Feature importance not available for this model type.")

# 12 & 13. Save the trained model & preprocessing objects
joblib.dump(model, 'models/model.pkl')
print("\nModel saved to models/model.pkl")
print("Preprocessing objects saved to models/label_encoders.pkl and models/scaler.pkl")
print("\nPhase 1 Completed successfully.")

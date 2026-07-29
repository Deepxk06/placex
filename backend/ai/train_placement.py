import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, r2_score
import joblib
import os


def generate_synthetic_data(n_samples=500):
    np.random.seed(42)
    data = {
        "cgpa": np.random.uniform(5.0, 10.0, n_samples),
        "skills_count": np.random.randint(0, 15, n_samples),
        "project_count": np.random.randint(0, 8, n_samples),
        "resume_score": np.random.uniform(20, 100, n_samples),
        "aptitude_score": np.random.uniform(20, 100, n_samples),
        "interview_score": np.random.uniform(20, 100, n_samples),
    }
    df = pd.DataFrame(data)
    # Generate target: placement probability
    score = (
        0.30 * (df["cgpa"] / 10) +
        0.20 * (df["skills_count"] / 15) +
        0.10 * (df["project_count"] / 8) +
        0.15 * (df["resume_score"] / 100) +
        0.10 * (df["aptitude_score"] / 100) +
        0.15 * (df["interview_score"] / 100)
    )
    noise = np.random.normal(0, 0.1, n_samples)
    score = np.clip(score + noise, 0, 1)
    df["placed"] = (score > 0.5).astype(int)
    df["salary"] = 300000 + score * 1200000 + np.random.normal(0, 100000, n_samples)
    df["salary"] = df["salary"].clip(300000, 3000000)
    return df


def train_models():
    print("Generating synthetic data...")
    df = generate_synthetic_data(500)
    
    features = ["cgpa", "skills_count", "project_count", "resume_score",
                 "aptitude_score", "interview_score"]
    X = df[features]
    y_class = df["placed"]
    y_reg = df["salary"]
    
    X_train, X_test, y_train_class, y_test_class = train_test_split(
        X, y_class, test_size=0.2, random_state=42
    )
    _, _, y_train_reg, y_test_reg = train_test_split(
        X, y_reg, test_size=0.2, random_state=42
    )
    
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    print("Training Random Forest Classifier...")
    clf = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
    clf.fit(X_train_scaled, y_train_class)
    y_pred = clf.predict(X_test_scaled)
    accuracy = accuracy_score(y_test_class, y_pred)
    print(f"Classification Accuracy: {accuracy:.2%}")
    
    print("Training Random Forest Regressor (Salary)...")
    reg = RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42)
    reg.fit(X_train_scaled, y_train_reg)
    y_pred_reg = reg.predict(X_test_scaled)
    r2 = r2_score(y_test_reg, y_pred_reg)
    print(f"Salary Prediction R² Score: {r2:.2%}")
    
    os.makedirs("ai/models", exist_ok=True)
    joblib.dump(clf, "ai/models/placement_model.pkl")
    joblib.dump(reg, "ai/models/salary_model.pkl")
    joblib.dump(scaler, "ai/models/scaler.pkl")
    print("Models saved to ai/models/")
    print("\nFeature Importance:")
    for name, imp in zip(features, clf.feature_importances_):
        print(f"  {name}: {imp:.3f}")


if __name__ == "__main__":
    train_models()

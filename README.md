# 🔐 Zero Trust Identity Verification using Biometric Behavior

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Machine Learning](https://img.shields.io/badge/Scikit--learn-F7931E?style=for-the-badge&logo=scikitlearn&logoColor=white)
![Security](https://img.shields.io/badge/Zero%20Trust-Security-red?style=for-the-badge)
![Jupyter](https://img.shields.io/badge/Jupyter-F37626?style=for-the-badge&logo=jupyter&logoColor=white)

A security system built on the **"never trust, always verify"** principle. Continuously verifies user identity by analysing behavioural biometrics — keystroke dynamics and mouse movement patterns — using ML anomaly detection in real time.

---

## 🔍 What This Does

Traditional authentication verifies identity **once at login**. This system continuously monitors user behaviour throughout a session — flagging anomalies that suggest impersonation or unauthorised access without requiring additional hardware.

---

## 🛠 Tech Stack

| Tool | Purpose |
|---|---|
| Python | Core pipeline development |
| Scikit-learn | ML model training and evaluation |
| Pandas / NumPy | Data processing and feature engineering |
| Anomaly Detection | Statistical deviation modelling |
| Biometric Signal Processing | Keystroke dynamics, mouse movement analysis |

---

## 🏗 System Architecture
User Interaction
↓
Data Collection (Keystroke timing, Mouse movement)
↓
Feature Engineering (Timing intervals, velocity, pressure patterns)
↓
Baseline Profile Training (per user)
↓
Real-time Anomaly Detection

↓---

## 📊 Key Results

- ✅ Continuous identity verification without additional hardware
- ✅ Real-time anomaly flagging with low false positive rate
- ✅ Reduced reliance on single-point authentication
- ✅ Significantly lowered identity fraud and impersonation risk on exam platforms

---

## 🔑 Key Concepts

**Zero Trust Security** — Never trust any user or device by default, even inside the network. Always verify continuously.

**Behavioural Biometrics** — Each person has a unique way of typing and moving a mouse. These patterns are nearly impossible to replicate.

**Anomaly Detection** — ML models learn a user's normal behaviour and flag sessions that deviate significantly from the baseline.

---

## ▶️ How to Run

1. Clone the repo:
```bash
git clone https://github.com/Harshiniradha/Zero-trust-based-identity-verification-using-biometric-behavior.git
```

2. Install dependencies:
```bash
pip install pandas numpy scikit-learn matplotlib seaborn jupyter
```

3. Open the notebook:
```bash
jupyter notebook main.ipynb
```

---

## 🎓 Context

This project was developed as a **research internship project** at Thirvu Soft Pvt Ltd (Dec 2025 – Apr 2026) and as an academic research project at PSGR Krishnammal College for Women, Bharathiar University.

---

## 📬 Connect

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/harshini-r-b9558a336)
[![Gmail](https://img.shields.io/badge/Gmail-EA4335?style=for-the-badge&logo=gmail&logoColor=white)](mailto:harshiniradhakrishnan25@gmail.com)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Harshiniradha)

Flag / Re-authenticate / Terminate session

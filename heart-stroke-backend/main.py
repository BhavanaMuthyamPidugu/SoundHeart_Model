from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware

import pickle
import pandas as pd
import shap
import tensorflow as tf
from PIL import Image
import io
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------------
# LOAD CLINICAL MODEL
# ----------------------------

print("Loading stroke model...")

model = pickle.load(open("stroke_model.pkl", "rb"))
scaler = pickle.load(open("scaler.pkl", "rb"))

explainer = shap.TreeExplainer(model)

print("Stroke model loaded.")

# ----------------------------
# LOAD MRI MODEL SAFELY
# ----------------------------

cnn_model = None

if os.path.exists("heart_mri_resnet50.h5"):
    try:
        cnn_model = tf.keras.models.load_model(
            "heart_mri_resnet50.h5",
            compile=False
        )
        print("MRI model loaded successfully.")
    except Exception as e:
        print("MRI MODEL FAILED TO LOAD")
        print(e)

# ----------------------------
# MRI PREPROCESS
# ----------------------------

def preprocess_mri(image_bytes):

    image = Image.open(io.BytesIO(image_bytes)).convert("L")
    image = image.resize((224,224))

    image = tf.keras.preprocessing.image.img_to_array(image)
    image = tf.image.grayscale_to_rgb(image)

    image = image / 255.0
    image = tf.expand_dims(image, axis=0)

    return image


# ----------------------------
# HYBRID PREDICTION
# ----------------------------

@app.post("/predict_hybrid")

async def predict_hybrid(

    file: UploadFile = File(...),

    age: float = Form(...),
    gender: str = Form(...),
    hypertension: int = Form(...),
    heart_disease: int = Form(...),
    avg_glucose_level: float = Form(...),
    bmi: float = Form(...),
    smoking_status: str = Form(...),
    physical_activity_hours: float = Form(...),
    covid_infected: int = Form(...),
    vaccination_doses: float = Form(...),
    post_covid_fatigue: int = Form(...),
    inflammation_marker: int = Form(...),
    brain_fog: int = Form(...),
    memory_loss: int = Form(...),
    dizziness: int = Form(...)
):

    # ----------------------------
    # CLINICAL DATA
    # ----------------------------

    data = {
        "age": age,
        "gender": gender.lower(),
        "hypertension": hypertension,
        "heart_disease": heart_disease,
        "avg_glucose_level": avg_glucose_level,
        "bmi": bmi,
        "smoking_status": smoking_status.lower(),
        "physical_activity_hours": physical_activity_hours,
        "covid_infected": covid_infected,
        "vaccination_doses": vaccination_doses,
        "post_covid_fatigue": post_covid_fatigue,
        "inflammation_marker": inflammation_marker,
        "brain_fog": brain_fog,
        "memory_loss": memory_loss,
        "dizziness": dizziness
    }

    df = pd.DataFrame([data])

    # Encoding
    df["gender"] = df["gender"].map({"male":1,"female":0})

    df["smoking_status"] = df["smoking_status"].map({
        "never smoked":0,
        "formerly smoked":1,
        "smokes":2
    })

    scaled = scaler.transform(df)

    # ----------------------------
    # STROKE MODEL
    # ----------------------------

    stroke_probability = model.predict_proba(scaled)[0][1]

    # ----------------------------
    # SHAP EXPLAINABILITY
    # ----------------------------

    shap_values = explainer.shap_values(scaled)

    feature_importance = dict(
        zip(df.columns.tolist(), shap_values[0].tolist())
    )

    top_features = sorted(
        feature_importance.items(),
        key=lambda x: abs(x[1]),
        reverse=True
    )[:5]

    # ----------------------------
    # MRI MODEL
    # ----------------------------

    mri_prediction = 0
    mri_result = "MRI Model Not Loaded"

    if cnn_model is not None:

        contents = await file.read()
        image = preprocess_mri(contents)

        mri_prediction = cnn_model.predict(image)[0][0]

        if mri_prediction > 0.5:
            mri_result = "Disease Detected"
        else:
            mri_result = "Normal"

    # ----------------------------
    # HYBRID RISK
    # ----------------------------

    if stroke_probability > 0.7 and mri_prediction > 0.7:
        final_risk = "Severe High Risk"

    elif stroke_probability > 0.7 or mri_prediction > 0.7:
        final_risk = "High Risk"

    elif stroke_probability > 0.4 or mri_prediction > 0.5:
        final_risk = "Medium Risk"

    else:
        final_risk = "Low Risk"

    return {

        "stroke_probability": float(stroke_probability),
        "mri_probability": float(mri_prediction),
        "mri_result": mri_result,
        "final_risk": final_risk,
        "top_risk_factors": top_features

    }












# from fastapi import FastAPI, File, UploadFile, Form
# from fastapi.middleware.cors import CORSMiddleware

# import pickle
# import pandas as pd
# import shap
# import tensorflow as tf
# from PIL import Image
# import io

# # -----------------------------------
# # FASTAPI INIT
# # -----------------------------------

# app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # -----------------------------------
# # LOAD MODELS
# # -----------------------------------

# model = pickle.load(open("stroke_model.pkl", "rb"))
# scaler = pickle.load(open("scaler.pkl", "rb"))

# cnn_model = tf.keras.models.load_model("heart_mri_resnet50.keras")

# explainer = shap.TreeExplainer(model)

# # -----------------------------------
# # MRI PREPROCESSING
# # -----------------------------------

# def preprocess_mri(image_bytes):

#     image = Image.open(io.BytesIO(image_bytes)).convert("L")

#     image = image.resize((224,224))

#     image = tf.keras.preprocessing.image.img_to_array(image)

#     image = tf.image.grayscale_to_rgb(image)

#     image = image / 255.0

#     image = tf.expand_dims(image, axis=0)

#     return image

# # -----------------------------------
# # HYBRID PREDICTION
# # -----------------------------------

# @app.post("/predict_hybrid")

# async def predict_hybrid(

#     file: UploadFile = File(...),

#     age: float = Form(...),
#     gender: str = Form(...),
#     hypertension: int = Form(...),
#     heart_disease: int = Form(...),
#     avg_glucose_level: float = Form(...),
#     bmi: float = Form(...),
#     smoking_status: str = Form(...),
#     physical_activity_hours: float = Form(...),
#     covid_infected: int = Form(...),
#     vaccination_doses: float = Form(...),
#     post_covid_fatigue: int = Form(...),
#     inflammation_marker: int = Form(...),
#     brain_fog: int = Form(...),
#     memory_loss: int = Form(...),
#     dizziness: int = Form(...)
# ):

#     # -----------------------------------
#     # CLINICAL DATA
#     # -----------------------------------

#     data = {
#         "age": age,
#         "gender": gender.lower(),
#         "hypertension": hypertension,
#         "heart_disease": heart_disease,
#         "avg_glucose_level": avg_glucose_level,
#         "bmi": bmi,
#         "smoking_status": smoking_status.lower(),
#         "physical_activity_hours": physical_activity_hours,
#         "covid_infected": covid_infected,
#         "vaccination_doses": vaccination_doses,
#         "post_covid_fatigue": post_covid_fatigue,
#         "inflammation_marker": inflammation_marker,
#         "brain_fog": brain_fog,
#         "memory_loss": memory_loss,
#         "dizziness": dizziness
#     }

#     df = pd.DataFrame([data])

#     # -----------------------------------
#     # ENCODING
#     # -----------------------------------

#     df["gender"] = df["gender"].map({
#         "male": 1,
#         "female": 0
#     })

#     df["smoking_status"] = df["smoking_status"].map({
#         "never smoked": 0,
#         "formerly smoked": 1,
#         "smokes": 2
#     })

#     # -----------------------------------
#     # SCALE DATA
#     # -----------------------------------

#     scaled = scaler.transform(df)

#     # -----------------------------------
#     # CLINICAL MODEL PREDICTION
#     # -----------------------------------

#     stroke_probability = model.predict_proba(scaled)[0][1]

#     # -----------------------------------
#     # SHAP EXPLAINABILITY
#     # -----------------------------------

#     shap_values = explainer.shap_values(scaled)

#     feature_importance = dict(
#         zip(df.columns.tolist(), shap_values[0].tolist())
#     )

#     top_features = sorted(
#         feature_importance.items(),
#         key=lambda x: abs(x[1]),
#         reverse=True
#     )[:5]

#     # -----------------------------------
#     # MRI MODEL
#     # -----------------------------------

#     contents = await file.read()

#     image = preprocess_mri(contents)

#     mri_prediction = cnn_model.predict(image)[0][0]

#     mri_result = "Disease Detected" if mri_prediction > 0.5 else "Normal"

#     # -----------------------------------
#     # HYBRID RISK LOGIC
#     # -----------------------------------

#     if stroke_probability > 0.7 and mri_prediction > 0.7:
#         final_risk = "Severe High Risk"

#     elif stroke_probability > 0.7 or mri_prediction > 0.7:
#         final_risk = "High Risk"

#     elif stroke_probability > 0.4 or mri_prediction > 0.5:
#         final_risk = "Medium Risk"

#     else:
#         final_risk = "Low Risk"

#     # -----------------------------------
#     # RESPONSE
#     # -----------------------------------

#     return {

#         "stroke_probability": float(stroke_probability),

#         "mri_probability": float(mri_prediction),

#         "mri_result": mri_result,

#         "final_risk": final_risk,

#         "top_risk_factors": top_features

#     }













# from fastapi import FastAPI, File, UploadFile, Form
# from fastapi.middleware.cors import CORSMiddleware

# import pickle
# import pandas as pd
# import tensorflow as tf
# from PIL import Image
# import io

# # ----------------------------
# # FASTAPI INIT
# # ----------------------------

# app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # ----------------------------
# # LOAD MODELS
# # ----------------------------

# model = pickle.load(open("stroke_model.pkl", "rb"))
# scaler = pickle.load(open("scaler.pkl", "rb"))

# cnn_model = tf.keras.models.load_model(
#     "heart_mri_resnet50.h5",
#     compile=False
# )

# # ----------------------------
# # MRI PREPROCESS FUNCTION
# # ----------------------------

# def preprocess_mri(image_bytes):

#     image = Image.open(io.BytesIO(image_bytes)).convert("L")
#     image = image.resize((224,224))

#     image = tf.keras.preprocessing.image.img_to_array(image)

#     image = tf.image.grayscale_to_rgb(image)

#     image = image / 255.0

#     image = tf.expand_dims(image, axis=0)

#     return image


# # ----------------------------
# # HYBRID PREDICTION API
# # ----------------------------

# @app.post("/predict_hybrid")
# async def predict_hybrid(

#     file: UploadFile = File(...),

#     age: float = Form(...),
#     gender: str = Form(...),
#     hypertension: int = Form(...),
#     heart_disease: int = Form(...),
#     avg_glucose_level: float = Form(...),
#     bmi: float = Form(...),
#     smoking_status: str = Form(...),
#     physical_activity_hours: float = Form(...),
#     covid_infected: int = Form(...),
#     vaccination_doses: float = Form(...),
#     post_covid_fatigue: int = Form(...),
#     inflammation_marker: int = Form(...),
#     brain_fog: int = Form(...),
#     memory_loss: int = Form(...),
#     dizziness: int = Form(...)
# ):

#     # ----------------------------
#     # CLINICAL DATA MODEL
#     # ----------------------------

#     data = {
#         "age": age,
#         "gender": gender.lower(),
#         "hypertension": hypertension,
#         "heart_disease": heart_disease,
#         "avg_glucose_level": avg_glucose_level,
#         "bmi": bmi,
#         "smoking_status": smoking_status.lower(),
#         "physical_activity_hours": physical_activity_hours,
#         "covid_infected": covid_infected,
#         "vaccination_doses": vaccination_doses,
#         "post_covid_fatigue": post_covid_fatigue,
#         "inflammation_marker": inflammation_marker,
#         "brain_fog": brain_fog,
#         "memory_loss": memory_loss,
#         "dizziness": dizziness
#     }

#     df = pd.DataFrame([data])

#     # ----------------------------
#     # ENCODING
#     # ----------------------------

#     df["gender"] = df["gender"].map({
#         "male": 1,
#         "female": 0
#     })

#     df["smoking_status"] = df["smoking_status"].map({
#         "never smoked": 0,
#         "formerly smoked": 1,
#         "smokes": 2
#     })

#     # ----------------------------
#     # SCALING
#     # ----------------------------

#     scaled = scaler.transform(df)

#     # ----------------------------
#     # STROKE MODEL
#     # ----------------------------

#     stroke_probability = model.predict_proba(scaled)[0][1]

#     # ----------------------------
#     # MRI MODEL
#     # ----------------------------

#     contents = await file.read()

#     image = preprocess_mri(contents)

#     mri_prediction = cnn_model.predict(image)[0][0]

#     mri_result = "Disease Detected" if mri_prediction > 0.5 else "Normal"

#     # ----------------------------
#     # HYBRID RISK LOGIC
#     # ----------------------------

#     if stroke_probability > 0.7 and mri_prediction > 0.7:
#         final_risk = "Severe High Risk"

#     elif stroke_probability > 0.7 or mri_prediction > 0.7:
#         final_risk = "High Risk"

#     elif stroke_probability > 0.4 or mri_prediction > 0.5:
#         final_risk = "Medium Risk"

#     else:
#         final_risk = "Low Risk"

#     # ----------------------------
#     # RESPONSE
#     # ----------------------------

#     return {

#         "stroke_probability": float(stroke_probability),

#         "mri_probability": float(mri_prediction),

#         "mri_result": mri_result,

#         "final_risk": final_risk

#     }










# from fastapi import FastAPI, File, UploadFile, Form
# from fastapi.middleware.cors import CORSMiddleware
# import pickle
# import pandas as pd
# import shap
# import tensorflow as tf
# from PIL import Image
# import io

# app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # --------------------
# # Load Models
# # --------------------

# model = pickle.load(open("stroke_model.pkl", "rb"))
# scaler = pickle.load(open("scaler.pkl", "rb"))
# cnn_model = tf.keras.models.load_model("heart_mri_resnet50.h5")

# explainer = shap.TreeExplainer(model)

# # --------------------
# # MRI Preprocess
# # --------------------

# def preprocess_mri(image_bytes):

#     image = Image.open(io.BytesIO(image_bytes)).convert("L")
#     image = image.resize((224,224))

#     image = tf.keras.preprocessing.image.img_to_array(image)
#     image = tf.image.grayscale_to_rgb(image)
#     image = image / 255.0
#     image = tf.expand_dims(image, axis=0)

#     return image


# # --------------------
# # HYBRID PREDICTION
# # --------------------

# @app.post("/predict_hybrid")
# async def predict_hybrid(

#     file: UploadFile = File(...),

#     age: float = Form(...),
#     gender: str = Form(...),
#     hypertension: int = Form(...),
#     heart_disease: int = Form(...),
#     avg_glucose_level: float = Form(...),
#     bmi: float = Form(...),
#     smoking_status: str = Form(...),
#     physical_activity_hours: float = Form(...),
#     covid_infected: int = Form(...),
#     vaccination_doses: float = Form(...),
#     post_covid_fatigue: int = Form(...),
#     inflammation_marker: int = Form(...),
#     brain_fog: int = Form(...),
#     memory_loss: int = Form(...),
#     dizziness: int = Form(...)
# ):

#     # -------- Clinical Model --------

#     data = {
#         "age": age,
#         "gender": gender.lower(),
#         "hypertension": hypertension,
#         "heart_disease": heart_disease,
#         "avg_glucose_level": avg_glucose_level,
#         "bmi": bmi,
#         "smoking_status": smoking_status.lower(),
#         "physical_activity_hours": physical_activity_hours,
#         "covid_infected": covid_infected,
#         "vaccination_doses": vaccination_doses,
#         "post_covid_fatigue": post_covid_fatigue,
#         "inflammation_marker": inflammation_marker,
#         "brain_fog": brain_fog,
#         "memory_loss": memory_loss,
#         "dizziness": dizziness
#     }

#     df = pd.DataFrame([data])

#     df["gender"] = df["gender"].map({
#         "male": 1,
#         "female": 0
#     })

#     df["smoking_status"] = df["smoking_status"].map({
#         "never smoked": 0,
#         "formerly smoked": 1,
#         "smokes": 2
#     })

#     scaled = scaler.transform(df)

#     stroke_probability = model.predict_proba(scaled)[0][1]

#     # -------- MRI MODEL --------

#     contents = await file.read()
#     image = preprocess_mri(contents)

#     mri_prediction = cnn_model.predict(image)[0][0]

#     mri_result = "Disease Detected" if mri_prediction > 0.5 else "Normal"

#     # -------- HYBRID RISK --------

#     if stroke_probability > 0.7 and mri_prediction > 0.6:
#         final_risk = "Severe High Risk"

#     elif stroke_probability > 0.7:
#         final_risk = "High Risk"

#     elif stroke_probability > 0.3 and mri_prediction > 0.6:
#         final_risk = "High Risk"

#     elif stroke_probability > 0.3:
#         final_risk = "Medium Risk"

#     elif mri_prediction > 0.6:
#         final_risk = "Medium Risk"

#     else:
#         final_risk = "Low Risk"

#     return {

#         "stroke_probability": float(stroke_probability),
#         "mri_probability": float(mri_prediction),
#         "mri_result": mri_result,
#         "final_risk": final_risk

#     }










# from fastapi import FastAPI, File, UploadFile, Form
# from fastapi.middleware.cors import CORSMiddleware
# import pickle
# import pandas as pd
# import shap
# import numpy as np
# import tensorflow as tf
# from PIL import Image
# import io

# app = FastAPI()

# # Enable CORS
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # -------------------------
# # LOAD MODELS
# # -------------------------

# model = pickle.load(open("stroke_model.pkl", "rb"))
# scaler = pickle.load(open("scaler.pkl", "rb"))

# cnn_model = tf.keras.models.load_model("heart_mri_resnet50.h5")

# explainer = shap.TreeExplainer(model)

# # -------------------------
# # MRI PREPROCESS FUNCTION
# # -------------------------

# def preprocess_mri(image_bytes):

#     image = Image.open(io.BytesIO(image_bytes)).convert("L")
#     image = image.resize((224,224))

#     image = tf.keras.preprocessing.image.img_to_array(image)

#     # convert grayscale -> RGB
#     image = tf.image.grayscale_to_rgb(image)

#     image = image / 255.0
#     image = tf.expand_dims(image, axis=0)

#     return image


# # -------------------------
# # CLINICAL STROKE PREDICTION
# # -------------------------

# @app.post("/predict")
# def predict(data: dict):

#     df = pd.DataFrame([data])

#     # manual encoding
#     df["gender"] = df["gender"].str.lower().map({
#         "male": 1,
#         "female": 0
#     })

#     df["smoking_status"] = df["smoking_status"].str.lower().map({
#         "never smoked": 0,
#         "formerly smoked": 1,
#         "smokes": 2
#     })

#     scaled = scaler.transform(df)

#     prediction = model.predict(scaled)[0]
#     probability = model.predict_proba(scaled)[0][1]

#     if probability < 0.3:
#         risk_level = "Low Risk"
#     elif probability < 0.7:
#         risk_level = "Medium Risk"
#     else:
#         risk_level = "High Risk"

#     # SHAP explanation
#     shap_values = explainer.shap_values(scaled)

#     feature_importance = dict(
#         zip(df.columns.tolist(), shap_values[0].tolist())
#     )

#     top_features = sorted(
#         feature_importance.items(),
#         key=lambda x: abs(x[1]),
#         reverse=True
#     )[:5]

#     return {
#         "stroke_prediction": int(prediction),
#         "stroke_probability": float(probability),
#         "risk_level": risk_level,
#         "top_features": top_features
#     }


# # -------------------------
# # MRI CNN PREDICTION
# # -------------------------

# @app.post("/predict_mri")
# async def predict_mri(file: UploadFile = File(...)):

#     contents = await file.read()

#     image = preprocess_mri(contents)

#     prediction = cnn_model.predict(image)[0][0]

#     result = "Disease Detected" if prediction > 0.5 else "Normal"

#     return {
#         "mri_probability": float(prediction),
#         "mri_result": result
#     }


# # -------------------------
# # HYBRID PREDICTION
# # -------------------------

# @app.post("/predict_hybrid")
# async def predict_hybrid(

#     file: UploadFile = File(...),

#     age: float = Form(...),
#     gender: str = Form(...),
#     hypertension: int = Form(...),
#     heart_disease: int = Form(...),
#     avg_glucose_level: float = Form(...),
#     bmi: float = Form(...),
#     smoking_status: str = Form(...),
#     physical_activity_hours: float = Form(...),
#     covid_infected: int = Form(...),
#     vaccination_doses: float = Form(...),
#     post_covid_fatigue: int = Form(...),
#     inflammation_marker: int = Form(...),
#     brain_fog: int = Form(...),
#     memory_loss: int = Form(...),
#     dizziness: int = Form(...)
# ):

#     # -------------------------
#     # CLINICAL MODEL
#     # -------------------------

#     data = {
#         "age": age,
#         "gender": gender,
#         "hypertension": hypertension,
#         "heart_disease": heart_disease,
#         "avg_glucose_level": avg_glucose_level,
#         "bmi": bmi,
#         "smoking_status": smoking_status,
#         "physical_activity_hours": physical_activity_hours,
#         "covid_infected": covid_infected,
#         "vaccination_doses": vaccination_doses,
#         "post_covid_fatigue": post_covid_fatigue,
#         "inflammation_marker": inflammation_marker,
#         "brain_fog": brain_fog,
#         "memory_loss": memory_loss,
#         "dizziness": dizziness
#     }

#     df = pd.DataFrame([data])

#     df["gender"] = df["gender"].lower()
#     df["smoking_status"] = df["smoking_status"].lower()

#     df["gender"] = df["gender"].map({
#         "male": 1,
#         "female": 0
#     })

#     df["smoking_status"] = df["smoking_status"].map({
#         "never smoked": 0,
#         "formerly smoked": 1,
#         "smokes": 2
#     })

#     scaled = scaler.transform(df)

#     stroke_probability = model.predict_proba(scaled)[0][1]


#     # -------------------------
#     # MRI MODEL
#     # -------------------------

#     contents = await file.read()

#     image = preprocess_mri(contents)

#     mri_prediction = cnn_model.predict(image)[0][0]

#     mri_result = "Disease Detected" if mri_prediction > 0.5 else "Normal"


#     # -------------------------
#     # HYBRID RISK FUSION
#     # -------------------------

#     if stroke_probability > 0.7 and mri_prediction > 0.6:
#         final_risk = "Severe High Risk"

#     elif stroke_probability > 0.7:
#         final_risk = "High Risk"

#     elif stroke_probability > 0.3 and mri_prediction > 0.6:
#         final_risk = "High Risk"

#     elif stroke_probability > 0.3:
#         final_risk = "Medium Risk"

#     elif mri_prediction > 0.6:
#         final_risk = "Medium Risk"

#     else:
#         final_risk = "Low Risk"


#     return {

#         "stroke_probability": float(stroke_probability),

#         "mri_probability": float(mri_prediction),

#         "mri_result": mri_result,

#         "final_risk": final_risk

#     }











# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# import pickle
# import pandas as pd
# import shap
# import numpy as np
# import tensorflow as tf
# from PIL import Image
# import io
# from fastapi import File, UploadFile

# app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Load model + scaler + encoder
# model = pickle.load(open("stroke_model.pkl", "rb"))
# scaler = pickle.load(open("scaler.pkl", "rb"))
# # encoder = pickle.load(open("encoder.pkl", "rb"))
# cnn_model = tf.keras.models.load_model("heart_mri_resnet50.h5")

# explainer = shap.TreeExplainer(model)

# @app.post("/predict")
# def predict(data: dict):

#     df = pd.DataFrame([data])

#     # Manual categorical encoding
#     df["gender"] = df["gender"].str.lower().map({
#         "male": 1,
#         "female": 0
#     })

#     df["smoking_status"] = df["smoking_status"].str.lower().map({
#         "never smoked": 0,
#         "formerly smoked": 1,
#         "smokes": 2
#     })

#     # # FORCE LOWERCASE BEFORE ENCODING
#     # df["gender"] = df["gender"].str.lower().str.strip()
#     # df["smoking_status"] = df["smoking_status"].str.lower().str.strip()

#     # # DEBUG PRINT (temporary)
#     # print("Incoming Gender:", df["gender"].values)
#     # print("Encoder Classes:", encoder.classes_)

#     # df["gender"] = encoder.transform(df["gender"])
#     # df["smoking_status"] = encoder.transform(df["smoking_status"])



#     scaled = scaler.transform(df)

#     prediction = model.predict(scaled)[0]
#     probability = model.predict_proba(scaled)[0][1]

#     # Risk level classification
#     if probability < 0.3:
#         risk_level = "Low Risk"
#     elif probability < 0.7:
#         risk_level = "Medium Risk"
#     else:
#         risk_level = "High Risk"

#     # SHAP explanation
#     shap_values = explainer.shap_values(scaled)
#     feature_importance = dict(
#         zip(df.columns.tolist(), shap_values[0].tolist())
#     )

#     # Sort top 5 features
#     top_features = sorted(
#         feature_importance.items(),
#         key=lambda x: abs(x[1]),
#         reverse=True
#     )[:5]

#     return {
#         "stroke_prediction": int(prediction),
#         "stroke_probability": float(probability),
#         "risk_level": risk_level,
#         "top_features": top_features
#     }

# @app.post("/predict_mri")
# async def predict_mri(file: UploadFile = File(...)):

#     contents = await file.read()
#     image = Image.open(io.BytesIO(contents)).convert("L").resize((224,224))

#     image = tf.keras.preprocessing.image.img_to_array(image)
#     image = tf.image.grayscale_to_rgb(image)
#     image = image / 255.0
#     image = tf.expand_dims(image, axis=0)

#     prediction = cnn_model.predict(image)[0][0]

#     result = "Heart Disease Detected" if prediction > 0.5 else "Normal"

#     return {
#         "mri_probability": float(prediction),
#         "mri_result": result
#     }

# @app.post("/predict_hybrid")
# async def predict_hybrid(
#     file: UploadFile = File(...),
#     age: float = Form(...),
#     gender: str = Form(...),
#     hypertension: int = Form(...),
#     heart_disease: int = Form(...),
#     avg_glucose_level: float = Form(...),
#     bmi: float = Form(...),
#     smoking_status: str = Form(...),
#     physical_activity_hours: float = Form(...),
#     covid_infected: int = Form(...),
#     vaccination_doses: float = Form(...),
#     post_covid_fatigue: int = Form(...),
#     inflammation_marker: int = Form(...),
#     brain_fog: int = Form(...),
#     memory_loss: int = Form(...),
#     dizziness: int = Form(...)
# ):

# final_risk = "Low"

# if stroke_probability > 0.7 or mri_prediction > 0.6:
#     final_risk = "High"
# elif stroke_probability > 0.3:
#     final_risk = "Medium"










# from fastapi import FastAPI
# import pickle
# import numpy as np
# import pandas as pd

# from fastapi.middleware.cors import CORSMiddleware

# # app.add_middleware(
# #     CORSMiddleware,
# #     allow_origins=["*"],
# #     allow_credentials=True,
# #     allow_methods=["*"],
# #     allow_headers=["*"],
# # )

# app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Load saved files
# model = pickle.load(open("stroke_model.pkl", "rb"))
# scaler = pickle.load(open("scaler.pkl", "rb"))
# encoder = pickle.load(open("encoder.pkl", "rb"))

# @app.get("/")
# def home():
#     return {"message": "Heart Stroke Prediction API Running"}

# @app.post("/predict")
# def predict(data: dict):

#     df = pd.DataFrame([data])

#     # Encode categorical
#     df["gender"] = encoder.fit_transform(df["gender"])
#     df["smoking_status"] = encoder.fit_transform(df["smoking_status"])

#     # Scale
#     scaled = scaler.transform(df)

#     prediction = model.predict(scaled)[0]
#     probability = model.predict_proba(scaled)[0][1]

#     return {
#         "stroke_prediction": int(prediction),
#         "stroke_probability": float(probability)
#     }

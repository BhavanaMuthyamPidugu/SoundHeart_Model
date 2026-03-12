"use client";

import { useState } from "react";
import axios from "axios";

export default function Dashboard() {

  const [form,setForm]=useState<any>({
    age:"",
    gender:"Male",
    hypertension:0,
    heart_disease:0,
    avg_glucose_level:"",
    bmi:"",
    smoking_status:"never smoked",
    physical_activity_hours:"",
    covid_infected:0,
    vaccination_doses:"",
    post_covid_fatigue:0,
    inflammation_marker:0,
    brain_fog:0,
    memory_loss:0,
    dizziness:0
  });

  const [mri,setMri]=useState<any>(null);
  const [preview,setPreview]=useState<any>(null);
  const [result,setResult]=useState<any>(null);

  const handleChange=(e:any)=>{

    const value=
      e.target.value==="Yes"?1:
      e.target.value==="No"?0:
      e.target.value;

    setForm({...form,[e.target.name]:value});
  };

  const handleFile=(e:any)=>{

    const file=e.target.files[0];
    setMri(file);

    if(file){
      setPreview(URL.createObjectURL(file));
    }

  };

  const handleSubmit=async()=>{

    const formData=new FormData();

    Object.keys(form).forEach((key)=>{
      formData.append(key,form[key]);
    });

    formData.append("file",mri);

    const response=await axios.post(
      "http://127.0.0.1:8000/predict_hybrid",
      formData,
      {headers:{'Content-Type':'multipart/form-data'}}
    );

    setResult(response.data);
  };

  const riskColor=(risk:string)=>{

    if(risk==="Low Risk") return "bg-green-500";
    if(risk==="Medium Risk") return "bg-yellow-500";
    if(risk==="High Risk") return "bg-orange-500";

    return "bg-red-600";
  };

  const yesNoFields=[

    {name:"hypertension",label:"Hypertension"},
    {name:"heart_disease",label:"Heart Disease"},
    {name:"covid_infected",label:"COVID Infected"},
    {name:"post_covid_fatigue",label:"Post COVID Fatigue"},
    {name:"inflammation_marker",label:"Inflammation Marker"},
    {name:"brain_fog",label:"Brain Fog"},
    {name:"memory_loss",label:"Memory Loss"},
    {name:"dizziness",label:"Dizziness"}

  ];

  return (

  <div className="relative min-h-screen flex items-center justify-center">

  {/* Background */}

  <div className="absolute inset-0">

  <img
  src="/heart_illustration1.jpeg"
  className="w-full h-full object-cover"
  />

  <div className="absolute inset-0 bg-gradient-to-br from-blue-200 via-white to-pink-200 opacity-70"></div>

  </div>

  <div className="relative z-10 w-full max-w-7xl p-6">

  {/* Header */}

  <div className="text-center mb-10">

  <h1 className="text-4xl font-bold text-blue-700">
  Sound Heart Check
  </h1>

  <p className="text-gray-700 mt-2">
  AI-Based Stroke & Cardio Risk Prediction Dashboard
  </p>

  </div>

  <div className="grid md:grid-cols-2 gap-8">

  {/* INPUT CARD */}

  <div className="glassCard">

  <h2 className="sectionTitle">
  Patient Parameters
  </h2>

  <div className="grid grid-cols-2 gap-4">

  <input className="inputField" name="age" placeholder="Age" onChange={handleChange}/>
  <input className="inputField" name="avg_glucose_level" placeholder="Glucose Level" onChange={handleChange}/>
  <input className="inputField" name="bmi" placeholder="BMI" onChange={handleChange}/>
  <input className="inputField" name="physical_activity_hours" placeholder="Activity Hours" onChange={handleChange}/>
  <input className="inputField" name="vaccination_doses" placeholder="Vaccination Doses" onChange={handleChange}/>

  <select name="gender" onChange={handleChange} className="inputField">
  <option>Male</option>
  <option>Female</option>
  </select>

  <select name="smoking_status" onChange={handleChange} className="inputField">
  <option>never smoked</option>
  <option>formerly smoked</option>
  <option>smokes</option>
  </select>

  </div>

  {/* YES NO */}

  <div className="grid grid-cols-2 gap-4 mt-6">

  {yesNoFields.map((field)=>(
  <div key={field.name}>
  <label className="label">{field.label}</label>

  <select name={field.name} onChange={handleChange} className="inputField">
  <option>No</option>
  <option>Yes</option>
  </select>

  </div>
  ))}

  </div>

  {/* MRI Upload */}

  <div className="uploadBox">

  <label className="uploadTitle">
  Upload MRI Scan
  </label>

  <input
  type="file"
  accept="image/*"
  onChange={handleFile}
  className="hidden"
  id="mriUpload"
  />

  <label htmlFor="mriUpload" className="uploadButton">

  {preview ? "Change MRI Image" : "Upload MRI Scan"}

  </label>

  {preview && (

  <img
  src={preview}
  className="previewImage"
  />

  )}

  </div>

  <button
  onClick={handleSubmit}
  className="analyzeButton"
  >
  Analyze Hybrid Risk
  </button>

  </div>


  {/* OUTPUT CARD */}

  <div className="glassCard">

  <h2 className="sectionTitlePink">
  Hybrid Analysis Result
  </h2>

  {result?(

  <>

  <p className="resultText">
  Stroke Probability:
  <b> {result.stroke_probability.toFixed(3)}</b>
  </p>

  <p className="resultText">
  MRI Probability:
  <b> {result.mri_probability.toFixed(3)}</b>
  </p>

  <p className="resultText">
  MRI Result:
  <b> {result.mri_result}</b>
  </p>

  <div className="mt-6">

  <span className={`riskBadge ${riskColor(result.final_risk)}`}>
  {result.final_risk}
  </span>

  </div>

  </>

  ):(

  <p className="text-gray-500">
  Upload MRI and enter patient parameters to analyze risk.
  </p>

  )}

  </div>

  </div>

  </div>

<style jsx>{`

.glassCard{
background:rgba(255,255,255,0.75);
backdrop-filter:blur(15px);
border-radius:30px;
padding:30px;
box-shadow:0 10px 40px rgba(0,0,0,0.1);
border:1px solid rgba(255,255,255,0.4);
}

.sectionTitle{
font-size:22px;
font-weight:600;
color:#2563eb;
margin-bottom:20px;
}

.sectionTitlePink{
font-size:22px;
font-weight:600;
color:#db2777;
margin-bottom:20px;
}

.inputField{
width:100%;
padding:10px;
border-radius:12px;
border:1px solid #cbd5e1;
background:#f9fafb;
}

.label{
font-size:14px;
font-weight:500;
}

.uploadBox{
margin-top:25px;
text-align:center;
}

.uploadTitle{
font-weight:600;
display:block;
margin-bottom:10px;
}

.uploadButton{
display:inline-block;
padding:10px 20px;
border-radius:20px;
background:linear-gradient(90deg,#2563eb,#ec4899);
color:white;
cursor:pointer;
font-weight:500;
}

.previewImage{
margin-top:15px;
border-radius:10px;
max-height:150px;
margin-left:auto;
margin-right:auto;
}

.analyzeButton{
margin-top:25px;
width:100%;
padding:12px;
border-radius:20px;
background:linear-gradient(90deg,#2563eb,#ec4899);
color:white;
font-weight:600;
transition:0.3s;
}

.analyzeButton:hover{
transform:scale(1.05);
}

.riskBadge{
padding:10px 20px;
border-radius:30px;
color:white;
font-weight:600;
}

.resultText{
margin-bottom:10px;
font-size:16px;
}

`}</style>

</div>

);

}











// "use client";

// import { useState } from "react";
// import axios from "axios";

// export default function Dashboard() {

// const [form,setForm]=useState<any>({
// age:"",
// gender:"Male",
// hypertension:0,
// heart_disease:0,
// avg_glucose_level:"",
// bmi:"",
// smoking_status:"never smoked",
// physical_activity_hours:"",
// covid_infected:0,
// vaccination_doses:"",
// post_covid_fatigue:0,
// inflammation_marker:0,
// brain_fog:0,
// memory_loss:0,
// dizziness:0
// });

// const [mri,setMri]=useState<any>(null);
// const [result,setResult]=useState<any>(null);

// const handleChange=(e:any)=>{

// const value=
// e.target.value==="Yes"?1:
// e.target.value==="No"?0:
// e.target.value;

// setForm({...form,[e.target.name]:value});

// };

// const handleFile=(e:any)=>{
// setMri(e.target.files[0]);
// };

// const handleSubmit=async()=>{

// const formData=new FormData();

// Object.keys(form).forEach((key)=>{
// formData.append(key,form[key]);
// });

// formData.append("file",mri);

// const response=await axios.post(
// "http://127.0.0.1:8000/predict_hybrid",
// formData,
// {headers:{'Content-Type':'multipart/form-data'}}
// );

// setResult(response.data);

// };

// const riskColor=(risk:string)=>{

// if(risk==="Low Risk") return "bg-green-500";
// if(risk==="Medium Risk") return "bg-yellow-500";
// if(risk==="High Risk") return "bg-orange-500";
// return "bg-red-600";

// };

// const yesNoFields=[

// {name:"hypertension",label:"Hypertension"},
// {name:"heart_disease",label:"Heart Disease"},
// {name:"covid_infected",label:"COVID Infected"},
// {name:"post_covid_fatigue",label:"Post COVID Fatigue"},
// {name:"inflammation_marker",label:"Inflammation Marker"},
// {name:"brain_fog",label:"Brain Fog"},
// {name:"memory_loss",label:"Memory Loss"},
// {name:"dizziness",label:"Dizziness"}

// ];

// return (

// <div className="min-h-screen flex items-center justify-center bg-gray-100">

// <div className="w-full max-w-7xl p-6 grid md:grid-cols-2 gap-8">

// {/* INPUT */}

// <div className="bg-white rounded-3xl shadow-xl p-8">

// <h2 className="text-xl font-bold mb-6">
// Patient Parameters
// </h2>

// <div className="grid grid-cols-2 gap-4">

// <input name="age" placeholder="Age" onChange={handleChange} className="inputField"/>

// <input name="avg_glucose_level" placeholder="Glucose" onChange={handleChange} className="inputField"/>

// <input name="bmi" placeholder="BMI" onChange={handleChange} className="inputField"/>

// <input name="physical_activity_hours" placeholder="Activity Hours" onChange={handleChange} className="inputField"/>

// <input name="vaccination_doses" placeholder="Vaccination Doses" onChange={handleChange} className="inputField"/>

// <select name="gender" onChange={handleChange} className="inputField">
// <option>Male</option>
// <option>Female</option>
// </select>

// <select name="smoking_status" onChange={handleChange} className="inputField">
// <option>never smoked</option>
// <option>formerly smoked</option>
// <option>smokes</option>
// </select>

// </div>

// <div className="grid grid-cols-2 gap-4 mt-6">

// {yesNoFields.map((field)=>(
// <select
// key={field.name}
// name={field.name}
// onChange={handleChange}
// className="inputField"
// >
// <option>No</option>
// <option>Yes</option>
// </select>
// ))}

// </div>

// {/* MRI Upload */}

// <div className="mt-6">

// <label className="font-semibold">
// Upload MRI Scan
// </label>

// <input
// type="file"
// accept="image/*"
// onChange={handleFile}
// className="mt-2"
// />

// </div>

// <button
// onClick={handleSubmit}
// className="mt-6 w-full bg-blue-600 text-white py-3 rounded-xl"
// >
// Analyze Hybrid Risk
// </button>

// </div>


// {/* OUTPUT */}

// <div className="bg-white rounded-3xl shadow-xl p-8">

// <h2 className="text-xl font-bold mb-6">
// Hybrid Analysis Result
// </h2>

// {result?(
// <>

// <p>
// Stroke Probability:
// <b> {result.stroke_probability.toFixed(3)}</b>
// </p>

// <p>
// MRI Probability:
// <b> {result.mri_probability.toFixed(3)}</b>
// </p>

// <p>
// MRI Result:
// <b> {result.mri_result}</b>
// </p>

// <div className="mt-4">

// <span className={`px-4 py-2 rounded-full text-white ${riskColor(result.final_risk)}`}>
// {result.final_risk}
// </span>

// </div>

// </>

// ):(

// <p className="text-gray-500">
// Fill form and upload MRI scan to analyze risk
// </p>

// )}

// </div>

// </div>

// <style jsx>{`

// .inputField{
// width:100%;
// padding:10px;
// border-radius:10px;
// border:1px solid #ccc;
// }

// `}</style>

// </div>

// );
// }











// "use client";

// import { useState } from "react";
// import axios from "axios";

// export default function Dashboard() {

//   const [form, setForm] = useState<any>({
//     age: "",
//     gender: "Male",
//     hypertension: 0,
//     heart_disease: 0,
//     avg_glucose_level: "",
//     bmi: "",
//     smoking_status: "never smoked",
//     physical_activity_hours: "",
//     covid_infected: 0,
//     vaccination_doses: "",
//     post_covid_fatigue: 0,
//     inflammation_marker: 0,
//     brain_fog: 0,
//     memory_loss: 0,
//     dizziness: 0
//   });

//   const [result, setResult] = useState<any>(null);

//   const handleChange = (e: any) => {
//     const value =
//       e.target.value === "Yes" ? 1 :
//       e.target.value === "No" ? 0 :
//       e.target.value;

//     setForm({ ...form, [e.target.name]: value });
//   };

//   const handleSubmit = async () => {
//     const response = await axios.post("http://127.0.0.1:8000/predict", form);
//     setResult(response.data);
//   };

//   const riskColor = (risk: string) => {
//     if (risk === "Low Risk") return "bg-green-500";
//     if (risk === "Medium Risk") return "bg-yellow-500";
//     return "bg-red-600";
//   };

//   const yesNoFields = [
//     { name: "hypertension", label: "Hypertension" },
//     { name: "heart_disease", label: "Heart Disease" },
//     { name: "covid_infected", label: "COVID Infected" },
//     { name: "post_covid_fatigue", label: "Post COVID Fatigue" },
//     { name: "inflammation_marker", label: "Inflammation Marker" },
//     { name: "brain_fog", label: "Brain Fog" },
//     { name: "memory_loss", label: "Memory Loss" },
//     { name: "dizziness", label: "Dizziness" }
//   ];

//   return (
//     <div className="relative min-h-screen flex items-center justify-center">

//       {/* Background Image */}
//       <div className="absolute inset-0">
//         <img
//           src="/heart_illustration1.jpeg"
//           className="w-full h-full object-cover opacity-100"
//           alt="background"
//         />
//         <div className="absolute inset-0 bg-gradient-to-br from-blue-200 via-white to-pink-200 opacity-70"></div>
//       </div>

//       <div className="relative z-10 w-full max-w-7xl p-6">

//         {/* Header */}
//         <div className="text-center mb-10">
//           <h1 className="text-4xl font-bold text-blue-700">
//             Sound Heart Check
//           </h1>
//           <p className="text-gray-700 mt-2">
//             AI-Based Stroke & Cardio Risk Prediction Dashboard
//           </p>
//         </div>

//         {/* Two Glass Cards Side-by-Side */}
//         <div className="grid md:grid-cols-2 gap-8">

//           {/* INPUT CARD */}
//           <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-blue-200">

//             <h2 className="text-2xl font-semibold text-blue-600 mb-6">
//               Patient Parameters
//             </h2>

//             <div className="grid grid-cols-2 gap-4">

//               <div>
//                 <label className="label">Age</label>
//                 <input className="inputField" name="age" onChange={handleChange}/>
//               </div>

//               <div>
//                 <label className="label">Glucose Level</label>
//                 <input className="inputField" name="avg_glucose_level" onChange={handleChange}/>
//               </div>

//               <div>
//                 <label className="label">BMI</label>
//                 <input className="inputField" name="bmi" onChange={handleChange}/>
//               </div>

//               <div>
//                 <label className="label">Activity Hours</label>
//                 <input className="inputField" name="physical_activity_hours" onChange={handleChange}/>
//               </div>

//               <div>
//                 <label className="label">Vaccination Doses</label>
//                 <input className="inputField" name="vaccination_doses" onChange={handleChange}/>
//               </div>

//               <div>
//                 <label className="label">Gender</label>
//                 <select name="gender" onChange={handleChange} className="inputField">
//                   <option>Male</option>
//                   <option>Female</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="label">Smoking Status</label>
//                 <select name="smoking_status" onChange={handleChange} className="inputField">
//                   <option>never smoked</option>
//                   <option>formerly smoked</option>
//                   <option>smokes</option>
//                 </select>
//               </div>

//             </div>

//             {/* YES/NO Section */}
//             <div className="grid grid-cols-2 gap-4 mt-6">
//               {yesNoFields.map((field) => (
//                 <div key={field.name}>
//                   <label className="label">{field.label}</label>
//                   <select
//                     name={field.name}
//                     onChange={handleChange}
//                     className="inputField"
//                   >
//                     <option>No</option>
//                     <option>Yes</option>
//                   </select>
//                 </div>
//               ))}
//             </div>

//             <button
//               onClick={handleSubmit}
//               className="mt-8 w-full bg-gradient-to-r from-blue-600 to-pink-500 text-white py-3 rounded-2xl font-semibold shadow-lg hover:scale-105 transition"
//             >
//               Analyze Risk
//             </button>

//           </div>

//           {/* OUTPUT CARD */}
//           <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-pink-200">

//             <h2 className="text-2xl font-semibold text-pink-600 mb-6">
//               Analysis Result
//             </h2>

//             {result ? (
//               <>
//                 <div className="mb-4">
//                   <span className="font-semibold text-lg">Risk Level: </span>
//                   <span className={`px-4 py-1 rounded-full text-white ${riskColor(result.risk_level)}`}>
//                     {result.risk_level}
//                   </span>
//                 </div>

//                 <p className="mb-6">
//                   Probability: <span className="font-bold">{result.stroke_probability.toFixed(4)}</span>
//                 </p>

//                 <h3 className="font-semibold mb-3 text-blue-600">
//                   Top Contributing Factors
//                 </h3>

//                 <ul className="space-y-2">
//                   {result.top_features.map((feature: any, index: number) => (
//                     <li key={index} className="flex justify-between bg-blue-50 px-3 py-2 rounded-xl">
//                       <span>{feature[0]}</span>
//                       <span className="font-semibold">
//                         {feature[1] > 0 ? "+" : ""}
//                         {feature[1].toFixed(3)}
//                       </span>
//                     </li>
//                   ))}
//                 </ul>
//               </>
//             ) : (
//               <p className="text-gray-500">
//                 Fill patient details and click Analyze to view results.
//               </p>
//             )}

//           </div>

//         </div>
//       </div>

//       <style jsx>{`
//         .inputField {
//           width: 100%;
//           padding: 10px;
//           border-radius: 12px;
//           border: 1px solid #cbd5e1;
//           background: #f9fafb;
//           outline: none;
//         }
//         .inputField:focus {
//           border-color: #3b82f6;
//           box-shadow: 0 0 0 2px #bfdbfe;
//         }
//         .label {
//           font-size: 14px;
//           font-weight: 500;
//           color: #334155;
//           display: block;
//           margin-bottom: 4px;
//         }
//       `}</style>
//     </div>
//   );
// }














// "use client";

// import { useState } from "react";
// import axios from "axios";

// export default function Dashboard() {

//   const [form, setForm] = useState<any>({
//     age: "",
//     gender: "Male",
//     hypertension: 0,
//     heart_disease: 0,
//     avg_glucose_level: "",
//     bmi: "",
//     smoking_status: "never smoked",
//     physical_activity_hours: "",
//     covid_infected: 0,
//     vaccination_doses: "",
//     post_covid_fatigue: 0,
//     inflammation_marker: 0,
//     brain_fog: 0,
//     memory_loss: 0,
//     dizziness: 0
//   });

//   const [result, setResult] = useState<any>(null);

//   const handleChange = (e: any) => {
//     const value =
//       e.target.value === "Yes" ? 1 :
//       e.target.value === "No" ? 0 :
//       e.target.value;

//     setForm({ ...form, [e.target.name]: value });
//   };

//   const handleSubmit = async () => {
//     const response = await axios.post("http://127.0.0.1:8000/predict", form);
//     setResult(response.data);
//   };

//   const riskColor = (risk: string) => {
//     if (risk === "Low Risk") return "bg-green-500";
//     if (risk === "Medium Risk") return "bg-yellow-500";
//     return "bg-red-600";
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-pink-100 p-6">

//       <div className="max-w-7xl mx-auto">

//         {/* HEADER */}
//         <div className="text-center mb-10">
//           <h1 className="text-4xl font-bold text-blue-700">
//             Sound Heart Check
//           </h1>
//           <p className="text-gray-600 mt-2">
//             AI-Powered Stroke & Cardio Risk Assessment System
//           </p>
//         </div>

//         {/* MAIN GRID */}
//         <div className="grid md:grid-cols-2 gap-10 items-start">

//           {/* LEFT: INPUT FORM */}
//           <div className="bg-white/70 backdrop-blur-xl shadow-2xl rounded-3xl p-8 border border-blue-100">

//             <h2 className="text-2xl font-semibold text-blue-600 mb-6">
//               Patient Parameters
//             </h2>

//             <div className="grid grid-cols-2 gap-4">

//               <input className="inputField" name="age" placeholder="Age" onChange={handleChange}/>
//               <input className="inputField" name="avg_glucose_level" placeholder="Glucose Level" onChange={handleChange}/>
//               <input className="inputField" name="bmi" placeholder="BMI" onChange={handleChange}/>
//               <input className="inputField" name="physical_activity_hours" placeholder="Activity Hours" onChange={handleChange}/>
//               <input className="inputField" name="vaccination_doses" placeholder="Vaccination Doses" onChange={handleChange}/>

//               {/* Dropdowns */}
//               <select name="gender" onChange={handleChange} className="inputField">
//                 <option>Male</option>
//                 <option>Female</option>
//               </select>

//               <select name="smoking_status" onChange={handleChange} className="inputField">
//                 <option>never smoked</option>
//                 <option>formerly smoked</option>
//                 <option>smokes</option>
//               </select>

//               {[
//                 "hypertension",
//                 "heart_disease",
//                 "covid_infected",
//                 "post_covid_fatigue",
//                 "inflammation_marker",
//                 "brain_fog",
//                 "memory_loss",
//                 "dizziness"
//               ].map((field) => (
//                 <select key={field} name={field} onChange={handleChange} className="inputField">
//                   <option>No</option>
//                   <option>Yes</option>
//                 </select>
//               ))}

//             </div>

//             <button
//               onClick={handleSubmit}
//               className="mt-8 w-full bg-gradient-to-r from-blue-600 to-pink-500 text-white py-3 rounded-2xl font-semibold shadow-lg hover:scale-105 transition"
//             >
//               Analyze Stroke Risk
//             </button>

//             {/* RESULT SECTION */}
//             {result && (
//               <div className="mt-8 p-6 bg-white rounded-2xl shadow-lg border">

//                 <h3 className="text-xl font-semibold mb-2">
//                   Risk Level:
//                   <span className={`ml-3 px-4 py-1 rounded-full text-white ${riskColor(result.risk_level)}`}>
//                     {result.risk_level}
//                   </span>
//                 </h3>

//                 <p className="text-gray-700">
//                   Probability: <span className="font-bold">{result.stroke_probability.toFixed(4)}</span>
//                 </p>

//                 <h4 className="mt-6 font-semibold text-blue-600">
//                   Top Contributing Factors:
//                 </h4>

//                 <ul className="mt-2 space-y-2">
//                   {result.top_features.map((feature: any, index: number) => (
//                     <li key={index} className="flex justify-between bg-blue-50 px-3 py-2 rounded-xl">
//                       <span>{feature[0]}</span>
//                       <span className="font-semibold">
//                         {feature[1] > 0 ? "+" : ""}
//                         {feature[1].toFixed(3)}
//                       </span>
//                     </li>
//                   ))}
//                 </ul>

//               </div>
//             )}

//           </div>

//           {/* RIGHT: HERO IMAGE */}
//           <div className="flex justify-center">
//             <img
//               src="/heart_illustration.jpeg"
//               alt="Heart Illustration"
//               className="w-full max-w-md drop-shadow-2xl"
//             />
//           </div>

//         </div>

//       </div>

//       {/* Tailwind Input Style */}
//       <style jsx>{`
//         .inputField {
//           padding: 10px;
//           border-radius: 12px;
//           border: 1px solid #dbeafe;
//           background: #f9fafb;
//           outline: none;
//         }
//         .inputField:focus {
//           border-color: #3b82f6;
//           box-shadow: 0 0 0 2px #bfdbfe;
//         }
//       `}</style>

//     </div>
//   );
// }













// "use client";

// import { useState } from "react";
// import axios from "axios";

// export default function Dashboard() {

//   const [form, setForm] = useState<any>({
//     age: "",
//     gender: "Male",
//     hypertension: 0,
//     heart_disease: 0,
//     avg_glucose_level: "",
//     bmi: "",
//     smoking_status: "never smoked",
//     physical_activity_hours: "",
//     covid_infected: 0,
//     vaccination_doses: "",
//     post_covid_fatigue: 0,
//     inflammation_marker: 0,
//     brain_fog: 0,
//     memory_loss: 0,
//     dizziness: 0
//   });

//   const [result, setResult] = useState<any>(null);

//   const handleChange = (e: any) => {
//     setForm({...form, [e.target.name]: e.target.value});
//   };

//   const handleSubmit = async () => {
//     const response = await axios.post("http://127.0.0.1:8000/predict", form);
//     setResult(response.data);
//   };

//   const riskColor = (risk: string) => {
//     if (risk === "Low Risk") return "bg-green-500";
//     if (risk === "Medium Risk") return "bg-yellow-500";
//     return "bg-red-600";
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 p-10">
//       <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-2xl p-8">

//         <h1 className="text-3xl font-bold mb-6 text-center">
//           Sound Heart Check – Stroke Risk Analyzer
//         </h1>

//         <div className="grid grid-cols-2 gap-4">

//           <input className="input" name="age" placeholder="Age" onChange={handleChange}/>
//           <input className="input" name="hypertension" placeholder="HyperTension" onChange={handleChange}/>
//           <select name="heart_disease" onChange={handleChange} className="input">
//             <option>No</option>
//             <option>Yes</option>
//           </select>
//           {/* <input className="input" name="heart_disease" placeholder="Heart" onChange={handleChange}/> */}

//           <input className="input" name="avg_glucose_level" placeholder="Glucose Level" onChange={handleChange}/>
//           <input className="input" name="bmi" placeholder="BMI" onChange={handleChange}/>
//           <input className="input" name="physical_activity_hours" placeholder="Activity Hours" onChange={handleChange}/>

//           {/* <input className="input" name="covid_infected" placeholder="Age" onChange={handleChange}/>
//           <input className="input" name="post_covid_fatigue" placeholder="Age" onChange={handleChange}/> */}
//           <select name="covid_infected" onChange={handleChange} className="input">
//             <option>No</option>
//             <option>Yes</option>
//           </select>
//           <select name="post_covid_fatigue" onChange={handleChange} className="input">
//             <option>No</option>
//             <option>Yes</option>
//           </select>
//           <input className="input" name="vaccination_doses" placeholder="Vaccination Doses" onChange={handleChange}/>

//           <select name="inflammation_marker" onChange={handleChange} className="input">
//             <option>No</option>
//             <option>Yes</option>
//           </select>
//           <select name="brain_fog" onChange={handleChange} className="input">
//             <option>No</option>
//             <option>Yes</option>
//           </select>

//           <select name="memory_loss" onChange={handleChange} className="input">
//             <option>No</option>
//             <option>Yes</option>
//           </select>
//           <select name="dizziness" onChange={handleChange} className="input">
//             <option>No</option>
//             <option>Yes</option>
//           </select>


//           <select name="gender" onChange={handleChange} className="input">
//             <option>Male</option>
//             <option>Female</option>
//           </select>

//           <select name="smoking_status" onChange={handleChange} className="input">
//             <option>never smoked</option>
//             <option>formerly smoked</option>
//             <option>smokes</option>
//           </select>

//         </div>

//         <button
//           onClick={handleSubmit}
//           className="mt-6 w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700"
//         >
//           Analyze Stroke Risk
//         </button>

//         {result && (
//           <div className="mt-8 p-6 border rounded-xl">

//             <h2 className="text-xl font-semibold">
//               Risk Level:
//               <span className={`ml-3 px-3 py-1 rounded text-white ${riskColor(result.risk_level)}`}>
//                 {result.risk_level}
//               </span>
//             </h2>

//             <p className="mt-2">
//               Probability: {result.stroke_probability.toFixed(4)}
//             </p>

//             <h3 className="mt-6 font-bold">Top Contributing Factors:</h3>

//             <ul className="list-disc ml-6">
//               {result.top_features.map((feature: any, index: number) => (
//                 <li key={index}>
//                   {feature[0]} (Impact: {feature[1].toFixed(3)})
//                 </li>
//               ))}
//             </ul>

//           </div>
//         )}
//       </div>
//     </div>
//   );
// }












// "use client";

// import { useState, ChangeEvent } from "react";
// import axios from "axios";

// type PredictionResponse = {
//   stroke_prediction: number;
//   stroke_probability: number;
// };

// export default function Home() {

//   const [form, setForm] = useState({
//     age: "",
//     gender: "",
//     hypertension: "",
//     heart_disease: "",
//     avg_glucose_level: "",
//     bmi: "",
//     smoking_status: "",
//     physical_activity_hours: "",
//     covid_infected: "",
//     vaccination_doses: "",
//     post_covid_fatigue: "",
//     inflammation_marker: "",
//     brain_fog: "",
//     memory_loss: "",
//     dizziness: ""
//   });

//   const [result, setResult] = useState<PredictionResponse | null>(null);

//   const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
//     setForm({
//       ...form,
//       [e.target.name]: e.target.value
//     });
//   };

//   const handleSubmit = async () => {
//     try {
//       const response = await axios.post<PredictionResponse>(
//         "http://127.0.0.1:8000/predict",
//         {
//           ...form,
//           age: Number(form.age),
//           hypertension: Number(form.hypertension),
//           heart_disease: Number(form.heart_disease),
//           avg_glucose_level: Number(form.avg_glucose_level),
//           bmi: Number(form.bmi),
//           physical_activity_hours: Number(form.physical_activity_hours),
//           covid_infected: Number(form.covid_infected),
//           vaccination_doses: Number(form.vaccination_doses),
//           post_covid_fatigue: Number(form.post_covid_fatigue),
//           inflammation_marker: Number(form.inflammation_marker),
//           brain_fog: Number(form.brain_fog),
//           memory_loss: Number(form.memory_loss),
//           dizziness: Number(form.dizziness)
//         }
//       );

//       setResult(response.data);

//     } catch (error) {
//       console.error("Prediction error:", error);
//     }
//   };

//   return (
//     <div style={{ padding: 40 }}>
//       <h1>Heart Stroke Risk Predictor</h1>

//       {Object.keys(form).map((field) => (
//         <div key={field} style={{ marginBottom: 10 }}>
//           <input
//             type="text"
//             name={field}
//             placeholder={field}
//             value={form[field as keyof typeof form]}
//             onChange={handleChange}
//             style={{ padding: 8, width: 300 }}
//           />
//         </div>
//       ))}

//       <button
//         onClick={handleSubmit}
//         style={{
//           padding: 10,
//           backgroundColor: "blue",
//           color: "white",
//           border: "none",
//           cursor: "pointer"
//         }}
//       >
//         Predict
//       </button>

//       {result && (
//         <div style={{ marginTop: 20 }}>
//           <h2>
//             Prediction: {result.stroke_prediction === 1 ? "High Risk" : "Low Risk"}
//           </h2>
//           <h3>Probability: {result.stroke_probability.toFixed(4)}</h3>
//         </div>
//       )}
//     </div>
//   );
// }

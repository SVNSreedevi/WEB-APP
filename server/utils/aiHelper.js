const axios = require('axios');

/**
 * Helper to call the Python AI Inference Service
 * @param {Object} data The collected input fields
 * @returns {Object} { riskLevel, confidence }
 */
exports.predictRiskLevel = async (data) => {
  try {
    const payload = {
      Age: Number(data.Age) || 0,
      Gender: data.Gender || 'Other',
      Weight_kg: Number(data.Weight_kg) || 0,
      Blood_Group: data.Blood_Group || 'O+',
      Surgery_Type: data.Surgery_Type || 'Unknown',
      Small_Gauze_Count: Number(data.Small_Gauze_Count) || 0,
      Small_Gauze_Value_ml: Number(data.Small_Gauze_Value_ml) || 0,
      Large_Gauze_Count: Number(data.Large_Gauze_Count) || 0,
      Large_Gauze_Value_ml: Number(data.Large_Gauze_Value_ml) || 0,
      Suction_ml: Number(data.Suction_ml) || 0,
      Irrigation_ml: Number(data.Irrigation_ml) || 0,
      Duration_hr: Number(data.Duration_hr) || 0,
      Urine_Collected_ml: Number(data.Urine_Collected_ml) || 0
    };

    const response = await axios.post('http://127.0.0.1:5001/predict', payload, {
      timeout: 15000 // 15 seconds timeout
    });

    if (response.data && response.data.success) {
      return {
        riskLevel: response.data.risk_level,
        confidence: response.data.confidence
      };
    } else {
      console.error('Python AI Service returned an error:', response.data);
      return { riskLevel: 'Unknown', confidence: 0 };
    }
  } catch (error) {
    console.error('Error connecting to Python AI Service:', error.message);
    return { riskLevel: 'Unknown', confidence: 0 };
  }
};

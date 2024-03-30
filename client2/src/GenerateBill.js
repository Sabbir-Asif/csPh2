import React, { useState } from 'react';
import axios from 'axios';
import './index.css'; // Make sure you have this CSS file for basic styling

const GenerateBill = () => {
  // Form data state
  const [data, setData] = useState({
    registrationNumber: '',
    wardNumber: '',
    arrivalTime: '',
    departureTime: '',
    distance: '',
    time: '',
    weight: '',
  });

  // State for storing the server's response
  const [response, setResponse] = useState(null);

  // State for storing any errors
  const [error, setError] = useState('');

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Convert numeric fields to numbers
    const isNumeric = ['wardNumber', 'arrivalTime', 'departureTime', 'distance', 'time', 'weight'].includes(name);
    setData({ ...data, [name]: isNumeric ? parseFloat(value) || 0 : value });
  };

  // Submit form data
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data: responseData } = await axios.post('http://localhost:8080/api/bills', data);
      setResponse(responseData);
    } catch (error) {
      console.error(error);
      setError('Failed to generate bill. Please try again.');
    }
  };

  return (
    <div className="form-container">
      <h1>Generate Bill</h1>
      <form onSubmit={handleSubmit}>
        {/* Input fields */}
        <input type="text" placeholder="Registration Number" name="registrationNumber" onChange={handleChange} value={data.registrationNumber} required />
        <input type="number" placeholder="Ward Number" name="wardNumber" onChange={handleChange} value={data.wardNumber} required />
        <input type="number" placeholder="Arrival Time" name="arrivalTime" onChange={handleChange} value={data.arrivalTime} required />
        <input type="number" placeholder="Departure Time" name="departureTime" onChange={handleChange} value={data.departureTime} required />
        <input type="number" placeholder="Distance" name="distance" onChange={handleChange} value={data.distance} required />
        <input type="number" placeholder="Time" name="time" onChange={handleChange} value={data.time} required />
        <input type="number" placeholder="Weight" name="weight" onChange={handleChange} value={data.weight} required />
        <button type="submit">Generate Bill</button>
      </form>
      {error && <p className="error">{error}</p>}
      {response && (
        <table>
          <tbody>
            <tr><th>Field</th><th>Value</th></tr>
            {Object.entries(response).map(([key, value]) => (
              <tr key={key}><td>{key}</td><td>{value.toString()}</td></tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default GenerateBill;

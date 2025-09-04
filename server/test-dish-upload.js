// test-dish-upload.js
// Run this with: node test-dish-upload.js

const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');
const path = require('path');

async function testDishUpload() {
  try {
    // Create form data
    const form = new FormData();
    
    // Add your test data
    form.append('restaurantId', '688e664f894856c3ed40bb2a'); // Replace with actual restaurant ID
    form.append('name', 'Test Pizza');
    form.append('description', 'Delicious test pizza');
    form.append('price', '15.99');
    form.append('discountPrice', '12.99');
    form.append('isVeg', 'true');
    form.append('category', 'Pizza');
    form.append('isAvailable', 'true');
    form.append('addons', JSON.stringify([
      { name: 'Extra Cheese', price: 2.5 },
      { name: 'Pepperoni', price: 3.0 }
    ]));
    
    // Add image file (make sure this file exists)
    const imagePath = path.join(__dirname, 'pizza.png'); // Create or use an actual image file
    if (fs.existsSync(imagePath)) {
      form.append('image', fs.createReadStream(imagePath));
    } else {
      console.error('Test image not found at:', imagePath);
      console.log('Please create a test image file at:', imagePath);
      return;
    }
    
    // Add your actual auth token here
    const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4OGU2NjRmODk0ODU2YzNlZDQwYmIyYSIsInJvbGUiOiJyZXN0YXVyYW50X293bmVyIiwiaWF0IjoxNzU0MTYyODA0LCJleHAiOjE3NTQyNDkyMDR9.uNRE16E3M5fG0aLobV3jHrux4x4BJw72s-gosWa-Upc';
    
    const response = await axios.post('http://localhost:3000/api/dishes/add', form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log('Success:', response.data);
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testDishUpload();
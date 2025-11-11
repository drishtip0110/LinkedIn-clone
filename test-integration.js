#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testIntegration() {
  console.log('🧪 Testing Backend Integration...\n');

  try {
    // Test 1: Basic server health
    console.log('1. Testing server health...');
    const healthResponse = await axios.get(`${BASE_URL}/test`);
    console.log('✅ Server is running:', healthResponse.data.message);

    // Test 2: Register a test user
    console.log('\n2. Testing user registration...');
    const testUser = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'password123'
    };

    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, testUser);
    console.log('✅ User registered successfully');
    
    const { token, user } = registerResponse.data;
    console.log('   User ID:', user.id);
    console.log('   Token received:', token ? 'Yes' : 'No');

    // Test 3: Login with the test user
    console.log('\n3. Testing user login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    console.log('✅ User login successful');

    // Test 4: Get current user (protected route)
    console.log('\n4. Testing protected route...');
    const meResponse = await axios.get(`${BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Protected route working');
    console.log('   Current user:', meResponse.data.user.name);

    // Test 5: Create a test post
    console.log('\n5. Testing post creation...');
    const postResponse = await axios.post(`${BASE_URL}/posts`, {
      content: 'This is a test post from integration test!'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Post created successfully');
    console.log('   Post ID:', postResponse.data.post._id);

    // Test 6: Get all posts
    console.log('\n6. Testing posts retrieval...');
    const postsResponse = await axios.get(`${BASE_URL}/posts`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Posts retrieved successfully');
    console.log('   Total posts:', postsResponse.data.count);

    console.log('\n🎉 All integration tests passed!');
    console.log('\n📝 Next steps:');
    console.log('   1. Start the frontend: cd frontend && npm run dev');
    console.log('   2. Open http://localhost:5173 in your browser');
    console.log('   3. Register a new account and test the full application');

  } catch (error) {
    console.error('\n❌ Integration test failed:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Message:', error.response.data.message || error.response.data);
    } else if (error.request) {
      console.error('   No response received. Is the server running?');
      console.error('   Make sure to start the backend server first: cd backend && npm start');
    } else {
      console.error('   Error:', error.message);
    }
    process.exit(1);
  }
}

// Check if axios is available
try {
  require('axios');
} catch (error) {
  console.error('❌ axios is not installed. Please run: npm install axios');
  process.exit(1);
}

testIntegration();
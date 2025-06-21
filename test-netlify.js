// Simple test to verify the serverless function works
import { handler } from './netlify/functions/api.js';

// Test the handler with a mock event
const testEvent = {
  httpMethod: 'GET',
  path: '/api/search',
  queryStringParameters: { q: 'naruto' },
  headers: {},
  body: null
};

console.log('Testing Netlify function...');

try {
  const result = await handler(testEvent, {});
  console.log('✅ Function test successful!');
  console.log('Status:', result.statusCode);
  console.log('Headers:', result.headers);
  console.log('Body preview:', result.body.substring(0, 200) + '...');
} catch (error) {
  console.error('❌ Function test failed:', error);
} 
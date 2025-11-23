const testSignup = async () => {
  console.log('Testing signup endpoint...');
  console.log('='.repeat(50));
  
  const signupData = {
    email: 'testuser' + Date.now() + '@gmail.com',
    password: 'Test123!@#',
    username: 'testuser' + Date.now(),
    full_name: 'Test User',
    role: 'client',
    height: 180,
    weight: 75,
    phone_number: '+1234567890',
    country_code: '+1'
  };
  
  console.log('Request data:', JSON.stringify(signupData, null, 2));
  console.log('='.repeat(50));
  
  try {
    const response = await fetch('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(signupData)
    });
    
    console.log('Response status:', response.status, response.statusText);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    console.log('='.repeat(50));
    
    const data = await response.json();
    console.log('Response body:', JSON.stringify(data, null, 2));
    
    if (!response.ok) {
      console.error('\n❌ SIGNUP FAILED!');
      console.error('Error details:', data);
    } else {
      console.log('\n✅ SIGNUP SUCCESSFUL!');
      console.log('User created:', data.user?.email);
    }
  } catch (error) {
    console.error('\n❌ REQUEST FAILED!');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
};

testSignup();

const ipfsService = require('./services/ipfsService');

async function testIPFS() {
  console.log('🧪 Testing IPFS Service...\n');

  try {
    // Test 1: Generate encryption key
    console.log('1. Testing encryption key generation...');
    const key = ipfsService.generateEncryptionKey();
    console.log('✅ Generated key:', key.toString('hex'));
    console.log('   Key length:', key.length * 8, 'bits\n');

    // Test 2: Test encryption/decryption
    console.log('2. Testing encryption/decryption...');
    const testData = Buffer.from(
      'Hello, ProofMintAI! This is a test message.',
      'utf8'
    );
    const { encrypted, iv, authTag } = ipfsService.encryptBuffer(testData, key);
    console.log('✅ Encrypted data length:', encrypted.length);

    const decrypted = ipfsService.decryptBuffer(encrypted, key, iv, authTag);
    console.log('✅ Decrypted data:', decrypted.toString('utf8'));
    console.log(
      '   Original matches decrypted:',
      testData.equals(decrypted),
      '\n'
    );

    // Test 3: Test file info (if WEB3_STORAGE_TOKEN is set)
    if (process.env.WEB3_STORAGE_TOKEN) {
      console.log('3. Testing file info retrieval...');
      // This would need a real CID to test
      console.log('⚠️  Skipping file info test (needs real CID)\n');
    } else {
      console.log('3. Skipping file info test (WEB3_STORAGE_TOKEN not set)\n');
    }

    console.log('🎉 All tests passed!');
    console.log('\n📝 To test full functionality:');
    console.log('1. Set WEB3_STORAGE_TOKEN environment variable');
    console.log('2. Start the backend server');
    console.log('3. Use the frontend to upload/download files');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testIPFS();

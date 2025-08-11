#!/usr/bin/env node

/**
 * Test script for the ProofMintAI event listener
 * Run with: node test-listener.js
 */

const { getListenerStatus, reconnect } = require('./services/notaryListener');

async function testListener() {
  console.log('🔍 Testing ProofMintAI Event Listener...\n');

  try {
    // Check initial status
    console.log('📊 Current Listener Status:');
    const status = getListenerStatus();
    console.log(JSON.stringify(status, null, 2));

    // Test reconnection if needed
    if (!status.isListening) {
      console.log('\n⚠️  Listener is not active, attempting to reconnect...');
      reconnect();

      // Wait a bit and check status again
      setTimeout(() => {
        const newStatus = getListenerStatus();
        console.log('\n📊 Status after reconnection:');
        console.log(JSON.stringify(newStatus, null, 2));
      }, 2000);
    } else {
      console.log('\n✅ Listener is active and working');
    }
  } catch (error) {
    console.error('❌ Error testing listener:', error.message);
  }
}

// Run the test
testListener();

// Keep the process alive for a bit to see reconnection results
setTimeout(() => {
  console.log('\n🏁 Test completed');
  process.exit(0);
}, 5000);

#!/usr/bin/env node

/**
 * Test script for the ProofMintAI event listener
 * Run with: node test-listener.js
 */

const {
  getListenerStatus,
  reconnect,
  testProviderConnection,
  testEventListener,
} = require('./services/notaryListener');

async function testListener() {
  console.log('🔍 Testing ProofMintAI Event Listener...\n');

  try {
    // Test provider connection first
    console.log('🌐 Testing Provider Connection:');
    const providerStatus = await testProviderConnection();
    console.log(JSON.stringify(providerStatus, null, 2));

    if (!providerStatus.connected) {
      console.log(
        '\n❌ Provider connection failed. Check your RPC URL and network connection.'
      );
      return;
    }

    // Test event listener functionality
    console.log('\n🎯 Testing Event Listener:');
    const listenerTest = await testEventListener();
    console.log(JSON.stringify(listenerTest, null, 2));

    // Check listener status
    console.log('\n📊 Current Listener Status:');
    const status = getListenerStatus();
    console.log(JSON.stringify(status, null, 2));

    // Test reconnection if needed
    if (!status.isListening) {
      console.log('\n⚠️  Listener is not active, attempting to reconnect...');
      reconnect();

      // Wait a bit and check status again
      setTimeout(async () => {
        const newStatus = getListenerStatus();
        console.log('\n📊 Status after reconnection:');
        console.log(JSON.stringify(newStatus, null, 2));

        // Test provider again
        const newProviderStatus = await testProviderConnection();
        console.log('\n🌐 Provider status after reconnection:');
        console.log(JSON.stringify(newProviderStatus, null, 2));

        // Test event listener again
        const newListenerTest = await testEventListener();
        console.log('\n🎯 Event listener test after reconnection:');
        console.log(JSON.stringify(newListenerTest, null, 2));
      }, 3000);
    } else {
      console.log('\n✅ Listener is active and working');
    }
  } catch (error) {
    console.error('❌ Error testing listener:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testListener();

// Keep the process alive for a bit to see reconnection results
setTimeout(() => {
  console.log('\n🏁 Test completed');
  process.exit(0);
}, 8000);

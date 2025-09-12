const { scanPorts } = require('./dist/lib/port-scanner');

async function testScan() {
  try {
    console.log('Starting test scan...');
    const results = await scanPorts('127.0.0.1');
    console.log('Scan results:', JSON.stringify(results, null, 2));
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testScan();

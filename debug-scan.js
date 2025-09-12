const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function testNmap() {
  try {
    console.log('1. Testing Nmap availability...');
    
    // Test 1: Basic Nmap version check
    try {
      const { stdout: version } = await execAsync('nmap --version');
      console.log('✅ Nmap version:', version.split('\n')[0]);
    } catch (e) {
      console.error('❌ Nmap not found in PATH');
      console.error('Error:', e.message);
      return;
    }

    // Test 2: Test with direct path
    console.log('\n2. Testing with direct path...');
    const nmapPath = 'C:\\Program Files (x86)\\Nmap\\nmap.exe';
    try {
      const { stdout } = await execAsync(`"${nmapPath}" --version`);
      console.log(`✅ Nmap found at: ${nmapPath}`);
      console.log('Version:', stdout.split('\n')[0]);
    } catch (e) {
      console.error(`❌ Nmap not found at: ${nmapPath}`);
      console.error('Error:', e.message);
    }

    // Test 3: Try a simple scan
    console.log('\n3. Trying a simple scan...');
    try {
      const { stdout, stderr } = await execAsync(`"${nmapPath}" -Pn -p 80,443 --open 127.0.0.1`);
      console.log('✅ Scan completed successfully');
      console.log('Output:', stdout);
      if (stderr) console.log('Errors:', stderr);
    } catch (e) {
      console.error('❌ Scan failed');
      console.error('Error:', e.message);
      if (e.stderr) console.error('stderr:', e.stderr);
      if (e.stdout) console.log('stdout:', e.stdout);
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testNmap();

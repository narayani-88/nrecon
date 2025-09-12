const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function testNmap() {
  try {
    // Test 1: Check if nmap is in PATH
    console.log('Testing nmap in PATH...');
    try {
      const { stdout: version } = await execAsync('nmap --version');
      console.log('Nmap version (from PATH):', version.split('\n')[0]);
    } catch (e) {
      console.log('Nmap not found in PATH');
    }

    // Test 2: Check direct path
    console.log('\nTesting direct path to nmap...');
    const nmapPath = 'C:\\Program Files (x86)\\Nmap\\nmap.exe';
    const { stdout } = await execAsync(`"${nmapPath}" --version`);
    console.log('Nmap version (direct path):', stdout.split('\n')[0]);

    // Test 3: Try a simple scan
    console.log('\nTrying a simple scan...');
    const { stdout: scanOutput } = await execAsync(`"${nmapPath}" -Pn -p 80,443 --open 127.0.0.1`);
    console.log('Scan results:', scanOutput);
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.stderr) console.error('stderr:', error.stderr);
    if (error.stdout) console.log('stdout:', error.stdout);
  }
}

testNmap();

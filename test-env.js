const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function testEnvironment() {
  try {
    // 1. Test basic command execution
    console.log('1. Testing basic command execution...');
    await execAsync('echo Hello, World!');
    console.log('✅ Basic command execution works');

    // 2. Test Nmap version
    console.log('\n2. Testing Nmap version...');
    try {
      const { stdout } = await execAsync('nmap --version');
      console.log('✅ Nmap version:', stdout.split('\n')[0]);
    } catch (e) {
      console.error('❌ Nmap version check failed:', e.message);
    }

    // 3. Test direct Nmap path
    console.log('\n3. Testing direct Nmap path...');
    const nmapPath = 'C:\\Program Files (x86)\\Nmap\\nmap.exe';
    try {
      const { stdout } = await execAsync(`"${nmapPath}" --version`);
      console.log(`✅ Nmap found at: ${nmapPath}`);
      console.log('Version:', stdout.split('\n')[0]);
    } catch (e) {
      console.error(`❌ Nmap not found at: ${nmapPath}`);
      console.error('Error:', e.message);
    }

    // 4. Test simple Nmap scan
    console.log('\n4. Testing simple Nmap scan...');
    try {
      const command = `"${nmapPath}" -Pn -p 80,443 --open 127.0.0.1`;
      console.log('Running:', command);
      
      const { stdout, stderr } = await execAsync(command, {
        timeout: 30000,
        maxBuffer: 1024 * 1024 * 10,
        windowsHide: true
      });
      
      console.log('✅ Scan completed successfully');
      console.log('Output:', stdout.trim());
      if (stderr) console.log('Errors:', stderr);
    } catch (e) {
      console.error('❌ Scan failed');
      console.error('Error:', e.message);
      if (e.stdout) console.log('stdout:', e.stdout);
      if (e.stderr) console.error('stderr:', e.stderr);
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testEnvironment();

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function testNmapAccess() {
  try {
    console.log('Testing Nmap access...');
    
    const commands = [
      'nmap --version',
      'where nmap',
      'echo %PATH%',
      'dir "C:\\Program Files\\Nmap\\nmap.exe"',
      'dir "C:\\Program Files (x86)\\Nmap\\nmap.exe"'
    ];

    for (const cmd of commands) {
      console.log(`\nRunning: ${cmd}`);
      try {
        const { stdout, stderr } = await execAsync(cmd);
        if (stdout) console.log('Output:', stdout);
        if (stderr) console.error('Error:', stderr);
      } catch (error) {
        console.error(`Command failed: ${cmd}`, error.message);
      }
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testNmapAccess();

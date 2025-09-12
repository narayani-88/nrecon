const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function testNmapDirect() {
  try {
    const nmapPath = 'C:\\Program Files (x86)\\Nmap\\nmap.exe';
    const command = `"${nmapPath}" -Pn -p 80,443 --open 127.0.0.1`;
    
    console.log('Running command:', command);
    
    const { stdout, stderr } = await execAsync(command, {
      timeout: 30000,
      maxBuffer: 1024 * 1024 * 10, // 10MB buffer
      windowsHide: true
    });
    
    console.log('Command output:');
    console.log(stdout);
    
    if (stderr) {
      console.error('Error output:');
      console.error(stderr);
    }
    
  } catch (error) {
    console.error('Error executing Nmap:');
    console.error('Message:', error.message);
    
    if (error.stdout) {
      console.log('stdout:', error.stdout);
    }
    
    if (error.stderr) {
      console.error('stderr:', error.stderr);
    }
  }
}

testNmapDirect();

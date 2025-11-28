/*
 * Arduino-to-Keyboard Bridge
 * Reads serial messages from Arduino and simulates keyboard presses
 */

const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const robot = require('robotjs');

// Find your Arduino port - check Arduino IDE Tools > Port
// Mac: usually /dev/cu.usbmodem... or /dev/tty.usbmodem...
const ARDUINO_PORT = '/dev/cu.usbmodem11401'; // Update this to match your port
const BAUD_RATE = 9600;

console.log('🎮 Starting Arduino Bridge...');
console.log(`Connecting to: ${ARDUINO_PORT}`);

// Open serial connection to Arduino
const port = new SerialPort({
  path: ARDUINO_PORT,
  baudRate: BAUD_RATE,
});

const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

// Listen for data from Arduino
parser.on('data', (data) => {
  const message = data.trim();
  console.log(`📨 Arduino: ${message}`);
  
  // Parse KEY:A, KEY:B, KEY:C, KEY:D messages
  if (message.startsWith('KEY:')) {
    const key = message.split(':')[1].toLowerCase();
    
    if (['a', 'b', 'c', 'd'].includes(key)) {
      console.log(`⌨️  Simulating keypress: ${key.toUpperCase()}`);
      
      // Simulate keyboard press
      robot.keyTap(key);
      
      console.log(`✅ Key ${key.toUpperCase()} sent!`);
    }
  }
});

// Handle connection events
port.on('open', () => {
  console.log('✅ Arduino connected successfully!');
  console.log('🎯 Press Arduino buttons to simulate keyboard presses');
  console.log('📍 Make sure your quiz window is in focus');
});

port.on('error', (err) => {
  console.error('❌ Serial port error:', err.message);
  console.log('\n💡 Troubleshooting:');
  console.log('1. Check the port path is correct (see Arduino IDE Tools > Port)');
  console.log('2. Close Serial Monitor in Arduino IDE');
  console.log('3. Make sure Arduino is plugged in');
  console.log(`4. Update ARDUINO_PORT in this file to match your port`);
  process.exit(1);
});

port.on('close', () => {
  console.log('🔌 Arduino disconnected');
  process.exit(0);
});

// Handle script termination
process.on('SIGINT', () => {
  console.log('\n👋 Closing Arduino bridge...');
  port.close();
  process.exit(0);
});

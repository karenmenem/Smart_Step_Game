/*
 * Optional Arduino Integration for SmartStep
 * CRASH-PROOF VERSION - Will NOT crash the backend
 * 
 * This module integrates Arduino quiz buzzer with the backend server.
 * It's completely optional - the server works fine without it.
 */

const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

// Safe robot import - won't crash if it fails
let robot = null;
try {
  robot = require('robotjs');
} catch (error) {
  console.warn('Warning: RobotJS not available - Arduino keypresses disabled');
}

class ArduinoManager {
  constructor() {
    this.port = null;
    this.parser = null;
    this.isConnected = false;
    this.isEnabled = process.env.ARDUINO_ENABLED === 'true';
    this.arduinoPort = process.env.ARDUINO_PORT || '/dev/cu.usbmodem11301';
    this.baudRate = 9600;
    this.robotAvailable = robot !== null;
  }

  async initialize() {
    if (!this.isEnabled) {
      console.log('Arduino integration disabled (ARDUINO_ENABLED=false)');
      return;
    }

    console.log('Initializing Arduino...');
    console.log(`Connecting to: ${this.arduinoPort}`);

    try {
      this.port = new SerialPort({
        path: this.arduinoPort,
        baudRate: this.baudRate,
      });

      this.parser = this.port.pipe(new ReadlineParser({ delimiter: '\n' }));
      this.setupListeners();

    } catch (error) {
      console.error('Failed to initialize Arduino:', error.message);
      console.log('Server will continue without Arduino');
      this.isEnabled = false;
    }
  }

  setupListeners() {
    try {
      this.port.on('open', () => {
        this.isConnected = true;
        console.log('Arduino connected!');
      });

      this.parser.on('data', (data) => {
        try {
          const message = data.trim();
          
          if (message && !message.startsWith('KEY:')) {
            console.log(`Arduino: ${message}`);
          }
          
          if (message.startsWith('KEY:')) {
            const key = message.split(':')[1]?.toLowerCase();
            
            if (key && ['a', 'b', 'c', 'd'].includes(key)) {
              console.log(`Button ${key.toUpperCase()} pressed`);
              
              if (this.robotAvailable && robot) {
                try {
                  robot.keyTap(key);
                  console.log(`Key ${key.toUpperCase()} sent`);
                } catch (error) {
                  console.error(`Keypress failed:`, error.message);
                  this.robotAvailable = false;
                }
              }
            }
          }
        } catch (error) {
          console.error('Arduino data error:', error.message);
        }
      });

      this.port.on('error', (err) => {
        console.error('Arduino error:', err.message);
        this.isConnected = false;
        console.log('Server continues running normally');
      });

      this.port.on('close', () => {
        if (this.isConnected) {
          console.log('Arduino disconnected');
          this.isConnected = false;
        }
      });
      
    } catch (error) {
      console.error('Error setting up Arduino:', error.message);
      this.isEnabled = false;
    }
  }

  sendFeedback(isCorrect) {
    try {
      if (!this.isConnected || !this.port || !this.port.isOpen) {
        return;
      }

      const feedback = isCorrect ? 'CORRECT\n' : 'WRONG\n';
      this.port.write(feedback);
    } catch (error) {
      console.error('Failed to send feedback:', error.message);
    }
  }

  async close() {
    try {
      if (!this.port || !this.isConnected) {
        return;
      }

      console.log('Closing Arduino...');
      
      return new Promise((resolve) => {
        this.port.close((err) => {
          if (err && err.message !== 'Port is not open') {
            console.error('Error closing Arduino:', err.message);
          }
          this.isConnected = false;
          resolve();
        });
      });
    } catch (error) {
      this.isConnected = false;
    }
  }

  isArduinoConnected() {
    return this.isConnected;
  }

  getStatus() {
    return {
      enabled: this.isEnabled,
      connected: this.isConnected,
      port: this.arduinoPort,
    };
  }
}

const arduinoManager = new ArduinoManager();
module.exports = arduinoManager;

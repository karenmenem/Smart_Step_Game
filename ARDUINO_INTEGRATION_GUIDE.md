# 🎮 Arduino Integration Guide

## The Problem You Were Having

When you tried to use the Arduino:
1. **Running `arduino-bridge.js` separately** locked the serial port
2. **The backend would crash** or fail when Arduino was connected
3. **No clean way to disconnect** without breaking things
4. **Had to restart everything** each time

## The Solution ✅

I've integrated Arduino **optionally** into your backend server so:
- ✅ Arduino is **disabled by default** - server works normally
- ✅ **Enable it when you want** with a simple .env setting
- ✅ **Disconnect anytime** - just unplug or disable in .env
- ✅ **Backend never crashes** - continues working even if Arduino fails
- ✅ **Clean shutdown** - Arduino disconnects properly when server stops

---

## Quick Setup Guide

### Step 1: Configure Arduino (One-Time Setup)

1. **Upload the Arduino code:**
   - Open Arduino IDE
   - Open: `arduino/quiz_buzzer/quiz_buzzer.ino`
   - Connect your Arduino board via USB
   - Click Upload (➜ icon)
   - Wait for "Done uploading"

2. **Find your Arduino port:**
   - In Arduino IDE: **Tools > Port**
   - Look for something like:
     - Mac: `/dev/cu.usbmodem11301` or `/dev/tty.usbmodem11301`
     - Windows: `COM3` or `COM4`
     - Linux: `/dev/ttyACM0` or `/dev/ttyUSB0`
   - **Write this down!** You'll need it.

3. **IMPORTANT:** Close the Serial Monitor in Arduino IDE (if open)

---

### Step 2: Enable Arduino in Backend

1. **Create or edit your `.env` file** in the `backend/` folder:

```bash
cd backend
nano .env   # or use any text editor
```

2. **Add these lines** (or copy from `.env.example`):

```env
# Enable Arduino
ARDUINO_ENABLED=true

# Your Arduino port (from Step 1)
ARDUINO_PORT=/dev/cu.usbmodem11301
```

3. **Save the file**

---

### Step 3: Start the Backend

```bash
cd backend
npm start
```

**Look for these messages:**
```
✅ Database connected
🎮 Initializing Arduino integration...
📍 Attempting to connect to: /dev/cu.usbmodem11301
✅ Arduino connected successfully!
🎯 Physical buttons will now simulate keyboard presses
🚀 Server running on http://localhost:5001
```

---

## Using the Arduino Buttons

1. **Start a quiz** in your frontend (http://localhost:3000)
2. **Make sure the quiz window has focus** (click on it)
3. **Press physical buttons:**
   - 🔴 Red Button (A) → Selects first answer
   - 🔵 Blue Button (B) → Selects second answer
   - 🟢 Green Button (C) → Selects third answer
   - 🟡 Yellow Button (D) → Selects fourth answer

---

## Disabling Arduino

### Temporary (keep backend running):
Just **unplug the Arduino**. The backend continues working normally.

### Permanent:
Edit `.env`:
```env
ARDUINO_ENABLED=false
```
Or just **comment it out** or **delete the line**.

Then restart the backend.

---

## Troubleshooting

### ❌ "Arduino error: Port not found"

**Fix:**
1. Check the port in Arduino IDE (Tools > Port)
2. Update `ARDUINO_PORT` in `.env` to match
3. Restart the backend

### ❌ "Permission denied" error

**Fix:**
1. **Close Serial Monitor** in Arduino IDE
2. Unplug and replug the Arduino
3. Restart the backend

### ❌ Backend won't start

**Fix:**
Set `ARDUINO_ENABLED=false` in `.env` to disable Arduino temporarily.

### ❌ Buttons don't do anything in quiz

**Fix:**
1. Make sure **quiz window has focus** (click on it)
2. Test keyboard keys A, B, C, D first - if they work, Arduino should too
3. Check Arduino Serial Monitor - see if "KEY:A" messages appear when you press buttons

### ❌ Port changed after unplugging

**This is normal on Mac!** The port can change to `/dev/cu.usbmodem11401` or similar.

**Fix:**
1. Check Arduino IDE Tools > Port
2. Update `ARDUINO_PORT` in `.env`
3. Restart backend

---

## How It Works

1. **Arduino sends serial messages** like `KEY:A`, `KEY:B`, etc.
2. **Backend receives these messages** via SerialPort
3. **Backend simulates keyboard presses** using RobotJS
4. **Your quiz receives the keypresses** as if you typed them

---

## File Structure

```
backend/
├── server.js                 # Main server (includes Arduino integration)
├── utils/
│   └── arduino.js           # Arduino manager (handles connection)
├── arduino-bridge.js        # OLD standalone script (not used anymore)
└── .env                     # Configuration (enable/disable Arduino here)

arduino/
├── SETUP_GUIDE.md           # Hardware setup instructions
└── quiz_buzzer/
    └── quiz_buzzer.ino      # Arduino code
```

---

## Commands Reference

### Check if Arduino is connected:
```bash
# Mac/Linux
ls /dev/cu.* | grep usb

# Windows (in PowerShell)
Get-WmiObject Win32_SerialPort | Select Name,DeviceID
```

### Test Arduino without backend:
1. Open Arduino IDE
2. Tools > Serial Monitor
3. Set baud rate to 9600
4. Press buttons - you should see "KEY:A", "KEY:B", etc.

### Restart backend:
```bash
cd backend
# Stop with Ctrl+C
npm start
```

---

## Normal Workflow

### With Arduino:
1. Set `ARDUINO_ENABLED=true` in `.env`
2. Connect Arduino via USB
3. Start backend: `npm start`
4. Start frontend: `npm start` (in frontend folder)
5. Use physical buttons in quiz!

### Without Arduino (normal keyboard):
1. Set `ARDUINO_ENABLED=false` in `.env` (or don't set it at all)
2. Start backend: `npm start`
3. Start frontend: `npm start`
4. Use keyboard keys A, B, C, D in quiz

### Switch anytime:
- Just edit `.env` and restart backend
- Or unplug Arduino - backend keeps working!

---

## Benefits of This Setup

✅ **No conflicts** - Arduino and backend work together  
✅ **Optional** - Works with or without Arduino  
✅ **Safe** - Backend never crashes if Arduino fails  
✅ **Clean** - Proper connection and disconnection  
✅ **Simple** - One .env setting to enable/disable  
✅ **Flexible** - Unplug anytime without breaking anything  

---

Need help? Check the console logs when starting the backend - they show exactly what's happening with the Arduino connection!

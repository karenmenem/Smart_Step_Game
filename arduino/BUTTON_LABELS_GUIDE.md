# SmartStep Arduino Button Labels Guide

## Physical Button Identification

To help users identify which button corresponds to which quiz option (A, B, C, or D), use the following methods:

### Option 1: LED Indicators (Recommended)
Each button has a dedicated LED that stays ON to identify it:

| Button | LED Color | Arduino Pin | Quiz Option |
|--------|-----------|-------------|-------------|
| Button A | **RED LED** | Pin 9 | Option A (First) |
| Button B | **BLUE LED** | Pin 10 | Option B (Second) |
| Button C | **GREEN LED** | Pin 11 | Option C (Third) |
| Button D | **YELLOW LED** | Pin 6 | Option D (Fourth) |

**When you press a button:**
- The button's LED will blink 3 times quickly
- The buzzer will beep
- The answer will be selected on screen

**LED Wiring:**
- Connect LED positive (long leg) to Arduino pin through 220Ω resistor
- Connect LED negative (short leg) to GND

### Option 2: Physical Labels
If you don't have colored LEDs, use physical labels:

**Sticker Labels:**
- Print or write large letters: **A**, **B**, **C**, **D**
- Stick them above or next to each button on the breadboard

**Colored Tape:**
- Red tape = Button A
- Blue tape = Button B  
- Green tape = Button C
- Yellow tape = Button D

**Colored Buttons:**
- Use actual red, blue, green, and yellow push buttons if available
- This makes identification intuitive

### Option 3: Numbered Labels
Simple number labels work too:
- Button 1 = Option A
- Button 2 = Option B
- Button 3 = Option C
- Button 4 = Option D

## Breadboard Layout Example

```
    [Arduino Uno]
         |
         |
    [Breadboard]
    
Row 1:  [RED LED]    ← Always ON = Button A
        [Button A]   ← Press for Option A
        
Row 2:  [BLUE LED]   ← Always ON = Button B
        [Button B]   ← Press for Option B
        
Row 3:  [GREEN LED]  ← Always ON = Button C
        [Button C]   ← Press for Option C
        
Row 4:  [YELLOW LED] ← Always ON = Button D
        [Button D]   ← Press for Option D

Bottom: [Buzzer]     ← Beeps when any button pressed
        [Green LED]  ← Lights up for correct answer
        [Red LED]    ← Lights up for wrong answer
```

## Testing the Setup

After uploading the Arduino code:

1. **Power on:** All 4 button LEDs should light up
2. **Startup sequence:** LEDs flash in order A→B→C→D twice
3. **Button test:** Press each button and verify:
   - Buzzer beeps
   - Button's LED blinks 3 times
   - Serial Monitor shows "Button X pressed!"
   - Quiz on screen selects the corresponding option

## For Presentation / Demonstration

When presenting to your professor or classmates:

1. **Point out the LEDs:** "Each button has a colored LED that stays on to show which option it represents"
2. **Press a button:** "When I press the red LED button, it selects Option A"
3. **Show the blink:** "The LED blinks to confirm the press"
4. **Show screen response:** "And immediately the quiz shows my selection and checks if it's correct"

## Materials Needed

**With LED Indicators:**
- 4x Push buttons
- 4x LEDs (red, blue, green, yellow - or any 4 colors)
- 4x 220Ω resistors (for LEDs)
- 1x Buzzer
- 2x LEDs (green and red for feedback)
- 2x 220Ω resistors (for feedback LEDs)
- Jumper wires
- Breadboard
- Arduino Uno
- USB cable

**Without LED Indicators:**
- Same as above but without the 4 button indicator LEDs
- Use physical labels instead (stickers, tape, or markers)

## Troubleshooting

**LEDs don't light up:**
- Check polarity (long leg = +, short leg = -)
- Check resistor is connected (220Ω)
- Verify Arduino pin connections

**Button presses not detected:**
- Check button wiring to correct pins (2, 3, 4, 5)
- Verify button other side is connected to GND
- Check Serial Monitor for messages

**Screen doesn't respond:**
- Ensure backend server is running with Arduino bridge
- Check USB cable connection
- Verify Arduino port in arduino-bridge.js matches your system

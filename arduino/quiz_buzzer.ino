/*
 * SmartStep Arduino Quiz Buzzer System
 * 
 * Hardware Setup:
 * - Button A (Red)    → Pin 2 → Answer A
 * - Button B (Blue)   → Pin 3 → Answer B  
 * - Button C (Green)  → Pin 4 → Answer C
 * - Button D (Yellow) → Pin 5 → Answer D
 * - Buzzer            → Pin 8
 * - LED Green         → Pin 12 (Correct answer feedback)
 * - LED Red           → Pin 13 (Wrong answer feedback)
 * 
 * Each button should connect to:
 * - One side → Arduino digital pin
 * - Other side → GND (ground)
 * 
 * Use INPUT_PULLUP mode so buttons work without external resistors
 */

// Button pins
const int buttonA = 2;
const int buttonB = 3;
const int buttonC = 4;
const int buttonD = 5;

// Buzzer and LED pins
const int buzzerPin = 8;
const int ledGreen = 12;
const int ledRed = 13;

// Debounce timing
unsigned long lastDebounceTime = 0;
const unsigned long debounceDelay = 300; // 300ms between button presses

void setup() {
  // Initialize serial communication at 9600 baud
  Serial.begin(9600);
  
  // Set button pins as INPUT_PULLUP (no external resistors needed)
  pinMode(buttonA, INPUT_PULLUP);
  pinMode(buttonB, INPUT_PULLUP);
  pinMode(buttonC, INPUT_PULLUP);
  pinMode(buttonD, INPUT_PULLUP);
  
  // Set buzzer and LED pins as outputs
  pinMode(buzzerPin, OUTPUT);
  pinMode(ledGreen, OUTPUT);
  pinMode(ledRed, OUTPUT);
  
  // Turn off LEDs initially
  digitalWrite(ledGreen, LOW);
  digitalWrite(ledRed, LOW);
  
  // Startup beep
  tone(buzzerPin, 1000, 200);
  delay(250);
  
  Serial.println("SmartStep Quiz Buzzer Ready!");
}

void loop() {
  unsigned long currentTime = millis();
  
  // Check if enough time has passed since last button press (debounce)
  if ((currentTime - lastDebounceTime) > debounceDelay) {
    
    // Check Button A (Pin 2) - LOW means pressed (INPUT_PULLUP)
    if (digitalRead(buttonA) == LOW) {
      sendAnswer('A');
      lastDebounceTime = currentTime;
    }
    
    // Check Button B (Pin 3)
    else if (digitalRead(buttonB) == LOW) {
      sendAnswer('B');
      lastDebounceTime = currentTime;
    }
    
    // Check Button C (Pin 4)
    else if (digitalRead(buttonC) == LOW) {
      sendAnswer('C');
      lastDebounceTime = currentTime;
    }
    
    // Check Button D (Pin 5)
    else if (digitalRead(buttonD) == LOW) {
      sendAnswer('D');
      lastDebounceTime = currentTime;
    }
  }
  
  // Listen for feedback from computer (correct/wrong)
  if (Serial.available() > 0) {
    String feedback = Serial.readStringUntil('\n');
    feedback.trim();
    
    if (feedback == "CORRECT") {
      flashGreen();
    } else if (feedback == "WRONG") {
      flashRed();
    }
  }
}

// Function to send answer to computer
void sendAnswer(char button) {
  // Play buzzer beep
  tone(buzzerPin, 800, 100);
  
  // Send button press to computer via Serial
  Serial.print("KEY:");
  Serial.println(button);
  
  // Brief LED flash on any button press
  digitalWrite(ledGreen, HIGH);
  digitalWrite(ledRed, HIGH);
  delay(50);
  digitalWrite(ledGreen, LOW);
  digitalWrite(ledRed, LOW);
  
  Serial.print("Button ");
  Serial.print(button);
  Serial.println(" pressed!");
}

// Flash green LED for correct answer
void flashGreen() {
  for (int i = 0; i < 3; i++) {
    digitalWrite(ledGreen, HIGH);
    tone(buzzerPin, 1200, 100);
    delay(150);
    digitalWrite(ledGreen, LOW);
    delay(150);
  }
}

// Flash red LED for wrong answer
void flashRed() {
  digitalWrite(ledRed, HIGH);
  tone(buzzerPin, 400, 500);
  delay(600);
  digitalWrite(ledRed, LOW);
}

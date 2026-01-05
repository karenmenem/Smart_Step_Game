
const int buttonA = 2;
const int buttonB = 3;
const int buttonC = 4;
const int buttonD = 5;


const int ledA = 9;   
const int ledB = 10;  
const int ledC = 11;  
const int ledD = 6;   


const int buzzerPin = 8;
const int ledGreen = 12;  // correct
const int ledRed = 13;     // wrong

// Debounce timing
unsigned long lastDebounceTime = 0;
const unsigned long debounceDelay = 300; 
void setup() {
  
  Serial.begin(9600); // open serial communication
  
  
  pinMode(buttonA, INPUT_PULLUP);
  pinMode(buttonB, INPUT_PULLUP);
  pinMode(buttonC, INPUT_PULLUP);
  pinMode(buttonD, INPUT_PULLUP);
  
  
  pinMode(ledA, OUTPUT);
  pinMode(ledB, OUTPUT);
  pinMode(ledC, OUTPUT);
  pinMode(ledD, OUTPUT);
  
  
  pinMode(buzzerPin, OUTPUT);
  pinMode(ledGreen, OUTPUT);
  pinMode(ledRed, OUTPUT);
  
  // Turn off feedback LEDs initially
  digitalWrite(ledGreen, LOW);
  digitalWrite(ledRed, LOW);
  
  // Turn ON button indicator LEDs 
  digitalWrite(ledA, HIGH);  // Button A indicator always ON
  digitalWrite(ledB, HIGH);  
  digitalWrite(ledC, HIGH);  
  digitalWrite(ledD, HIGH);  
  
  // Startup beep and LED sequence
  tone(buzzerPin, 1000, 200);
  
  // Flash each button LED in sequence to show they work
  for (int i = 0; i < 2; i++) {
    digitalWrite(ledA, LOW); delay(100);
    digitalWrite(ledA, HIGH); delay(100);
    digitalWrite(ledB, LOW); delay(100);
    digitalWrite(ledB, HIGH); delay(100);
    digitalWrite(ledC, LOW); delay(100);
    digitalWrite(ledC, HIGH); delay(100);
    digitalWrite(ledD, LOW); delay(100);
    digitalWrite(ledD, HIGH); delay(100);
  }
  
  Serial.println("SmartStep Quiz Buzzer Ready!");
  Serial.println("Button A = Red LED (Pin 9)");
  Serial.println("Button B = Blue LED (Pin 10)");
  Serial.println("Button C = Green LED (Pin 11)");
  Serial.println("Button D = Yellow LED (Pin 6)");
}

void loop() {
  unsigned long currentTime = millis();
  
  // Check if enough time has passed since last button press (debounce)
  if ((currentTime - lastDebounceTime) > debounceDelay) {
    
    
    if (digitalRead(buttonA) == LOW) {
      sendAnswer('A');
      lastDebounceTime = currentTime;
    }
    
   
    else if (digitalRead(buttonB) == LOW) {
      sendAnswer('B');
      lastDebounceTime = currentTime;
    }
    
    
    else if (digitalRead(buttonC) == LOW) {
      sendAnswer('C');
      lastDebounceTime = currentTime;
    }
    
    
    else if (digitalRead(buttonD) == LOW) {
      sendAnswer('D');
      lastDebounceTime = currentTime;
    }
  }
  
  
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
  
  // Blink the specific button's LED to show it was pressed
  int buttonLED = -1;
  switch(button) {
    case 'A': buttonLED = ledA; break;
    case 'B': buttonLED = ledB; break;
    case 'C': buttonLED = ledC; break;
    case 'D': buttonLED = ledD; break;
  }
  
  // Quick triple blink of the pressed button's LED
  if (buttonLED != -1) {
    for (int i = 0; i < 3; i++) {
      digitalWrite(buttonLED, LOW);
      delay(80);
      digitalWrite(buttonLED, HIGH);
      delay(80);
    }
  }
  
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

const int buttonA = 5;
const int buttonB = 3;
const int buttonC = 4;
const int buttonD = 2;

const int ledA = 6;   
const int ledB = 10;  
const int ledC = 11;  
const int ledD = 9;   

const int buzzerPin = 8;
const int ledGreen = 7;
const int ledRed = 12;

unsigned long lastDebounceTime = 0;
const unsigned long debounceDelay = 300;

void sendAnswer(char button);
void flashGreen();
void flashRed();

void setup() {
  Serial.begin(9600);
  
  pinMode(ledGreen, OUTPUT);
  pinMode(ledRed, OUTPUT);
  digitalWrite(ledGreen, LOW);
  digitalWrite(ledRed, LOW);
  
  pinMode(buttonA, INPUT_PULLUP);
  pinMode(buttonB, INPUT_PULLUP);
  pinMode(buttonC, INPUT_PULLUP);
  pinMode(buttonD, INPUT_PULLUP);
  
  pinMode(ledA, OUTPUT);
  pinMode(ledB, OUTPUT);
  pinMode(ledC, OUTPUT);
  pinMode(ledD, OUTPUT);
  
  pinMode(buzzerPin, OUTPUT);
  
  digitalWrite(ledA, HIGH);
  digitalWrite(ledB, HIGH);  
  digitalWrite(ledC, HIGH);  
  digitalWrite(ledD, HIGH);  
  
  tone(buzzerPin, 1000, 200);
  
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
  
  delay(100);
  while(Serial.available() > 0) {
    Serial.read();
  }
  
  digitalWrite(ledGreen, LOW);
  digitalWrite(ledRed, LOW);
}

void loop() {
  digitalWrite(ledGreen, LOW);
  digitalWrite(ledRed, LOW);
  
  unsigned long currentTime = millis();
  
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
    
    if (feedback.length() > 0) {
      Serial.print("Received: ");
      Serial.println(feedback);
      
      if (feedback == "CORRECT") {
        flashGreen();
      } else if (feedback == "WRONG") {
        flashRed();
      }
      
      while(Serial.available() > 0) {
        Serial.read();
      }
    }
  }
}

void sendAnswer(char button) {
  tone(buzzerPin, 800, 100);
  
  Serial.print("KEY:");
  Serial.println(button);
  
  int buttonLED = -1;
  switch(button) {
    case 'A': buttonLED = ledA; break;
    case 'B': buttonLED = ledB; break;
    case 'C': buttonLED = ledC; break;
    case 'D': buttonLED = ledD; break;
  }
  
  if (buttonLED != -1) {
    for (int i = 0; i < 3; i++) {
      digitalWrite(buttonLED, LOW);
      delay(80);
      digitalWrite(buttonLED, HIGH);
      delay(80);
    }
  }
}

void flashGreen() {
  digitalWrite(ledRed, LOW);
  
  for (int i = 0; i < 3; i++) {
    digitalWrite(ledGreen, LOW);
    tone(buzzerPin, 1200, 100);
    delay(150);
    digitalWrite(ledGreen, HIGH);
    delay(150);
  }
  
  digitalWrite(ledGreen, LOW);
  Serial.println("GREEN done");
}

void flashRed() {
  digitalWrite(ledGreen, HIGH);
  
  digitalWrite(ledRed, HIGH);
  tone(buzzerPin, 400, 500);
  delay(600);
  digitalWrite(ledRed, LOW);
  
  Serial.println("RED done");
}

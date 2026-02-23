const int LED_TRUE=9;
const int LED_FALSE=2;

void setup() {
  pinMode(LED_TRUE, OUTPUT);
  pinMode(LED_FALSE, OUTPUT);
  digitalWrite(LED_TRUE, LOW);
  digitalWrite(LED_FALSE, LOW);
  Serial.begin(9600);

  Serial.print("{\"question\":");
  Serial.print("\"is the sky blue?\"");
  Serial.println("}");
}



void loop() {
  if (Serial.available()) {
    String msg = Serial.readStringUntil('\n');
    
    if (msg == "LED_TRUE_ON") {
      digitalWrite(LED_TRUE, HIGH);
      delay(5000);
      digitalWrite(LED_TRUE, LOW);
    }

    if (msg == "LED_FALSE_ON") {
      digitalWrite(LED_FALSE, HIGH);
      delay(5000);
      digitalWrite(LED_FALSE, LOW);
    }
  }
}
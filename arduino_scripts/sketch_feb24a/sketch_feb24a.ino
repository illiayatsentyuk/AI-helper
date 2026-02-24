#include <ArduinoJson.h>

#define echoPin 7
#define trigPin 8


const int LED_TRUE=9;
const int LED_FALSE=2;

long duration;
long distance;

void setup() {
  Serial.begin(9600);
  while (!Serial) continue;

  pinMode(echoPin, INPUT);
  pinMode(trigPin, OUTPUT);
  pinMode(LED_TRUE, OUTPUT);
  pinMode(LED_FALSE, OUTPUT);
  digitalWrite(LED_TRUE, LOW);
  digitalWrite(LED_FALSE, LOW);

}

void loop() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(4);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(20);
  digitalWrite(trigPin, LOW);
  duration = pulseIn(echoPin, HIGH);
  distance = duration/58.2;

  StaticJsonDocument<200> doc;
  doc["question"] = "Is 50 > " + String(distance);
  serializeJson(doc, Serial);
  Serial.println();

  delay(1000);

  if (Serial.available()) {
    String msg = Serial.readStringUntil('\n');
    
    if (msg == "LED_TRUE_ON") {
      digitalWrite(LED_TRUE, HIGH);
      delay(500);
      digitalWrite(LED_TRUE, LOW);
    }

    if (msg == "LED_FALSE_ON") {
      digitalWrite(LED_FALSE, HIGH);
      delay(500);
      digitalWrite(LED_FALSE, LOW);
    }
  }
}

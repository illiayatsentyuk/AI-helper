#include "DHT.h"
#include <ArduinoJson.h>

#define DHTPIN 2      // Пін D2
#define DHTTYPE DHT11 // Тип датчика

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(9600);
  Serial.println("DHT11 тест!");
  dht.begin();
}

void loop() {
  float h = dht.readHumidity();
  float t = dht.readTemperature();

  if (isnan(h) || isnan(t)) {
    Serial.println("Помилка зчитування DHT11!");
    return;
  }

  StaticJsonDocument<200> doc;
  doc["temperature"] = t;
  doc["humidity"] = h;
  serializeJson(doc, Serial);
  Serial.println();

  delay(2000); // DHT11: пауза 2с
}

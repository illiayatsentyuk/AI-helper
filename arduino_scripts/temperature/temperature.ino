#include "DHT.h"
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <ArduinoJson.h>

#define DHTPIN 2      // Пін D2
#define DHTTYPE DHT11 // Тип датчика

LiquidCrystal_I2C lcd(0x27, 16, 2);


DHT dht(DHTPIN, DHTTYPE);

void setup() {
  lcd.init();          // Ініціалізація
  lcd.backlight();  
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

  lcd.clear();
  lcd.setCursor(0, 0); // Колонка 0, рядок 0
  lcd.print("Temp: ");
  lcd.print(t);
  lcd.setCursor(0, 1); // Колонка 0, рядок 1
  lcd.print("Hum: ");
  lcd.print(h);

  delay(2000); // DHT11: пауза 2с
}

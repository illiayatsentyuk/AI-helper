#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <ArduinoJson.h>
#include "DHT.h"

#define DHTPIN 2      // Пін D2
#define DHTTYPE DHT11 // Тип датчика
// Адреса дисплея зазвичай 0x27 або 0x3F
LiquidCrystal_I2C lcd(0x27, 16, 2);

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  lcd.init();          // Ініціалізація
  lcd.backlight();     // Увімкнути підсвітку
  Serial.begin(9600);  // Серійний порт для отримання даних з бекенду
  dht.begin();
}

void loop() {
  if (Serial.available()) {
    String msg = Serial.readStringUntil('\n');
    StaticJsonDocument<200> doc;
    DeserializationError error = deserializeJson(doc, msg);

    float h = dht.readHumidity();
    float t = dht.readTemperature();
  
    if (isnan(h) || isnan(t)) {
      Serial.println("Помилка зчитування DHT11!");
      return;
    }

    if (error) {
      // Якщо JSON некоректний — нічого не показуємо
      return;
    }

    float temperature = doc["temperature"] | t;
    float humidity    = doc["humidity"] | h;

    lcd.clear();
    lcd.setCursor(0, 0); // Колонка 0, рядок 0
    lcd.print("Temp: ");
    lcd.print(temperature);

    lcd.setCursor(0, 1); // Колонка 0, рядок 1
    lcd.print("Hum: ");
    lcd.print(humidity);
  }
}
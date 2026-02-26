#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <ArduinoJson.h>

// Адреса дисплея зазвичай 0x27 або 0x3F
LiquidCrystal_I2C lcd(0x27, 16, 2);


void setup() {
  lcd.init();          // Ініціалізація
  lcd.backlight();     // Увімкнути підсвітку
  Serial.begin(9600);  // Серійний порт для отримання даних з бекенду
}

void loop() {
  if (Serial.available()) {
    String msg = Serial.readStringUntil('\n');
    StaticJsonDocument<200> doc;
    DeserializationError error = deserializeJson(doc, msg);
    if (error) {
      // Якщо JSON некоректний — нічого не показуємо
      return;
    }

    float temperature = doc["temperature"] | 0.0;
    float humidity    = doc["humidity"] | 0.0;

    lcd.clear();
    lcd.setCursor(0, 0); // Колонка 0, рядок 0
    lcd.print("Temp: ");
    lcd.print(temperature);

    lcd.setCursor(0, 1); // Колонка 0, рядок 1
    lcd.print("Hum: ");
    lcd.print(humidity);
  }
}
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// Адреса дисплея зазвичай 0x27 або 0x3F
LiquidCrystal_I2C lcd(0x27, 16, 2);

void setup() {
  lcd.init();          // Ініціалізація
  lcd.backlight();     // Увімкнути підсвітку
}

void loop() {
  if (Serial.available()) {
    String msg = Serial.readStringUntil('\n');
    
    lcd.setCursor(0, 0); // Колонка 0, рядок 0
    lcd.print("Temperature: ");
    lcd.print(msg);
    lcd.setCursor(0, 1); // Колонка 0, рядок 1
    lcd.print("Humidity: ");
    lcd.print(msg);
  }
}
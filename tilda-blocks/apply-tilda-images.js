/**
 * Скрипт замены плейсхолдеров ##TILDA_BASE## на реальные URL из tilda-images-config.json
 * Запуск: node apply-tilda-images.js
 */

const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, 'tilda-images-config.json');
const blocksDir = path.join(__dirname);

// Читаем конфиг
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Фильтруем только реальные маппинги (не пустые, не комментарии)
const mapping = {};
for (const [filename, url] of Object.entries(config)) {
  if (!filename.startsWith('_') && url && typeof url === 'string' && url.trim()) {
    mapping[filename] = url.trim();
  }
}

if (Object.keys(mapping).length === 0) {
  console.log('Ошибка: заполните URL в tilda-images-config.json');
  process.exit(1);
}

console.log('Замена изображений для:', Object.keys(mapping).length, 'файлов');

// Обрабатываем все HTML-файлы
const files = fs.readdirSync(blocksDir).filter(f => f.endsWith('.html'));

let totalReplacements = 0;

for (const file of files) {
  const filePath = path.join(blocksDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let fileReplacements = 0;

  for (const [filename, url] of Object.entries(mapping)) {
    const placeholder = `##TILDA_BASE##${filename}`;
    const count = (content.match(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
    if (count > 0) {
      content = content.split(placeholder).join(url);
      fileReplacements += count;
    }
  }

  if (fileReplacements > 0) {
    fs.writeFileSync(filePath, content);
    console.log(`  ${file}: ${fileReplacements} замен`);
    totalReplacements += fileReplacements;
  }
}

console.log('Готово. Всего замен:', totalReplacements);

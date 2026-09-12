# Millennium Dawn: Деколонизация РФ

Сабмод к **[Millennium Dawn: A Modern Day Mod](https://steamcommunity.com/sharedfiles/filedetails/?id=2777392649)** (MD 2.0 / HOI4 `1.19.*`) про деколонизацию субъектов РФ: новые тэги, фокусы, ивенты и решения.

Зависимость обязательна: без MD сабмод не предназначен к запуску.

## Что уже есть (прототип 0.1)

| Тэг | Суть | Земля (cores при старте) |
|-----|------|---------------------------|
| **VBG** | Волжская Булгария | 1135 Чувашия (+ claim на 661 Татарстан) |
| **CIR** | Черкесия | 1127 Адыгея, 1125 КЧР, 674 КБР |

- Ивенты `dec.1`–`dec.5`, решения в категории «Деколонизация РФ»
- Мини-деревья фокусов для VBG и CIR
- В **debug-режиме** HOI4: решение «DEBUG: Start decolonisation wave» → затем решения на релиз VBG/CIR

MD уже содержит освобождаемые тэги вроде `CHU`, `TAT`, `ADY` — этот сабмод добавляет **новые** политические формы (восстановленная Булгария / объединённая Черкесия), не копируя workshop MD.

## Установка (локально)

1. Подпишись/поставь **Millennium Dawn** из Steam Workshop (`2777392649`).
2. Скопируй `decolonizaciya.mod` в  
   `Documents\Paradox Interactive\Hearts of Iron IV\mod\`  
   (в репо файл уже с `path="C:/git/decolonizaciya"` — поправь путь, если клон в другом месте).
3. Либо держи мод как папку внутри `...\Hearts of Iron IV\mod\decolonizaciya\` и укажи относительный `path="mod/decolonizaciya"`.
4. В лаунчере HOI4 включи **сначала** Millennium Dawn, **затем** этот сабмод.

Workshop-публикация — позже.

## Структура

```
common/country_tags/   — VBG, CIR
common/countries/      — цвета/gfx
common/national_focus/ — мини-фокусы
common/decisions/      — прототип решений
common/on_actions/     — cores при старте
events/                — dec.*
localisation/          — EN + RU
history/countries/     — стартовая политика тэгов
```

Нельзя править файлы MD в `steamapps\workshop\...` — только этот репозиторий.

## Версии

- `supported_version = "1.19.*"`
- `dependencies = { "Millennium Dawn: A Modern Day Mod" }`
- сабмод `0.1.0`

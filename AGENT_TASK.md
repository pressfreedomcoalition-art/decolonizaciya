# Задача агента: мод «Деколонизация» к Millennium Dawn

Сделай всё ниже **самостоятельно**, без ожидания подтверждений.

## Цель
HOI4-сабмод к **Millennium Dawn: A Modern Day Mod** (Steam Workshop `2777392649`, MD 2.0.0 / HOI4 1.19.*) про **деколонизацию РФ** — распад/освобождение колониальных субъектов РФ, новые тэги, фокусы, ивенты.

## GitHub
1. Аккаунт уже залогинен в `gh`: **pressfreedomcoalition-art** (коалиция / Freedom.Co). Не переключай аккаунт.
2. Создай публичный (или private, если create public недоступен) репозиторий с именем **`деколонизация`** (если Cyrillic slug отвергнут — `decolonizaciya`, description: «Millennium Dawn submod: деколонизация РФ»).
3. Инициализируй git в этой папке (`c:\git\decolonizaciya`), сделай initial commit, запушь в `main` на этот remote.
4. Верни URL репо.

## Каркас мода (обязательный минимум)
- `descriptor.mod` + `.mod` для Documents/Paradox: name вроде `Millennium Dawn: Деколонизация РФ`, `dependencies = { "Millennium Dawn: A Modern Day Mod" }`, `supported_version = "1.19.*"`.
- README: что это сабмод к MD, как поставить (Workshop later / local mod path), зависимость от MD 2.0.
- Базовая структура Paradox: `common/`, `history/`, `events/`, `localisation/` (хотя бы заготовки + 1–2 примерных тэга/ивента про деколонизацию субъектов РФ — Чувашия/Волжская Булгария и ещё один регион как прототип).
- `.gitignore` для Paradox/IDE мусора.

## Контекст
Родительский мод локально: `C:\Program Files (x86)\Steam\steamapps\workshop\content\394360\2777392649`.
Смежный госпроект (для лора/нейминга, не копировать код портала): `c:\git\State_ChuvashiaVolgaBulgaria`.

Не трогай файлы Millennium Dawn в workshop — только отдельный сабмод в этом репо.

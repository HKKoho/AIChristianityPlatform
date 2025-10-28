# Internationalization (i18n) Implementation

This document describes the internationalization implementation for the AI Theology Platform, supporting both **English** and **Traditional Chinese (繁體中文)**.

## Overview

The application now supports full internationalization using **i18next** and **react-i18next**, allowing users to seamlessly switch between English and Traditional Chinese languages.

## Features

- ✅ **Two Languages**: English (en) and Traditional Chinese (zh-TW)
- ✅ **Language Switcher**: Toggle button in the top-right corner of the landing page
- ✅ **Persistent Language Selection**: User preference saved in localStorage
- ✅ **Auto-detection**: Detects browser language on first visit
- ✅ **Default Language**: Traditional Chinese (zh-TW)

## Implementation Details

### Dependencies Installed

```bash
npm install i18next react-i18next i18next-browser-languagedetector
```

### Folder Structure

```
src/
├── config/
│   └── i18n.ts                    # i18next configuration
├── locales/
│   ├── en/                        # English translations
│   │   ├── common.json            # Common UI elements
│   │   ├── landing.json           # Landing page
│   │   ├── bible.json             # Bible study module
│   │   ├── language.json          # Biblical language module
│   │   ├── theology.json          # Theology research module
│   │   ├── journey.json           # Theologian journal module
│   │   ├── dialogue.json          # Theological dialogue module
│   │   └── sermon.json            # Sermon generator module
│   └── zh-TW/                     # Traditional Chinese translations
│       ├── common.json
│       ├── landing.json
│       ├── bible.json
│       ├── language.json
│       ├── theology.json
│       ├── journey.json
│       ├── dialogue.json
│       └── sermon.json
└── components/
    └── common/
        └── LanguageSwitcher.tsx   # Language toggle component
```

### Configuration

The i18n configuration is set up in `src/config/i18n.ts`:

- **Default Language**: Traditional Chinese (zh-TW)
- **Fallback Language**: Traditional Chinese (zh-TW)
- **Detection Order**: localStorage → browser navigator
- **Storage**: localStorage key `i18nextLng`

### Usage in Components

#### Import the hook:
```typescript
import { useTranslation } from 'react-i18next';
```

#### Use translations in a component:
```typescript
const MyComponent: React.FC = () => {
  const { t } = useTranslation(['common', 'landing']);

  return (
    <div>
      <h1>{t('common:appTitle')}</h1>
      <p>{t('landing:capabilities.bibleGame.description')}</p>
    </div>
  );
};
```

### Translation Keys Structure

Translation keys follow a namespaced structure:

```typescript
// Format: t('namespace:key.path')
t('common:appTitle')                              // "AI 神學平台" or "AI Theology Platform"
t('landing:capabilities.bibleGame.title')         // "聖經研讀" or "Bible Study"
t('sermon:inputForm.topic')                       // "講道主題" or "Sermon Topic"
```

## Completed Implementations

### ✅ Landing Page
- App title and subtitle
- All 6 capability cards (title, description, icon)
- Language switcher component

### 📝 Translation Files Created

All translation files have been created for:
1. **common.json** - Common UI elements (buttons, labels, messages)
2. **landing.json** - Landing page content
3. **bible.json** - Bible study game module
4. **language.json** - Biblical language learning module
5. **theology.json** - Theological research assistant
6. **journey.json** - Theologian journal module
7. **dialogue.json** - Theological dialogue module
8. **sermon.json** - Sermon generator module

## How to Add New Translations

### Step 1: Add to JSON files

Add your new key to both English and Traditional Chinese JSON files:

**English** (`src/locales/en/common.json`):
```json
{
  "newKey": "New English Text"
}
```

**Traditional Chinese** (`src/locales/zh-TW/common.json`):
```json
{
  "newKey": "新的中文文字"
}
```

### Step 2: Use in component

```typescript
const { t } = useTranslation('common');

return <div>{t('newKey')}</div>;
```

## Language Switcher Component

The `LanguageSwitcher` component is located at `src/components/common/LanguageSwitcher.tsx`.

Features:
- Toggle between English and Traditional Chinese
- Shows current language (中文 or EN)
- Globe icon indicator
- Hover tooltip
- Responsive design

## Testing

### Build Test
```bash
npm run build
```
✅ Build successful with i18n integration

### Development Server
```bash
npm run dev
```
Visit http://localhost:3007 and test:
1. Landing page displays in default language (Traditional Chinese)
2. Click language switcher to toggle to English
3. Refresh page - language preference persists
4. Navigate between pages - language remains consistent

## Next Steps

To complete full internationalization across the entire application:

### Phase 2: Remaining Components

1. **Sermon Generator** (`src/components/sermon/`)
   - InputForm.tsx
   - ResultDisplay.tsx
   - SavedPresentations.tsx
   - AdminPanel.tsx

2. **Bible Study Game** (`src/components/bible/`)
   - BibleGame.tsx
   - QuestModal.tsx
   - JournalModal.tsx
   - LevelCompleteModal.tsx

3. **Biblical Language** (`src/components/language/`)
   - BiblicalLanguage.tsx
   - VerseSelector.tsx
   - AlphabetLearning.tsx

4. **Theology Assistant** (`src/components/theology/`)
   - TheologyAssistant.tsx

5. **Theologian Journey** (`src/components/journey/`)
   - TheologicalJourney.tsx
   - MindMap.tsx
   - Timeline.tsx
   - Editor.tsx

6. **Theological Dialogue** (`src/components/dialogue/`)
   - TheologicalDialogue.tsx
   - DialogueWindow.tsx
   - PersonaCreator.tsx

### Implementation Pattern

For each component:

1. Import the hook:
```typescript
import { useTranslation } from 'react-i18next';
```

2. Initialize in component:
```typescript
const { t } = useTranslation(['common', 'specificNamespace']);
```

3. Replace hardcoded strings:
```typescript
// Before:
<h1>聖經研讀</h1>

// After:
<h1>{t('bible:title')}</h1>
```

4. Ensure corresponding translations exist in both:
   - `src/locales/en/specificNamespace.json`
   - `src/locales/zh-TW/specificNamespace.json`

## Best Practices

1. **Consistent Keys**: Use camelCase for translation keys
2. **Namespacing**: Group related translations in same namespace
3. **Fallback**: Always provide fallback text for missing keys
4. **Testing**: Test both languages after adding new translations
5. **Context**: Add comments in JSON for context when needed
6. **Variables**: Use interpolation for dynamic content:
   ```json
   {
     "greeting": "Hello {{name}}"
   }
   ```
   ```typescript
   t('greeting', { name: 'John' }) // "Hello John"
   ```

## Troubleshooting

### Issue: Translations not updating
**Solution**: Clear localStorage and refresh browser
```javascript
localStorage.removeItem('i18nextLng');
```

### Issue: Missing translation warning
**Solution**: Check that the key exists in both language JSON files

### Issue: Language not persisting
**Solution**: Verify localStorage is enabled and not blocked

## Resources

- [i18next Documentation](https://www.i18next.com/)
- [react-i18next Documentation](https://react.i18next.com/)
- [i18next Browser Language Detector](https://github.com/i18next/i18next-browser-languageDetector)

## Version History

- **v1.0.0** (2025-10-29): Initial i18n implementation
  - Installed i18next dependencies
  - Created translation files for all modules
  - Implemented LanguageSwitcher component
  - Updated LandingPage with full translation support
  - Build verified and working

---

**Status**: ✅ Foundation Complete - Ready for Phase 2 Component Updates
**Last Updated**: 2025-10-29

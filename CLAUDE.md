# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Kontekst aplikacji

**Król Kauciusz** — aplikacja pomagająca użytkownikowi zliczać ilość oddanych butelek/puszek kaucyjnych, konkurować w tabeli wyników i budować swój profil. Kluczowe mechaniki:

- **Świnka-skarbonka**: wizualizacja napełniania się kwotą do celu ustawionego przez użytkownika.
- **Wpływ na środowisko**: przelicznik ilości butelek/puszek na zajmowaną objętość (m³), bazujący na średniej powierzchni sklepu Biedronka w Polsce oraz średniej wielkości puszki/butelki.
- **Zarobek**: suma pieniędzy odzyskanych z kaucji.
- **Profil i tytuły**: progresja na podstawie ilości zebranych butelek, odblokowywana w miarę zbierania.
- **Sklep**: customizacja profilu (m.in. customowe efekty dla nicków).
- **Reklamy**: aplikacja jest monetyzowana reklamami.
- **Wprowadzanie danych**: zdjęcie paragonu (OCR) lub ręczne wpisanie ilości — ręczny tryb istnieje, żeby dane dało się zweryfikować/nie dało się oszukać systemu.

## Stan repozytorium

To jest świeży projekt `create-expo-app` (Expo SDK 56, Expo Router, TypeScript) — poza `app.json`/`CLAUDE.md` cały kod w `src/` to domyślny szablon (tabs Home/Explore, `ThemedText`/`ThemedView`, `use-color-scheme`). Żadna z mechanik opisanych wyżej nie jest jeszcze zaimplementowana. Traktuj obecną strukturę jako punkt startowy do rozbudowy, nie jako gotową architekturę do naśladowania 1:1.

## Komendy

```bash
npx expo start               # dev server (Expo Go / dev build)
npx expo start --android     # uruchom na Androidzie
npx expo start --ios         # uruchom na iOS
npx expo lint                # ESLint
npx tsc --noEmit             # typecheck
npx expo-doctor              # diagnostyka zależności/configu
npx expo install --fix       # napraw niekompatybilne wersje pakietów
```

Brak jeszcze konfiguracji testów. Jeśli dodajesz testy, użyj `npx expo install jest-expo jest @testing-library/react-native` i uruchamiaj przez `jest <plik>` dla pojedynczego testu — nie dodawaj frameworka testowego "na zapas" zanim nie ma kodu, który tego wymaga.

Uruchom `npx expo lint` i `npx tsc --noEmit` przed zgłoszeniem zadania jako ukończone.

## Architektura

- Routing: **Expo Router**, pliki w `src/app/` to ekrany, `_layout.tsx` definiuje nawigację (obecnie `NativeTabs` z `expo-router/unstable-native-tabs` w `src/components/app-tabs.tsx`).
- Platform-specific pliki używają suffixów `.web.tsx` (patrz `animated-icon.web.tsx`, `use-color-scheme.web.ts`) — Metro/webpack wybiera właściwy wariant automatycznie po platformie.
- Motyw (`src/constants/theme.ts`) eksportuje `Colors` (light/dark), `Fonts`, `Spacing` jako tokeny — nowe komponenty mają czerpać stąd, nie hardkodować kolorów/odstępów.
- `useColorScheme` (`src/hooks/use-color-scheme.ts`) to jedyne źródło prawdy o motywie; komponenty pobierają kolory przez `Colors[scheme]`, nigdy przez media queries bezpośrednio.

## Proponowany stack pod docelową aplikację

Do zaimplementowania mechanik opisanych w "Kontekst aplikacji", zanim dodasz nową zależność, sprawdź czy nie pokrywa jej już coś z `expo install`:

| Potrzeba | Rekomendacja |
|---|---|
| Baza danych / backend / auth / ranking globalny | Supabase (Postgres + Auth + Realtime) — `supabase:supabase` skill ma gotowe wzorce, tańsze niż własny backend |
| Przechowywanie lokalne (cache, ustawienia) | `expo-sqlite` lub `@react-native-async-storage/async-storage` — nie wprowadzaj Realm/WatermelonDB bez realnej potrzeby offline-first |
| OCR paragonu | `expo-camera` do zdjęcia + backend/edge function robiący OCR (np. Google Vision / AWS Textract) — OCR na urządzeniu jest niepotrzebnie ciężki na start |
| Animacje | `react-native-reanimated` (już jest) + `react-native-skia` tylko jeśli świnka/wykresy wymagają rysowania customowego — patrz sekcja Animacje niżej |
| Reklamy | `react-native-google-mobile-ads` (oficjalnie wspierane przez Expo config plugin) |
| Płatności w sklepie (customizacje) | `react-native-iap` lub Expo In-App Purchases odpowiednik — dopiero gdy sklep faktycznie sprzedaje realne produkty |
| Stan globalny | Zustand — mniej boilerplate'u niż Redux, wystarcza dla apki tej skali |
| Formularze / walidacja wpisywanej ilości butelek | `zod` do walidacji + kontrolowane komponenty RN, bez pełnego form-lib (react-hook-form dopiero jeśli formularze się namnożą) |

Nie dodawaj żadnej z tych zależności zanim nie zaczynasz pisać funkcji, która jej realnie potrzebuje.

## Zasady pisania CLAUDE.md / instrukcji dla AI (oszczędność tokenów)

Ten plik i wszelkie przyszłe aktualizacje mają trzymać się poniższych zasad, żeby model nie marnował tokenów bez utraty precyzji:

- **Fakty, nie narracja.** Zdania oznajmujące ("X używa Y"), nie eseje uzasadniające dlaczego.
- **Nie duplikuj tego, co model i tak wyczyta z kodu.** Nie opisuj struktury katalogów, którą widać z jednego `ls`, nie wymieniaj każdego komponentu — to marnowanie tokenów na coś odtwarzalne za darmo.
- **Tabele i listy zamiast prozy** tam, gdzie dane są tabelaryczne (jak stack wyżej) — token/informacja jest wyższy niż w zdaniach.
- **Jedno źródło prawdy.** `AGENTS.md` ma reguły Expo/EAS, `CLAUDE.md` ma kontekst domenowy i konwencje projektowe — nie powielaj treści między plikami (stąd `@AGENTS.md` na górze zamiast kopiowania).
- **Linkuj do docs zamiast wklejać ich treść.** Jedna linia z URL-em do `docs.expo.dev` kosztuje mniej niż wklejona sekcja dokumentacji, która i tak się zdezaktualizuje.
- **Aktualizuj, nie dopisuj.** Gdy fakt się zmienia (np. stack z sekcji wyżej faktycznie się zaimplementuje), edytuj istniejący wpis zamiast dopisywać nowy akapit obok starego.
- **Przykłady kodu tylko gdy konwencja jest nieoczywista.** Nazwa dobrze nazwanej funkcji nie potrzebuje przykładu użycia.

## Czysty, bezpieczny i rozbudowywalny kod

- Trzymaj się TypeScript strict (już włączony w `tsconfig.json`) — nie wyłączaj `strict`, nie używaj `any` jako obejścia typów.
- Logika biznesowa (przeliczniki objętości, zasady progresji tytułów, walidacja ilości butelek) ma żyć w `src/lib/` lub `src/hooks/` jako czyste funkcje/hooki, testowalne bez renderowania UI — nie wklejaj jej bezpośrednio w komponenty ekranów.
- Jeden plik = jedna odpowiedzialność: komponent ekranu (`src/app/`) orkiestruje, nie implementuje algorytmów.
- Waliduj dane wejściowe na granicy systemu (input użytkownika, odpowiedź OCR, odpowiedź backendu) — nie w środku łańcucha wywołań.
- Nazwy plików/komponentów w kebab-case (zgodnie z istniejącą konwencją: `themed-text.tsx`, `use-color-scheme.ts`).
- Nie dodawaj abstrakcji (interfejs, factory, warstwa serwisowa) dopóki nie ma drugiego realnego przypadku użycia.

## Bezpieczeństwo aplikacji mobilnej

- **Zliczanie kaucji nie może być łatwe do oszukania**: ręczne wpisywanie ilości istnieje właśnie po to — waliduj rozsądne górne limity (np. brak sensu > kilkuset butelek na jeden wpis) i rozważ rate-limiting/anti-abuse po stronie backendu, nie tylko klienta. Logika punktacji/tytułów ma być liczona i weryfikowana po stronie serwera (Supabase RPC/Edge Function), nigdy zaufana z samego klienta — inaczej tabela wyników jest trywialna do zmanipulowania.
- **Zdjęcia paragonów** mogą zawierać dane osobowe (adres sklepu, czasem dane karty na paragonie) — nie przechowuj surowych zdjęć dłużej niż to potrzebne do OCR; jeśli trzeba je zachować, szyfruj w spoczynku i ogranicz dostęp regułami RLS w Supabase.
- **Auth**: tokeny sesji trzymaj w `expo-secure-store`, nigdy w `AsyncStorage`/plain storage.
- **Płatności w sklepie**: weryfikacja zakupu (receipt validation) zawsze po stronie serwera, nie ufaj samemu zdarzeniu "zakup udany" z klienta.
- **Sekrety** (klucze API OCR, Ads, Supabase service role) nigdy w kodzie klienckim ani w `app.json`/`extra` — tylko jako zmienne środowiskowe backendu/Edge Function.
- Sprawdzaj `npx expo-doctor` i śledź CVE zależności przy każdym większym dodaniu paczki.

## Animacje

- Domyślny wybór: **`react-native-reanimated`** (już zainstalowany) — działa na UI thread, nie blokuje JS thread przy scrollu/gestach.
- Świnka napełniająca się monetami i paski postępu tytułów: `Animated` API z `useSharedValue`/`useAnimatedStyle`, interpolacja wartości procentowej — nie custom Canvas dopóki potrzebny jest tylko prosty fill/scale/opacity.
- Splash/intro (`AnimatedSplashOverlay` w `src/components/animated-icon.tsx`) to już istniejący wzorzec do naśladowania dla podobnych przejść.
- Reguła: animacja ma komunikować stan (np. przyrost kaucji, odblokowanie tytułu), nie być ozdobą samą w sobie — jeśli nie niesie informacji, prawdopodobnie niepotrzebna.
- Zawsze udostępniaj `prefers-reduced-motion`/skrót animacji tam, gdzie RN to wspiera, dla dostępności.
- Testuj animacje na realnym urządzeniu/emulatorze niskiej klasy przed uznaniem za gotowe — Reanimated na UI thread bywa płynny w simulatorze, a i tak warto zweryfikować na słabszym Androidzie.

## Dokumentacja i task management

- Nie twórz plików `*.md` z notatkami/planami "na wszelki wypadek" — jeśli zadanie wymaga planu wieloetapowego, użyj planu w rozmowie (`superpowers:writing-plans`), nie osobnego pliku w repo.
- Komentarze w kodzie tylko tam, gdzie WHY jest nieoczywiste (obejście buga w bibliotece, nieoczywisty invariant) — nie opisuj CO robi kod, gdy nazwa zmiennej/funkcji już to mówi.
- Historia zmian i uzasadnienia decyzji żyją w commitach/PR-ach, nie w komentarzach kodu ani w tym pliku.
- Zadania w ramach jednej sesji trzymaj w narzędziu task/TODO agenta, nie w plikach repo — ten plik ma opisywać stan trwały projektu, nie bieżącą pracę w toku.

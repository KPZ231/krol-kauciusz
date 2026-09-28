# 👑 Król Kauciusz

Aplikacja mobilna (Expo / React Native), która pomaga zliczać oddane butelki i puszki kaucyjne, motywuje do zbierania kaucji i pokazuje, jak dużo dzięki temu zyskuje środowisko i portfel użytkownika.

## Co robi aplikacja

- **Licznik butelek/puszek** — dodawanie ilości poprzez zdjęcie paragonu (OCR) lub ręczne wpisanie liczby, żeby danych nie dało się łatwo zafałszować.
- **Świnka-skarbonka** — wizualne napełnianie się kwotą kaucji do celu ustawionego przez użytkownika.
- **Wpływ na środowisko** — przelicznik ilości oddanych opakowań na zajmowaną objętość (m³), odniesiony do średniej powierzchni sklepu Biedronka oraz średniej wielkości puszki/butelki.
- **Zarobek z kaucji** — suma pieniędzy odzyskanych dzięki zwrotom.
- **Ranking** — tabela wyników, w której użytkownicy rywalizują ilością zebranych opakowań.
- **Profil i tytuły** — progresja i tytuły przyznawane w zależności od ilości zebranych butelek/puszek.
- **Sklep** — customizacja profilu, w tym customowe efekty dla nicków.
- **Reklamy** — aplikacja jest monetyzowana reklamami.

## Stack techniczny

- [Expo](https://expo.dev) + [Expo Router](https://docs.expo.dev/router/introduction/) (routing oparty na plikach)
- React Native + TypeScript
- React Native Reanimated (animacje)

Szczegółowe zasady pracy nad kodem (architektura, konwencje, bezpieczeństwo, animacje) opisane są w [`AGENTS.md`](./AGENTS.md) i [`CLAUDE.md`](./CLAUDE.md).

## Uruchomienie projektu

1. Zainstaluj zależności:

   ```bash
   npm install
   ```

2. Uruchom serwer deweloperski:

   ```bash
   npx expo start
   ```

3. Z poziomu terminala wybierz, gdzie otworzyć aplikację:
   - [development build](https://docs.expo.dev/develop/development-builds/introduction/)
   - [emulator Androida](https://docs.expo.dev/workflow/android-studio-emulator/)
   - [symulator iOS](https://docs.expo.dev/workflow/ios-simulator/)
   - [Expo Go](https://expo.dev/go)

## Przydatne komendy

```bash
npx expo start --android   # uruchom na Androidzie
npx expo start --ios       # uruchom na iOS
npx expo lint              # lint
npx tsc --noEmit           # sprawdzenie typów
npx expo-doctor            # diagnostyka zależności i konfiguracji
npx expo install --fix     # naprawa niekompatybilnych wersji pakietów
```

## Licencja

Projekt objęty jest licencją [MIT](./LICENSE).

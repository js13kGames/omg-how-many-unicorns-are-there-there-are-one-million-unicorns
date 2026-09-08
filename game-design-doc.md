# PROJECT UNICORN FLOOD

## Game Design Document

**Status:** Pre-production / gameplay prototype
**Wersja dokumentu:** 0.1
**Gatunek:** Incremental Tower Defense / Horde Defense / Action Strategy
**Tryb podstawowy:** Single-player
**Perspektywa:** widok z góry / ukośny widok strategiczny
**Główny motyw:** ponura forteca broniąca się przed absurdalnie wielką, kolorową hordą jednorożców

---

# 1. HIGH CONCEPT

Gracz broni fortecy przed ogromną hordą jednorożców, budując i rozwijając system obronny składający się z kilku wyspecjalizowanych rodzajów wież oraz aktywnych zdolności.

Najważniejszym elementem gry nie jest samo „wygranie mapy”, lecz stopniowe przełamywanie coraz potężniejszej hordy.

Każde podejście zapewnia trwały postęp.

Gracz:

1. rozpoczyna próbę,
2. buduje obronę,
3. obserwuje napływ tysięcy jednostek,
4. powstrzymuje je coraz bardziej spektakularnymi sposobami,
5. ostatecznie przegrywa albo kończy etap,
6. otrzymuje zasoby,
7. kupuje trwałe ulepszenia,
8. wraca na mapę znacznie silniejszy,
9. dociera dalej niż poprzednio.

Podstawowa emocja gry:

**„Jeszcze jedna próba. Teraz na pewno ich zatrzymam.”**

---

# 2. PLAYER FANTASY

Fantasy gracza nie polega na byciu genialnym generałem wykonującym skomplikowane obliczenia.

Fantasy brzmi:

> „Zbudowałem absurdalnie potężną machinę wojenną, która zamienia dziesiątki tysięcy jednorożców w kolorową katastrofę.”

Gracz powinien przechodzić przez trzy stany emocjonalne.

### Stan A — zagrożenie

Na początku fala wygląda niemożliwie.

Gracz widzi masę przeciwników większą niż możliwości jego obrony.

### Stan B — kontrola

Po kilku upgrade'ach poprzednio niebezpieczna fala zaczyna być powstrzymywana.

Gracz czuje wyraźny wzrost mocy.

### Stan C — dominacja

Dawniej groźny fragment mapy zostaje całkowicie zniszczony przez system obronny.

Setki przeciwników znikają w sekundę.

Następnie pojawia się kolejna fala, która ponownie przywraca poczucie zagrożenia.

Gra cały czas oscyluje pomiędzy:

**„Nie dam rady.”**

i

**„Jestem absurdalnie potężny.”**

---

# 3. FILARY GAMEPLAYU

## 3.1. Ogromna horda

Ekran powinien być w stanie zawierać ogromną liczbę przeciwników.

Nie chodzi jedynie o wartość liczbową.

Horda musi wyglądać jak fizyczna masa.

Powinna:

* zagęszczać się,
* przeciskać przez przejścia,
* rozpływać się na otwartej przestrzeni,
* reagować na eksplozje,
* rozdzielać się wokół przeszkód,
* ponownie się łączyć,
* tworzyć lokalne zatory.

Gracz powinien bardziej postrzegać hordę jako „żywy płyn” niż jako grupę niezależnych przeciwników.

---

## 3.2. Spektakularna destrukcja

Każdy mocny system ofensywny powinien wpływać na wiele jednostek jednocześnie.

Najlepsze momenty gry powstają, kiedy:

* eksplozja wyrzuca grupę przeciwników,
* laser przecina całą kolumnę,
* chain attack przeskakuje przez dziesiątki celów,
* fala zamrożenia zatrzymuje cały front,
* ogromna zdolność aktywna czyści dużą część ekranu.

---

## 3.3. Trwała progresja

Porażka nigdy nie powinna być całkowicie straconym czasem.

Każdy run daje możliwość:

* zwiększenia obrażeń,
* zwiększenia zasięgu,
* poprawy fire rate,
* odblokowania wież,
* poprawy ekonomii,
* poprawy zdolności aktywnych,
* zwiększenia liczby dostępnych konstrukcji.

---

## 3.4. Natychmiast zauważalny wzrost mocy

Upgrade musi być odczuwalny.

Jeżeli gracz kupił:

**+20% fire rate**

powinien to zauważyć podczas następnej próby.

Jeżeli kupił:

**+1 penetration**

powinien natychmiast zobaczyć pociski przebijające więcej przeciwników.

---

## 3.5. Proste decyzje, duży rezultat

Gra nie powinna wymagać bardzo skomplikowanego micromanagementu.

Podstawowe decyzje:

* gdzie postawić wieżę,
* jaką wieżę postawić,
* co ulepszyć,
* kiedy odpalić zdolność,
* jaki fragment mapy wzmocnić.

Każda z nich powinna prowadzić do dużej różnicy wizualnej lub systemowej.

---

# 4. CORE LOOP

## 4.1. Pętla pojedynczej próby

```text
START MAPY
↓
krótka faza przygotowania
↓
ustawienie / zakup obrony
↓
nadejście hordy
↓
automatyczna walka
↓
gracz obserwuje słabe punkty
↓
gracz używa aktywnych zdolności
↓
eskalacja
↓
przełamanie obrony albo zwycięstwo
↓
podsumowanie
```

---

# 5. META LOOP

```text
ROZPOCZNIJ RUN
↓
ZDOBĄDŹ WALUTĘ
↓
PRZEGRAJ / WYGRAJ
↓
UPGRADE TREE
↓
KUP TRWAŁE ULEPSZENIA
↓
WRÓĆ NA MAPĘ
↓
DOTRZYJ DALEJ
↓
ZDOBĄDŹ WIĘCEJ WALUTY
↓
ODBLOKUJ NOWE SYSTEMY
↓
POWTÓRZ
```

Meta loop jest równie istotny jak sama walka.

---

# 6. STRUKTURA SESJI

Docelowa długość pojedynczego podejścia:

**3–12 minut.**

Pierwsze próby mogą kończyć się szybko.

Po kilku upgrade'ach ta sama mapa może trwać znacznie dłużej.

Gracz nie powinien przez kilka minut czekać, aż pojawi się problem.

Pierwsze realne zagrożenie:

**20–40 sekund od początku runu.**

Pierwszy spektakularny moment:

**najpóźniej w pierwszej minucie.**

---

# 7. WARUNEK ZWYCIĘSTWA

Każda mapa ma określoną liczbę głównych fal lub długość szturmu.

Gracz wygrywa, gdy:

* przetrwa wszystkie główne fale,
* pokona końcową falę,
* zachowa przynajmniej 1 punkt integralności fortecy.

---

# 8. WARUNEK PORAŻKI

Każdy jednorożec, który osiąga wejście do fortecy:

* zadaje określoną wartość obrażeń,
* następnie znika z symulacji.

Forteca posiada:

**Fortress Integrity.**

Przykład:

```text
Integrity: 100 / 100
```

Zwykły jednorożec:

```text
1 damage
```

Ciężki jednorożec:

```text
5 damage
```

Boss:

```text
20 damage
```

Po osiągnięciu:

```text
Integrity = 0
```

run się kończy.

---

# 9. HORDA — NAJWAŻNIEJSZY SYSTEM GRY

Najważniejszym zadaniem techniczno-designowym jest stworzenie zachowania tłumu.

Nie chcemy, żeby każdy przeciwnik zachowywał się jak klasyczna jednostka RTS.

Zamiast tego chcemy uzyskać wrażenie:

**płynącej masy.**

---

# 10. REPREZENTACJA PRZECIWNIKA

Każdy przeciwnik posiada minimalny zestaw danych gameplayowych:

```text
position
velocity
movement_speed
radius
health
max_health

movement_state
status_effects

knockback_velocity

enemy_type

goal_progress
```

Nie potrzebujemy indywidualnego skomplikowanego AI.

99% przeciwników powinno działać poprzez bardzo prosty wspólny system.

---

# 11. NAWIGACJA HORDY

Rekomendowany model:

# FLOW FIELD

Zamiast liczyć indywidualną ścieżkę dla każdego jednorożca, świat posiada pole kierunków prowadzące w stronę fortecy.

Mapa zostaje podzielona logicznie na komórki.

Każda komórka posiada wartość:

```text
distance_to_goal
```

oraz:

```text
preferred_direction
```

Pole jest liczone od celu w stronę całej mapy.

---

# 12. GENEROWANIE FLOW FIELDU

Najpierw tworzymy mapę kosztu przejścia.

Przykład:

```text
otwarty teren      = koszt 1
błoto              = koszt 2
stromy teren       = koszt 3
przeszkoda         = brak przejścia
```

Od pola fortecy obliczamy koszt dojścia do każdej dostępnej komórki.

Dla każdej komórki:

```text
preferred_direction =
direction toward lowest neighboring cost
```

Jednorożec zamiast wykonywać pełne pathfinding:

```text
desired_velocity =
flow_direction * movement_speed
```

---

# 13. RUCH LOKALNY

Samo flow field będzie wyglądało zbyt sztucznie.

Dlatego finalny ruch składa się z kilku komponentów:

```text
movement =
flow_force
+ separation_force
+ pressure_force
+ obstacle_force
+ noise_force
+ knockback_force
```

Każdy składnik posiada osobną wagę.

---

# 14. FLOW FORCE

Podstawowa siła ruchu:

```text
flow_force =
normalized(flow_direction) * desired_speed
```

To główna tendencja prowadząca do fortecy.

---

# 15. SEPARATION FORCE

Jednostki nie powinny zajmować dokładnie tego samego miejsca.

Dla sąsiadów znajdujących się w promieniu:

```text
separation_radius
```

liczymy:

```text
difference = self.position - neighbor.position

distance = length(difference)
```

Jeżeli:

```text
distance < desired_distance
```

dodajemy siłę:

```text
separation =
normalize(difference)
* (desired_distance - distance)
```

Bliscy sąsiedzi mają większy wpływ niż dalecy.

---

# 16. SPATIAL PARTITIONING

Nie można sprawdzać każdego jednorożca przeciw każdemu.

Dla:

```text
10 000 jednostek
```

pełna liczba porównań byłaby ogromna.

Dlatego przestrzeń dzielimy na lokalne komórki.

Każda jednostka zna:

```text
spatial_cell
```

Podczas wyszukiwania sąsiadów sprawdzamy tylko:

* własną komórkę,
* sąsiednie komórki.

W praktyce daje to lokalne zapytania zamiast globalnych.

Możliwe struktury logiczne:

* uniform spatial grid,
* spatial hash,
* hierarchiczna siatka przestrzenna.

Najważniejsza jest właściwość:

> Query kosztuje proporcjonalnie do liczby lokalnych jednostek, a nie całej hordy.

---

# 17. GĘSTOŚĆ HORDY

Każda komórka przestrzeni powinna posiadać:

```text
local_density
```

Przykładowo:

```text
0–2 jednostki       niska gęstość
3–8                 średnia
9–20                wysoka
20+                 bardzo wysoka
```

Gęstość wykorzystujemy do:

* zachowania crowd pressure,
* wyboru celów przez AoE,
* efektów wizualnych,
* dźwięku tłumu,
* skalowania niektórych zachowań.

---

# 18. PRESSURE FORCE

To jeden z kluczowych elementów symulacji.

Jeżeli wiele jednostek znajduje się w jednej przestrzeni, tłum powinien próbować się rozlewać.

Dla komórki możemy policzyć gradient gęstości.

Jednostka dostaje dodatkową siłę:

```text
pressure_force =
direction_toward_lower_density
* density_pressure_strength
```

Rezultat:

horda automatycznie wykorzystuje szerokość przejścia.

---

# 19. CHOKE POINTS

W wąskich przejściach chcemy celowo pozwolić na:

* kompresję tłumu,
* tworzenie korka,
* lekkie nakładanie modeli,
* wzrost lokalnej gęstości.

Nie należy próbować utrzymywać idealnej fizycznej separacji.

Idealna separacja spowodowałaby powstawanie sztucznych kolejek.

Dopuszczamy więc:

```text
soft overlap
```

ale zwiększamy separation force wraz z głębokością przenikania.

---

# 20. NOISE FORCE

Aby tłum nie wyglądał jak jedna idealna siatka:

```text
noise_force =
small varying directional perturbation
```

Każda jednostka otrzymuje niewielkie odchylenie.

Noise powinien być:

* niewielki,
* powolny,
* stabilny przez chwilę.

Nie powinien wyglądać jak losowe drganie.

---

# 21. OBSTACLE AVOIDANCE

Jednostka sprawdza przestrzeń przed sobą.

Jeśli kierunek ruchu prowadzi w przeszkodę:

```text
obstacle_force =
direction tangent to obstacle
```

Flow field powinien wykonywać większość pracy.

Obstacle avoidance służy jedynie do lokalnego wygładzenia ruchu.

---

# 22. FINALNY WEKTOR RUCHU

Przykład:

```text
desired =
flow * 1.0
+ separation * 0.7
+ pressure * 0.4
+ obstacle * 1.2
+ noise * 0.05
```

Następnie:

```text
desired = clamp_length(desired, max_speed)
```

Rzeczywista prędkość nie powinna natychmiast przeskakiwać.

Można stosować:

```text
velocity =
approach(current_velocity, desired_velocity, acceleration)
```

Daje to bardziej organiczny ruch.

---

# 23. KNOCKBACK

Eksplozje nie powinny bezpośrednio nadpisywać normalnego ruchu.

Jednostka posiada dodatkowy:

```text
external_velocity
```

Przy eksplozji:

```text
external_velocity += explosion_direction * force
```

Każdego kroku symulacji:

```text
external_velocity *= damping
```

Finalny ruch:

```text
velocity =
movement_velocity
+ external_velocity
```

Dzięki temu tłum:

* rozpada się przy eksplozji,
* po chwili wraca do naturalnego przepływu.

---

# 24. MASSA PRZECIWNIKÓW

Różne jednostki posiadają:

```text
mass
```

Knockback:

```text
effective_knockback =
force / mass
```

Zwykły jednorożec:

```text
mass = 1
```

Ciężki:

```text
mass = 4
```

Mini-boss:

```text
mass = 15
```

---

# 25. STANY JEDNOSTKI

Minimalny state machine:

```text
SPAWNING
MOVING
STAGGERED
FROZEN
DEAD
REACHED_GOAL
```

Nie należy tworzyć kilkunastu zachowań AI bez potrzeby.

---

# 26. ŚMIERĆ PRZECIWNIKA

Po:

```text
health <= 0
```

jednostka przestaje być częścią kosztownej symulacji.

Gameplayowy obiekt powinien zostać usunięty szybko.

Elementy wizualne po śmierci mogą pozostawać niezależnie.

Przykłady:

* konfetti,
* brokat,
* tęczowa plama,
* gwiazdki,
* cukierki,
* mała chmurka.

To pozwala tworzyć wrażenie ogromnej destrukcji bez utrzymywania martwych jednostek w systemie hordy.

---

# 27. SPAWN SYSTEM

Jednorożce nie powinny pojawiać się z jednego punktu.

Każda strefa spawn posiada powierzchnię.

Spawn wybiera:

```text
random position within spawn zone
```

z preferencją do równomiernego rozmieszczenia.

Możemy stosować:

```text
stratified random sampling
```

Zamiast czystego randomu obszar dzielimy na części i rotacyjnie wybieramy różne fragmenty.

Zapobiega to powstawaniu przypadkowych dziur.

---

# 28. WAVE DIRECTOR

Fala nie powinna być prostym:

```text
spawn 500 enemies
```

Każda fala składa się z segmentów.

Przykład:

```text
INTRO
BUILDUP
PRESSURE
BURST
RELIEF
SECOND BURST
FINALE
```

---

# 29. BUDŻET FALI

Każdy typ przeciwnika posiada koszt.

Przykład:

```text
basic unicorn      1
fast unicorn       1.5
armored unicorn    4
giant unicorn      10
```

Fala posiada:

```text
wave_budget
```

Przykład:

```text
Wave 1 = 300
Wave 2 = 450
Wave 3 = 680
Wave 4 = 1000
```

Director zużywa ten budżet zgodnie z kompozycją fali.

---

# 30. KRZYWA ESKALACJI

Można stosować bazową funkcję:

```text
B(n) = B0 * growth^n
```

gdzie:

```text
B0 = początkowy budżet
growth = około 1.2–1.5
n = numer fali
```

Nie należy polegać wyłącznie na wzorze.

Ręcznie zaprojektowane skoki są ważniejsze niż matematyczna perfekcja.

---

# 31. TEMPO FALI

Jednym z najważniejszych parametrów jest:

```text
spawn_rate
```

Ta sama liczba przeciwników może dawać zupełnie inne doświadczenie.

500 jednostek przez 60 sekund:

łagodna fala.

500 jednostek przez 10 sekund:

gwałtowny szturm.

Dlatego Wave Director kontroluje osobno:

```text
total_budget
spawn_rate
enemy_composition
spawn_locations
burst_duration
rest_duration
```

---

# 32. ENEMY ARCHETYPES

Pierwsza pełna wersja powinna posiadać niewielką liczbę archetypów.

---

## 32.1. BASIC UNICORN

Rola:

główna masa hordy.

Statystyki:

```text
HP        niskie
Speed     średni
Mass      niska
Damage    1
```

Stanowi około:

**60–85% wszystkich jednostek.**

---

## 32.2. SPRINTER

Mały, bardzo szybki jednorożec.

Rola:

testowanie cleanupu.

```text
HP        bardzo niskie
Speed     bardzo wysoki
Mass      bardzo niska
```

---

## 32.3. CHUBBY UNICORN

Duży, wolny przeciwnik.

```text
HP        wysokie
Speed     niski
Mass      wysoka
```

Jego obecność pomaga rozpychać tłum.

---

## 32.4. CRYSTAL UNICORN

Posiada częściową odporność.

Może mieć:

```text
armor
```

redukujący małe trafienia.

Promuje używanie cięższych wież.

---

## 32.5. ROYAL UNICORN

Mini-boss.

Duży model, bardzo dużo HP.

Powinien być natychmiast zauważalny w masie.

---

# 33. TARGETING TOWERS

Każda wieża posiada:

```text
position
rotation
range

targeting_mode

fire_rate
damage

projectile_or_attack_type
```

---

# 34. TARGET QUERY

Wieża nie powinna przeszukiwać całej hordy.

Używa tej samej struktury przestrzennej co crowd system.

Query:

```text
get enemies inside radius R
```

---

# 35. TARGET PRIORITIES

Podstawowe tryby:

```text
FIRST
LAST
CLOSEST
STRONGEST
WEAKEST
DENSEST
```

W pierwszej wersji nie wszystkie muszą być dostępne dla gracza.

Domyślny tryb:

**FIRST**

czyli przeciwnik z największym:

```text
goal_progress
```

---

# 36. GOAL PROGRESS

Każda komórka flow field posiada odległość od celu.

Możemy więc określić:

```text
progress =
1 - distance_to_goal / max_path_distance
```

Im większy progress, tym bliżej fortecy znajduje się przeciwnik.

Pozwala to wybierać „pierwszego” przeciwnika bez analizowania ścieżki.

---

# 37. WIEŻA 1 — STAR BLASTER

Rola:

**podstawowy sustained DPS.**

Charakterystyka:

* wysoka szybkość strzału,
* małe pojedyncze obrażenia,
* dobry zasięg,
* szybkie śledzenie celu.

Początkowo pocisk trafia jeden cel.

Upgrady:

```text
damage
fire rate
range
projectile speed
pierce
target switching speed
```

Milestone upgrades:

```text
Pierce +1
Pierce +2
Ricochet
Double Shot
Triple Shot
```

---

# 38. WIEŻA 2 — RAINBOW SPRAYER

Rola:

frontline DPS + debuff.

Atak ma kształt stożka.

Każdy przeciwnik znajdujący się w stożku otrzymuje:

```text
damage_per_second
```

oraz status:

```text
Saturated
```

Saturated zwiększa otrzymywane obrażenia.

Przykład:

```text
+15% incoming damage
```

Upgrady:

```text
range
cone width
damage
debuff strength
debuff duration
```

---

# 39. WIEŻA 3 — CLOUD MORTAR

Rola:

daleki AoE + crowd displacement.

Wieża wybiera obszar o wysokiej gęstości.

Nie musi wybierać konkretnego przeciwnika.

Może wyszukiwać:

```text
densest spatial cell within range
```

Atak:

1. pocisk leci do obszaru,
2. następuje eksplozja,
3. przeciwnicy otrzymują damage,
4. dostają radialny knockback.

Falloff:

```text
damage =
max_damage * (1 - distance / radius)
```

Knockback może mieć osobny falloff.

---

# 40. WIEŻA 4 — CANDY CANNON

Rola:

ciężkie obrażenia przeciw zwartej masie.

Niska szybkość strzału.

Bardzo duże obrażenia.

Pocisk może posiadać:

```text
penetration
```

Po każdym trafieniu:

```text
damage *= penetration_decay
```

Przykład:

```text
100%
85%
72%
61%
```

Dzięki temu jedna kula może przejść przez długą linię przeciwników.

---

# 41. WIEŻA 5 — PRISM BEAM

Rola:

geometryczny DPS.

Wieża generuje ciągły promień.

Promień:

* zadaje obrażenia przeciwnikom znajdującym się na linii,
* może przenikać wiele celów,
* może odbijać się od specjalnych powierzchni.

Podstawowy test trafienia:

```text
distance(enemy_position, beam_segment) < enemy_radius
```

Upgrady:

```text
beam damage
beam width
range
reflection count
reflection efficiency
```

---

# 42. REFLECTION

Promień trafiający powierzchnię posiadającą normalną:

```text
N
```

oraz kierunek:

```text
D
```

Nowy kierunek:

```text
R = D - 2 * dot(D,N) * N
```

Każde odbicie może zmniejszać damage.

Przykład:

```text
reflection 1 = 100%
reflection 2 = 80%
reflection 3 = 64%
```

---

# 43. WIEŻA 6 — FRIENDSHIP COIL

Rola:

360° cleanup + chain attack.

Wieża wybiera najbliższy cel.

Następnie znajduje kolejny cel w promieniu:

```text
chain_radius
```

który nie był jeszcze trafiony.

Proces powtarza się:

```text
max_chain_count
```

Każdy jump może zmniejszać obrażenia.

```text
damage_n =
base_damage * decay^n
```

---

# 44. CHAIN SELECTION

Priorytet kolejnego celu:

1. nie był jeszcze trafiony,
2. znajduje się w chain radius,
3. jest najbliżej poprzedniego celu.

Opcjonalnie później:

preferuj grupy o wysokiej gęstości.

---

# 45. WIEŻA 7 — CUPCAKE LAUNCHER

Rola:

support + crowd control.

Pocisk eksploduje na obszarze.

Nakłada:

```text
Slow
```

oraz:

```text
Vulnerability
```

Slow:

```text
movement_speed *= slow_multiplier
```

Przykład:

```text
0.7
```

Czyli 30% spowolnienia.

Wieża sama posiada przeciętny DPS.

Jej wartość pojawia się w synergii.

---

# 46. STATUS EFFECT SYSTEM

Każdy status posiada:

```text
type
strength
duration
source
stacking_rule
```

---

# 47. STACKING RULES

Każdy efekt definiuje zasadę.

### Slow

Najsilniejszy wygrywa.

Nie sumujemy:

```text
30% slow + 30% slow = 60%
```

chyba że specjalny upgrade mówi inaczej.

### Vulnerability

Może się sumować do soft capu.

### Damage over Time

Może posiadać niezależne stacki.

---

# 48. ACTIVE ABILITIES

Gracz posiada osobny zestaw aktywnych zdolności.

Ich rolą jest:

* ratowanie sytuacji,
* dawanie poczucia bezpośredniej kontroli,
* tworzenie spektakularnych momentów.

---

# 49. MAGIC MISSILE

Gracz wskazuje miejsce.

Pocisk eksploduje.

Krótki cooldown.

Rola:

* szybki panic button,
* manualne wsparcie słabego miejsca.

---

# 50. FREEZE RAINBOW

Gracz przeciąga linię przez mapę.

Wszyscy przeciwnicy w obszarze zostają:

```text
Frozen
```

na kilka sekund.

Frozen:

```text
movement_speed = 0
```

Wieże mogą nadal ich atakować.

---

# 51. PEGASUS FLYBY

Gracz wybiera linię przelotu.

Po krótkim opóźnieniu eskadra przelatuje przez mapę.

Zadaje serię eksplozji wzdłuż linii.

Najważniejszy feeling:

```text
telegraph
→ anticipation
→ rapid destruction
```

---

# 52. DIVINE RAINBOW

Gracz wskazuje dwa punkty.

Między nimi przez chwilę działa ogromny promień.

Bardzo wysoki DPS.

Promień może niszczyć całą kolumnę hordy.

---

# 53. UNICORN APOCALYPSE

Najpotężniejsza zdolność.

Bardzo długi cooldown.

Po aktywacji:

1. krótki warning,
2. ekran wizualnie reaguje,
3. ogromna eksplozja,
4. bardzo duża część hordy zostaje usunięta.

Powinna być używana raz lub kilka razy podczas długiego runu.

---

# 54. ABILITY ECONOMY

Cooldown powinien być zasobem strategicznym.

Gracz powinien myśleć:

> „Czy użyć tego teraz, czy poczekać na następną falę?”

Dlatego najpotężniejsze abilities nie mogą być dostępne zbyt często.

---

# 55. BUILD SYSTEM

Wieże stawia się na wyznaczonych obszarach budowy.

Nie powinny blokować ścieżki hordy.

Dzięki temu unikamy systemu tworzenia labiryntów jako głównej mechaniki.

Gracz wybiera:

```text
tower type
position
orientation
```

---

# 56. ORIENTATION

Nie wszystkie wieże muszą korzystać z orientacji.

### Kierunkowe

* Star Blaster,
* Rainbow Sprayer,
* Prism Beam.

### 360°

* Friendship Coil.

### Balistyczne

* Cloud Mortar,
* Cupcake Launcher.

Orientacja daje dodatkowy poziom decyzji bez komplikowania sterowania.

---

# 57. ECONOMY DURING RUN

Istnieją dwa zasoby.

## Temporary Currency

Używana podczas runu.

Robocza nazwa:

**Stars**

Zdobywana za:

* eliminowanie przeciwników,
* przeżycie segmentu fali,
* specjalne milestone'y.

Wydawana na:

* stawianie wież,
* ewentualne lokalne ulepszenia.

Po zakończeniu runu znika.

---

# 58. META CURRENCY

Robocza nazwa:

**Sparkles**

Zostaje po runie.

Zdobywana za:

* zabitych przeciwników,
* osiągnięty progres,
* nowe rekordy,
* zakończone fale,
* ukończenie mapy.

Wydawana w permanent upgrade tree.

---

# 59. NAGRADZANIE ZA PORAŻKĘ

Najważniejsza zasada:

**dłuższy run = większa nagroda.**

Prosta funkcja:

```text
reward =
base_reward
+ kills * kill_value
+ progress_reward
+ milestone_bonus
```

---

# 60. FIRST-TIME BONUS

Za pierwsze osiągnięcie:

```text
Wave 5
Wave 10
Wave 15
Map Complete
```

gracz dostaje bonus.

Zapobiega to odczuciu czystego grindu.

---

# 61. META UPGRADE TREE

Drzewo powinno wyglądać na większe, niż gracz jest w stanie kupić podczas pierwszej godziny.

Kategorie:

```text
GLOBAL
STAR BLASTER
RAINBOW SPRAYER
CLOUD MORTAR
CANDY CANNON
PRISM BEAM
FRIENDSHIP COIL
CUPCAKE LAUNCHER
ABILITIES
ECONOMY
FORTRESS
```

---

# 62. RODZAJE NODE'ÓW

## Stat nodes

Przykład:

```text
+10% damage
+8% range
+12% fire rate
```

## Mechanic nodes

Przykład:

```text
Pierce +1
Chain +2
Explosion Radius +30%
```

## Transformational nodes

Przykład:

```text
Every fifth shot fires three projectiles.
```

---

# 63. RYTM UPGRADE'ÓW

Nie chcemy samych małych procentów.

Rekomendowany rytm:

```text
small
small
small
mechanic
small
small
mechanic
small
transformational
```

Czyli co kilka upgrade'ów zachowanie broni wyraźnie się zmienia.

---

# 64. KRZYWA KOSZTÓW

Koszt kolejnych poziomów:

```text
Cost(n) = BaseCost * Growth^(n-1)
```

Przykład:

```text
BaseCost = 10
Growth = 1.35
```

Daje:

```text
10
14
18
25
33
45
61
```

Wartości zaokrąglamy do czytelnych liczb.

---

# 65. CEL BALANSU META PROGRESSION

Po typowym przegranym runie gracz powinien móc kupić:

**2–5 upgrade'ów.**

Po bardzo krótkim runie:

**minimum 1.**

Po świetnym runie:

**5–10.**

---

# 66. POSTĘP PO UPGRADE

Po normalnej rundzie zakupów gracz powinien być w stanie dotrzeć:

**około 15–40% dalej**

niż podczas poprzedniej próby.

Nie musi to być dokładna wartość.

To target feelingu.

---

# 67. UNLOCK STRUCTURE

Na początku:

```text
2 towers
1 active ability
```

Potem szybko odblokowujemy kolejne.

Przykładowo:

```text
0 min      Star Blaster
5 min      Rainbow Sprayer
10 min     Cloud Mortar
15 min     Friendship Coil
25 min     Candy Cannon
35 min     Cupcake Launcher
45 min     Prism Beam
```

Czas jest orientacyjny.

Ważne:

gracz regularnie dostaje coś nowego.

---

# 68. MAP DESIGN

Mapa powinna być projektowana pod zachowanie hordy.

Nie pod dekorację.

Podstawowe składniki:

```text
spawn zones
wide fields
choke points
branching routes
high-value tower areas
geometry for beams
open zones for AoE
final approach
fortress
```

---

# 69. MAP FLOW

Dobra mapa powinna posiadać rytm:

```text
OPEN AREA
↓
CHOKE
↓
OPEN AREA
↓
SPLIT
↓
MERGE
↓
FINAL CHOKE
↓
FORTRESS
```

Dzięki temu różne wieże mają różne momenty przewagi.

---

# 70. CHOKE POINT DESIGN

Choke powinien być wystarczająco wąski, żeby:

* zwiększyć density,
* poprawić AoE,
* zwiększyć wartość knockbacku.

Ale nie może całkowicie zablokować ruchu.

---

# 71. OPEN AREA DESIGN

Szerokie przestrzenie powodują:

* rozlewanie hordy,
* obniżenie efektywności małych AoE,
* zwiększenie wartości szerokich ataków.

---

# 72. MULTIPLE LANES

Na późniejszych mapach można wprowadzić dwa wejścia.

Horda może:

* pojawiać się jednocześnie,
* przełączać główny kierunek szturmu,
* łączyć się przed fortecą.

To tworzy decyzję:

> gdzie skoncentrować obronę?

---

# 73. WAVE TELEGRAPHING

Gracz powinien wiedzieć, że zbliża się duża fala.

UI może pokazywać:

```text
NEXT WAVE
12 sec
```

oraz skład:

```text
850 Basic
120 Sprinters
8 Chubby
```

Nie musi zawsze podawać dokładnych liczb.

---

# 74. CAMERA

Kamera powinna pozwalać jednocześnie:

* obserwować szczegóły,
* rozumieć kierunek hordy,
* zobaczyć duży fragment mapy.

Gracz powinien mieć możliwość:

```text
pan
zoom
```

Najważniejsze zdarzenia mogą posiadać subtelne focus cues, ale kamera nie powinna odbierać graczowi kontroli podczas walki.

---

# 75. CAMERA SHAKE

Stosować wyłącznie do dużych efektów.

Skala zależna od:

```text
impact_power
distance_from_camera_focus
```

Zwykłe strzały nie powinny trząść ekranem.

---

# 76. VISUAL DIRECTION

Kontrast jest główną zasadą art direction.

Świat:

* ciężki,
* kamienny,
* wojskowy,
* monumentalny,
* lekko ponury.

Jednorożce:

* różowe,
* błękitne,
* pastelowe,
* brokatowe,
* absurdalnie słodkie.

Broń:

połączenie ciężkiej fortyfikacji z magiczno-tęczowymi efektami.

---

# 77. SILHOUETTES

Każda wieża musi posiadać odmienną sylwetkę.

Gracz powinien rozpoznawać ją bez patrzenia na UI.

Przykład:

```text
Star Blaster       długa lufa
Rainbow Sprayer    szeroka dysza
Cloud Mortar       duża misa
Candy Cannon       ciężka armata
Prism Beam         wysoki kryształ
Friendship Coil    pionowa cewka
Cupcake Launcher   wielolufowa wyrzutnia
```

---

# 78. ENEMY READABILITY

Nie każdy jednorożec potrzebuje unikalnego koloru.

Różne archetypy powinny mieć przede wszystkim odmienny:

* rozmiar,
* proporcje,
* prędkość,
* charakter ruchu.

Rozmiar jest szczególnie ważny przy tysiącach jednostek.

---

# 79. DAMAGE FEEDBACK

Przy tak dużej liczbie przeciwników nie pokazujemy damage number nad każdym celem.

Zamiast tego:

* małe flash,
* hit particles,
* reakcja ruchowa,
* zbiorcze liczby przy mocnych trafieniach.

Można opcjonalnie pokazywać agregat:

```text
12,450 DAMAGE
```

dla wielkiej eksplozji.

---

# 80. KILL FEEDBACK

Indywidualny kill nie powinien być wydarzeniem.

Ważne są serie.

Przykład:

```text
x50
x100
x500
x1000
```

Możemy pokazywać:

```text
UNICORN STAMPEDE STOPPED x842
```

---

# 81. AUDIO

Audio musi reagować na skalę.

Nie odtwarzamy indywidualnego dźwięku każdego przeciwnika.

Zamiast tego crowd posiada warstwę audio zależną od:

```text
visible_density
distance
threat_level
```

Im większa masa:

* więcej tupotu,
* głośniejszy zbiorczy odgłos,
* więcej chaosu.

---

# 82. WEAPON AUDIO

Każda broń musi posiadać charakterystyczny rytm.

Star Blaster:

```text
rapid mechanical pulse
```

Mortar:

```text
launch → silence → heavy impact
```

Prism:

```text
continuous energy tone
```

Coil:

```text
short electric bursts
```

---

# 83. MUSIC

Muzyka powinna posiadać warstwy.

Intensity zależy od:

```text
enemy_density_near_base
current_wave_phase
fortress_health
```

Przy spokojnym początku:

niska intensywność.

Podczas finalnej fali:

pełny arrangement.

---

# 84. UX — GŁÓWNY EKRAN WALKI

Najważniejsze informacje:

```text
Fortress Integrity
Current Wave
Next Wave timer
Temporary Currency
Active Abilities
Tower Build Menu
Game Speed
Pause
```

Nie należy pokazywać dziesiątek wartości jednocześnie.

---

# 85. GAME SPEED

Gra powinna posiadać kontrolę prędkości.

Minimum:

```text
1x
2x
```

Opcjonalnie:

```text
3x
```

Ale duże fale powinny być satysfakcjonujące również w 1x.

---

# 86. PAUSE BUILD

Budowę można wykonywać:

* podczas aktywnej gry,
* podczas pauzy.

Zmniejsza to presję zręcznościową.

Aktywne abilities nadal wymagają timing'u.

---

# 87. TOWER TOOLTIP

Tooltip musi podawać informacje gameplayowe.

Przykład:

```text
STAR BLASTER

Damage: 24
Fire Rate: 8.2/s
Range: 18m
Pierce: 2

Fast sustained damage.
Best against dense lanes.
```

---

# 88. DENSITY VISUALIZATION

Opcjonalnie po zaznaczeniu niektórych wież można pokazać:

* range,
* coverage,
* predicted lane.

Nie pokazujemy skomplikowanej heatmapy na stałe.

---

# 89. RUN SUMMARY

Po przegranej:

```text
RUN FAILED

Time Survived
Waves Cleared
Unicorns Defeated
Damage Dealt
Best Wave
New Record

Sparkles Earned
```

Na dole:

**UPGRADE & RETRY**

To powinien być najbardziej oczywisty następny przycisk.

---

# 90. REDUKCJA FRIKCJI RETRY

Od porażki do ponownego gameplayu:

**maksymalnie kilkanaście sekund**, jeżeli gracz tego chce.

Flow:

```text
Death
↓
Summary
↓
Upgrade
↓
Retry
```

Bez dodatkowych ekranów.

---

# 91. BUILD PERSISTENCE

Opcjonalna bardzo ważna funkcja:

po retry poprzedni układ wież może zostać zachowany jako blueprint.

Gracz nie musi ponownie wykonywać tych samych kliknięć.

Może:

```text
REBUILD PREVIOUS
```

lub:

```text
EDIT LAYOUT
```

To szczególnie ważne w incremental loopie.

---

# 92. DAMAGE MODEL

Standardowo:

```text
FinalDamage =
BaseDamage
* UpgradeMultiplier
* VulnerabilityMultiplier
* OtherMultipliers
- ArmorReduction
```

Minimalne obrażenia powinny istnieć.

Przykład:

```text
FinalDamage >= 1
```

---

# 93. ARMOR

Nie komplikujemy systemu.

Możliwy model:

```text
DamageAfterArmor =
Damage * 100 / (100 + Armor)
```

Przykład:

```text
Armor = 100

damage received = 50%
```

Daje płynne skalowanie.

---

# 94. DPS BALANCE

Do porównywania wież używamy:

```text
Raw DPS =
Damage * AttacksPerSecond
```

Ale rzeczywista wartość to:

```text
Effective DPS =
Raw DPS
* uptime
* target_efficiency
* area_efficiency
* crowd_density_factor
```

Dlatego nie balansujemy wież wyłącznie tabelą DPS.

---

# 95. AOE VALUE

Dla eksplozji:

```text
Expected Damage =
AverageTargetsHit
* AverageDamagePerTarget
* AttacksPerSecond
```

AverageTargetsHit zależy od density.

To pozwala tworzyć broń, która jest słaba przy małej liczbie przeciwników i fenomenalna przeciw hordzie.

---

# 96. TTK

Kluczowy parametr:

**Time To Kill.**

Zwykły przeciwnik nie powinien być workiem HP.

Podstawowa wieża powinna zabijać go szybko.

Trudność tworzymy głównie przez:

**liczbę przeciwników.**

Nie przez zwiększanie HP każdego przeciwnika do absurdalnych wartości.

---

# 97. SCALING ENEMIES

Priorytet eskalacji:

1. więcej przeciwników,
2. większy spawn rate,
3. trudniejsze kompozycje,
4. dopiero potem więcej HP.

To zachowuje fantasy hordy.

---

# 98. PERFORMANCE-AWARE GAME DESIGN

Projekt powinien od początku zakładać, że duża liczba przeciwników jest najważniejsza.

Dlatego nie projektujemy podstawowych przeciwników wymagających:

* indywidualnego skomplikowanego AI,
* skomplikowanej fizyki,
* bardzo dokładnych kolizji,
* rozbudowanych animacyjnych decyzji.

Tysiące jednostek mają wykonywać proste operacje.

---

# 99. SIMULATION LEVELS OF DETAIL

Możemy logicznie dzielić przeciwników na poziomy dokładności.

### Near Combat

Pełna częstotliwość:

* ruch,
* statusy,
* collision approximation.

### Mid Distance

Ruch i combat aktualizowane rzadziej.

### Far Distance

Bardzo uproszczony ruch zgodny z flow field.

Nie zmieniamy gameplay outcome.

Zmienia się tylko częstotliwość obliczeń, jeśli jest to konieczne.

---

# 100. UPDATE BUCKETING

Nie wszystkie jednostki muszą wykonywać kosztowne zapytania w tym samym momencie.

Możemy podzielić je na grupy:

```text
bucket 0
bucket 1
bucket 2
bucket 3
```

Przykładowo local neighbor query wykonywany jest tylko przez jeden bucket podczas danego kroku.

Pozostałe wykorzystują poprzedni wynik.

Dzięki temu koszt jest rozkładany.

---

# 101. TOWER UPDATE BUCKETING

Podobnie można traktować target acquisition.

Wieża nie musi szukać nowego celu bez przerwy.

Jeżeli obecny cel nadal jest prawidłowy:

utrzymuje go.

Nowy query wykonuje gdy:

* cel zginął,
* wyszedł z range,
* minął określony interval.

---

# 102. POCISKI

Przy bardzo szybkich broniach nie każdy wizualny pocisk musi być osobnym skomplikowanym bytem gameplayowym.

Istnieją logiczne kategorie:

### Hitscan

Natychmiastowy rezultat.

### Projectile

Pocisk posiada pozycję i prędkość.

### Area event

Atak reprezentowany jako przyszła eksplozja.

### Beam

Ciągły geometryczny test obszaru.

Każda broń wybiera model pasujący do jej fantasy.

---

# 103. EXPLOSION QUERY

Eksplozja:

```text
GetEnemiesInRadius(center, radius)
```

Następnie dla każdego celu:

```text
distance_factor =
1 - distance/radius
```

Obrażenia i knockback są obliczane osobno.

---

# 104. DENSITY TARGETING

Mortar może zamiast jednostki szukać najlepszej komórki.

Co pewien czas:

```text
best_cell =
argmax(enemy_count * tactical_weight)
```

Tactical weight może preferować:

* wysoką density,
* bliskość fortecy,
* obecność ciężkich przeciwników.

---

# 105. ANTI-DEATHBALL DESIGN

Jedna konfiguracja wież nie powinna być zawsze najlepsza.

Dlatego mapy i fale powinny zmieniać:

```text
density
speed
armor
route width
spawn direction
```

To sprawia, że różne wieże mają różne momenty dominacji.

---

# 106. SYNERGIE

Podstawowe synergie:

### Slow + Mortar

Więcej przeciwników pozostaje w blast zone.

### Vulnerability + rapid fire

Dużo małych trafień korzysta z debuffu.

### Knockback + Beam

Przeciwnicy wracają na długą linię ostrzału.

### Freeze + Apocalypse

Zatrzymanie masy przed wielkim uderzeniem.

---

# 107. NIE WPROWADZAĆ NA START

Na pierwszym etapie nie potrzebujemy:

* craftingu,
* inventory,
* equipment rarity,
* lootów,
* questów,
* dialogów,
* bohaterów,
* klas postaci,
* proceduralnych map,
* skomplikowanej fabuły,
* multiplayera.

Każdy z tych systemów zwiększa scope bez wzmacniania rdzenia.

---

# 108. ART JUICE PRIORITIES

Kolejność efektów wizualnych:

1. śmierć hordy,
2. eksplozje,
3. knockback,
4. beam effects,
5. projectile trails,
6. crowd reactions,
7. environmental destruction,
8. dekoracje.

Gameplay juice ma pierwszeństwo przed szczegółowym środowiskiem.

---

# 109. SCREEN SATURATION

Przy ogromnej liczbie efektów istnieje ryzyko nieczytelności.

Dlatego:

* zwykłe pociski mają mały kontrast,
* ważne abilities mają duży kontrast,
* telegraphy zagrożeń zawsze są czytelne,
* największe efekty są krótkie.

---

# 110. COLOR LANGUAGE

Przykładowa semantyka:

```text
biały        podstawowy hit
niebieski    freeze
zielony      slow
fioletowy    vulnerability
żółty        chain/electric
różowy       magic damage
czerwony     fortress danger
```

Kolor powinien przekazywać informację.

---

# 111. GAME FEEL — HIT STOP

Przy pojedynczych trafieniach:

brak zatrzymania.

Przy ogromnych zdolnościach:

bardzo krótki globalny moment impactu może wzmacniać feeling.

Nie może niszczyć płynności hordy.

---

# 112. GAME FEEL — ANTICIPATION

Największe efekty powinny posiadać trzy fazy:

```text
telegraph
impact
aftermath
```

Przykład:

```text
0.6 s warning
→ explosion
→ expanding shockwave + flying enemies
```

---

# 113. CAMPAIGN STRUCTURE

Przykład:

```text
MAP 1 — Meadow Gate
MAP 2 — Narrow Valley
MAP 3 — Twin Roads
MAP 4 — Prism Canyon
MAP 5 — Last Fortress
```

Każda mapa wprowadza jeden nowy problem.

---

# 114. MAP 1

Cel:

nauczyć podstaw.

Jedna szeroka ścieżka.

Jeden choke.

Mało archetypów.

---

# 115. MAP 2

Silniejszy nacisk na:

* density,
* mortar,
* knockback.

---

# 116. MAP 3

Dwie drogi.

Gracz musi rozdzielić obronę.

---

# 117. MAP 4

Dużo geometrii.

Promuje:

* Prism Beam,
* dobre ustawienie.

---

# 118. MAP 5

Wszystkie systemy jednocześnie.

Finalna fala powinna wyglądać absurdalnie.

---

# 119. TUTORIAL

Tutorial minimalny.

Zamiast dużych okien:

```text
PLACE A STAR BLASTER
```

następnie:

```text
START WAVE
```

następnie:

```text
USE MAGIC MISSILE
```

Po porażce:

```text
BUY AN UPGRADE
```

To wystarczy do nauczenia podstawowej pętli.

---

# 120. FIRST 10 MINUTES

Idealne doświadczenie:

### 0:00

Gracz widzi fortecę.

### 0:30

Pierwsza horda.

### 1:00

Pierwsza duża eksplozja.

### 2:00

Gracz przegrywa.

### 2:30

Pierwsze permanent upgrades.

### 3:00

Retry.

### 4:00

Poprzedni problem staje się łatwy.

### 6:00

Nowe zagrożenie.

### 8:00

Odblokowanie nowej wieży.

### 10:00

Gracz rozumie pełny core loop.

---

# 121. GŁÓWNA METRYKA FUNU

Podczas testów nie pytamy przede wszystkim:

> „Czy balans jest dobry?”

Pytamy:

> „Czy po przegranej chcesz natychmiast zrobić retry?”

Jeżeli odpowiedź brzmi:

**tak**

core loop działa.

---

# 122. DRUGA METRYKA FUNU

Pytanie:

> „Czy samo obserwowanie działania obrony jest przyjemne?”

Jeżeli gracz przez kilka sekund niczego nie klika i nadal dobrze się bawi, spectacle działa.

---

# 123. TRZECIA METRYKA FUNU

Pytanie:

> „Czy gracz zauważa zakupiony upgrade bez patrzenia na statystyki?”

Jeżeli nie:

upgrade jest prawdopodobnie zbyt słaby.

---

# 124. ANALYTICS DESIGN

Warto mierzyć:

```text
average run duration
wave reached
reason for defeat
tower usage
tower damage share
ability usage
currency earned
upgrades purchased
time between death and retry
number of retries per session
```

Najważniejsza metryka:

```text
death → retry conversion
```

---

# 125. TOWER BALANCE DATA

Dla każdej wieży zbieramy:

```text
total damage
kills
targets hit
average enemies per attack
uptime
currency cost
damage per currency
```

Dla support:

```text
damage amplified
seconds of slow
enemies displaced
effective damage enabled
```

---

# 126. WAVE BALANCE DATA

Dla każdej fali:

```text
average players defeated
average integrity lost
average duration
average enemy leak
average ability usage
```

Chcemy znaleźć fale tworzące dobre punkty napięcia.

---

# 127. DIFFICULTY PHILOSOPHY

Gra nie jest klasycznym testem perfekcyjnej strategii.

Część fal może być celowo zbyt trudna przy obecnym poziomie progresji.

To nie błąd.

To element incremental loopu.

Gracz ma czasem dojść do ściany.

Potem:

```text
upgrade → retry → breakthrough
```

---

# 128. SOFT WALL

Idealna ściana wygląda:

> „Prawie dałem radę.”

Nie:

> „Nie miałem żadnej szansy.”

Podczas porażki horda powinna zwykle dochodzić do fortecy stopniowo.

Gracz obserwuje, jak obrona zaczyna się załamywać.

---

# 129. HARD WALL

Hard wall może istnieć przy końcu regionu lub specjalnym bossie.

Nie powinien pojawiać się zbyt często.

---

# 130. BOSS DESIGN

Boss nie powinien zamieniać gry w klasyczną walkę z jednym przeciwnikiem.

Najlepszy boss:

**wzmacnia hordę.**

Przykład:

Royal Unicorn posiada bardzo dużo HP i pojawia się razem z tysiącami mniejszych jednostek.

Może:

* zwiększać speed pobliskich,
* redukować knockback,
* osłaniać część hordy.

---

# 131. GAME OVER FEEL

Game over powinien być szybki i lekko komediowy.

Nie traktujemy porażki dramatycznie.

Przykład:

forteca zostaje zalana pastelową masą.

Następnie:

```text
THE FORTRESS HAS BEEN OVERLOVED
```

i natychmiast podsumowanie.

---

# 132. NARRATIVE TONE

Świat traktuje wydarzenia śmiertelnie poważnie.

Humor wynika z kontrastu.

Dowódcy:

poważni.

Forteca:

ponura.

Raporty:

militarne.

Zagrożenie:

dziesiątki tysięcy pastelowych jednorożców.

Nie należy tłumaczyć dowcipu.

---

# 133. TEXT STYLE

Krótko.

Przykład:

```text
WAVE 14

SCOUT REPORT:
"They brought larger ones."
```

Albo:

```text
FORTRESS REPORT:
"We are running out of non-sparkly ground."
```

---

# 134. VERTICAL SLICE

Minimalny build udowadniający cały koncept:

```text
1 mapa
3 typy wież
2 abilities
2 enemy types
1 upgrade screen
8–10 fal
1 meta currency
retry
```

---

# 135. VERTICAL SLICE — WIEŻE

Najlepsze trzy:

```text
Star Blaster
Cloud Mortar
Friendship Coil
```

Dlaczego:

pokazują trzy najważniejsze typy funu.

Star Blaster:

precyzyjny DPS.

Mortar:

AoE + fizyka.

Coil:

masowe chain attacks.

---

# 136. PROTOTYPE ZERO

Jeszcze wcześniejszy test:

```text
1 mapa
1 wieża
1 horda
1 forteca
brak UI
brak meta
```

Cel:

**czy horda jest przyjemna do niszczenia?**

---

# 137. PROTOTYPE ONE

Dodajemy:

```text
currency
retry
damage upgrades
fire rate upgrades
```

Cel:

**czy przegrana prowadzi do natychmiastowego retry?**

---

# 138. PROTOTYPE TWO

Dodajemy:

```text
Mortar
knockback
density targeting
```

Cel:

**czy interakcja fizyczna z hordą tworzy spectacle?**

---

# 139. PROTOTYPE THREE

Dodajemy:

```text
3–4 towers
active ability
upgrade tree
```

Cel:

**czy istnieje już decyzja strategiczna?**

---

# 140. CONTENT COMPLETE CORE

Dopiero potem:

```text
7 towers
5 abilities
5 enemy archetypes
multiple maps
full progression tree
bosses
```

---

# 141. PRIORYTET IMPLEMENTACYJNY SYSTEMÓW

Kolejność:

### P0 — absolutny rdzeń

1. mapa,
2. flow field,
3. crowd movement,
4. spatial queries,
5. health,
6. damage,
7. jedna wieża,
8. fortress damage.

### P1 — loop

9. wave director,
10. currency,
11. run ending,
12. permanent upgrades,
13. retry.

### P2 — spectacle

14. mortar,
15. AoE,
16. knockback,
17. death FX,
18. crowd density.

### P3 — strategia

19. kolejne wieże,
20. status effects,
21. targeting modes,
22. abilities.

### P4 — content

23. nowe mapy,
24. nowe enemy types,
25. większe drzewo progresji.

### P5 — polish

26. audio,
27. juice,
28. camera polish,
29. onboarding,
30. balans.

---

# 142. GŁÓWNE RYZYKO PROJEKTU

Największe ryzyko:

**horda wygląda jak zwykła grupa agentów zamiast płynącej masy.**

Jeżeli tak się dzieje:

nie należy dodawać contentu.

Należy poprawić crowd simulation.

---

# 143. DRUGIE RYZYKO

Meta progression jest zbyt wolna.

Objaw:

gracz przegrywa i widzi, że upgrade poprawi damage o niezauważalne 2%.

Rozwiązanie:

większe skoki mocy.

---

# 144. TRZECIE RYZYKO

Zbyt dużo czekania.

Objaw:

przez 30 sekund nic nie dociera do obrony.

Rozwiązanie:

* agresywniejszy spawn,
* szybszy start,
* game speed controls.

---

# 145. CZWARTE RYZYKO

Efekty zasłaniają hordę.

Rozwiązanie:

hierarchia efektów.

Największą widoczność posiadają:

1. przeciwnicy,
2. duże zagrożenia,
3. abilities,
4. ważne ataki,
5. dekoracyjne particles.

---

# 146. PIĄTE RYZYKO

Jedna wieża staje się uniwersalnie najlepsza.

Rozwiązanie:

projektować sytuacje, nie tylko statystyki.

Przykład:

* szerokie hordy,
* ciężkie cele,
* szybkie cele,
* choke,
* wiele ścieżek.

---

# 147. DEFINITION OF FUN — HORDA

System jest gotowy, jeśli:

* 1000 jednostek wygląda dobrze,
* 5000 wygląda lepiej niż 1000,
* eksplozja w dużej grupie jest satysfakcjonująca,
* horda naturalnie wypełnia przestrzeń,
* choke tworzy wyraźną kompresję,
* knockback zmienia kształt tłumu.

---

# 148. DEFINITION OF FUN — COMBAT

Combat jest gotowy, jeśli:

* każdą wieżę można rozpoznać po efekcie,
* mocne trafienie ma wyraźny impact,
* AoE jest wizualnie czytelne,
* target selection nie wygląda głupio,
* wiele wież działających jednocześnie tworzy spektakl, nie chaos informacyjny.

---

# 149. DEFINITION OF FUN — PROGRESSION

Progression działa, jeśli po 3 przegranych runach:

* build wygląda silniej,
* horda ginie szybciej,
* gracz dochodzi wyraźnie dalej,
* odblokował coś nowego,
* posiada jasny następny cel.

---

# 150. NORTH STAR MOMENT

Moment, do którego powinien prowadzić cały projekt:

Na ekran napływa ogromna fala.

Gracz widzi dziesiątki tysięcy jednorożców.

Pierwsza linia obrony zaczyna strzelać.

Mortary rozrywają tłum.

Eksplozje odrzucają setki jednostek.

Chain attack przeskakuje przez całą grupę.

Laser przecina kolumnę.

Horda mimo wszystko dociera coraz bliżej fortecy.

Gracz aktywuje Freeze.

Cały front zatrzymuje się.

Odpala wielką zdolność.

Ekran zostaje na moment zalany tęczą i eksplozjami.

Kilka tysięcy jednostek znika.

Muzyka opada.

Na ekranie zostaje:

```text
WAVE CLEARED
```

Po dwóch sekundach:

```text
NEXT WAVE:
24,800 UNICORNS
```

I gracz myśli:

**„O nie.”**

a jednocześnie:

**„Dawaj.”**

To jest docelowe doświadczenie gry.

---

# 151. OSTATECZNA ZASADA PROJEKTOWA

Każdy system należy oceniać według pytania:

> Czy zwiększa satysfakcję wynikającą z obserwowania coraz potężniejszej obrony walczącej z coraz większą hordą?

Jeżeli odpowiedź brzmi „nie”, system prawdopodobnie nie jest potrzebny.

Gra nie potrzebuje ogromnej liczby różnych mechanik.

Potrzebuje niewielkiej liczby mechanik, które eskalują do absurdalnej skali.

**Horda → destrukcja → porażka → upgrade → retry → dominacja → większa horda.**

To jest rdzeń całego projektu.

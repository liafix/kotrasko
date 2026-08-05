# KOTRASKO — detailný plán vývoja zážitkového rezervačného systému

**Projekt:** KOTRASKO Booking Experience  
**Prevádzka:** Big Head House Barbershop, Ilava  
**Dokument:** Product Blueprint + UX plán + technický implementačný plán  
**Verzia:** 1.0  
**Stav:** pripravené na schválenie pred implementáciou  
**Jazyk produktu:** slovenčina  
**Primárna platforma:** mobilný web / PWA-ready  
**Navrhovaný deployment:** Vercel + Supabase + Stripe + Resend

---

## 1. Executive summary

Cieľom projektu je vytvoriť samostatný rezervačný systém pre barbera **KOTRASKO**, ktorý pôsobí v **Big Head House Barbershop v Ilave**. Produkt nemá byť obyčajným kalendárom alebo klonom Bookio. Má zmeniť rezerváciu strihu na krátky, vizuálny a emocionálny zážitok:

1. klient uvidí reálne Kotraskove práce,
2. vyberie si štýl alebo „vibe“,
3. zvolí termín,
4. zadá minimum osobných údajov,
5. zaplatí 10 € cez Stripe,
6. dostane prémiové potvrdenie a možnosť pridať termín do kalendára.

Systém bude navrhnutý **mobile-first**, pretože hlavný vstup bude pravdepodobne z Instagramu. Desktop verzia bude pôsobiť ako prémiový lookbook spojený s rezerváciou, zatiaľ čo mobilná verzia bude pripomínať plynulú natívnu aplikáciu.

Projekt bude technicky pripravený tak, aby:

- neumožnil dvojité rezervovanie rovnakého slotu,
- bezpečne priradil Stripe platbu ku konkrétnej rezervácii,
- umožnil Kotraskovi spravovať dostupnosť,
- posielal potvrdenia klientovi aj administrátorovi,
- umožnil zmenu alebo zrušenie rezervácie,
- dal sa neskôr rozšíriť o pripomienky, vernostný systém, recenzie a ďalších barberov.

---

## 2. Potvrdené vstupy

### 2.1 Značka

- Primárny názov: **KOTRASKO**
- Parent brand / miesto výkonu služby: **Big Head House Barbershop**
- Lokalita: **Ilava**
- Dodané logo: Big Head House, čierno-zlaté
- Vizuálny smer: čierna, uhlíková, teplá zlatá, krémová, filmový a street-luxury feel
- Produkt nemá pôsobiť staromódne ani ako westernový barber template; ornamentálnosť loga bude použitá iba ako akcent.

### 2.2 Služba

- Názov: **Kotrasko strih**
- Zobrazený názov v UI: **Pánsky strih**
- Cena: **10 €**
- Trvanie: **60 minút**
- Platba: **povinná online platba vopred**
- Stripe test Payment Link:  
  `https://buy.stripe.com/test_28E8wQ3x465u2hNbr5fnO0m`

> Poznámka: Ide o testovací Stripe link. Pred produkčným spustením musí byť vytvorený alebo aktivovaný živý ekvivalent v live režime.

### 2.3 Rezervovanie

- Rezervácia najskôr: 2 hodiny pred termínom
- Rezervácia najďalej: 30 dní dopredu
- Základný slot: 60 minút
- Klient môže rezerváciu zrušiť cez web.
- Pred zrušením má byť vyzvaný, aby telefonicky kontaktoval prevádzku a uviedol dôvod.
- Presunutie rezervácie môže byť v MVP riešené ako zrušenie + vytvorenie novej rezervácie alebo ako samostatná funkcia administrátora.
- Dostupnosť Kotraska nebude automaticky totožná s celými otváracími hodinami prevádzky. Otváracie hodiny budú iba rámec a konkrétnu dostupnosť nastaví administrátor.

### 2.4 Kontakty a notifikácie

- Dočasný administračný e-mail: `dczwebagentsi@gmail.com`
- Produkčný e-mail Kotraska bude doplnený neskôr.
- Telefón na zrušenie rezervácie bude nastaviteľný v administrácii.
- Pred verejným spustením musí byť potvrdené, ktorý verejný telefón sa má zobrazovať.

### 2.5 Fotografie

- Pre prototyp sa použijú dodané screenshoty haircutov.
- Pri prototypovaní sa odstráni:
  - stavový riadok telefónu,
  - spodná galéria náhľadov,
  - používateľské mená klientov,
  - nadbytočné okraje.
- Pred produkciou sa majú vymeniť za pôvodné fotografie v plnej kvalite.
- Administrácia má umožniť výmenu fotografií bez zásahu do kódu.

---

## 3. Kritické launch gates

Nasledujúce položky **neblokujú vytvorenie MVP**, ale blokujú verejné produkčné spustenie:

1. písomný alebo jednoznačný súhlas Kotraska s použitím mena, fotografií a údajov,
2. súhlas prevádzky s použitím loga Big Head House a prípadnou subdoménou,
3. potvrdenie ceny 10 € / 60 minút priamo Kotraskom alebo prevádzkou,
4. potvrdenie reálnych pracovných dní a časov Kotraska,
5. potvrdenie telefónu a e-mailu pre rezervácie,
6. živý Stripe Payment Link alebo živá Stripe Checkout konfigurácia,
7. presné pravidlá zrušenia, refundácie a no-show,
8. zásady ochrany osobných údajov a identita prevádzkovateľa systému,
9. pôvodné fotografie alebo súhlas s dočasnými obrázkami,
10. prístup k DNS, ak sa má používať subdoména Big Head House.

---

## 4. Produktová vízia

### 4.1 Core promise

> **Rezervácia, pri ktorej klient ešte pred návštevou cíti, že ide po svoj nový look.**

### 4.2 Positioning

KOTRASKO Booking Experience bude prezentovaný ako osobná digitálna brána ku Kotraskovi v Big Head House Ilava. Namiesto anonymného „objednania služby“ si klient vyberá atmosféru, štýl a moment premeny.

### 4.3 Hlavné UX princípy

1. **Obraz pred formulárom**  
   Najskôr ukázať výsledky, až potom pýtať údaje.

2. **Jedna hlavná akcia na obrazovke**  
   Každý krok má mať jasný cieľ a dominantné CTA.

3. **Minimum textu, maximum istoty**  
   Krátke titulky, jasná cena, čas, miesto a pravidlá.

4. **Rýchlosť bez pocitu lacnosti**  
   Animácie nesmú spomaľovať dokončenie rezervácie.

5. **Mobile-first**  
   Všetko musí fungovať palcom na telefóne a bez hover závislostí.

6. **Emócia s kontrolou**  
   Výrazný vizuál, ale vždy čitateľný termín, cena a potvrdenie.

7. **Dôvera**  
   Reálne fotografie, jasná prevádzka, presná adresa, bezpečná platba cez Stripe.

---

## 5. Cieľové persony

### Persona A — Instagram klient

- vek približne 15–25 rokov,
- prichádza z Instagram bio alebo Story,
- pozná Kotraskove výsledky,
- chce rezervovať rýchlo na mobile,
- očakáva moderný vizuál,
- pravdepodobne použije Apple Pay alebo Google Pay.

**Cieľ:** rezervácia do 90 sekúnd bez straty kontextu.

### Persona B — nový klient z Ilavy a okolia

- Kotraska ešte osobne nepozná,
- potrebuje vidieť kvalitu práce a miesto,
- porovnáva barberov,
- chce vedieť cenu, trvanie a dostupnosť.

**Cieľ:** vytvoriť dôveru cez lookbook a jasnú prezentáciu.

### Persona C — vracajúci sa klient

- chce rovnakú službu,
- nechce opakovane prechádzať celý marketingový flow,
- potrebuje najbližší termín a jednoduché potvrdenie.

**Cieľ:** tlačidlo „Rezervovať znova“ a predvyplnené údaje cez bezpečný lokálny token alebo magic link.

---

## 6. Informačná architektúra

### Verejná časť

- `/` — zážitková landing page
- `/book` — začiatok booking flow
- `/book/style` — výber vibe / referenčného strihu
- `/book/time` — kalendár a sloty
- `/book/details` — meno, e-mail, telefón, poznámka
- `/book/review` — rekapitulácia
- `/book/pay` — vytvorenie dočasnej rezervácie a redirect na Stripe
- `/booking/success` — potvrdenie po platbe
- `/booking/manage/[token]` — správa rezervácie
- `/booking/cancel/[token]` — bezpečné zrušenie
- `/lookbook` — galéria výsledkov
- `/privacy` — ochrana osobných údajov
- `/terms` — podmienky rezervácie
- `/contact` — miesto, navigácia a kontakt

### Admin časť

- `/admin/login`
- `/admin`
- `/admin/calendar`
- `/admin/bookings`
- `/admin/bookings/[id]`
- `/admin/availability`
- `/admin/lookbook`
- `/admin/settings`
- `/admin/audit-log`

---

## 7. Detailný UX flow klienta

## 7.1 Landing page

### Úloha

Do 3 sekúnd vysvetliť:

- kto je Kotrasko,
- kde strihá,
- čo klient dostane,
- ako si rezervuje termín.

### Hero

**Eyebrow:**  
`PRECISION CUTS · ILAVA`

**H1:**  
`KOTRASKO`

**Subheadline:**  
`Tvoj ďalší look začína v Big Head House.`

**Body copy:**  
`Vyber si vibe, termín a rezervuj si 60-minútový strih.`

**Primárne CTA:**  
`Rezervovať termín`

**Sekundárne CTA:**  
`Pozrieť prácu`

### Hero vizuál

- dominantná fotografia jedného z najlepších fade výsledkov,
- jemný zlatý rim light,
- pomalý 2–3 % scale drift,
- filmové zrno ako CSS/SVG overlay,
- svetelný prechod reagujúci na scroll,
- bez agresívneho 3D efektu, ktorý by znižoval čitateľnosť.

### Trust strip

- `60 min`
- `10 €`
- `Big Head House · Ilava`
- `Bezpečná platba cez Stripe`

### UX požiadavky

- CTA viditeľné nad foldom,
- sticky CTA na mobile,
- hero obrázok optimalizovaný do AVIF/WebP,
- pri `prefers-reduced-motion` žiadny parallax ani scale drift.

---

## 7.2 Lookbook sekcia

### Úloha

Premeniť portfólio na vstup do rezervácie.

Každá fotografia má:

- názov vibe,
- krátky popis,
- tlačidlo `Toto je môj vibe`,
- voliteľný tag: `Low fade`, `Taper`, `Textured`, `Clean`.

### Počiatočné kategórie

1. **Clean & Classic**
2. **Textured & Modern**
3. **Low Fade**
4. **Taper & Volume**
5. **Messy & Natural**
6. **Nechám to na Kotraska**

Výber vibe nemení cenu ani dĺžku služby. Je to referencia pripojená k rezervácii.

### Interakcie

- mobile: swipe carousel + snap,
- desktop: hover zoom maximálne 1.04,
- kliknutie otvorí lightbox s detailom,
- výber sa potvrdí zlatým rámikom a check ikonou,
- po výbere sa CTA zmení na `Pokračovať s týmto lookom`.

---

## 7.3 Výber dátumu a času

### Kalendár

- zobrazuje maximálne 30 dní,
- nedostupné dni sú vizuálne tlmené,
- dnešný deň má samostatný outline,
- zvolený deň má plnú zlatú výplň,
- kalendár musí byť plne ovládateľný klávesnicou.

### Sloty

- iba 60-minútové sloty,
- slot musí začínať aspoň 2 hodiny od aktuálneho času,
- dostupnosť sa počíta zo:
  1. základného týždenného rozvrhu,
  2. výnimiek,
  3. blokovaných časov,
  4. potvrdených rezervácií,
  5. aktívnych dočasných holdov.

### Smart prompt

Nad kalendárom:

`Najbližší voľný termín`

Tlačidlo napríklad:

`Dnes o 16:00`

Po kliknutí sa vyberie automaticky.

### Loading a error states

- skeleton slotov,
- správa `Kontrolujeme dostupnosť…`,
- pri strate slotu:  
  `Tento termín práve obsadil niekto iný. Vyber si, prosím, ďalší čas.`

---

## 7.4 Údaje klienta

### Povinné polia

- meno a priezvisko,
- e-mail,
- telefón.

### Voliteľné polia

- poznámka pre Kotraska,
- vlastná referenčná fotografia,
- odpoveď na otázku `Čo chceš na účese zmeniť?`

### UX

Formulár bude rozdelený na dve vizuálne časti:

1. `Kto príde?`
2. `Čo má Kotrasko vedieť?`

### Validácia

- meno: 2–80 znakov,
- e-mail: normalizovaný, validovaný,
- telefón: medzinárodný formát; UI predvolene +421,
- poznámka: maximálne 500 znakov,
- obrázok: JPG/PNG/WebP, limit 8 MB, serverová kontrola typu.

### Consent

Povinný checkbox:

`Súhlasím so spracovaním údajov na vybavenie rezervácie a s podmienkami rezervácie.`

Marketingový súhlas nesmie byť spojený s povinným booking consentom.

---

## 7.5 Rekapitulácia

Zobrazí sa „booking ticket“:

- vybraný vibe a fotografia,
- Pánsky strih,
- 60 minút,
- 10 €,
- dátum a čas,
- Big Head House Barbershop, Ilava,
- meno klienta,
- CTA `Pokračovať na bezpečnú platbu`.

Pred CTA bude mikrocopy:

`Termín ti podržíme 15 minút počas platby.`

---

## 7.6 Dočasné podržanie slotu

Po kliknutí na platbu backend:

1. znovu overí dostupnosť,
2. v transakcii vytvorí `booking` so stavom `PENDING_PAYMENT`,
3. nastaví `hold_expires_at = now + 15 min`,
4. vygeneruje bezpečné verejné ID,
5. vytvorí Payment Link URL s `client_reference_id`,
6. presmeruje klienta na Stripe.

Príklad:

```text
https://buy.stripe.com/test_28E8wQ3x465u2hNbr5fnO0m?client_reference_id=bkg_ABC123
```

Do `client_reference_id` sa nesmú vkladať osobné údaje. Použije sa iba náhodné verejné ID rezervácie.

---

## 7.7 Stripe platba

### MVP režim — dodaný Payment Link

Dodaný testovací Payment Link sa použije v development a staging prostredí.

Potrebné nastavenia v Stripe Dashboard:

- produkt: Kotrasko strih,
- cena: 10 € jednorazovo,
- zber e-mailu,
- zber mena,
- zber telefónu iba v prípade, že nebude spoľahlivo zbieraný v aplikácii,
- branding vo farbách Kotrasko / Big Head House,
- after-payment redirect:
  `https://<domain>/booking/success?session_id={CHECKOUT_SESSION_ID}`,
- webhook endpoint:
  `https://<domain>/api/stripe/webhook`.

### Produkčná integrita

Webhook je zdroj pravdy. Success stránka sama o sebe nesmie potvrdiť rezerváciu.

Pri udalosti `checkout.session.completed`:

1. overiť Stripe podpis,
2. nájsť rezerváciu podľa `client_reference_id`,
3. overiť sumu, menu a produkt,
4. skontrolovať idempotenciu eventu,
5. zmeniť stav na `CONFIRMED`,
6. uložiť Stripe session ID a payment intent ID,
7. odoslať potvrdenie klientovi,
8. odoslať notifikáciu administrátorovi,
9. vytvoriť audit log.

### Riziko statického Payment Linku

Statický Payment Link nie je viazaný na životnosť konkrétneho hold-u. Klient môže platbu dokončiť neskoro.

Preto webhook musí:

- ak hold stále platí: potvrdiť rezerváciu,
- ak hold vypršal, ale slot je voľný: atomicky ho potvrdiť,
- ak je slot už obsadený: označiť `PAYMENT_EXCEPTION`, upozorniť admina a neodoslať falošné potvrdenie termínu.

### Odporúčaný upgrade po MVP

Pre najrobustnejšiu produkčnú verziu vytvárať ku každej rezervácii serverovú Stripe Checkout Session. Tým sa dá presnejšie riadiť expirácie, metadata, success/cancel URL a kontrola konkrétneho booking pokusu.

---

## 7.8 Success experience

### Hlavný moment

Animovaný zlatý kruh sa uzavrie do check ikony.

**Headline:**  
`YOU’RE BOOKED.`

**Slovenská podpora:**  
`Tvoj termín je potvrdený. Kotrasko sa na teba teší.`

### Booking card

- názov služby,
- dátum,
- čas,
- cena,
- miesto,
- mapa/navigácia,
- manage booking link.

### CTA

- `Pridať do kalendára`
- `Otvoriť navigáciu`
- `Spravovať rezerváciu`
- `Sledovať @kotrasko`

### Kalendár

MVP vytvorí stiahnuteľný `.ics` súbor kompatibilný s Apple Calendar, Google Calendar a Outlookom.

### Bezpečnostná kontrola

Success stránka načíta session cez serverový endpoint a zobrazí potvrdenie iba vtedy, keď Stripe session patrí k existujúcej rezervácii.

---

## 7.9 Správa a zrušenie rezervácie

Klient dostane e-mail s bezpečným magic linkom:

`/booking/manage/<opaque-token>`

Token:

- náhodný,
- minimálne 128-bit entropy,
- v databáze uložený iba ako hash,
- časovo obmedzený podľa termínu rezervácie.

### Manage stránka

Zobrazí:

- rezervovaný termín,
- stav platby,
- miesto,
- tlačidlo `Zavolať do Big Head House`,
- tlačidlo `Zrušiť rezerváciu`.

### Cancellation flow

1. klient klikne `Zrušiť rezerváciu`,
2. zobrazí sa krok:
   `Pred zrušením nám, prosím, zavolaj a povedz dôvod.`,
3. CTA `Zavolať`,
4. sekundárne CTA `Už som volal — pokračovať`,
5. klient vyberie dôvod alebo napíše poznámku,
6. potvrdí zrušenie,
7. booking sa prepne na `CANCELLED_BY_CUSTOMER`,
8. slot sa uvoľní,
9. admin dostane notifikáciu.

### Refundácia

V MVP nebude refundácia automatická, kým nebude potvrdená politika. Admin uvidí stav platby a môže refundáciu vykonať v Stripe Dashboarde.

---

## 8. Admin systém

## 8.1 Dashboard

Karty:

- dnešné rezervácie,
- najbližší klient,
- potvrdené rezervácie za týždeň,
- zaplatená suma,
- zrušené rezervácie,
- výnimky vyžadujúce pozornosť.

## 8.2 Kalendár

- deň / týždeň / zoznam,
- status farby:
  - pending,
  - confirmed,
  - completed,
  - cancelled,
  - no-show,
  - payment exception,
- klik na rezerváciu otvorí detail,
- drag & drop je až post-MVP; v MVP manuálna úprava cez formulár.

## 8.3 Dostupnosť

### Weekly availability

Pre každý deň:

- zapnutý/vypnutý,
- čas od–do,
- prestávky,
- slot length,
- buffer after service.

### Exceptions

- dovolenka,
- škola,
- osobné voľno,
- zatvorenie prevádzky,
- jednorazovo predĺžený pracovný deň.

## 8.4 Booking detail

- klient,
- kontakt,
- služba,
- vibe,
- poznámka,
- referenčná fotografia,
- dátum a čas,
- Stripe stav,
- história zmien,
- akcie:
  - potvrdiť,
  - presunúť,
  - zrušiť,
  - označiť dokončené,
  - označiť no-show,
  - odoslať e-mail znova.

## 8.5 Lookbook CMS

- upload fotografie,
- názov vibe,
- tagy,
- poradie,
- aktivovať/deaktivovať,
- výber hero fotografie,
- alt text,
- focal point pre orez.

## 8.6 Settings

- názov barbera,
- názov prevádzky,
- adresa,
- telefón,
- e-mail,
- Instagram,
- cena,
- trvanie,
- booking horizon,
- minimum notice,
- hold duration,
- Stripe test/live režim,
- e-mailové šablóny,
- text podmienok,
- logo a farby.

---

## 9. Booking state machine

```text
DRAFT
  ↓
PENDING_PAYMENT
  ├── payment completed → CONFIRMED
  ├── hold expired → EXPIRED
  ├── customer leaves → PENDING_PAYMENT until expiry
  └── paid after collision → PAYMENT_EXCEPTION

CONFIRMED
  ├── service completed → COMPLETED
  ├── customer cancels → CANCELLED_BY_CUSTOMER
  ├── admin cancels → CANCELLED_BY_ADMIN
  ├── customer absent → NO_SHOW
  └── admin reschedules → RESCHEDULED / updated CONFIRMED

PAYMENT_EXCEPTION
  ├── admin assigns new slot → CONFIRMED
  └── admin refunds → REFUNDED
```

### Povolené stavy

- `DRAFT`
- `PENDING_PAYMENT`
- `CONFIRMED`
- `EXPIRED`
- `COMPLETED`
- `CANCELLED_BY_CUSTOMER`
- `CANCELLED_BY_ADMIN`
- `NO_SHOW`
- `PAYMENT_EXCEPTION`
- `REFUND_PENDING`
- `REFUNDED`

Každá zmena stavu sa zapisuje do audit logu.

---

## 10. Databázový návrh

Navrhovaná databáza: PostgreSQL cez Supabase.

## 10.1 `services`

```text
id
slug
name
description
duration_minutes
price_cents
currency
is_active
created_at
updated_at
```

Seed:

```text
name: Pánsky strih
duration_minutes: 60
price_cents: 1000
currency: EUR
```

## 10.2 `bookings`

```text
id
public_id
service_id
customer_name
customer_email
customer_phone
customer_note
style_reference_id
reference_upload_url
starts_at
ends_at
timezone
status
hold_expires_at
stripe_checkout_session_id
stripe_payment_intent_id
stripe_payment_link_id
amount_paid_cents
currency
manage_token_hash
cancel_reason
cancelled_at
confirmed_at
completed_at
created_at
updated_at
```

## 10.3 `availability_rules`

```text
id
day_of_week
start_time
end_time
is_enabled
valid_from
valid_to
created_at
updated_at
```

## 10.4 `availability_breaks`

```text
id
availability_rule_id
start_time
end_time
```

## 10.5 `availability_exceptions`

```text
id
date
start_time
end_time
type
reason
is_available
created_at
updated_at
```

## 10.6 `style_references`

```text
id
slug
title
description
image_url
thumbnail_url
alt_text
tags
sort_order
is_featured
is_active
created_at
updated_at
```

## 10.7 `stripe_events`

```text
id
stripe_event_id
event_type
processed_at
payload_hash
status
error_message
created_at
```

Unique index na `stripe_event_id` zabezpečí idempotenciu.

## 10.8 `audit_logs`

```text
id
actor_type
actor_id
action
entity_type
entity_id
before_json
after_json
ip_hash
created_at
```

## 10.9 `settings`

```text
key
value_json
updated_at
```

---

## 11. Ochrana proti dvojitej rezervácii

Databáza musí byť autoritatívny zdroj.

### Kontrola slotu

Pri vytvorení hold-u sa použije transakcia:

1. zamknúť relevantný časový interval,
2. skontrolovať kolíziu s potvrdenými bookingami,
3. skontrolovať neexpirované `PENDING_PAYMENT`,
4. vložiť booking,
5. commit.

Odporúčaná databázová ochrana:

- PostgreSQL exclusion constraint nad `tstzrange(starts_at, ends_at)`,
- aplikovať iba na aktívne stavy,
- alebo transakčná advisory lock podľa dátumu + slotu.

Frontend nikdy nesmie byť jediným miestom, ktoré kontroluje dostupnosť.

---

## 12. API návrh

### Public endpoints

```text
GET  /api/availability?from=&to=
POST /api/bookings/hold
GET  /api/bookings/public/:publicId
POST /api/bookings/:publicId/cancel
GET  /api/bookings/:publicId/ics
POST /api/uploads/reference
POST /api/stripe/webhook
GET  /api/stripe/session/:sessionId
```

### Admin endpoints

```text
GET    /api/admin/bookings
GET    /api/admin/bookings/:id
PATCH  /api/admin/bookings/:id
POST   /api/admin/bookings/:id/resend-confirmation
POST   /api/admin/bookings/:id/refund-note
GET    /api/admin/availability
PUT    /api/admin/availability
POST   /api/admin/exceptions
DELETE /api/admin/exceptions/:id
GET    /api/admin/styles
POST   /api/admin/styles
PATCH  /api/admin/styles/:id
DELETE /api/admin/styles/:id
GET    /api/admin/settings
PUT    /api/admin/settings
```

### API štandardy

- Zod validácia na hranici systému,
- jednotný error shape,
- rate limiting,
- CSRF ochrana pre admin mutácie,
- žiadne osobné údaje v logoch,
- server-side authorization pre každý admin endpoint.

---

## 13. Navrhovaný tech stack

### Frontend

- Next.js, current stable release
- React + TypeScript strict
- Tailwind CSS
- shadcn/ui iba pre základné primitives, nie ako vizuálna šablóna
- Motion pre page transitions a mikrointerakcie
- GSAP iba pre jednu-dve cinematic sekvencie, kde Motion nestačí
- React Hook Form + Zod
- date-fns s explicitnou timezone logikou

### Backend

- Next.js Route Handlers / server functions
- Supabase PostgreSQL
- Drizzle ORM
- Supabase Storage pre lookbook a referenčné uploady
- Supabase Auth pre jedného alebo viac adminov

### Integrácie

- Stripe Payment Links + webhook
- Resend pre transakčné e-maily
- Vercel Cron pre expiráciu holdov a budúce pripomienky
- Sentry pre error monitoring
- Vercel Analytics alebo Plausible pre produktovú analytiku

### Hosting

- Vercel
- staging a production environment
- subdoména podľa rozhodnutia vlastníka:
  - `kotrasko.ilavabarbershop.sk`, alebo
  - iná subdoména oficiálnej domény,
  - dočasne Vercel preview domain.

---

## 14. UI design system

## 14.1 Farby

```css
--bg-primary: #070707;
--bg-secondary: #0D0E10;
--surface: #121418;
--surface-elevated: #171A1F;
--border-subtle: rgba(214, 169, 57, 0.18);
--gold-400: #E5BE5D;
--gold-500: #D3A437;
--gold-600: #AF7E1E;
--text-primary: #F3EFE6;
--text-secondary: #B6B0A5;
--text-muted: #77736C;
--success: #72C792;
--danger: #E07575;
```

Kontrast musí byť overený podľa WCAG; zlatá sa nesmie používať ako drobný text na čiernej bez kontroly kontrastu.

## 14.2 Typografia

Odporúčanie:

- Display: moderný condensed grotesk s licenciou pre web
- Body: Inter, Geist alebo podobný čistý sans-serif
- Accent/script: nepoužívať pre kritický text, iba veľmi striedmo ako dekoráciu

### Scale

- Hero desktop: clamp 72–144 px
- Hero mobile: clamp 52–84 px
- H2: 40–64 px desktop, 32–44 px mobile
- Body: 16–18 px
- Form labels: minimálne 14 px
- Button: 15–17 px, semibold

## 14.3 Spacing

8 px základ:

```text
4, 8, 12, 16, 24, 32, 48, 64, 96, 128
```

## 14.4 Radius

- buttons: 12–16 px,
- cards: 18–24 px,
- mobile booking panel: 24–28 px,
- nepoužívať prehnané pill tvary všade.

## 14.5 Shadows and glow

- žiadne veľké lacno pôsobiace neónové glows,
- gold glow maximálne na aktívny prvok,
- tieň musí vyjadrovať vrstvenie, nie dekoráciu.

---

## 15. Motion system

### Motion princípy

- okamžitá odozva: 80–150 ms,
- bežný prechod: 180–280 ms,
- výrazný page transition: 450–700 ms,
- cinematic intro maximálne 1,2 s a preskočiteľné,
- žiadna animácia nesmie blokovať CTA.

### Mikrointerakcie

- magnetic button iba desktop,
- mobile tap scale 0.98,
- selected time slot: border → fill → subtle glow,
- progress indicator morph,
- card image parallax do 8 px,
- confirmation check reveal,
- toast s haptickým charakterom cez vizuálny spring.

### Reduced motion

Pri `prefers-reduced-motion`:

- vypnúť parallax,
- vypnúť motion blur,
- používať fade do 100 ms,
- žiadne automatické horizontálne posúvanie.

---

## 16. UI UX Pro Max skill — spôsob použitia

Skill sa použije ako kontrolná vrstva, nie ako generátor generického template.

### Povinné použitia

1. vygenerovať základný design-system návrh pre:
   `premium barber booking dark editorial mobile-first`,
2. skontrolovať:
   - kontrast,
   - focus states,
   - touch targety,
   - form validation,
   - mobile navigation,
   - responsive layout,
   - loading/empty/error states,
3. vytvoriť a uložiť master design system,
4. spraviť page-specific overrides pre:
   - landing,
   - booking flow,
   - admin dashboard,
5. vykonať finálny UI/UX audit pred release.

### Pravidlo

Ak výstup skillu odporuje schválenému Kotrasko vizuálu, prioritu má schválený vizuálny koncept a použiteľnosť.

---

## 17. E-mailové notifikácie

### Klient — potvrdenie

Subject:

`Tvoj termín u Kotraska je potvrdený ✂️`

Obsah:

- meno,
- služba,
- dátum a čas,
- miesto,
- navigácia,
- cena a potvrdenie platby,
- manage booking link,
- informácia o telefonickom kontakte pri zrušení.

### Admin — nová rezervácia

Subject:

`Nová rezervácia: [meno] — [dátum] [čas]`

Obsah:

- kontakt,
- vibe,
- poznámka,
- platba,
- odkaz do admin detailu.

### Klient — zrušenie

- potvrdenie zrušenia,
- informácia o refundácii podľa individuálneho posúdenia,
- CTA rezervovať nový termín.

### Post-MVP

- pripomienka 24 hodín pred termínom,
- pripomienka 2 hodiny pred termínom,
- follow-up s recenziou,
- CTA „Rezervovať znova“.

---

## 18. Analytika a eventy

Bez ukladania citlivých údajov do analytiky.

### Funnel eventy

```text
landing_view
booking_started
style_selected
date_selected
time_selected
details_completed
booking_hold_created
stripe_redirected
payment_completed
booking_confirmed
booking_cancelled
calendar_added
navigation_opened
instagram_opened
```

### KPI

- landing → booking start,
- booking start → payment,
- payment completion rate,
- priemerný čas rezervácie,
- najčastejšie vybraný vibe,
- obsadenosť dostupných slotov,
- no-show rate,
- cancellation rate,
- returning customer rate.

---

## 19. SEO a social sharing

### Homepage metadata

**Title:**  
`Kotrasko Barber Ilava | Rezervácia strihu v Big Head House`

**Description:**  
`Rezervuj si 60-minútový pánsky strih ku Kotraskovi v Big Head House Barbershop v Ilave. Vyber si look, termín a zaplať bezpečne online.`

### Open Graph

- vlastný OG vizuál v čierno-zlatom štýle,
- názov KOTRASKO,
- Big Head House Ilava,
- reálna fotografia strihu.

### Structured data

- `LocalBusiness` alebo vhodnejší typ podľa finálnej identity prevádzkovateľa,
- `Service`,
- adresa,
- telefón až po potvrdení,
- otváracie hodiny iba po potvrdení.

Booking/admin stránky majú byť `noindex`.

---

## 20. Bezpečnosť

### Povinné opatrenia

- Stripe secret key iba na serveri,
- webhook signature verification,
- idempotent webhook handling,
- admin MFA, ak to zvolený auth provider podporuje,
- rate limiting pre booking a upload endpoint,
- upload content-type validation,
- generované názvy súborov,
- CSP a bezpečnostné hlavičky,
- CSRF ochrana admin mutácií,
- sanitizácia textových vstupov,
- žiadne PII v URL okrem opaque tokenov,
- hashovanie manage tokenov,
- pravidelné zálohy databázy,
- audit log pre admin zásahy.

### Abuse protection

- honeypot v booking formulári,
- časový limit na opakované holdy,
- limit rezervácií na telefón/e-mail za deň,
- voliteľná Turnstile ochrana pri podozrivej aktivite,
- blokovanie opakovaných falošných klientov v admin rozhraní.

---

## 21. Súkromie a právny checklist

Toto je technický checklist, nie právne stanovisko.

- identifikovať prevádzkovateľa osobných údajov,
- uviesť účel spracovania: vybavenie rezervácie a platby,
- uviesť právny základ,
- uviesť kategórie údajov,
- uviesť dobu uchovávania,
- uviesť príjemcov/spracovateľov: hosting, databáza, e-mail, Stripe,
- umožniť kontakt pre uplatnenie práv,
- neposielať marketing bez samostatného súhlasu,
- nepoužívať tracking cookies bez potrebnej cookie logiky,
- vytvoriť podmienky rezervácie a refundácie,
- mať súhlas na zverejnenie fotografií klientov.

Odporúčaná retencia:

- neúspešné/expired holdy: automatické odstránenie alebo anonymizácia po 30 dňoch,
- booking údaje: podľa účtovných a prevádzkových potrieb po právnom potvrdení,
- referenčné fotografie klienta: odstrániť krátko po návšteve, ak nie je dôvod ich uchovávať.

---

## 22. Prístupnosť

Cieľ: WCAG 2.2 AA tam, kde je to realistické.

- všetky CTA klávesnicou,
- viditeľný focus ring,
- touch target minimálne 44 × 44 px,
- textový ekvivalent fotografií,
- kalendár s ARIA popismi,
- formulárové chyby prepojené s poľami,
- nie iba farba ako indikátor stavu,
- reduced-motion,
- dostatočný kontrast,
- zoom do 200 % bez straty funkčnosti,
- screen reader announcement pri zmene kroku a potvrdení slotu.

---

## 23. Výkonnostné rozpočty

### Ciele mobile production

- LCP pod 2,5 s na bežnom 4G,
- CLS pod 0,1,
- INP pod 200 ms,
- hero asset ideálne pod 250 KB po optimalizácii,
- JS pre verejnú landing/booking trasu minimalizovať,
- galériu lazy-loadovať,
- admin bundle oddeliť od public app.

### Pravidlá

- nepoužívať video v hero ako povinný asset MVP,
- žiadne tri paralelné animation libraries pre rovnakú úlohu,
- GSAP iba lazy-loaded v konkrétnej sekcii,
- Next Image / optimalizovaný CDN pipeline,
- font subset a preload iba nevyhnutných rezov.

---

## 24. Navrhovaná štruktúra repozitára

```text
kotrasko-booking/
├── app/
│   ├── (marketing)/
│   │   ├── page.tsx
│   │   ├── lookbook/
│   │   ├── contact/
│   │   ├── privacy/
│   │   └── terms/
│   ├── book/
│   │   ├── page.tsx
│   │   ├── style/
│   │   ├── time/
│   │   ├── details/
│   │   ├── review/
│   │   └── pay/
│   ├── booking/
│   │   ├── success/
│   │   ├── manage/[token]/
│   │   └── cancel/[token]/
│   ├── admin/
│   └── api/
├── components/
│   ├── brand/
│   ├── booking/
│   ├── calendar/
│   ├── lookbook/
│   ├── motion/
│   ├── admin/
│   └── ui/
├── db/
│   ├── schema/
│   ├── migrations/
│   └── seed/
├── lib/
│   ├── auth/
│   ├── availability/
│   ├── bookings/
│   ├── stripe/
│   ├── email/
│   ├── storage/
│   ├── validation/
│   └── security/
├── public/
│   ├── brand/
│   ├── portfolio/
│   └── og/
├── emails/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/
│   ├── architecture.md
│   ├── booking-state-machine.md
│   ├── stripe-runbook.md
│   └── launch-checklist.md
└── README.md
```

---

## 25. Environment variables

```env
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_STRIPE_PAYMENT_LINK_TEST=
NEXT_PUBLIC_STRIPE_PAYMENT_LINK_LIVE=

DATABASE_URL=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

RESEND_API_KEY=
BOOKING_FROM_EMAIL=
ADMIN_NOTIFICATION_EMAIL=dczwebagentsi@gmail.com

SENTRY_DSN=
CRON_SECRET=
```

Žiadna secret hodnota nesmie byť commitnutá do Git repozitára.

---

## 26. Implementačné fázy

## Fáza 0 — validačný setup

### Výstupy

- potvrdenie MVP rozsahu,
- založenie repozitára,
- `.env.example`,
- staging Vercel projekt,
- Supabase projekt,
- Stripe test mode,
- základné assety,
- rozhodnutie o licencii fontov.

### Acceptance criteria

- build prejde,
- preview deployment funguje,
- databázové migrácie sa dajú spustiť,
- žiadne secrets v repozitári.

---

## Fáza 1 — design system a statický experience prototype

### Úlohy

- vytvoriť design tokens,
- spracovať logo,
- spracovať screenshot fotografie,
- landing page,
- lookbook,
- booking stepper,
- mobile interactions,
- reduced motion,
- responzivita.

### Bez backendu

Použiť mockované dátumy a sloty.

### Acceptance criteria

- vizuál zodpovedá schválenému konceptu,
- mobile 360 px až desktop,
- používateľ prejde celý flow s mock dátami,
- žiadne horizontálne pretekanie,
- Lighthouse accessibility základ nad 90 ako orientačný cieľ.

---

## Fáza 2 — booking engine

### Úlohy

- databázová schéma,
- service seed,
- availability rules,
- availability endpoint,
- slot generator,
- booking hold,
- concurrency ochrana,
- expirácia holdov,
- klientsky formulár,
- upload referencie.

### Acceptance criteria

- nemožno vytvoriť dva aktívne bookingy na rovnaký slot,
- nedostupný slot sa nedá rezervovať cez manuálny API request,
- hold expiruje po 15 minútach,
- time zone je konzistentne Europe/Bratislava.

---

## Fáza 3 — Stripe test integrácia

### Úlohy

- dodaný test Payment Link,
- append `client_reference_id`,
- after-payment redirect,
- webhook endpoint,
- signature verification,
- idempotencia,
- success stránka,
- payment exception handling.

### Acceptance criteria

- testovacia platba 10 € potvrdí správny booking,
- reload webhooku nevytvorí duplicitné side effects,
- success URL bez platnej session nič nepotvrdí,
- pri kolízii po expirácii vznikne `PAYMENT_EXCEPTION`.

---

## Fáza 4 — e-maily a manage booking

### Úlohy

- klientské potvrdenie,
- admin notifikácia,
- magic manage link,
- `.ics`,
- cancellation flow,
- cancellation e-maily.

### Acceptance criteria

- klient dostane správny dátum v Europe/Bratislava,
- manage token nie je čitateľný z databázy,
- zrušený slot sa opäť zobrazí ako voľný,
- refundácia sa nespustí automaticky.

---

## Fáza 5 — admin panel

### Úlohy

- admin auth,
- dashboard,
- booking list/detail,
- availability editor,
- exceptions,
- settings,
- lookbook CMS,
- audit log.

### Acceptance criteria

- neautorizovaný používateľ nemá prístup,
- Kotrasko vie zmeniť rozvrh bez deployu,
- vie zablokovať konkrétny deň,
- vie označiť booking ako completed/no-show,
- vie vymeniť kontakty a fotografie.

---

## Fáza 6 — hardening a QA

### Úlohy

- unit testy,
- integration testy,
- Playwright E2E,
- security review,
- performance audit,
- accessibility audit,
- cross-browser QA,
- mobile devices,
- error monitoring.

### Acceptance criteria

- všetky kritické scenáre prejdú,
- žiadne P0/P1 chyby,
- žiadne známe double-booking race conditions,
- test Stripe webhook prejde,
- formuláre fungujú na iOS Safari a Android Chrome.

---

## Fáza 7 — production launch

### Úlohy

- potvrdiť všetky launch gates,
- live Stripe,
- produkčný webhook,
- live e-mail domain,
- DNS subdoména,
- právne stránky,
- produkčné fotografie,
- otváracie hodiny a rozvrh,
- backup a rollback,
- monitoring.

### Acceptance criteria

- test reálnej platby v malej sume alebo interný produkčný smoke test,
- správne e-maily,
- správna adresa a telefón,
- booking sa zobrazí v admine,
- rollback postup je zdokumentovaný.

---

## 27. Testovací plán

## 27.1 Unit testy

- generovanie slotov,
- minimum notice,
- 30-dňový horizon,
- DST pre Europe/Bratislava,
- prekrývanie intervalov,
- hold expiration,
- state transitions,
- validácia telefónu/e-mailu,
- manage token hashing.

## 27.2 Integration testy

- booking hold + DB transaction,
- webhook + booking confirmation,
- webhook idempotencia,
- expired hold + free slot,
- expired hold + occupied slot,
- cancellation + release slot,
- email queue/error handling.

## 27.3 E2E

1. mobilný používateľ vyberie vibe, termín a zaplatí,
2. klient opustí Stripe a vráti sa,
3. dvaja klienti kliknú na rovnaký slot,
4. klient otvorí neplatný success link,
5. klient zruší booking cez magic link,
6. admin zablokuje deň a sloty zmiznú,
7. admin upraví booking,
8. reduced motion flow,
9. keyboard-only booking,
10. upload nepovoleného súboru.

## 27.4 Stripe test cases

- úspešná karta,
- zamietnutá karta,
- 3D Secure,
- webhook retry,
- nesprávny podpis,
- duplicitný event,
- session bez client_reference_id,
- nesprávna suma,
- nesprávna mena.

---

## 28. Definition of Done — MVP

MVP je dokončené iba vtedy, keď:

- schválený prémiový vizuál je implementovaný,
- landing a booking sú plne responzívne,
- klient vyberie vibe, dátum a čas,
- systém drží slot počas platby,
- Stripe platba je priradená ku konkrétnemu booking ID,
- webhook potvrdí booking,
- dvojitá rezervácia je databázovo blokovaná,
- klient dostane e-mail a `.ics`,
- admin dostane e-mail,
- klient môže booking zrušiť cez bezpečný link,
- Kotrasko vie spravovať dostupnosť,
- fotografie a kontakty sa dajú meniť,
- existuje staging a production konfigurácia,
- sú spravené E2E testy kritického flow,
- právne a prevádzkové údaje sú potvrdené pred public launch.

---

## 29. Explicitne mimo MVP

- marketplace ďalších barberov,
- natívna iOS/Android aplikácia,
- automatické SMS cez platenú bránu,
- automatické refundácie,
- dynamické ceny,
- membership/subscription,
- viac jazykov,
- komplexný CRM,
- fakturácia,
- sklad produktov,
- AI odporúčanie účesu podľa fotografie tváre,
- live chat,
- vernostné body,
- affiliate/referral systém.

Tieto funkcie môžu byť zaradené do roadmapy po overení, že systém reálne získava rezervácie.

---

## 30. Post-MVP roadmap

### Release 1.1

- e-mail reminder 24 h,
- tlačidlo rezervovať znova,
- waiting list pri obsadenom dni,
- jednoduché recenzie.

### Release 1.2

- SMS pripomienky,
- presun rezervácie klientom podľa pravidiel,
- automatizovaný refund workflow,
- PWA install prompt.

### Release 2.0

- viac služieb,
- produkty a upsell,
- vernostný program,
- referenčné kódy,
- pokročilé revenue dashboardy.

### Release 3.0

- multi-barber architektúra pre Big Head House,
- samostatné profily,
- výber barbera,
- spoločný kalendár,
- Stripe Connect alebo oddelené payout pravidlá.

---

## 31. Rozhodnutia, ktoré sa už nemajú počas MVP meniť bez change requestu

- hlavná značka je KOTRASKO,
- Big Head House je parent/location brand,
- primárna služba je 10 € / 60 minút,
- platba je povinná online,
- booking horizon je 30 dní,
- minimum notice je 2 hodiny,
- hold je 15 minút,
- mobile-first je priorita,
- lookbook je súčasť booking flow,
- admin spravuje dostupnosť,
- webhook je zdroj pravdy pre platbu,
- refundácia nie je v MVP automatická.

---

## 32. Zostávajúce údaje pred implementáciou a pred launchom

### Pred začatím kódovania

Nie sú potrebné ďalšie produktové rozhodnutia. Môže sa začať s prototypom a technickou implementáciou.

### Pred dokončením Stripe fázy

- Stripe test secret key,
- Stripe test webhook secret,
- konfigurácia after-payment redirect,
- potvrdenie zberu mena/telefónu v Stripe.

### Pred produkčným launchom

- live Stripe link alebo Price ID,
- live secret key a webhook secret,
- produkčný e-mail odosielateľa,
- Kotraskov e-mail,
- potvrdený telefón,
- potvrdený rozvrh,
- súhlas s logom, názvom, fotografiami a subdoménou,
- pravidlá refundácie,
- právne texty,
- pôvodné fotografie,
- DNS prístup.

---

## 33. Záverečné odporúčanie

Projekt je dostatočne špecifikovaný na začatie vývoja.

Dodaný Stripe Payment Link je vhodný pre **testovacie MVP**. Implementácia ho však nesmie používať ako obyčajné tlačidlo bez väzby na rezerváciu. Každý redirect musí obsahovať náhodné `client_reference_id`, platba sa musí potvrdiť webhookom a slot musí byť chránený databázovou transakciou.

Najväčšia hodnota systému nebude v množstve funkcií, ale v kombinácii:

- reálneho Kotraskovho portfólia,
- výrazného KOTRASKO vizuálu,
- rýchleho mobilného flow,
- bezpečnej rezervácie,
- spoľahlivej platby,
- jednoduchej správy dostupnosti.

Tak vznikne systém, ktorý nepôsobí ako formulár, ale ako digitálny vstup do zážitku v Big Head House Ilava.

---

## 34. Referenčné zdroje pre implementáciu

- Stripe Checkout Sessions:  
  https://docs.stripe.com/api/checkout/sessions
- Stripe Payment Link URL parameters a `client_reference_id`:  
  https://docs.stripe.com/payment-links/url-parameters
- Stripe post-payment redirect:  
  https://docs.stripe.com/payment-links/post-payment
- Stripe webhook dokumentácia:  
  https://docs.stripe.com/webhooks
- UI UX Pro Max skill:  
  https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
- Big Head House verejná stránka:  
  https://ilavabarbershop.sk/

# ZLKL Hra - Tomův Dream job

## Jak změnit odměny?

V souboru ```app.js``` najdete tento kod:

```
const rewards = ["Ponožky", "Tužka", "Sešit", "Samolepka", "Odznáček"];

```

Program z těchto pěti odměn vezme tři a schová je za karty, ze kterých si uživatel jednu vybere po výhře.

Změnit to můžete relativně jednoduše, stačí zaměnit texty v uvozovkách, t.j. kdybych chtěl místo tužky mít pero, kod bude vypadat následovně:

```
const rewards = ["Ponožky", "Pero", "Sešit", "Samolepka", "Odznáček"];

```

!!! Upozornění, pokud bude kod bez uzavíracích uvozovek, či čárek mezi předměty, nebude fungovat.

✅  ```const rewards = ["Ponožky", "Pero", "Sešit", "Samolepka", "Odznáček"];```

❌  ```const rewards = ["Ponožky, "Pero", "Sešit", "Samolepka", "Odznáček"];``` (Chybí uvozovky)

❌  ```const rewards = ["Ponožky" "Pero", "Sešit", "Samolepka", "Odznáček"];``` (Chybí čárka)

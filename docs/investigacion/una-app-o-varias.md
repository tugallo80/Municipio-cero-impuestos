# ¿Una app municipal o varias? — Investigación (7-nov-2026)

Pregunta del dueño: desde la experiencia del ciudadano, ¿conviene una sola app que reúna todo
(suscripciones, transparencia, referéndums, eMarket, transporte, salud) o apps separadas?
Educación ya es app aparte.

Cinco enfoques investigados en paralelo: sociología, psicología, neurociencias, marketing y casos
reales de gobiernos. Cada afirmación lleva su fuente; al final se separa evidencia de inferencia.

## Respuesta corta

**Los cinco enfoques llegan a lo mismo: ni una súper app con todo ni muchas apps sueltas.**
Lo que funciona es **una sola cuenta (ÑANDÉ ID)**, **una app núcleo con pocos accesos**, y
**apps aparte solo para lo que tiene datos sensibles o públicos distintos** (Educación, Salud).
Dentro del núcleo, **lo cívico va en un espacio protegido**: sin publicidad, sin premios por votar,
sin cruzar datos de compras o viajes con votos.

## La propuesta

| Pieza | Qué es | Por qué |
|---|---|---|
| **ÑANDÉ ID** | Una sola cuenta para todo (idealmente con Ciudadanía Digital de AGETIC) | Lo que más funcionó en todos los casos: Singpass, gov.br, Llave CDMX, One Login |
| **App ÑANDÉ (núcleo)** | Inicio con **máximo 4 accesos**: *Mi aporte* (suscripción, reciclaje, solar, billetera de créditos), *Mi ciudad* (transparencia + referéndums), *Comprar* (eMarket), *Viajar* (transporte) | Lo de uso diario (comprar, reciclar, viajar) trae al vecino; lo cívico se le ofrece en el momento justo |
| **Mi ciudad** (dentro del núcleo, espacio protegido) | Transparencia en tiempo real + referéndums de obras por zona | Confianza institucional en Bolivia muy baja: el voto tiene que verse neutral |
| **eMarket y transporte** | Submarcas "… de ÑANDÉ", primero como módulos dentro del núcleo; apps aparte solo para vendedores/conductores o si crecen | Compiten con Yango/InDrive/Marketplace: si fallan, no deben arrastrar la confianza en la transparencia. Así lo hizo App CDMX (taxi dentro); Uber separó y volvió a juntar Uber Eats |
| **Salud** | App aparte con la misma cuenta | Datos clínicos: reglas propias (Singapur unifica salud en su propia app) |
| **Educación** | App aparte (ya decidido) con respaldo visible "de ÑANDÉ" | Otro público, datos de menores |
| **Web abierta de transparencia** | Las cuentas públicas, sin iniciar sesión | Para periodistas y oposición: la transparencia no puede ser "producto" de la app |
| **WhatsApp** | Bot para avisos, consultas y votos simples | ~89% Android, datos caros, todos en WhatsApp. Boti (Buenos Aires): 26 millones de conversaciones en un trimestre sin descargas |

Formato técnico: app web instalable (PWA) liviana para Android de gama baja (Twitter Lite pesaba
600 KB contra 23,5 MB de la app nativa).

## Reglas de diseño (las que más respaldo tienen)

1. **Votar NO da créditos ni descuentos.** Pagar por participar baja la participación
   (Frey y Oberholzer-Gee 1997; Gneezy y Rustichini 2000; metaanálisis Deci, Koestner y Ryan 1999).
   La recompensa es ver el resultado: "ganó tu opción, la obra va 40%".
2. **Cerrar siempre el ciclo.** En FixMyStreet, cuando el primer reclamo se resolvió, la
   probabilidad de un segundo subió 57% (Sjoberg, Mellon y Peixoto 2017).
3. **Referéndums vinculantes con monto fijo**, respaldados por ordenanza. Porto Alegre, Decide
   Madrid y vTaiwan perdieron participación cuando no se cumplía o faltó voluntad política;
   Barcelona funcionó con dinero real (39.433 vecinos decidieron 30 millones de euros).
4. **Créditos solo para conductas económicas o ambientales** (reciclaje, solar, consumo).
5. **"Suscripción" solo funciona si el vecino ve qué recibe.** Si es obligatorio y solo cambia
   el nombre, puede sentirse como engaño (Prelec y Loewenstein 1998, "dolor de pagar").
6. **Pocas opciones a la vez**, mismo diseño y gestos en todos los módulos.
7. **Permisos por módulo**, no todos al registrarse; decir claro que salud y voto no se cruzan
   con pagos (integridad contextual, Nissenbaum).
8. **Inclusión**: votación presencial asistida, modo simple para adultos mayores, poco consumo
   de datos. El voto online atrae más a jóvenes, hombres y gente de más ingresos (Rio Grande do Sul).
9. **Seguridad**: todo en una cuenta = un ataque afecta todo (filtraciones en Diia, Llave CDMX,
   Mi Argentina). Datos separados por módulo y auditoría externa; código del módulo de voto auditable.
10. **No crear apps nuevas sin justificarlo.** Indonesia llegó a 27.000 apps de gobierno y tuvo
    que prohibir nuevas; Brasil, Bogotá y Singapur también tuvieron que unificar.

## Orden de lanzamiento sugerido

1. **Mi aporte** — cuánto aportás, créditos por reciclar, en qué se gasta la plata de tu barrio.
   Es lo único de ÑANDÉ y no compite con nadie.
2. **eMarket** en mercados piloto, donde se usan los créditos (da uso frecuente a la billetera).
3. **Referéndums de obras** por zona, cuando haya usuarios verificados.
4. **Salud** (app aparte).
5. **Transporte**, al final y como piloto acotado: es lo de más competencia y riesgo operativo.

Educación sigue su propio camino como primera prueba, en paralelo.

## Frases "neuro" que NO usar en la presentación

- "Cada notificación da una dosis de dopamina" — la dopamina codifica errores de predicción.
- "La app genera confianza con oxitocina" — no se replicó (Declerck y otros 2020).
- "Un hábito se forma en 21 días" — el promedio medido fue 66 días, rango 18–254 (Lally 2010).
- "7±2 elementos en la memoria" — hoy se estima ~4 (Cowan 2001).
- "La fatiga de decisión agota la voluntad" — réplica en 23 laboratorios con efecto cercano a cero.

## Qué es evidencia y qué es inferencia

- **Sólido**: crowding-out por pago; la respuesta visible aumenta la participación; la confianza
  predice el uso de gobierno digital (Carter y Bélanger 2005); confianza institucional muy baja en
  Bolivia (Latinobarómetro 2024, vía prensa); brecha urbano-rural (INE); casos de unificación de apps.
- **Inferencia**: que el híbrido supere a las otras opciones en Santa Cruz — **no existe estudio
  que compare "una app vs varias" en gobierno local**. Se recomienda validar con prototipos y
  vecinos reales (incluidos adultos mayores) antes de decidir en firme.
- **Sin datos**: confianza en la Alcaldía de Santa Cruz, costo actual de datos móviles en Bolivia,
  costo de adquisición por descarga en Bolivia. La Alcaldía de Santa Cruz no tiene app oficial de
  trámites (sí la Gobernación); Ciudadanía Digital tiene ~571 mil registrados (AGETIC, oct-2025).

## Fuentes principales

- Frey y Oberholzer-Gee (1997), *AER*: https://www.hbs.edu/faculty/Pages/item.aspx?num=15035
- Gneezy y Rustichini (2000), *QJE*: https://econpapers.repec.org/RePEc:oup:qjecon:v:115:y:2000:i:3:p:791-810.
- Deci, Koestner y Ryan (1999): https://depts.washington.edu/techdocs/papers/deciExtrinsicRewardsAndIntrinsicMotivation99.pdf
- Sjoberg, Mellon y Peixoto (2017), FixMyStreet: https://www.oidp.net/docs/repo/doc381.pdf
- Spada y otros (2016), voto online Rio Grande do Sul: https://openknowledge.worldbank.org/entities/publication/0c767762-408c-5299-b23a-e8525661330e/full
- Porto Alegre (WRI): https://www.wri.org/research/porto-alegre-participatory-budgeting-and-challenge-sustaining-transformative-change
- Decide Madrid (Royo y otros 2020): https://ideas.repec.org/a/gam/jsusta/v12y2020i4p1674-d324288.html
- Barcelona/Decidim: https://www.barcelona.cat/infobarcelona/en/over-100000-people-take-part-in-participatory-process-in-the-current-term-of-office_1268198.html
- Latinobarómetro 2024 (prensa): https://elpais.bo/nacional/20250131_latinobarometro-2024-ubica-a-bolivia-en-el-ultimo-lugar-en-progreso-situacion-economica-democracia-y-justicia.html
- Prelec y Loewenstein (1998): https://pubsonline.informs.org/doi/fpi/10.1287/mksc.17.1.4
- Lally y otros (2010), hábitos: https://www.ucl.ac.uk/news/2009/aug/how-long-does-it-take-form-habit
- Nissenbaum, integridad contextual: https://nissenbaum.tech.cornell.edu/papers/Contextual%20Integrity%20Up%20and%20Down.pdf
- Aaker y Joachimsthaler (2000), arquitectura de marca: https://cmr-mig.berkeley.edu/2000/08/42-4-the-brand-relationship-spectrum-the-key-to-the-brand-architecture-challenge
- Loken y John (1993), daño a la marca madre: https://carlsonschool-d8.prd.umn.edu/sites/carlsonschool.umn.edu/files/2020-03/loken%20and%20john%201993.pdf
- Boti (Buenos Aires): https://buenosaires.gob.ar/gcaba_historico/jefaturadegabinete/innovacion/noticias/boti-el-chatbot-de-la-ciudad-supero-las-26-millones-de
- Android en Bolivia (StatCounter): https://gs.statcounter.com/os-market-share/mobile/bolivia
- Twitter Lite (PWA): https://web.dev/case-studies/twitter
- Uber Eats vuelve a la app de Uber: https://techcrunch.com/2019/06/04/uber-eats-uber-eats/
- Diia: https://www.kmu.gov.ua/en/news/ponad-21-milion-ukraintsiv-korystuiutsia-diieiu-de-dostupni-24-dokumenty-ta-ponad-30-servisiv
- Singapur, salud en una app: https://www.moh.gov.sg/newsroom/integrating-public-health-apps-into-one--front-door--with-common-design-and-interoperability/
- GOV.UK 2025: https://insidegovuk.blog.gov.uk/2026/01/28/how-people-used-gov-uk-in-2025/
- App CDMX: https://www.cronica.com.mx/metropoli/2026/02/24/app-cdmx-permitira-pagar-predial-agua-y-lineas-de-captura-desde-el-celular/
- Indonesia, 27.000 apps: https://govinsider.asia/intl-en/article/all-indonesia-ministries-apps-set-to-be-integrated-via-apis-with-ina-digital-by-may-2024
- Ciudadanía Digital AGETIC: https://agetic.gob.bo/sites/default/files/2025-10/02%20-%20Boletin%20Digital%20038.pdf
- Moscú "Active Citizen" (legitimación sin poder real): https://boris.unibe.ch/157923
- Allcott (2011), normas sociales: https://www.povertyactionlab.org/pt-br/node/4530

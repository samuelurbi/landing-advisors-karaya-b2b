// Todo el copy de la versión B2B (13/10). Manda lo último del grupo «Marketing web»
// (../brief/2026-10-13-marketing-web.md): enfoque comercial para otros negocios, sin precios, sin
// porcentaje de comisión (solo la fórmula aprobada para el grupo), inglés americano para profesionales
// del viaje («clients» = los del socio, «guests» = a bordo), sin rayas largas ni clichés turísticos, y
// estructura distinta a la de Hispaniola. Nada sin verificar como hecho: va con <Pendiente> y está en
// PENDIENTES.md. Reglas de Karaya: nada de «Angurria», «Eclipse», «open bar», «MICE» en H1; WhatsApp
// nunca como CTA primario. Hechos del barco: los publicados en karayapartyboat.com.
// `*palabra*` = acento (itálica amarilla), no cambia el texto.

export const marca = {
  nombre: 'Karaya Punta Cana',
  lugar: 'Karaya Punta Cana · Dominican Republic',
  // Partner desk que dio Karaya (punto 11, 15/10). Tiempo de respuesta: no lo dieron.
  email: 'sales@karayapuntacana.com',
  telefonos: [
    { etiqueta: 'Toll free', numero: '1-800-657-0016', tel: '+18006570016' },
    { etiqueta: 'Local', numero: '+1-809-803-9529', tel: '+18098039529' },
  ],
  web: 'https://karayapuntacana.com', // web principal (Marketing, 20/10)
  // WhatsApp de la web principal (karaya-partyboat): solo como salida si falla el formulario.
  whatsapp: '18098039529',
};

export const nav = [
  { label: 'The boat', href: '#the-boat' },
  { label: 'The evening', href: '#the-evening' },
  { label: 'Plan an event', href: '#plan' },
  { label: 'Partnership', href: '#partnership' },
];

export const cta = {
  partner: 'Become a partner',
  conversacion: 'Start a Partnership Conversation',
  barco: 'Tour the boat',
};

// Hero: el selector de momentos de la propuesta «El Atardecer». Cada momento cambia la foto y la línea.
export const hero = {
  antetitulo: 'Partner program · Punta Cana, Dominican Republic',
  h1: 'The celebration your clients fly to *Punta Cana* for.',
  bajada: 'Karaya is a private event catamaran on the Bávaro coast. Partner with us and add private parties, birthdays, corporate events and weddings on the water to the trips you sell.',
  publico: 'For travel agencies, tour operators, DMCs, wholesalers and event and group planners.',
  selector: 'Sell a moment',
  // MA-83 (15/10): menos peso a las bodas. Las bodas pasan al final y el primer momento (el de la
  // foto del LCP, precargada en index.html) es el evento privado en general.
  momentos: [
    { id: 'private', etiqueta: 'Private events', foto: 'karaya-hero-03-atardecer', posicion: '62% 55%', linea: 'The whole boat for one group: family reunions, anniversaries and private parties.' },
    { id: 'celebrations', etiqueta: 'Birthdays', foto: 'karaya-punta-cana-deck-party-crowd', posicion: '50% 40%', linea: 'Birthdays, bachelor and bachelorette parties and group celebrations.' },
    { id: 'corporate', etiqueta: 'Corporate', foto: 'karaya-corporativo-mesas', posicion: '50% 60%', linea: 'Private events for companies and incentive trips, from year-end parties to brand moments.' },
    { id: 'weddings', etiqueta: 'Weddings', foto: 'karaya-boda-recepcion', posicion: '50% 50%', linea: 'Ceremony and reception on board, or the reception after a beach ceremony.' },
  ],
};

// «Tour the boat»: los puntos del visor 3D de la web (mismos ids y planos de cámara).
export const barco = {
  antetitulo: 'Tour the boat',
  titulo: 'Every deck is a *selling point*.',
  intro: 'Tap a number on the boat, or take the tour. Each stop shows what your client gets and what your business gets.',
  capaCliente: 'Your client gets',
  capaNegocio: 'Your business gets',
  tour: 'Take the tour',
  pararTour: 'Stop',
  ayuda: 'Drag to turn the boat · tap a number',
  ayudaFoto: 'Choose a stop to see each area',
  lista: 'Areas of the boat',
  zonas: [
    {
      id: 'aerea' as const,
      nombre: 'The whole boat',
      foto: 'karaya-zona-aerea',
      alt: 'Aerial view of the catamaran full of guests',
      titular: 'Two decks, one private venue.',
      cliente: 'The whole catamaran for their group, sailing along the Bávaro coast.',
      negocio: 'One venue for the welcome party, the reception or the farewell: fewer suppliers to coordinate.',
    },
    {
      id: 'cubierta' as const,
      nombre: 'Upper deck',
      foto: 'karaya-zona-cubierta',
      alt: 'Guests relaxing on white lounges on the upper deck',
      titular: 'Open air, with the sea all around.',
      cliente: 'Open-air lounges for the toast, the speeches and the photos.',
      negocio: 'A setting that sells itself in your proposal. The photos do the work.',
    },
    {
      id: 'escalera' as const,
      nombre: 'Open staircase',
      foto: 'karaya-zona-escalera',
      alt: 'Guests on the open staircase next to a painted mural',
      titular: 'The entrance they remember.',
      cliente: 'An open staircase, framed by murals, that connects both decks.',
      negocio: 'A natural stage for entrances and group photos, built into the boat.',
    },
    {
      id: 'barra' as const,
      nombre: 'The bar',
      foto: 'karaya-zona-barra',
      alt: 'Guests at the bar on the lower deck, with murals around it',
      titular: 'Service built in.',
      cliente: 'A bar built into the structure of the lower deck.',
      negocio: 'The bar is part of the venue: one less station to rent and set up.',
    },
    {
      id: 'pista' as const,
      nombre: 'DJ & dance floor',
      foto: 'karaya-zona-pista',
      alt: 'Guests dancing on the lower deck',
      titular: 'From dinner to dancing.',
      cliente: 'When the sun goes down, the lower deck becomes the dance floor.',
      negocio: 'Dinner and party in one booking, so the whole night stays on the program you sold.',
    },
    {
      id: 'murales' as const,
      nombre: 'Original murals',
      foto: 'karaya-zona-murales',
      alt: 'Large painted mural of a parrotfish on the boat',
      titular: 'Art no other venue has.',
      cliente: 'Murals painted for the boat. The venue is part of the experience.',
      negocio: 'A one-of-a-kind venue: a reason to book it through you, not a generic boat.',
    },
  ],
  // De un vistazo. Aforo confirmado por Ventas (punto 07, Marketing 15/10): 300 de pie y 120 sentados,
  // «tal como está». No usar 350 ni otra cifra.
  vistazo: [
    { valor: '2 decks', etiqueta: 'open air and covered' },
    { valor: 'Private', etiqueta: 'one group per event' },
    { valor: 'Bávaro', etiqueta: 'Punta Cana coast' },
  ],
  aforo: { valor: 'Up to 300 guests', etiqueta: 'cocktail style, or 120 seated' },
};

// Baños a bordo (MA-83). Oculta (`visible: false`) por indicación de Marketing (punto 05, 15/10): las
// fotos y los datos llegarán juntos más adelante. Las fotos que mandó Cathy se quedan preparadas en
// public/img (`<nombre>.webp` 1600 px y `-800`, medidas en data/dimensiones.json; la primera va grande).
export const banos = {
  visible: false,
  antetitulo: 'Comfort on board',
  titulo: 'Restrooms *on board*.',
  texto: 'The event never has to stop for a trip to shore. Guests have restrooms on the boat from the welcome toast to the last song.',
  negocio: 'One less question from your client before they book.',
  fotos: [
    { nombre: 'karaya-banos-lavabos', alt: 'Restroom on board Karaya with two washbasins, mirrors and marble-look walls' },
    { nombre: 'karaya-banos-detalle', alt: 'Close-up of the double washbasin and mirrors in a Karaya restroom' },
    { nombre: 'karaya-banos-vertical', alt: 'Restroom on board Karaya with washbasins and wood-look floor' },
  ] as { nombre: string; alt: string }[],
  huecos: ['Restroom photo', 'Restroom detail', 'Restroom detail'],
  pendiente: 'restroom photos from Karaya',
};

// «El Atardecer» (la propuesta de Marketing para Karaya): el cielo pasa de la hora dorada a la noche
// según se avanza por la sección. Sin horarios ni menús: lo que cuenta la web y nada más.
export const velada = {
  antetitulo: 'An event on Karaya',
  titulo: 'From the first toast to the *last song*.',
  intro: 'How an event on board unfolds, from afternoon light to sunset, and what each part means for you.',
  paraTi: 'For your business',
  // Iteración 3 (13/10): tres luces del mismo plano que pasan solas en bucle (y se eligen con las
  // pestañas); el texto de cada luz cambia con la foto. `hora` de cada parada = etiqueta de su luz.
  luces: [
    { id: 'dia', etiqueta: 'Afternoon' },
    { id: 'golden', etiqueta: 'Golden hour' },
    { id: 'anochecer', etiqueta: 'Sunset' },
  ],
  control: 'Moments of the event',
  pausar: 'Pause',
  reanudar: 'Play',
  // Iteración 1 (13/10): la escena va de día a golden hour y a casi anochecer, nunca de noche (Karaya
  // no tiene servicios de noche). `hora` acompaña a la foto que se ve en cada momento.
  paradas: [
    { id: 'board', hora: 'Afternoon', titulo: 'Welcome on board', texto: 'Guests step on board and the group has the boat to itself.', socio: 'Your client sees a private venue from the first minute.' },
    { id: 'sail', hora: 'Afternoon', titulo: 'Sail the Bávaro coast', texto: 'The boat sails along the coast, with the beach in view.', socio: 'Nothing to explain: the setting is the product.' },
    { id: 'toast', hora: 'Golden hour', titulo: 'The toast', texto: 'Speeches, the toast and the photos on the upper deck, in the golden light.', socio: 'The moment that ends up in every guest’s photos, and in your next proposal.' },
    { id: 'dinner', hora: 'Golden hour', titulo: 'Dinner on deck', texto: 'Dinner on board, seated or cocktail style.', socio: 'Format and menu are agreed in the quote, so there are no surprises on the day.' },
    { id: 'dance', hora: 'Sunset', titulo: 'DJ and dance floor', texto: 'As the sun goes down, the lower deck becomes the dance floor.', socio: 'The party stays inside the program you sold.' },
    { id: 'shore', hora: 'Sunset', titulo: 'Back to shore', texto: 'The boat returns at the end of the event, with the last light.', socio: 'An event well delivered is the start of your client’s next booking.' },
  ],
};

// Planificador: arma el borrador del brief que el socio manda (la propuesta «El Atardecer» calculaba
// la comisión; sin porcentaje publicable, aquí no se calcula nada).
export const plan = {
  antetitulo: 'Plan an event',
  titulo: 'Draft the brief. We build the *proposal*.',
  intro: 'Choose what your client has in mind. You get a brief you can send us in one click, and we reply with a proposal you can present.',
  pasos: {
    // El orden importa: la primera opción da la foto por defecto de la tarjeta (antes, la boda).
    tipo: { titulo: 'Event', pregunta: 'What is your client celebrating?', opciones: ['Birthday or celebration', 'Private or farewell party', 'Incentive or corporate', 'Destination wedding'] },
    // Punto 08 (Marketing 15/10): de 80 a 300 invitados, o un consumo mínimo de US$5,000 para grupos
    // más pequeños. La nota va bajo la pregunta con el texto que sugirieron y, como piden, los tramos van
    // dentro del rango 80–300 (no genéricos); menos de 80 solo con el consumo mínimo.
    invitados: { titulo: 'Guests', pregunta: 'How many guests?', nota: '80–300 guests · or US$5,000 minimum spend', opciones: ['80 to 150', '150 to 300', 'Under 80, with US$5,000 minimum spend', 'Not sure yet'] },
    formato: { titulo: 'Format', pregunta: 'What kind of evening?', opciones: ['Seated dinner', 'Cocktail style', 'Party with DJ'] },
    mes: { titulo: 'When', pregunta: 'When is the event?', opciones: ['Next 3 months', 'In 3 to 6 months', 'In 6 to 12 months', 'More than a year out'] },
  },
  extra: { titulo: 'Add Hispaniola for the daytime', texto: 'Catamaran and snorkeling experiences for the rest of the stay.' },
  fotos: { 'Birthday or celebration': 'karaya-punta-cana-friends-group', 'Private or farewell party': 'karaya-punta-cana-drinks-toast', 'Incentive or corporate': 'karaya-corporativo-invitados', 'Destination wedding': 'karaya-boda-recepcion' } as Record<string, string>,
  alts: { 'Birthday or celebration': 'A group of friends celebrating on the deck of Karaya', 'Private or farewell party': 'Glasses ready for a toast on board', 'Incentive or corporate': 'Guests seated at dressed banquet tables during a group event on Karaya', 'Destination wedding': 'A wedding reception set up on the deck of Karaya' } as Record<string, string>,
  progreso: 'Brief progress',
  pasoDe: 'Question {n} of {total}',
  atras: 'Back',
  siguiente: 'Next',
  listo: { antetitulo: 'Brief ready', titulo: 'Your brief is ready to send.', texto: 'Check it on the card. Add the daytime with Hispaniola if your clients stay a few days, then send it and we reply with a proposal.', otra: 'Start over' },
  porElegir: { tipo: 'Your event' },
  faltan: 'Answer the questions to send',
  borrador: 'Draft brief',
  recibes: 'What you get back',
  incluye: ['A proposal you can present to your client', 'Karaya services and third-party services listed separately', 'One contact from quote to event day'],
  enviar: 'Send this brief',
  nota: 'No prices here: every event is quoted to measure.',
};

// Para la agencia (no solo el advisor): bento con objetos. Textos de Karaya (punto 6, 15/10), en inglés
// como vienen; cada beneficio lleva su lema (`lema`). La tarjeta del contacto enseña el partner desk.
export const negocio = {
  antetitulo: 'Built for your business',
  titulo: 'What Your Agency Gets From *Day One*',
  subtitulo: 'Your Partner in Extraordinary Events in Punta Cana',
  intro: 'At Karaya, we believe successful partnerships are built on trust, personalized service, and exceptional experiences. We provide travel agencies, DMCs, event planners, and industry partners with the commercial support and resources they need to confidently promote and sell our unique floating event venue.',
  items: [
    { id: 'comision', objeto: 'objeto-sobre', titulo: 'Agency Commissions', lema: 'A partnership designed for mutual success.', texto: 'We value our agency partners and offer competitive commission opportunities based on our established commercial agreements.', grande: true },
    { id: 'cliente', objeto: 'objeto-04-llave', titulo: 'Your Clients, Your Relationships', lema: 'We respect the relationships you’ve built.', texto: 'Your clients remain your clients. Our team works alongside your agency to deliver exceptional service while respecting your established business relationships.' },
    { id: 'kit', objeto: 'objeto-kit', titulo: 'Sales Tools & Product Knowledge', lema: 'Everything you need to sell with confidence.', texto: 'Access professional marketing materials, product information, and personalized guidance to help your team effectively present the Karaya experience.' },
    { id: 'propuesta', objeto: 'objeto-propuesta', titulo: 'Personalized Quotation Support', lema: 'We help you turn opportunities into confirmed bookings.', texto: 'From initial inquiries to customized proposals, our commercial team supports your agency with tailored quotations and event solutions.', grande: true },
    { id: 'contacto', objeto: 'objeto-contacto', titulo: 'Dedicated Commercial Assistance', lema: 'A reliable partner at every step.', texto: 'Enjoy direct communication with our sales and events team for inquiries, availability, event coordination, and booking assistance.', contacto: true },
    { id: 'visita', objeto: 'objeto-01-barco', titulo: 'Familiarization & Site Inspections', lema: 'Experience Karaya before recommending it.', texto: 'We welcome qualified industry partners to explore our venue through coordinated site inspections, subject to availability.' },
    { id: 'crece', objeto: 'objeto-02-copas', titulo: 'Grow Your Business With Us', lema: 'More opportunities. More memorable experiences.', texto: 'Expand your portfolio with private celebrations, corporate events, weddings, incentive groups, and exclusive experiences aboard Karaya, a unique floating event venue in Punta Cana.' },
  ],
};

// Puente a Hispaniola (lo pide Marketing desde el primer mensaje). MA-83 (15/10): fuera el Museo, que
// es solo de Hispaniola; queda la piscina natural como muestra del día.
export const puente = {
  antetitulo: 'One partnership, two brands',
  titulo: 'Sell them the rest of the *stay*.',
  texto: 'Karaya is the celebration. Hispaniola Aquatic Adventures, our sister brand, covers the daytime with catamaran and snorkeling experiences. One partnership conversation covers both.',
  piezas: [
    {
      foto: 'hispaniola-piscina-natural',
      alt: 'Aerial view of a Hispaniola catamaran over the turquoise natural pool',
      etiqueta: 'Hispaniola Aquatic Adventures',
      titulo: 'Natural pool',
      texto: 'Clear, shallow water in the middle of the sea, with snorkeling on the reef.',
    },
  ],
};

// Condiciones para socios (punto 9). Manda el Word 09 de Marketing (15/10, confirmado por Ventas y
// Raymond), que sustituye a lo de Cathy: pagos 10 + 30 + 50 + 10 % al llegar, mínimo de 80 pasajeros,
// «Karaya» en vez de «Eclipse». Arriba, lo esencial en cuatro bloques; el texto completo (su traducción
// de cortesía al inglés), en el desplegable.
export const condiciones = {
  antetitulo: 'Booking terms',
  titulo: 'Clear terms for every *booking*.',
  intro: 'The essentials partners ask about first. Every quote is confirmed in the event contract.',
  bloques: [
    { id: 'deposito', titulo: 'Deposit and payments', puntos: ['10% deposit to confirm the date. Until then, any quote is tentative.', '30% due 30 days before the event.', '50% due 5 days before the event, if paid by bank transfer.', 'The remaining 10% is paid on arrival.', 'The deposit is deducted from the event total and is non-refundable if the client cancels. Taxes not included.'] },
    { id: 'cancelacion', titulo: 'Cancellations and reductions', puntos: ['From 30 days to 1 day before: cancelling the whole booking is charged at 100% of the total.', '30 to 15 days before: up to 30% of guests can be reduced without penalty; beyond that, 40% of the total.', '15 to 7 days before: up to 5% of guests can be reduced without penalty.', 'No-shows are charged at 100%. A minimum of 80 passengers per trip is required.'] },
    { id: 'clima', titulo: 'Weather', puntos: ['In case of rain, the upper deck has a protective awning and the lower deck is 90% covered.', 'If a tropical storm makes sailing unsafe, we reschedule to the next available date, or give a full refund if that is not possible.'] },
    { id: 'bordo', titulo: 'On board', puntos: ['Babies under 3 go free; children 3 to 9 pay 50% of the selected package. The child discount applies only with a minimum of 80 adults.', 'Services Karaya doesn’t offer must be requested at least 1 week before the event.'] },
  ],
  desplegable: 'Full booking terms and conditions',
  legal: [
    {
      titulo: 'Payment terms',
      puntos: [
        'Any quotation is tentative until the 10% deposit is paid.',
        'A second deposit payment of 30% must be paid 30 days before the activity.',
        'The final payment of 50% must be made 5 days before the activity if paid by bank transfer.',
        'The remaining 10% is paid upon arrival at the company’s facilities.',
        'Taxes not included.',
        'The deposit excludes all additional charges related to deposit costs and currency exchange.',
        'The deposit is non-refundable if the client cancels the event.',
        'The deposit will be deducted from the total amount of the event.',
        'All quotations are subject to the terms of the event contract.',
      ],
    },
    {
      titulo: 'Cancellation and reduction policy',
      puntos: [
        'From 30 days to 1 day before the group’s arrival, cancellation of the whole booking is charged at 100% of the total.',
        '30 to 15 days: up to 30% of guests may be reduced without penalty. Any additional cancellation beyond that 30% is penalized with 40% of the total.',
        '15 to 7 days before the event, 5% of guests may be cancelled without penalty.',
        'No-shows are charged 100% of the total.',
        'A minimum of 80 passengers per trip is required.',
      ],
    },
    {
      titulo: 'Force majeure',
      puntos: [
        'If either party to this Agreement fails to meet its obligations under this Agreement, in whole or in part, due to, among others, acts of God, including fires, explosions, earthquakes, hurricanes, extreme weather, epidemic, quarantine, terrorism, civil unrest, public utility failures, transport restrictions affecting at least 50% of the event participants, strikes, labor delays or disturbances, floods, embargoes, wars, nuclear disasters or riots, existing and continuing at the time of performance of the obligations (a “Force Majeure Event”), such failure will not be considered a breach of this Agreement for the duration of such inability. You will receive the deposit back.',
      ],
    },
    {
      titulo: 'Weather policy',
      puntos: [
        'In case of rain, we have a protective awning on the second level and the first level is 90% covered.',
        'If a tropical storm is forecast and sailing conditions are not favorable, we will work with you to reschedule your trip to the next available date, if one is available. If for any reason it cannot be rescheduled because your vacation has ended or there is no other availability, we will be happy to give you a full refund.',
      ],
    },
    {
      titulo: 'On-board policies',
      puntos: [
        'If you request other services not offered by Karaya, you must ask and give notice at least 1 week before the event.',
        'Karaya is not responsible for objects left on board during or after the event. If we find any object, it will be stored at the boat’s location; however, we are not responsible for transporting such objects.',
        'Babies under 3 enter free.',
        'Children between 3 and 9 pay a reduced price of 50% of the selected package. The infant/child discount applies only with a minimum of 80 adults.',
        'Setup fees: based on the total cost per person of the event as quoted and agreed by both parties. Additional services outside the services listed by Karaya will not be included in any discount, and the deposit is non-refundable. This includes entertainment, additional decoration and external A/V services or vendors.',
      ],
    },
  ],
};

// La alianza (punto 10, Marketing 15/10): fuera «From first call to commission» (pasos) y «Competitive
// Partner Commission». Queda una sola frase, la que indicaron, y el botón al formulario.
export const programa = {
  antetitulo: 'The partnership',
  frase: 'Karaya offers a collaboration program for travel agencies and commercial *partners*.',
  cta: 'Become a Karaya partner',
};

export const registro = {
  antetitulo: 'Become a partner',
  titulo: 'Bring your clients a *celebration* on the water.',
  texto: "Whether you're a travel agency, tour operator, DMC, wholesaler or wedding and group planner, let's talk about how Karaya fits your programs.",
  briefAdjunto: 'Your draft brief is attached',
  quitarBrief: 'Remove',
  campos: {
    nombre: 'Full name',
    empresa: 'Company name',
    email: 'Business email',
    telefono: 'Phone or WhatsApp',
    pais: 'Country',
    tipo: 'Business type',
    intereses: 'Areas of interest',
    mensaje: 'Anything we should know?',
    opcional: '(optional)',
    // Dice exactamente a qué se consiente (Marketing, 20/10). Borrador hasta el texto legal definitivo.
    consentimiento: 'I agree that Karaya Punta Cana may store the details I submit in this form and use them to contact me by email or phone about this partnership inquiry. I can withdraw my consent at any time.',
    politica: 'Read our Privacy Policy',
  },
  seleccionar: 'Select',
  paises: ['United States', 'Canada', 'United Kingdom', 'Mexico', 'Dominican Republic', 'Other'],
  tipos: ['Travel agency', 'Tour operator', 'Travel advisor network', 'DMC', 'Destination experience distributor', 'Travel wholesaler', 'Wedding or event planner', 'Hotel or concierge', 'Other'],
  intereses: ['Birthdays and celebrations', 'Private and farewell parties', 'Incentives and corporate', 'Destination weddings', 'Hispaniola day experiences'],
  enviar: 'Start a Partnership Conversation',
  enviando: 'Sending…',
  errores: {
    nombre: 'Please enter your full name.',
    empresa: 'Please enter your company name.',
    email: 'Please enter a valid business email.',
    pais: 'Please choose your country.',
    tipo: 'Please choose your business type.',
    consentimiento: 'Please confirm we may contact you.',
    resumen: 'Please check the fields marked below.',
    envio: "We couldn't send your request. Please try again, or reach us directly:",
    whatsapp: 'Message us on WhatsApp',
    whatsappTexto: "Hi! I tried to send the partner form on karayatravelagents.com and it didn't go through.",
  },
  hecho: { titulo: 'Thanks, the conversation has started.', texto: 'Our team will review your details and reply by email.', otro: 'Send another' },
  privacidad: 'Consent text and privacy policy are pending legal review.',
};

// Cierre a sangre: el remate de los textos de Karaya (punto 6, 15/10).
export const cierre = {
  titulo: 'Let’s Create Extraordinary Experiences *Together*.',
  texto: 'Partner with Karaya and discover new opportunities to grow your business in Punta Cana.',
};

export const pie = {
  lema: 'A private event catamaran on the Bávaro coast, Punta Cana.',
};

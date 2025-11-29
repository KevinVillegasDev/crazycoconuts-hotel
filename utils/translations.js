// ==========================================================================
// CRAZY COCONUTS - Translation System
// Supports English (en) and Spanish (es)
// ==========================================================================

const translations = {
    en: {
        // Navigation
        nav: {
            home: "Home",
            ourStory: "Our Story",
            rooms: "Rooms",
            amenities: "Amenities",
            explore: "Explore",
            contact: "Contact",
            bookYourStay: "Book Your Stay"
        },

        // Hero Section
        hero: {
            location: "San Antero, Colombia",
            title: 'Where the <em>Caribbean</em> feels like <em>home</em>',
            subtitle: "A cozy family-run bed & breakfast on Colombia's unspoiled coast. Homemade meals, hammocks under palms, and the kind of hospitality that makes strangers feel like family.",
            reserveRoom: "Reserve Your Room",
            seeRooms: "See Our Rooms",
            yearsHospitality: "Years of Hospitality",
            familyRooms: "Family Rooms",
            homemadeBreakfast: "Homemade Breakfast",
            guestFavorite: "Guest Favorite",
            guestQuote: '"Like staying with family"',
            scrollToExplore: "Scroll to explore"
        },

        // Quick Booking
        quickBooking: {
            checkAvailability: "Check Availability",
            findDates: "Find your perfect dates",
            checkIn: "Check-in",
            checkOut: "Check-out",
            guests: "Guests",
            guest: "Guest",
            guestsPlural: "Guests"
        },

        // About Section
        about: {
            tag: "Our Story",
            title: 'More than a place to stay&mdash;<br><em>a place to belong</em>',
            familyBadge: "Family Run Since 2009",
            lead: "Welcome to our family. Nestled in the coastal town of San Antero, Córdoba, Crazy Coconuts is more than a destination—it's a home where every guest becomes family.",
            p1: "Our spacious, immaculately clean bed & breakfast offers the perfect sanctuary for those seeking authentic relaxation. Here, where tranquil beaches meet unspoiled countryside, you'll savor lovingly prepared homemade meals while surrounded by the safe, serene atmosphere where time slows down.",
            p2: "We believe in the simple things: fresh morning coffee on the terrace, afternoon naps in hammocks, and evenings filled with good conversation and even better food.",
            feature1Title: "Homemade Meals",
            feature1Text: "Traditional Colombian breakfast included daily",
            feature2Title: "Peaceful Setting",
            feature2Text: "Escape the crowds on quiet, pristine beaches",
            feature3Title: "Personal Touch",
            feature3Text: "We'll help plan tours, meals & local experiences"
        },

        // Rooms Section
        rooms: {
            tag: "Accommodations",
            title: 'Comfortable rooms for <em>families & friends</em>',
            subtitle: "Spacious, clean, and thoughtfully designed for your comfort. Every room includes breakfast, air conditioning, and everything you need for a relaxing stay.",
            upTo: "Up to",
            guestsLabel: "guests",
            room1Name: "Family Room (Up to 4 Guests)",
            room1Desc: "Perfect for families and small groups. Comfortable beds, private bathroom, and all the amenities you need.",
            room2Name: "Large Family Room (Up to 7 Guests)",
            room2Desc: "Our most spacious room, ideal for large families and group gatherings. Plenty of space to spread out and relax.",
            mostPopular: "Most Popular",
            freeWifi: "Free WiFi",
            ac: "A/C",
            privateBath: "Private Bath",
            tv: "TV",
            miniFridge: "Mini Fridge",
            breakfast: "Breakfast",
            from: "From",
            perNight: "/night",
            bookThisRoom: "Book This Room",
            note: "All rooms include daily homemade breakfast, fresh linens, and 24-hour access. Need something special? Just ask—we're here to help!"
        },

        // Amenities Section
        amenities: {
            tag: "What's Included",
            title: 'All the little things that make it <em>feel like home</em>',
            subtitle: "No fancy frills, just genuine comforts. Everything you need for a perfect stay.",
            breakfastTitle: "Homemade Breakfast",
            breakfastDesc: "Wake up to the smell of fresh arepas, eggs, and Colombian coffee. Made with love, every morning.",
            drinksTitle: "Fresh Coconut Water",
            drinksDesc: "Straight from the tree to your glass. Plus tropical juices and cold drinks anytime.",
            wifiTitle: "Free WiFi",
            wifiDesc: "Stay connected (or don't - we won't judge). Reliable internet throughout the property.",
            poolTitle: "Swimming Pool",
            poolDesc: "Take a dip in our refreshing pool, surrounded by palm trees and tropical flowers.",
            parkingTitle: "Free Parking",
            parkingDesc: "Secure, complimentary parking right on the property. Your car will be safe with us.",
            hammockTitle: "Hammock Heaven",
            hammockDesc: "Find your favorite spot among our shaded hammocks. Perfect for afternoon naps and good books."
        },

        // Attractions Section
        attractions: {
            tag: "Explore the Area",
            title: 'Your adventure starts <em>right outside our door</em>',
            subtitle: "San Antero is full of hidden gems. We'll share our favorite spots and help you get there.",
            featuredBadge: "Most Popular",
            featuredTitle: "Island Hopping Tours",
            featuredDesc: "Hop on a local boat and explore pristine islands, secret beaches, and the famous bioluminescent waters. We'll pack you a cooler of drinks and snacks.",
            featuredTime: "Full day trip",
            featuredDistance: "15 min from here",
            mangroveTitle: "Mangrove Forest Tours",
            mangroveDesc: "Kayak through magical tunnels of mangroves. Keep your eyes open for monkeys and exotic birds!",
            mudTitle: "Mud Volcano",
            mudDesc: "Float in therapeutic volcanic mud - it's weird, wonderful, and your skin will thank you.",
            beachTitle: "Rincón del Mar",
            beachDesc: "The most beautiful beach in the region. Crystal-clear water and fresh seafood restaurants.",
            fishingTitle: "Fishing with Locals",
            fishingDesc: "Join local fishermen at dawn. Whatever you catch, we'll cook it for your dinner!",
            birdTitle: "Bird Watching",
            birdDesc: "La Caimanera sanctuary is home to flamingos, herons, and hundreds of exotic species.",
            marketTitle: "Local Village Markets",
            marketDesc: "Explore Cobeñas and Lorica. Fresh fruit, handmade crafts, and the friendliest people.",
            noteTitle: "We'll help you plan everything",
            noteDesc: "Just tell us what sounds fun and we'll arrange tours, transportation, and local guides. We know all the best spots (and the ones to skip)."
        },

        // Booking Section
        booking: {
            tag: "Reserve Your Room",
            title: 'Ready to <em>escape?</em>',
            subtitle: "Fill out the form and we'll confirm your reservation. Questions? We're always happy to help plan your perfect stay.",
            highlight1: "Free cancellation up to 48 hours",
            highlight2: "Breakfast included every morning",
            highlight3: "No hidden fees or surprises",
            highlight4: "Secure online payment",
            phonePrompt: "Prefer to book by phone?",
            yourInfo: "Your Information",
            firstName: "First Name",
            lastName: "Last Name",
            email: "Email",
            phone: "Phone",
            stayDetails: "Stay Details",
            checkInLabel: "Check-in",
            checkOutLabel: "Check-out",
            roomLabel: "Room",
            selectRoom: "Select a room...",
            room1Option: "Family Room (Up to 4) - $140/night",
            room2Option: "Large Family Room (Up to 7) - $150/night",
            guestsLabel: "Guests",
            specialRequests: "Special Requests",
            specialPlaceholder: "Dietary needs, arrival time, special occasions...",
            summaryTitle: "Booking Summary",
            summaryPlaceholder: "Select your dates and room to see pricing",
            completeReservation: "Complete Reservation"
        },

        // Contact Section
        contact: {
            tag: "Get in Touch",
            title: 'We\'d love to <em>hear from you</em>',
            subtitle: "Questions about your stay? Planning a special trip? We're here to help make it perfect.",
            callUs: "Call Us",
            callHint: "We speak English & Spanish",
            emailUs: "Email Us",
            emailHint: "We reply within 24 hours",
            visitUs: "Visit Us",
            visitHint: "3 hours from Cartagena",
            hours: "Reception Hours",
            hoursValue: "7:00 AM - 10:00 PM",
            hoursHint: "24/7 for emergencies"
        },

        // Footer
        footer: {
            tagline: "A cozy family-run bed & breakfast on Colombia's Caribbean coast. Where strangers become friends, and friends become family.",
            stayWithUs: "Stay With Us",
            ourRooms: "Our Rooms",
            amenitiesLink: "Amenities",
            bookNow: "Book Now",
            contactLink: "Contact",
            exploreTitle: "Explore",
            localAttractions: "Local Attractions",
            ourStory: "Our Story",
            gettingHere: "Getting Here",
            faq: "FAQ",
            policies: "Policies",
            cancellation: "Cancellation",
            privacy: "Privacy Policy",
            terms: "Terms of Service",
            copyright: "Crazy Coconuts. Made with",
            inLocation: "in San Antero, Colombia."
        },

        // Payment Modal
        payment: {
            title: "Complete Your Booking",
            cardLabel: "Credit or Debit Card",
            totalAmount: "Total Amount:",
            payNow: "Pay Now",
            successTitle: "Payment Successful!",
            successMessage: "Your booking has been confirmed. You'll receive a confirmation email shortly.",
            confirmationNumber: "Confirmation Number:"
        }
    },

    es: {
        // Navigation
        nav: {
            home: "Inicio",
            ourStory: "Nuestra Historia",
            rooms: "Habitaciones",
            amenities: "Servicios",
            explore: "Explorar",
            contact: "Contacto",
            bookYourStay: "Reservar"
        },

        // Hero Section
        hero: {
            location: "San Antero, Colombia",
            title: 'Donde el <em>Caribe</em> se siente como <em>hogar</em>',
            subtitle: "Un acogedor bed & breakfast familiar en la costa virgen de Colombia. Comida casera, hamacas bajo las palmeras y la hospitalidad que convierte a los extraños en familia.",
            reserveRoom: "Reserva Tu Habitación",
            seeRooms: "Ver Habitaciones",
            yearsHospitality: "Años de Hospitalidad",
            familyRooms: "Habitaciones Familiares",
            homemadeBreakfast: "Desayuno Casero",
            guestFavorite: "Favorito de Huéspedes",
            guestQuote: '"Como quedarse en familia"',
            scrollToExplore: "Desplázate para explorar"
        },

        // Quick Booking
        quickBooking: {
            checkAvailability: "Verificar Disponibilidad",
            findDates: "Encuentra tus fechas perfectas",
            checkIn: "Llegada",
            checkOut: "Salida",
            guests: "Huéspedes",
            guest: "Huésped",
            guestsPlural: "Huéspedes"
        },

        // About Section
        about: {
            tag: "Nuestra Historia",
            title: 'Más que un lugar para quedarse&mdash;<br><em>un lugar para pertenecer</em>',
            familyBadge: "Familiar Desde 2009",
            lead: "Bienvenido a nuestra familia. Ubicado en el pueblo costero de San Antero, Córdoba, Crazy Coconuts es más que un destino—es un hogar donde cada huésped se convierte en familia.",
            p1: "Nuestro espacioso y impecablemente limpio bed & breakfast ofrece el santuario perfecto para quienes buscan relajación auténtica. Aquí, donde las playas tranquilas se encuentran con el campo virgen, disfrutarás de comidas caseras preparadas con amor mientras te rodea un ambiente seguro y sereno donde el tiempo se detiene.",
            p2: "Creemos en las cosas simples: café fresco por la mañana en la terraza, siestas en hamacas y noches llenas de buenas conversaciones y mejor comida.",
            feature1Title: "Comida Casera",
            feature1Text: "Desayuno tradicional colombiano incluido diariamente",
            feature2Title: "Ambiente Tranquilo",
            feature2Text: "Escapa de las multitudes en playas tranquilas y prístinas",
            feature3Title: "Toque Personal",
            feature3Text: "Te ayudamos a planear tours, comidas y experiencias locales"
        },

        // Rooms Section
        rooms: {
            tag: "Alojamiento",
            title: 'Habitaciones cómodas para <em>familias y amigos</em>',
            subtitle: "Espaciosas, limpias y diseñadas pensando en tu comodidad. Cada habitación incluye desayuno, aire acondicionado y todo lo que necesitas para una estadía relajante.",
            upTo: "Hasta",
            guestsLabel: "huéspedes",
            room1Name: "Habitación Familiar (Hasta 4 Huéspedes)",
            room1Desc: "Perfecta para familias y grupos pequeños. Camas cómodas, baño privado y todas las comodidades que necesitas.",
            room2Name: "Habitación Familiar Grande (Hasta 7 Huéspedes)",
            room2Desc: "Nuestra habitación más espaciosa, ideal para familias grandes y reuniones grupales. Mucho espacio para relajarse.",
            mostPopular: "Más Popular",
            freeWifi: "WiFi Gratis",
            ac: "A/C",
            privateBath: "Baño Privado",
            tv: "TV",
            miniFridge: "Mini Nevera",
            breakfast: "Desayuno",
            from: "Desde",
            perNight: "/noche",
            bookThisRoom: "Reservar Esta Habitación",
            note: "Todas las habitaciones incluyen desayuno casero diario, sábanas frescas y acceso 24 horas. ¿Necesitas algo especial? Solo pregunta—¡estamos para ayudarte!"
        },

        // Amenities Section
        amenities: {
            tag: "Qué Incluye",
            title: 'Todos los detalles que hacen que se sienta <em>como en casa</em>',
            subtitle: "Sin lujos innecesarios, solo comodidades genuinas. Todo lo que necesitas para una estadía perfecta.",
            breakfastTitle: "Desayuno Casero",
            breakfastDesc: "Despierta con el aroma de arepas frescas, huevos y café colombiano. Hecho con amor, cada mañana.",
            drinksTitle: "Agua de Coco Fresca",
            drinksDesc: "Directo del árbol a tu vaso. Además de jugos tropicales y bebidas frías en cualquier momento.",
            wifiTitle: "WiFi Gratis",
            wifiDesc: "Mantente conectado (o no - no te juzgamos). Internet confiable en toda la propiedad.",
            poolTitle: "Piscina",
            poolDesc: "Date un chapuzón en nuestra refrescante piscina, rodeada de palmeras y flores tropicales.",
            parkingTitle: "Parqueadero Gratis",
            parkingDesc: "Parqueadero seguro y gratuito en la propiedad. Tu carro estará seguro con nosotros.",
            hammockTitle: "Paraíso de Hamacas",
            hammockDesc: "Encuentra tu lugar favorito entre nuestras hamacas sombreadas. Perfectas para siestas y buenos libros."
        },

        // Attractions Section
        attractions: {
            tag: "Explora el Área",
            title: 'Tu aventura comienza <em>justo afuera de nuestra puerta</em>',
            subtitle: "San Antero está lleno de tesoros escondidos. Compartiremos nuestros lugares favoritos y te ayudaremos a llegar.",
            featuredBadge: "Más Popular",
            featuredTitle: "Tours a las Islas",
            featuredDesc: "Súbete a un bote local y explora islas prístinas, playas secretas y las famosas aguas bioluminiscentes. Te empacamos una nevera con bebidas y snacks.",
            featuredTime: "Día completo",
            featuredDistance: "15 min de aquí",
            mangroveTitle: "Tours por Manglares",
            mangroveDesc: "Navega en kayak por túneles mágicos de manglares. ¡Mantén los ojos abiertos para ver monos y aves exóticas!",
            mudTitle: "Volcán de Lodo",
            mudDesc: "Flota en lodo volcánico terapéutico - es raro, maravilloso, y tu piel te lo agradecerá.",
            beachTitle: "Rincón del Mar",
            beachDesc: "La playa más hermosa de la región. Agua cristalina y restaurantes de mariscos frescos.",
            fishingTitle: "Pesca con Locales",
            fishingDesc: "Únete a pescadores locales al amanecer. ¡Lo que pesques, lo cocinamos para tu cena!",
            birdTitle: "Avistamiento de Aves",
            birdDesc: "El santuario La Caimanera es hogar de flamencos, garzas y cientos de especies exóticas.",
            marketTitle: "Mercados Locales",
            marketDesc: "Explora Cobeñas y Lorica. Fruta fresca, artesanías y la gente más amable.",
            noteTitle: "Te ayudamos a planear todo",
            noteDesc: "Solo dinos qué suena divertido y organizamos tours, transporte y guías locales. Conocemos los mejores lugares (y los que debes evitar)."
        },

        // Booking Section
        booking: {
            tag: "Reserva Tu Habitación",
            title: '¿Listo para <em>escapar?</em>',
            subtitle: "Completa el formulario y confirmaremos tu reservación. ¿Preguntas? Siempre estamos felices de ayudarte a planear tu estadía perfecta.",
            highlight1: "Cancelación gratis hasta 48 horas antes",
            highlight2: "Desayuno incluido cada mañana",
            highlight3: "Sin cargos ocultos ni sorpresas",
            highlight4: "Pago seguro en línea",
            phonePrompt: "¿Prefieres reservar por teléfono?",
            yourInfo: "Tu Información",
            firstName: "Nombre",
            lastName: "Apellido",
            email: "Correo Electrónico",
            phone: "Teléfono",
            stayDetails: "Detalles de Estadía",
            checkInLabel: "Llegada",
            checkOutLabel: "Salida",
            roomLabel: "Habitación",
            selectRoom: "Selecciona una habitación...",
            room1Option: "Habitación Familiar (Hasta 4) - $140/noche",
            room2Option: "Habitación Familiar Grande (Hasta 7) - $150/noche",
            guestsLabel: "Huéspedes",
            specialRequests: "Solicitudes Especiales",
            specialPlaceholder: "Necesidades dietéticas, hora de llegada, ocasiones especiales...",
            summaryTitle: "Resumen de Reserva",
            summaryPlaceholder: "Selecciona tus fechas y habitación para ver el precio",
            completeReservation: "Completar Reservación"
        },

        // Contact Section
        contact: {
            tag: "Contáctanos",
            title: 'Nos encantaría <em>saber de ti</em>',
            subtitle: "¿Preguntas sobre tu estadía? ¿Planeando un viaje especial? Estamos aquí para hacerlo perfecto.",
            callUs: "Llámanos",
            callHint: "Hablamos inglés y español",
            emailUs: "Escríbenos",
            emailHint: "Respondemos en 24 horas",
            visitUs: "Visítanos",
            visitHint: "3 horas desde Cartagena",
            hours: "Horario de Recepción",
            hoursValue: "7:00 AM - 10:00 PM",
            hoursHint: "24/7 para emergencias"
        },

        // Footer
        footer: {
            tagline: "Un acogedor bed & breakfast familiar en la costa caribeña de Colombia. Donde los extraños se convierten en amigos, y los amigos en familia.",
            stayWithUs: "Quédate Con Nosotros",
            ourRooms: "Nuestras Habitaciones",
            amenitiesLink: "Servicios",
            bookNow: "Reservar",
            contactLink: "Contacto",
            exploreTitle: "Explorar",
            localAttractions: "Atracciones Locales",
            ourStory: "Nuestra Historia",
            gettingHere: "Cómo Llegar",
            faq: "Preguntas Frecuentes",
            policies: "Políticas",
            cancellation: "Cancelación",
            privacy: "Política de Privacidad",
            terms: "Términos de Servicio",
            copyright: "Crazy Coconuts. Hecho con",
            inLocation: "en San Antero, Colombia."
        },

        // Payment Modal
        payment: {
            title: "Completa Tu Reserva",
            cardLabel: "Tarjeta de Crédito o Débito",
            totalAmount: "Monto Total:",
            payNow: "Pagar Ahora",
            successTitle: "¡Pago Exitoso!",
            successMessage: "Tu reserva ha sido confirmada. Recibirás un correo de confirmación pronto.",
            confirmationNumber: "Número de Confirmación:"
        }
    }
};

// Export for use in browser
if (typeof window !== 'undefined') {
    window.translations = translations;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = translations;
}

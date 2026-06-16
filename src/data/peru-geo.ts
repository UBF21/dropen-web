export interface Department {
  code: string
  name: string
  lat: number
  lng: number
  radiusKm: number
}

// 25 departamentos del Perú — ordenados alfabéticamente
// lat/lng = centro aproximado del departamento
// radiusKm = radio suficiente para cubrir todo el departamento (usado en filter[circle] de Geoapify)
export const DEPARTMENTS: Department[] = [
  { code: 'AMA', name: 'Amazonas',       lat: -5.833,  lng: -78.167, radiusKm: 220 },
  { code: 'ANC', name: 'Áncash',         lat: -9.500,  lng: -77.530, radiusKm: 210 },
  { code: 'APU', name: 'Apurímac',       lat: -13.640, lng: -73.090, radiusKm: 160 },
  { code: 'ARE', name: 'Arequipa',       lat: -16.409, lng: -71.537, radiusKm: 320 },
  { code: 'AYA', name: 'Ayacucho',       lat: -13.163, lng: -74.224, radiusKm: 220 },
  { code: 'CAJ', name: 'Cajamarca',      lat: -7.162,  lng: -78.512, radiusKm: 210 },
  { code: 'CAL', name: 'Callao',         lat: -12.056, lng: -77.117, radiusKm:  35 },
  { code: 'CUS', name: 'Cusco',          lat: -13.532, lng: -71.967, radiusKm: 320 },
  { code: 'HUV', name: 'Huancavelica',   lat: -12.786, lng: -74.973, radiusKm: 170 },
  { code: 'HUC', name: 'Huánuco',        lat: -9.930,  lng: -76.240, radiusKm: 220 },
  { code: 'ICA', name: 'Ica',            lat: -14.067, lng: -75.728, radiusKm: 210 },
  { code: 'JUN', name: 'Junín',          lat: -11.993, lng: -75.223, radiusKm: 220 },
  { code: 'LAL', name: 'La Libertad',    lat: -8.112,  lng: -79.028, radiusKm: 260 },
  { code: 'LAM', name: 'Lambayeque',     lat: -6.770,  lng: -79.840, radiusKm: 160 },
  { code: 'LIM', name: 'Lima',           lat: -12.046, lng: -77.043, radiusKm: 210 },
  { code: 'LOR', name: 'Loreto',         lat: -5.394,  lng: -75.980, radiusKm: 560 },
  { code: 'MDD', name: 'Madre de Dios',  lat: -12.594, lng: -69.190, radiusKm: 370 },
  { code: 'MOQ', name: 'Moquegua',       lat: -17.194, lng: -70.935, radiusKm: 160 },
  { code: 'PAS', name: 'Pasco',          lat: -10.682, lng: -76.257, radiusKm: 160 },
  { code: 'PIU', name: 'Piura',          lat: -5.194,  lng: -80.629, radiusKm: 270 },
  { code: 'PUN', name: 'Puno',           lat: -15.840, lng: -70.022, radiusKm: 320 },
  { code: 'SAM', name: 'San Martín',     lat: -6.485,  lng: -76.361, radiusKm: 270 },
  { code: 'TAC', name: 'Tacna',          lat: -18.013, lng: -70.252, radiusKm: 160 },
  { code: 'TUM', name: 'Tumbes',         lat: -3.566,  lng: -80.451, radiusKm: 110 },
  { code: 'UCA', name: 'Ucayali',        lat: -8.379,  lng: -74.553, radiusKm: 370 },
]

// Distritos por departamento — carga local sin API.
// Lima incluye los 43 distritos metropolitanos + principales distritos de provincias.
export const DISTRICTS_BY_DEPT: Record<string, string[]> = {
  AMA: ['Bagua', 'Bagua Grande', 'Cajaruro', 'Chachapoyas', 'Condorcanqui', 'El Cenepa', 'Jamalca', 'Lamud', 'Leimebamba', 'Luya', 'Mendoza', 'Santa María de Nieva', 'Utcubamba'],
  ANC: ['Bolognesi', 'Caraz', 'Carhuaz', 'Casma', 'Chimbote', 'Corongo', 'Huaraz', 'Huari', 'Huarmey', 'Huaylas', 'Independencia', 'Nuevo Chimbote', 'Ocros', 'Pallasca', 'Pomabamba', 'Recuay', 'Santa', 'Sihuas', 'Yungay'],
  APU: ['Abancay', 'Andahuaylas', 'Antabamba', 'Aymaraes', 'Chalhuanca', 'Chincheros', 'Cotabambas', 'Grau', 'Talavera', 'Tambobamba'],
  ARE: ['Alto Selva Alegre', 'Arequipa', 'Camaná', 'Caravelí', 'Cayma', 'Cerro Colorado', 'Characato', 'Chivay', 'Hunter', 'Jacobo Hunter', 'José Luis Bustamante y Rivero', 'La Joya', 'Mariano Melgar', 'Miraflores', 'Mollebaya', 'Mollendo', 'Paucarpata', 'Polobaya', 'Quequeña', 'Sabandía', 'Sachaca', 'Socabaya', 'Tiabaya', 'Uchumayo', 'Yanahuara', 'Yarabamba', 'Yura'],
  AYA: ['Ayacucho', 'Cangallo', 'Carmen Alto', 'Huamanga', 'Huanta', 'Jesús Nazareno', 'Lucanas', 'Puquio', 'San Juan Bautista', 'San Miguel', 'Vilcas Huamán'],
  CAJ: ['Bambamarca', 'Baños del Inca', 'Cajabamba', 'Cajamarca', 'Celendín', 'Chota', 'Contumazá', 'Cutervo', 'Hualgayoc', 'Jaén', 'San Ignacio', 'San Marcos', 'San Miguel', 'San Pablo', 'Santa Cruz'],
  CAL: ['Bellavista', 'Callao', 'Carmen de la Legua Reynoso', 'La Perla', 'La Punta', 'Mi Perú', 'Ventanilla'],
  CUS: ['Anta', 'Acomayo', 'Calca', 'Canas', 'Chumbivilcas', 'Cusco', 'Espinar', 'La Convención', 'Machu Picchu', 'Ollantaytambo', 'Paruro', 'Paucartambo', 'Pisac', 'Poroy', 'Quillabamba', 'Quispicanchi', 'San Jerónimo', 'San Sebastián', 'Santiago', 'Saylla', 'Sicuani', 'Santo Tomás', 'Urubamba', 'Wanchaq'],
  HUV: ['Acobamba', 'Angaraes', 'Castrovirreyna', 'Churcampa', 'Huancavelica', 'Huaytará', 'Lircay', 'Pampas', 'Tayacaja'],
  HUC: ['Amarilis', 'Ambo', 'Dos de Mayo', 'Huacaybamba', 'Huamalíes', 'Huánuco', 'La Unión', 'Leoncio Prado', 'Llata', 'Marañón', 'Pachitea', 'Panao', 'Pillcomarca', 'Puerto Inca', 'Tingo María', 'Yarowilca'],
  ICA: ['Chincha Alta', 'Chincha Baja', 'El Carmen', 'Grocio Prado', 'Ica', 'Los Aquijes', 'Mala', 'Nasca', 'Pisco', 'Paracas', 'Palpa', 'Parcona', 'San Juan Bautista', 'Subtanjalla'],
  JUN: ['Chanchamayo', 'Chilca', 'Chupaca', 'Concepción', 'El Tambo', 'Huancayo', 'Jauja', 'Junín', 'La Merced', 'La Oroya', 'Morococha', 'San Jerónimo de Tunan', 'San Ramón', 'Satipo', 'Tarma', 'Yauli'],
  LAL: ['Ascope', 'Chepén', 'El Porvenir', 'Florencia de Mora', 'Huanchaco', 'Huamachuco', 'Julcán', 'La Esperanza', 'Laredo', 'Moche', 'Otuzco', 'Pacasmayo', 'Pataz', 'Salaverry', 'San Pedro de Lloc', 'Sánchez Carrión', 'Santiago de Chuco', 'Trujillo', 'Víctor Larco Herrera', 'Virú'],
  LAM: ['Chiclayo', 'Eten', 'Ferreñafe', 'José Leonardo Ortiz', 'La Victoria', 'Lambayeque', 'Monsefú', 'Mórrope', 'Motupe', 'Pimentel', 'Puerto Eten', 'Reque', 'Santa Rosa', 'Tumán'],
  LIM: [
    // 43 distritos de Lima Metropolitana
    'Ate', 'Barranco', 'Breña', 'Carabayllo', 'Chaclacayo', 'Chorrillos', 'Cieneguilla',
    'Comas', 'El Agustino', 'Independencia', 'Jesús María', 'La Molina', 'La Victoria', 'Lima',
    'Lince', 'Los Olivos', 'Lurigancho', 'Lurín', 'Magdalena del Mar', 'Magdalena Vieja',
    'Miraflores', 'Pachacámac', 'Pucusana', 'Pueblo Libre', 'Puente Piedra', 'Punta Hermosa',
    'Punta Negra', 'Rímac', 'San Bartolo', 'San Borja', 'San Isidro', 'San Juan de Lurigancho',
    'San Juan de Miraflores', 'San Luis', 'San Martín de Porres', 'San Miguel', 'Santa Anita',
    'Santa María del Mar', 'Santa Rosa', 'Santiago de Surco', 'Surquillo',
    'Villa El Salvador', 'Villa María del Triunfo',
    // Lima Provincias (principales)
    'Barranca', 'Cajatambo', 'Canta', 'Chilca', 'Huacho', 'Huaral', 'Huarochirí',
    'Imperial', 'Lunahuaná', 'Mala', 'Matucana', 'Oyón', 'San Mateo', 'San Vicente de Cañete',
    'Sayán', 'Supe', 'Yauyos',
  ],
  LOR: ['Belén', 'Caballococha', 'Contamana', 'Fernando Lores', 'Indiana', 'Iquitos', 'Las Amazonas', 'Mazán', 'Nauta', 'Punchana', 'Requena', 'San Juan Bautista', 'Yurimaguas'],
  MDD: ['Fitzcarrald', 'Iberia', 'Inambari', 'Iñapari', 'Laberinto', 'Manu', 'Puerto Maldonado', 'Tambopata'],
  MOQ: ['El Algarrobal', 'Ichuña', 'Ilo', 'Moquegua', 'Omate', 'Pacocha', 'Samegua', 'Torata', 'Ubinas'],
  PAS: ['Aguaytía', 'Cerro de Pasco', 'Daniel Alcides Carrión', 'Oxapampa', 'Pasco', 'Pozuzo', 'Simón Bolívar', 'Tinyahuarco', 'Villa Rica', 'Yanacancha', 'Yanahuanca'],
  PIU: ['Amotape', 'Ayabaca', 'Bellavista', 'Castilla', 'Catacaos', 'Chulucanas', 'Cura Mori', 'Huancabamba', 'La Arena', 'La Unión', 'Las Lomas', 'Los Órganos', 'Máncora', 'Marcavelica', 'Miguel Checa', 'Morropón', 'Paita', 'Piura', 'Querecotillo', 'Salitral', 'Sechura', 'Sullana', 'Talara', 'Tambogrande', 'Veintiséis de Octubre'],
  PUN: ['Azángaro', 'Desaguadero', 'Huancané', 'Ilave', 'Juli', 'Juliaca', 'Lampa', 'Macusani', 'Melgar', 'Moho', 'Ayaviri', 'Pomata', 'Puno', 'San Román', 'Yunguyo', 'Zepita'],
  SAM: ['Banda de Shilcayo', 'Bellavista', 'El Dorado', 'Juanjuí', 'Lamas', 'Morales', 'Moyobamba', 'Nueva Cajamarca', 'Picota', 'Rioja', 'San José de Sisa', 'Tarapoto', 'Tocache', 'Uchiza'],
  TAC: ['Alto de la Alianza', 'Candarave', 'Ciudad Nueva', 'Coronel Gregorio Albarracín', 'Gregorio Albarracín Lanchipa', 'Ilabaya', 'Inclán', 'Ite', 'Jorge Basadre', 'Locumba', 'Pocollay', 'Sama', 'Tacna', 'Tarata'],
  TUM: ['Aguas Verdes', 'Casitas', 'Contralmirante Villar', 'Corrales', 'La Cruz', 'Matapalo', 'Pampas de Hospital', 'Papayal', 'San Jacinto', 'San Juan de la Virgen', 'Tumbes', 'Zarumilla', 'Zorritos'],
  UCA: ['Aguaytía', 'Atalaya', 'Campo Verde', 'Iparía', 'Irazola', 'Manantay', 'Masisea', 'Nueva Requena', 'Padre Abad', 'Pucallpa', 'Raymondi', 'Sepahua', 'Tahuanía', 'Yarinacocha', 'Yurúa'],
}

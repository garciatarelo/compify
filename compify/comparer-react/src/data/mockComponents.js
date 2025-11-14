// Mock data for PC components
export const mockComponents = {
  cpu: {
    name: "Procesador (CPU)",
    icon: "cpu",
    compatibleWith: { motherboard: ['intel-1700', 'amd-am5'] },
    items: [
      {
        id: 'c1',
        name: "Intel Core i5-13600K",
        specs: "14 Núcleos, 20 Hilos, 5.1GHz Turbo",
        socket: 'intel-1700',
        tdp: 125,
        stores: [
          { name: "Amazon", price: 320, url: "#", logo: "🛒", shipping: "Gratis" },
          { name: "Newegg", price: 315, url: "#", logo: "🖥️", shipping: "$10" },
          { name: "Best Buy", price: 329, url: "#", logo: "🏪", shipping: "Gratis" }
        ],
        priceHistory: [
          { date: "2025-09-15", price: 349 },
          { date: "2025-10-01", price: 335 },
          { date: "2025-10-15", price: 325 },
          { date: "2025-10-29", price: 320 },
          { date: "2025-11-05", price: 315 }
        ]
      },
      {
        id: 'c2',
        name: "AMD Ryzen 7 7800X3D",
        specs: "8 Núcleos, 16 Hilos, 5.0GHz, 3D V-Cache",
        socket: 'amd-am5',
        tdp: 120,
        stores: [
          { name: "Amazon", price: 449, url: "#", logo: "🛒", shipping: "Gratis" },
          { name: "Newegg", price: 439, url: "#", logo: "🖥️", shipping: "Gratis" },
          { name: "Micro Center", price: 429, url: "#", logo: "💻", shipping: "$15" }
        ],
        priceHistory: [
          { date: "2025-09-15", price: 499 },
          { date: "2025-10-01", price: 479 },
          { date: "2025-10-15", price: 459 },
          { date: "2025-10-29", price: 439 },
          { date: "2025-11-05", price: 429 }
        ]
      },
      {
        id: 'c3',
        name: "Intel Core i9-13900K",
        specs: "24 Núcleos, 32 Hilos, 5.8GHz Turbo",
        socket: 'intel-1700',
        tdp: 253,
        stores: [
          { name: "Amazon", price: 599, url: "#", logo: "🛒", shipping: "Gratis" },
          { name: "Best Buy", price: 589, url: "#", logo: "🏪", shipping: "Gratis" },
          { name: "Newegg", price: 579, url: "#", logo: "🖥️", shipping: "$10" }
        ],
        priceHistory: [
          { date: "2025-09-15", price: 649 },
          { date: "2025-10-01", price: 629 },
          { date: "2025-10-15", price: 609 },
          { date: "2025-10-29", price: 589 },
          { date: "2025-11-05", price: 579 }
        ]
      }
    ]
  },
  motherboard: {
    name: "Placa Base",
    icon: "circuit-board",
    compatibleWith: { cpu: ['intel-1700', 'amd-am5'], ram: ['ddr5'] },
    items: [
      {
        id: 'm1',
        name: "MSI B760 TOMAHAWK",
        specs: "LGA 1700, DDR5, Wi-Fi 6E, PCIe 5.0",
        socket: 'intel-1700',
        ramType: 'ddr5',
        maxRam: 128,
        stores: [
          { name: "Amazon", price: 199, url: "#", logo: "🛒", shipping: "Gratis" },
          { name: "Newegg", price: 194, url: "#", logo: "🖥️", shipping: "$8" },
          { name: "Best Buy", price: 209, url: "#", logo: "🏪", shipping: "Gratis" }
        ],
        priceHistory: [
          { date: "2025-09-15", price: 219 },
          { date: "2025-10-01", price: 209 },
          { date: "2025-10-15", price: 204 },
          { date: "2025-10-29", price: 199 },
          { date: "2025-11-05", price: 194 }
        ]
      },
      {
        id: 'm2',
        name: "Gigabyte B650 AORUS ELITE",
        specs: "AM5, DDR5, Wi-Fi 6E, PCIe 4.0",
        socket: 'amd-am5',
        ramType: 'ddr5',
        maxRam: 128,
        stores: [
          { name: "Amazon", price: 219, url: "#", logo: "🛒", shipping: "Gratis" },
          { name: "Newegg", price: 209, url: "#", logo: "🖥️", shipping: "Gratis" },
          { name: "Micro Center", price: 199, url: "#", logo: "💻", shipping: "$12" }
        ],
        priceHistory: [
          { date: "2025-09-15", price: 239 },
          { date: "2025-10-01", price: 229 },
          { date: "2025-10-15", price: 219 },
          { date: "2025-10-29", price: 209 },
          { date: "2025-11-05", price: 199 }
        ]
      }
    ]
  },
  ram: {
    name: "Memoria RAM",
    icon: "memory-stick",
    compatibleWith: { motherboard: ['ddr5'] },
    items: [
      {
        id: 'r1',
        name: "16GB (2x8GB) DDR5 5200",
        specs: "Corsair Vengeance, CL40",
        type: 'ddr5',
        capacity: 16,
        stores: [
          { name: "Amazon", price: 89, url: "#", logo: "🛒", shipping: "Gratis" },
          { name: "Newegg", price: 85, url: "#", logo: "🖥️", shipping: "$5" },
          { name: "Best Buy", price: 94, url: "#", logo: "🏪", shipping: "Gratis" }
        ],
        priceHistory: [
          { date: "2025-09-15", price: 109 },
          { date: "2025-10-01", price: 99 },
          { date: "2025-10-15", price: 94 },
          { date: "2025-10-29", price: 89 },
          { date: "2025-11-05", price: 85 }
        ]
      },
      {
        id: 'r2',
        name: "32GB (2x16GB) DDR5 6000",
        specs: "G.Skill Trident Z5, CL36",
        type: 'ddr5',
        capacity: 32,
        stores: [
          { name: "Amazon", price: 149, url: "#", logo: "🛒", shipping: "Gratis" },
          { name: "Newegg", price: 144, url: "#", logo: "🖥️", shipping: "Gratis" },
          { name: "Micro Center", price: 139, url: "#", logo: "💻", shipping: "$10" }
        ],
        priceHistory: [
          { date: "2025-09-15", price: 179 },
          { date: "2025-10-01", price: 164 },
          { date: "2025-10-15", price: 154 },
          { date: "2025-10-29", price: 144 },
          { date: "2025-11-05", price: 139 }
        ]
      }
    ]
  },
  gpu: {
    name: "Tarjeta Gráfica",
    icon: "box",
    compatibleWith: {},
    powerRequired: true,
    items: [
      {
        id: 'g1',
        name: "NVIDIA RTX 4070",
        specs: "12GB GDDR6X, DLSS 3, Ray Tracing",
        tdp: 200,
        stores: [
          { name: "Amazon", price: 599, url: "#", logo: "🛒", shipping: "Gratis" },
          { name: "Best Buy", price: 589, url: "#", logo: "🏪", shipping: "Gratis" },
          { name: "Newegg", price: 579, url: "#", logo: "🖥️", shipping: "$15" }
        ],
        priceHistory: [
          { date: "2025-09-15", price: 649 },
          { date: "2025-10-01", price: 629 },
          { date: "2025-10-15", price: 609 },
          { date: "2025-10-29", price: 589 },
          { date: "2025-11-05", price: 579 }
        ]
      },
      {
        id: 'g2',
        name: "AMD Radeon RX 7900 XT",
        specs: "20GB GDDR6, FSR 3, Ray Tracing",
        tdp: 315,
        stores: [
          { name: "Amazon", price: 749, url: "#", logo: "🛒", shipping: "Gratis" },
          { name: "Newegg", price: 739, url: "#", logo: "🖥️", shipping: "Gratis" },
          { name: "Micro Center", price: 729, url: "#", logo: "💻", shipping: "$20" }
        ],
        priceHistory: [
          { date: "2025-09-15", price: 849 },
          { date: "2025-10-01", price: 799 },
          { date: "2025-10-15", price: 769 },
          { date: "2025-10-29", price: 739 },
          { date: "2025-11-05", price: 729 }
        ]
      }
    ]
  },
  storage: {
    name: "Almacenamiento SSD",
    icon: "hard-drive",
    compatibleWith: {},
    items: [
      {
        id: 's1',
        name: "Samsung 980 Pro 1TB",
        specs: "NVMe Gen4, 7000MB/s Lectura",
        capacity: 1000,
        stores: [
          { name: "Amazon", price: 99, url: "#", logo: "🛒", shipping: "Gratis" },
          { name: "Best Buy", price: 94, url: "#", logo: "🏪", shipping: "Gratis" },
          { name: "Newegg", price: 89, url: "#", logo: "🖥️", shipping: "$5" }
        ],
        priceHistory: [
          { date: "2025-09-15", price: 129 },
          { date: "2025-10-01", price: 119 },
          { date: "2025-10-15", price: 109 },
          { date: "2025-10-29", price: 99 },
          { date: "2025-11-05", price: 89 }
        ]
      },
      {
        id: 's2',
        name: "WD Black SN850X 2TB",
        specs: "NVMe Gen4, 7300MB/s Lectura",
        capacity: 2000,
        stores: [
          { name: "Amazon", price: 159, url: "#", logo: "🛒", shipping: "Gratis" },
          { name: "Newegg", price: 154, url: "#", logo: "🖥️", shipping: "Gratis" },
          { name: "Micro Center", price: 149, url: "#", logo: "💻", shipping: "$8" }
        ],
        priceHistory: [
          { date: "2025-09-15", price: 199 },
          { date: "2025-10-01", price: 179 },
          { date: "2025-10-15", price: 169 },
          { date: "2025-10-29", price: 159 },
          { date: "2025-11-05", price: 149 }
        ]
      }
    ]
  },
  psu: {
    name: "Fuente de Poder",
    icon: "zap",
    compatibleWith: {},
    items: [
      {
        id: 'p1',
        name: "Corsair RM750e",
        specs: "750W, 80+ Gold, Totalmente Modular",
        wattage: 750,
        stores: [
          { name: "Amazon", price: 99, url: "#", logo: "🛒", shipping: "Gratis" },
          { name: "Best Buy", price: 104, url: "#", logo: "🏪", shipping: "Gratis" },
          { name: "Newegg", price: 94, url: "#", logo: "🖥️", shipping: "$7" }
        ],
        priceHistory: [
          { date: "2025-09-15", price: 119 },
          { date: "2025-10-01", price: 109 },
          { date: "2025-10-15", price: 104 },
          { date: "2025-10-29", price: 99 },
          { date: "2025-11-05", price: 94 }
        ]
      },
      {
        id: 'p2',
        name: "SeaSonic FOCUS GX-850",
        specs: "850W, 80+ Gold, Totalmente Modular",
        wattage: 850,
        stores: [
          { name: "Amazon", price: 139, url: "#", logo: "🛒", shipping: "Gratis" },
          { name: "Newegg", price: 134, url: "#", logo: "🖥️", shipping: "Gratis" },
          { name: "Micro Center", price: 129, url: "#", logo: "💻", shipping: "$10" }
        ],
        priceHistory: [
          { date: "2025-09-15", price: 169 },
          { date: "2025-10-01", price: 154 },
          { date: "2025-10-15", price: 144 },
          { date: "2025-10-29", price: 134 },
          { date: "2025-11-05", price: 129 }
        ]
      }
    ]
  },
  case: {
    name: "Gabinete",
    icon: "package",
    compatibleWith: {},
    items: [
      {
        id: 'k1',
        name: "Lian Li Lancool 216",
        specs: "Mid-Tower, Excelente Flujo de Aire",
        formFactor: 'mid-tower',
        stores: [
          { name: "Amazon", price: 99, url: "#", logo: "🛒", shipping: "Gratis" },
          { name: "Newegg", price: 94, url: "#", logo: "🖥️", shipping: "$12" },
          { name: "Best Buy", price: 104, url: "#", logo: "🏪", shipping: "Gratis" }
        ],
        priceHistory: [
          { date: "2025-09-15", price: 119 },
          { date: "2025-10-01", price: 109 },
          { date: "2025-10-15", price: 104 },
          { date: "2025-10-29", price: 99 },
          { date: "2025-11-05", price: 94 }
        ]
      },
      {
        id: 'k2',
        name: "NZXT H5 Flow",
        specs: "Mid-Tower, Compacto, Alto Flujo de Aire",
        formFactor: 'mid-tower',
        stores: [
          { name: "Amazon", price: 89, url: "#", logo: "🛒", shipping: "Gratis" },
          { name: "Best Buy", price: 94, url: "#", logo: "🏪", shipping: "Gratis" },
          { name: "Newegg", price: 84, url: "#", logo: "🖥️", shipping: "$8" }
        ],
        priceHistory: [
          { date: "2025-09-15", price: 109 },
          { date: "2025-10-01", price: 99 },
          { date: "2025-10-15", price: 94 },
          { date: "2025-10-29", price: 89 },
          { date: "2025-11-05", price: 84 }
        ]
      }
    ]
  }
};

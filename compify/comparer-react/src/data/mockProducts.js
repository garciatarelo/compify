// Mock data for laptop products
export const mockProducts = [
  { 
    id: 1, 
    name: "TechCo Pro 15", 
    brand: "TechCo", 
    processor: "Core i7-13700H", 
    ram: 16, 
    graphics: "RTX 4060",
    imageUrl: "https://placehold.co/400x300/6366f1/white?text=TechCo+Pro+15",
    stores: [
      { name: "Amazon", price: 1499, url: "https://amazon.com/techco-pro-15", logo: "🛒", shipping: "Gratis" },
      { name: "Best Buy", price: 1549, url: "https://bestbuy.com/techco-pro-15", logo: "🏪", shipping: "Gratis" },
      { name: "Newegg", price: 1475, url: "https://newegg.com/techco-pro-15", logo: "🖥️", shipping: "$15" },
      { name: "B&H Photo", price: 1520, url: "https://bhphotovideo.com/techco-pro-15", logo: "📷", shipping: "Gratis" }
    ],
    priceHistory: [
      { date: "2025-10-01", price: 1599 },
      { date: "2025-10-08", price: 1550 },
      { date: "2025-10-15", price: 1520 },
      { date: "2025-10-22", price: 1499 },
      { date: "2025-10-29", price: 1475 },
      { date: "2025-11-05", price: 1475 }
    ]
  },
  { 
    id: 2, 
    name: "NovaBook Air", 
    brand: "Nova", 
    processor: "Core i5-1240P", 
    ram: 8, 
    graphics: "Integrada",
    imageUrl: "https://placehold.co/400x300/ec4899/white?text=NovaBook+Air",
    stores: [
      { name: "Amazon", price: 999, url: "https://amazon.com/novabook-air", logo: "🛒", shipping: "Gratis" },
      { name: "Walmart", price: 1029, url: "https://walmart.com/novabook-air", logo: "🏬", shipping: "Gratis" },
      { name: "Best Buy", price: 1049, url: "https://bestbuy.com/novabook-air", logo: "🏪", shipping: "Gratis" }
    ],
    priceHistory: [
      { date: "2025-10-01", price: 1099 },
      { date: "2025-10-08", price: 1099 },
      { date: "2025-10-15", price: 1050 },
      { date: "2025-10-22", price: 1029 },
      { date: "2025-10-29", price: 1010 },
      { date: "2025-11-05", price: 999 }
    ]
  },
  { 
    id: 3, 
    name: "Quantum X Elite", 
    brand: "Quantum", 
    processor: "Core i9-13900HX", 
    ram: 32, 
    graphics: "RTX 4070",
    imageUrl: "https://placehold.co/400x300/22c55e/white?text=Quantum+X",
    stores: [
      { name: "Amazon", price: 1899, url: "https://amazon.com/quantum-x", logo: "🛒", shipping: "Gratis" },
      { name: "Newegg", price: 1849, url: "https://newegg.com/quantum-x", logo: "🖥️", shipping: "Gratis" },
      { name: "Best Buy", price: 1949, url: "https://bestbuy.com/quantum-x", logo: "🏪", shipping: "Gratis" },
      { name: "Micro Center", price: 1825, url: "https://microcenter.com/quantum-x", logo: "💻", shipping: "$20" }
    ],
    priceHistory: [
      { date: "2025-10-01", price: 2099 },
      { date: "2025-10-08", price: 2050 },
      { date: "2025-10-15", price: 1950 },
      { date: "2025-10-22", price: 1899 },
      { date: "2025-10-29", price: 1849 },
      { date: "2025-11-05", price: 1825 }
    ]
  },
  { 
    id: 4, 
    name: "Aero Ultralight", 
    brand: "Aero", 
    processor: "Ryzen 7 7840U", 
    ram: 16, 
    graphics: "Integrada",
    imageUrl: "https://placehold.co/400x300/f97316/white?text=Aero+Ultralight",
    stores: [
      { name: "Amazon", price: 1199, url: "https://amazon.com/aero-ultralight", logo: "🛒", shipping: "Gratis" },
      { name: "Best Buy", price: 1249, url: "https://bestbuy.com/aero-ultralight", logo: "🏪", shipping: "Gratis" },
      { name: "Target", price: 1279, url: "https://target.com/aero-ultralight", logo: "🎯", shipping: "$10" }
    ],
    priceHistory: [
      { date: "2025-10-01", price: 1299 },
      { date: "2025-10-08", price: 1280 },
      { date: "2025-10-15", price: 1250 },
      { date: "2025-10-22", price: 1220 },
      { date: "2025-10-29", price: 1199 },
      { date: "2025-11-05", price: 1199 }
    ]
  },
  { 
    id: 5, 
    name: "TechCo Gamer X", 
    brand: "TechCo", 
    processor: "Core i7-13700H", 
    ram: 16, 
    graphics: "RTX 4070",
    imageUrl: "https://placehold.co/400x300/6366f1/white?text=TechCo+Gamer",
    stores: [
      { name: "Amazon", price: 1699, url: "https://amazon.com/techco-gamer", logo: "🛒", shipping: "Gratis" },
      { name: "Newegg", price: 1649, url: "https://newegg.com/techco-gamer", logo: "🖥️", shipping: "Gratis" },
      { name: "Best Buy", price: 1749, url: "https://bestbuy.com/techco-gamer", logo: "🏪", shipping: "Gratis" }
    ],
    priceHistory: [
      { date: "2025-10-01", price: 1799 },
      { date: "2025-10-08", price: 1750 },
      { date: "2025-10-15", price: 1720 },
      { date: "2025-10-22", price: 1699 },
      { date: "2025-10-29", price: 1675 },
      { date: "2025-11-05", price: 1649 }
    ]
  },
  { 
    id: 6, 
    name: "NovaWorkstation Pro", 
    brand: "Nova", 
    processor: "Ryzen 7 7800X", 
    ram: 16, 
    graphics: "RTX 4050",
    imageUrl: "https://placehold.co/400x300/ec4899/white?text=NovaWorkstation",
    stores: [
      { name: "Amazon", price: 1399, url: "https://amazon.com/nova-workstation", logo: "🛒", shipping: "Gratis" },
      { name: "B&H Photo", price: 1449, url: "https://bhphotovideo.com/nova-workstation", logo: "📷", shipping: "Gratis" }
    ],
    priceHistory: [
      { date: "2025-10-01", price: 1499 },
      { date: "2025-10-08", price: 1475 },
      { date: "2025-10-15", price: 1450 },
      { date: "2025-10-22", price: 1425 },
      { date: "2025-10-29", price: 1399 },
      { date: "2025-11-05", price: 1399 }
    ]
  }
];

// Helper functions
export function getLowestPrice(product) {
  return Math.min(...product.stores.map(s => s.price));
}

export function getHighestPrice(product) {
  return Math.max(...product.stores.map(s => s.price));
}

import requests
from bs4 import BeautifulSoup
import re
import time
import random
import json
import urllib.parse

# URL del endpoint público para carga masiva de componentes
url_api = "http://127.0.0.1:8000/api/components/bulk"

headers_laravel = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
}

headers_scraping = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

queries = {
    'cpu': 'https://bajapc.com.mx/catalogo/subcategoria/componentes/procesadores-2',
    'motherboard': 'https://bajapc.com.mx/catalogo/subcategoria/componentes/tarjetas-madre',
    'ram': 'https://bajapc.com.mx/catalogo/subcategoria/componentes/memoria-ram',
    'gpu': 'https://bajapc.com.mx/catalogo/subcategoria/componentes/tarjetas-de-video',
    'storage': 'https://bajapc.com.mx/catalogo/subcategoria/componentes/unidades-ssd',
    'psu': 'https://bajapc.com.mx/catalogo/subcategoria/componentes/fuentes-de-alimentacion',
    'case': 'https://bajapc.com.mx/catalogo/subcategoria/componentes/gabinetes',
    'cooler': 'https://bajapc.com.mx/catalogo/subcategoria/componentes/enfriamiento'
}

def get_socket_from_title(title):
    t = title.upper()
    
    # INTEL GENERATION CHECK
    # Match i3/i5/i7/i9 followed by number (e.g. i5-12400, i7 14700K)
    intel_match = re.search(r'CORE\s*I\d[- ]+(\d{3,5})', t)
    if intel_match:
        model = int(intel_match.group(1))
        if 6000 <= model < 8000: return "LGA1151"
        if 8000 <= model < 10000: return "LGA1151-v2"
        if 10000 <= model < 12000: return "LGA1200"
        if 12000 <= model < 15000: return "LGA1700"
        
    # AMD RYZEN CHECK
    # Match Ryzen 3/5/7/9 followed by number (e.g. Ryzen 5 5600, Ryzen 7 7800X3D)
    amd_match = re.search(r'RYZEN\s*\d+\s*(\d{4})', t)
    if amd_match:
        model = int(amd_match.group(1))
        if 1000 <= model < 6000: return "AM4"
        if 7000 <= model < 10000: return "AM5"
        
    # THREADRIPPER
    if "THREADRIPPER" in t:
        tr_match = re.search(r'THREADRIPPER\s*(\d{4})', t)
        if tr_match:
            model = int(tr_match.group(1))
            if 1000 <= model < 3000: return "sTR4"
            if 3000 <= model < 6000: return "sTRX4"

    return None

def extract_specs(title, category):
    specs = {
        "brand": "Generico",
        "model": "Generico",
        "socket": None,
        "tdp": None,
        "memory_type": None,
        "capacity": None
    }
    
    title_lower = title.lower()
    
    # Extract Brand
    brands = ["intel", "amd", "nvidia", "asus", "gigabyte", "msi", "corsair", "kingston", "adata", "western digital", "seagate", "logitech", "razer", "evga", "thermaltake", "cooler master", "nzxt", "zotac", "pny", "samsung", "crucial", "teamgroup", "patriot", "g.skill", "asrock", "biostar", "ecs", "foxconn", "sapphire", "powercolor", "xfx", "inno3d", "palit", "gainward", "galax", "kfa2", "colorful", "manli", "leadtek", "visiontek", "diamond", "his", "club 3d", "matrox", "pny", "quadro", "tesla", "grid", "nvs", "titan", "geforce", "radeon", "arc", "ryzen", "core", "pentium", "celeron", "athlon", "sempron", "fx", "a-series", "e-series", "c-series", "z-series", "x-series", "threadripper", "epyc", "xeon", "atom", "itanium", "quark", "phi", "larrabee", "knights", "landing", "corner", "fermi", "kepler", "maxwell", "pascal", "volta", "turing", "ampere", "lovelace", "hopper", "blackwell", "cna", "rdna", "cdna", "gcn", "terascale", "rage", "mach", "wonder", "verite", "mystique", "millennium", "parhelia", "g200", "g400", "g450", "g550", "p650", "p690", "p750", "m9120", "m9125", "m9138", "m9140", "m9148", "m9188", "mura", "kyro", "delta", "chrome", "gamma", "s3", "virge", "savage", "volari", "xgi", "trident", "blade", "xp", "cyberblade", "imaginat"]
    
    for brand in brands:
        if brand in title_lower:
            specs["brand"] = brand.capitalize()
            break
            
    # Extract Capacity (RAM/Storage)
    cap_match = re.search(r'(\d+)\s*(GB|TB)', title, re.IGNORECASE)
    if cap_match:
        val = int(cap_match.group(1))
        unit = cap_match.group(2).upper()
        specs["capacity"] = val * 1024 if unit == 'TB' else val

    # Extract Memory Type (DDR4/DDR5)
    mem_match = re.search(r'(DDR\d)', title, re.IGNORECASE)
    if mem_match:
        specs["memory_type"] = mem_match.group(1).upper()

    # Extract Socket (LGA1700, AM5, etc)
    socket_match = re.search(r'(LGA\s*\d+|AM\d\+?|TR\d)', title, re.IGNORECASE)
    if socket_match:
        specs["socket"] = socket_match.group(1).upper().replace(" ", "")
    
    # Fallback: Infer socket from CPU model name if not found
    if category == 'cpu' and not specs["socket"]:
        specs["socket"] = get_socket_from_title(title)

    # Extract TDP
    tdp_match = re.search(r'(\d+)W', title, re.IGNORECASE)
    if tdp_match:
        specs["tdp"] = int(tdp_match.group(1))

    # Clean Model
    clean_title = title
    if specs["brand"] != "Generico":
        clean_title = re.sub(specs["brand"], "", clean_title, flags=re.IGNORECASE)
    
    specs["model"] = clean_title.strip()[:50]

    return specs

def fetch_query(cat_type, base_url):
    all_items = []
    # Scrape first 3 pages to ensure we get enough products
    for page in range(1, 4):
        url = f"{base_url}?pagina={page}"
        print(f"Scraping {cat_type} (Page {page}) from {url}...")
        
        try:
            # Add Referer and upgrade User-Agent to avoid 403
            headers = headers_scraping.copy()
            headers['Referer'] = 'https://bajapc.com.mx/'
            
            response = requests.get(url, headers=headers)
            if response.status_code != 200:
                print(f"Error {response.status_code} on page {page}")
                continue

            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Try finding items with the class 'card-item'
            items = soup.find_all('div', class_='card-item')
            
            if not items:
                print(f"No items found on page {page}.")
                continue

            batch = []
            for item in items:
                try:
                    # Title
                    title_elem = item.find('h3', class_='name').find('a')
                    if not title_elem: continue
                    title = title_elem.get_text(strip=True)

                    # Filter out "PC" (Full computers) and "LAPTOP"
                    if any(x in title.lower() for x in ['pc ', 'computadora', 'laptop', 'notebook', 'all in one', 'aio', 'mouse', 'teclado', 'headset', 'audifonos', 'monitor']):
                        # print(f"Skipping PC/Laptop/Peripheral: {title}")
                        continue

                    # Filter out Coolers from other categories (especially RAM)
                    # Only apply strict filtering to RAM, Storage, and Motherboard where "Cooler"/"Fan" is suspicious.
                    # For GPU, CPU, PSU, Case, words like "Fan" or "Cooler" are common (e.g. "Dual Fan", "Stock Cooler", "Cooler Master PSU").
                    if cat_type in ['ram', 'storage', 'motherboard'] and any(x in title.lower() for x in ['cooler', 'liquid', 'refrigeracion', 'enfriamiento', 'disipador', 'fan ']):
                        continue
                    
                    # Filter for Cooler category: Ensure it's actually a cooler
                    if cat_type == 'cooler':
                        valid_cooler_keywords = ['cooler', 'liquid', 'refrigeracion', 'enfriamiento', 'disipador', 'fan', 'ventilador', 'radiador', 'water']
                        if not any(x in title.lower() for x in valid_cooler_keywords):
                            continue
                        # Double check it's not a motherboard or case that slipped through
                        if any(x in title.lower() for x in ['tarjeta madre', 'motherboard', 'gabinete', 'case', 'audifonos', 'headset']):
                            continue

                    # Link
                    product_url = title_elem['href']
                    
                    # Image
                    img_elem = item.find('a', class_='anchor-image').find('img')
                    image_url = img_elem['src'] if img_elem else "https://via.placeholder.com/150"
                    
                    # Price
                    price_elem = item.find('div', class_='price-wrapper').find('span', class_='current')
                    if not price_elem: continue
                    price_text = price_elem.get_text(strip=True).replace('$', '').replace('MXN', '').replace(',', '').strip()
                    price = float(price_text)
                    
                    specs = extract_specs(title, cat_type)
                    
                    component_data = {
                        "type": cat_type,
                        "brand": specs["brand"],
                        "model": specs["model"],
                        "price": price,
                        "store_name": "BajaPC",
                        "product_url": product_url,
                        "image_url": image_url,
                        "description": title,
                        "specs": specs
                    }
                    
                    print(f"Found: {title[:30]}... - ${price}")
                    batch.append(component_data)
                    
                except Exception as e:
                    print(f"Error parsing item: {e}")
                    continue
            
            all_items.extend(batch)
            time.sleep(1) # Be nice to the server

        except Exception as e:
            print(f"Error scraping {cat_type} page {page}: {e}")
            continue

    return all_items

if __name__ == "__main__":
    all_components = []
    for cat_type, query in queries.items():
        components = fetch_query(cat_type, query)
        all_components.extend(components)
        time.sleep(2)
        
    if all_components:
        print(f"Sending {len(all_components)} components to API...")
        chunk_size = 50
        for i in range(0, len(all_components), chunk_size):
            chunk = all_components[i:i + chunk_size]
            try:
                response = requests.post(url_api, json={"components": chunk}, headers=headers_laravel)
                print(f"Batch {i//chunk_size + 1}: {response.status_code}")
                if response.status_code != 200:
                    print(response.text)
            except Exception as e:
                print(f"Error sending batch: {e}")
    else:
        print("No components found.")

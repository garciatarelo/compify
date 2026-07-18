import requests
from bs4 import BeautifulSoup
import re
import time
import random
import json

# URL del endpoint público para carga masiva de componentes
url_api = "http://192.168.0.24:3005/api/components/bulk"

headers_laravel = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
}

headers_scraping = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

categories = {
    'cpu': 'https://www.cyberpuerta.mx/Computo-Hardware/Componentes/Procesadores/Procesadores-para-PC/',
    'motherboard': 'https://www.cyberpuerta.mx/Computo-Hardware/Componentes/Tarjetas-Madre/',
    'ram': 'https://www.cyberpuerta.mx/Computo-Hardware/Memorias-RAM-y-Flash/Memorias-RAM-para-PC/',
    'gpu': 'https://www.cyberpuerta.mx/Computo-Hardware/Componentes/Tarjetas-de-Video/',
    'storage': 'https://www.cyberpuerta.mx/Computo-Hardware/Discos-Duros-SSD-NAS/SSD/',
    'psu': 'https://www.cyberpuerta.mx/Computo-Hardware/Componentes/Fuentes-de-Poder-para-PC-s/',
    'case': 'https://www.cyberpuerta.mx/Computo-Hardware/Componentes/Gabinetes/'
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
    
    # Extract Brand (Simple heuristic)
    brands = ["intel", "amd", "nvidia", "asus", "gigabyte", "msi", "corsair", "kingston", "adata", "western digital", "seagate", "logitech", "razer", "evga", "thermaltake", "cooler master", "nzxt", "zotac", "pny", "samsung", "crucial", "teamgroup", "patriot", "g.skill", "asrock", "biostar", "ecs", "foxconn", "sapphire", "powercolor", "xfx", "inno3d", "palit", "gainward", "galax", "kfa2", "colorful", "manli", "leadtek", "visiontek", "diamond", "his", "club 3d", "matrox", "pny", "quadro", "tesla", "grid", "nvs", "titan", "geforce", "radeon", "arc", "ryzen", "core", "pentium", "celeron", "athlon", "sempron", "fx", "a-series", "e-series", "c-series", "z-series", "x-series", "threadripper", "epyc", "xeon", "atom", "itanium", "quark", "phi", "larrabee", "knights", "landing", "corner", "fermi", "kepler", "maxwell", "pascal", "volta", "turing", "ampere", "lovelace", "hopper", "blackwell", "cna", "rdna", "cdna", "gcn", "terascale", "rage", "mach", "wonder", "verite", "mystique", "millennium", "parhelia", "g200", "g400", "g450", "g550", "p650", "p690", "p750", "m9120", "m9125", "m9138", "m9140", "m9148", "m9188", "mura", "kyro", "delta", "chrome", "gamma", "s3", "virge", "savage", "volari", "xgi", "trident", "blade", "xp", "cyberblade", "imaginat"]
    
    for brand in brands:
        if brand in title_lower:
            specs["brand"] = brand.capitalize()
            break
            
    # Extract Model (Very basic, usually needs regex based on brand)
    # For now, we use the title as description and try to find model numbers
    
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

    # Clean Model from Title
    # This is hard without specific rules per category, so we'll use a simplified approach
    # Remove brand and common words
    clean_title = title
    if specs["brand"] != "Generico":
        clean_title = re.sub(specs["brand"], "", clean_title, flags=re.IGNORECASE)
    
    specs["model"] = clean_title.strip()[:50] # Truncate for DB

    return specs

def fetch_category(cat_type, url):
    print(f"Scraping {cat_type} from {url}...")
    try:
        response = requests.get(url, headers=headers_scraping)
        if response.status_code != 200:
            print(f"Error {response.status_code}")
            return []

        soup = BeautifulSoup(response.text, 'html.parser')
        items = soup.find_all('div', class_='emproduct')
        
        batch = []
        for item in items:
            try:
                # Title
                title_elem = item.find('a', class_='emproduct_right_title')
                if not title_elem: continue
                title = title_elem.get_text(strip=True)
                product_url = title_elem['href']

                # Filter out "LAPTOP"
                if "LAPTOP" in title.upper():
                    print(f"Skipping Laptop: {title}")
                    continue
                
                # Price
                # Try multiple selectors for price
                price = 0
                price_elem = item.find('label', class_='price')
                if not price_elem:
                    price_elem = item.find(class_='price')
                
                if price_elem:
                    price_text = price_elem.get_text(strip=True).replace('$', '').replace(',', '')
                    # Handle ranges or text like "$1,200.00 a $1,300.00"
                    if 'a' in price_text:
                        price_text = price_text.split('a')[0].strip()
                    try:
                        price = float(price_text)
                    except:
                        pass
                
                if price == 0: continue
                
                # Image
                img_container = item.find('div', class_='emproduct_left_image')
                image_url = ''
                if img_container:
                    img_elem = img_container.find('img')
                    image_url = img_elem['data-src'] if img_elem and 'data-src' in img_elem.attrs else (img_elem['src'] if img_elem else '')
                
                if not image_url:
                    image_url = "https://via.placeholder.com/150"
                
                specs = extract_specs(title, cat_type)
                
                component_data = {
                    "type": cat_type,
                    "brand": specs["brand"],
                    "model": specs["model"],
                    "price": price,
                    "store_name": "Cyberpuerta",
                    "product_url": product_url,
                    "image_url": image_url,
                    "description": title,
                    "socket": specs["socket"],
                    "tdp": specs["tdp"],
                    "memory_type": specs["memory_type"],
                    "capacity": specs["capacity"],
                    "specs": specs
                }
                
                batch.append(component_data)
                
            except Exception as e:
                print(f"Error parsing item: {e}")
                continue
                
        return batch

    except Exception as e:
        print(f"Error fetching category: {e}")
        return []

if __name__ == "__main__":
    all_components = []
    for cat_type, url in categories.items():
        components = fetch_category(cat_type, url)
        all_components.extend(components)
        time.sleep(2) # Be polite
        
    if all_components:
        print(f"Sending {len(all_components)} components to API...")
        # Send in chunks to avoid payload limits
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

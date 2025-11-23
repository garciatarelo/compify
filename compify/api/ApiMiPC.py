import requests
from bs4 import BeautifulSoup
import re
import time
import random
import json

# URL del endpoint público para carga masiva de laptops
url_api = "http://127.0.0.1:8000/api/laptops/bulk"

headers_laravel = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
}

headers_scraping = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

def extract_specs(title):
    specs = {
        "brand": "N/A",
        "model": "N/A",
        "cpu": "N/A",
        "ram": "N/A",
        "storage": "N/A",
        "display": "N/A",
        "gpu": "Integrada",
        "os": "No especificado"
    }
    
    title_lower = title.lower()
    
    # Marca
    brands = ["hp", "dell", "lenovo", "asus", "acer", "apple", "msi", "huawei", "samsung", "gigabyte", "adata", "xpg", "microsoft", "razer", "alienware", "ghia", "vorago", "lanix"]
    
    # Mapeo de sub-marcas a marcas principales
    sub_brands = {
        "legion": "Lenovo",
        "ideapad": "Lenovo",
        "thinkpad": "Lenovo",
        "yoga": "Lenovo",
        "nitro": "Acer",
        "predator": "Acer",
        "aspire": "Acer",
        "swift": "Acer",
        "rog": "Asus",
        "tuf": "Asus",
        "vivobook": "Asus",
        "zenbook": "Asus",
        "aorus": "Gigabyte",
        "aero": "Gigabyte",
        "omen": "Hp",
        "victus": "Hp",
        "pavilion": "Hp",
        "alienware": "Dell",
        "inspiron": "Dell",
        "vostro": "Dell",
        "latitude": "Dell",
        "precision": "Dell",
        "xps": "Dell",
        "surface": "Microsoft",
        "matebook": "Huawei",
        "galaxy book": "Samsung",
        "macbook": "Apple",
        "katana": "Msi",
        "sword": "Msi",
        "stealth": "Msi",
        "raider": "Msi",
        "vector": "Msi",
        "crosshair": "Msi",
        "pulse": "Msi",
        "leopard": "Msi",
        "bravo": "Msi",
        "alpha": "Msi",
        "delta": "Msi",
        "prestige": "Msi",
        "modern": "Msi",
        "summit": "Msi",
        "creator": "Msi"
    }

    for brand in brands:
        if brand in title_lower:
            specs["brand"] = brand.capitalize()
            break
            
    # Si no hay marca, buscar por sub-marcas
    if specs["brand"] == "N/A":
        for sub, main in sub_brands.items():
            if sub in title_lower:
                specs["brand"] = main
                break

    if specs["brand"] == "N/A":
        # Intentar adivinar marca por primera palabra
        first_word = title_lower.split()[0]
        # Limpiar caracteres no alfanuméricos
        first_word = re.sub(r'[^a-zA-Z0-9]', '', first_word)
        if first_word.lower() in brands:
            specs["brand"] = first_word.capitalize()

    # Detectar Modelo
    # 1. Buscar sub-marca explícita (ej. Legion, Nitro)
    found_sub_brand = None
    for sub in sub_brands.keys():
        if sub in title_lower:
            found_sub_brand = sub.capitalize()
            break
    
    if found_sub_brand:
        specs["model"] = found_sub_brand
    
    # 2. Intentar extraer modelo más específico del título
    # Buscar texto entre la marca (o sub-marca) y el inicio de las especificaciones
    start_marker = specs["brand"].lower() if specs["brand"] != "N/A" else ""
    if found_sub_brand:
        start_marker = found_sub_brand.lower()
        
    if start_marker and start_marker in title_lower:
        # Regex para capturar texto entre el marcador y la siguiente palabra clave de spec
        pattern = re.compile(re.escape(start_marker) + r'\s+(.*?)\s+(intel|amd|core|ryzen|celeron|pentium|athlon|\d+gb|\d+tb|\d+"|\d+pulgadas|nvidia|geforce|rtx|gtx)', re.IGNORECASE)
        match = pattern.search(title_lower)
        if match:
            potential_model = match.group(1).strip()
            # Limpiar caracteres raros y palabras comunes de relleno
            potential_model = re.sub(r'[^a-zA-Z0-9\-\s]', '', potential_model)
            words_to_remove = ["laptop", "gamer", "notebook", "pc", "computadora", "portatil"]
            for w in words_to_remove:
                potential_model = re.sub(r'\b' + w + r'\b', '', potential_model, flags=re.IGNORECASE)
            
            potential_model = potential_model.strip()
            
            if len(potential_model) > 1 and len(potential_model) < 40:
                if specs["model"] != "N/A":
                    # Si ya tenemos sub-marca, combinamos si no está repetido
                    if specs["model"].lower() not in potential_model.lower():
                        specs["model"] = f"{specs['model']} {potential_model}".title()
                    else:
                        specs["model"] = potential_model.title()
                else:
                    specs["model"] = potential_model.title()
            
    # CPU
    if "intel" in title_lower:
        if "i9" in title_lower: specs["cpu"] = "Intel Core i9"
        elif "i7" in title_lower: specs["cpu"] = "Intel Core i7"
        elif "i5" in title_lower: specs["cpu"] = "Intel Core i5"
        elif "i3" in title_lower: specs["cpu"] = "Intel Core i3"
        elif "celeron" in title_lower: specs["cpu"] = "Intel Celeron"
        elif "pentium" in title_lower: specs["cpu"] = "Intel Pentium"
    elif "amd" in title_lower or "ryzen" in title_lower:
        if "ryzen 9" in title_lower: specs["cpu"] = "AMD Ryzen 9"
        elif "ryzen 7" in title_lower: specs["cpu"] = "AMD Ryzen 7"
        elif "ryzen 5" in title_lower: specs["cpu"] = "AMD Ryzen 5"
        elif "ryzen 3" in title_lower: specs["cpu"] = "AMD Ryzen 3"
        elif "athlon" in title_lower: specs["cpu"] = "AMD Athlon"

    # RAM
    ram_match = re.search(r'(\d+)\s*(gb|tb)\s*ram', title_lower)
    if not ram_match:
        ram_match = re.search(r'(\d+)\s*(gb|tb)', title_lower)
    if ram_match:
        specs["ram"] = f"{ram_match.group(1).upper()}{ram_match.group(2).upper()}"

    # Storage
    storage_match = re.search(r'(\d+)\s*(gb|tb)\s*(ssd|hdd|nvme)', title_lower)
    if storage_match:
        specs["storage"] = f"{storage_match.group(1).upper()}{storage_match.group(2).upper()} {storage_match.group(3).upper()}"

    # Display
    display_match = re.search(r'(\d+(\.\d+)?)\s*("|\'\'|pulgadas)', title_lower)
    if display_match:
        specs["display"] = f"{display_match.group(1)}\""

    # GPU
    if "rtx" in title_lower:
        gpu_match = re.search(r'rtx\s*\d{3,4}(ti|super)?', title_lower)
        if gpu_match: specs["gpu"] = f"NVIDIA {gpu_match.group(0).upper()}"
    elif "gtx" in title_lower:
        gpu_match = re.search(r'gtx\s*\d{3,4}(ti|super)?', title_lower)
        if gpu_match: specs["gpu"] = f"NVIDIA {gpu_match.group(0).upper()}"
    elif "radeon" in title_lower:
        specs["gpu"] = "AMD Radeon"

    return specs

def fetch_mipc_data(query="laptop gamer", max_pages=5):
    print(f"Iniciando scraping de MiPC para: {query}")
    
    base_url = "https://mipc.com.mx/catalogsearch/result/"
    
    for page in range(1, max_pages + 1):
        print(f"\n--- Scraping Página {page} ---")
        url = f"{base_url}?p={page}&q={query.replace(' ', '+')}"
        
        try:
            print(f"Conectando a {url}...")
            response = requests.get(url, headers=headers_scraping)
            print(f"Status Code: {response.status_code}")
            
            if response.status_code != 200:
                print("Error al acceder a MiPC.")
                break

            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Identificar contenedor de productos
            products = soup.find_all(class_='product-item')
            
            if not products:
                print("No se encontraron más productos. Terminando.")
                break
            
            print(f"Encontrados {len(products)} productos en página {page}")
            
            laptops_batch = []
            
            for item in products:
                try:
                    # Título
                    # Usando selector CSS más específico como sugirió el usuario
                    title_elem = item.select_one('.product-item-name')
                    if title_elem:
                        title = title_elem.get_text(strip=True)
                        link_elem = title_elem.find('a')
                        product_url = link_elem.get('href') if link_elem else None
                    else:
                        # Fallback
                        title_elem = item.find('a', class_='product-item-link')
                        if not title_elem: continue
                        title = title_elem.get_text(strip=True)
                        product_url = title_elem.get('href')

                    if not product_url: continue
                    
                    # Filtrar accesorios y no-laptops
                    keywords_exclude = ["teclado", "mouse", "mochila", "base enfriadora", "memoria ram", "silla", "audifonos", "headset", "monitor", "funda", "cargador", "adaptador", "cable", "disco duro", "ssd", "ventilador"]
                    if any(k in title.lower() for k in keywords_exclude):
                        continue

                    # Precio
                    price = 0
                    # Buscar precio en efectivo (price-cash)
                    price_elem = item.find('div', class_='price-cash')
                    if not price_elem:
                        # Fallback a precio normal si no hay cash price
                        price_elem = item.find('span', class_='price')
                    
                    if price_elem:
                        price_text = price_elem.get_text(strip=True).replace('$', '').replace(',', '')
                        # Limpiar texto extra
                        price_text = re.sub(r'[^\d.]', '', price_text)
                        try:
                            price = float(price_text)
                        except:
                            pass
                    
                    # Imagen
                    image_url = ""
                    img_elem = item.find('img', class_='product-image-photo')
                    if img_elem:
                        image_url = img_elem.get('src', '')

                    # Specs
                    specs = extract_specs(title)
                    
                    if specs['brand'] == 'N/A':
                        print(f"Advertencia: Marca no detectada para el producto: '{title}'")

                    laptop_data = {
                        "brand": specs["brand"],
                        "model": specs["model"], 
                        "cpu": specs["cpu"],
                        "ram": specs["ram"],
                        "storage": specs["storage"],
                        "display": specs["display"],
                        "gpu": specs["gpu"],
                        "os": specs["os"],
                        "price": price,
                        "image_url": image_url,
                        "description": title,
                        "product_url": product_url,
                        "store_name": "MiPC"
                    }
                    
                    if price > 0:
                        laptops_batch.append(laptop_data)
                        print(f"Procesado: {specs['brand']} - ${price}")
                    
                except Exception as e:
                    print(f"Error procesando item: {e}")
                    continue
                    
            if laptops_batch:
                send_to_api(laptops_batch)
            else:
                print("No se encontraron laptops válidas en este lote.")
                
            time.sleep(2) # Respetar al servidor

        except Exception as e:
            print(f"Error general en scraping: {e}")
            break

def send_to_api(laptops):
    if not laptops:
        print("No hay laptops para enviar.")
        return

    print(f"Enviando {len(laptops)} laptops a Laravel...")
    try:
        response = requests.post(url_api, json={"laptops": laptops}, headers=headers_laravel)
        print(f"Respuesta API: {response.status_code}")
        print(response.json())
    except Exception as e:
        print(f"Error enviando a API: {e}")

if __name__ == "__main__":
    fetch_mipc_data()

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
    for brand in brands:
        if brand in title_lower:
            specs["brand"] = brand.capitalize()
            break
            
    if specs["brand"] == "N/A":
        # Intentar adivinar marca por primera palabra
        first_word = title_lower.split()[0]
        # Limpiar caracteres no alfanuméricos
        first_word = re.sub(r'[^a-zA-Z0-9]', '', first_word)
        if first_word.lower() in brands:
            specs["brand"] = first_word.capitalize()
            
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

def fetch_mipc_data(query="laptop gamer"):
    print(f"Iniciando scraping de MiPC para: {query}")
    
    url = f"https://mipc.com.mx/catalogsearch/result/?q={query.replace(' ', '+')}"
    
    try:
        print(f"Conectando a {url}...")
        response = requests.get(url, headers=headers_scraping)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print("Error al acceder a MiPC.")
            return []

        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Identificar contenedor de productos
        products = soup.find_all(class_='product-item')
        
        print(f"Encontrados {len(products)} productos")
        
        laptops_batch = []
        
        for item in products:
            try:
                # Título
                title_elem = item.find('a', class_='product-item-link')
                if not title_elem: continue
                title = title_elem.get_text(strip=True)
                
                # Link
                product_url = title_elem.get('href')
                if not product_url: continue
                
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
                
        return laptops_batch

    except Exception as e:
        print(f"Error general en scraping: {e}")
        return []

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
    laptops = fetch_mipc_data()
    send_to_api(laptops)

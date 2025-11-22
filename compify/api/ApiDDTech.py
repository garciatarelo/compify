import cloudscraper
from bs4 import BeautifulSoup
import re
import time
import random
import json
import requests

# URL del endpoint público para carga masiva de laptops
url_api = "http://127.0.0.1:8000/api/laptops/bulk"

headers_laravel = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
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
    brands = ["hp", "dell", "lenovo", "asus", "acer", "apple", "msi", "huawei", "samsung", "gigabyte", "adata", "xpg"]
    for brand in brands:
        if brand in title_lower:
            specs["brand"] = brand.capitalize()
            break
            
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

def fetch_ddtech_data(query="laptop gamer"):
    print(f"Iniciando scraping de DDTech para: {query}")
    scraper = cloudscraper.create_scraper()
    
    # URL de búsqueda (ajustar si es necesario)
    # Intentamos la URL de búsqueda estándar
    url = f"https://ddtech.mx/importaciones/index/buscar?q={query.replace(' ', '+')}"
    
    try:
        print(f"Conectando a {url}...")
        response = scraper.get(url)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print("Error al acceder a DDTech. Posible bloqueo o URL incorrecta.")
            return []

        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Identificar contenedor de productos
        # Basado en estructura común de DDTech (div.product)
        products = soup.find_all('div', class_='product')
        
        if not products:
            # Intentar otro selector si 'product' no funciona
            products = soup.find_all('div', class_='product-item')
            
        print(f"Encontrados {len(products)} productos")
        
        laptops_batch = []
        
        for item in products:
            try:
                # Título
                title_elem = item.find('h3') or item.find('a', class_='name')
                if not title_elem: continue
                title = title_elem.get_text(strip=True)
                
                # Link
                link_elem = item.find('a', href=True)
                if not link_elem: continue
                product_url = link_elem['href']
                
                # Precio
                price = 0
                price_elem = item.find('span', class_='price') or item.find('div', class_='price')
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
                img_elem = item.find('img')
                if img_elem:
                    image_url = img_elem.get('src', '') or img_elem.get('data-src', '')

                # Specs
                specs = extract_specs(title)
                
                laptop_data = {
                    "brand": specs["brand"],
                    "model": specs["model"], # Se podría mejorar extrayendo del título
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
                    "store_name": "DDTech"
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
    laptops = fetch_ddtech_data()
    send_to_api(laptops)

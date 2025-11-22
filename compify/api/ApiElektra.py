import requests
from bs4 import BeautifulSoup
import re
import time
import random
import json

# URL del endpoint público para carga masiva de laptops
url_api = "http://127.0.0.1:8000/api/laptops/bulk"

headers_scraping = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

headers_laravel = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
}

def extract_specs(title):
    specs = {
        "cpu": "N/A",
        "ram": "N/A",
        "storage": "N/A",
        "display": "N/A",
        "gpu": "N/A",
        "os": "N/A",
        "brand": "N/A",
        "model": "N/A"
    }
    
    title_lower = title.lower()
    
    # Marca
    brands = ["hp", "dell", "lenovo", "asus", "acer", "apple", "msi", "huawei", "samsung", "microsoft", "gigabyte", "alienware", "razer"]
    for brand in brands:
        if brand in title_lower:
            specs["brand"] = brand.capitalize()
            break
            
    # Modelo (heurística básica)
    if specs["brand"] != "N/A":
        # Intentar extraer texto entre Marca y (Procesador o RAM o Pulgadas)
        # Ejemplo: "Laptop HP 240 G9 Intel..." -> "240 G9"
        # Mejorado: Busca patrones más específicos y limpia basura
        pattern = re.compile(re.escape(specs["brand"].lower()) + r'\s+(.*?)\s+(intel|amd|core|ryzen|\d+gb|\d+"|\d+tb|celeron|pentium|athlon)', re.IGNORECASE)
        match = pattern.search(title_lower)
        if match:
            clean_model = match.group(1)
            # Limpiar palabras comunes que no son parte del modelo
            clean_model = re.sub(r'\b(laptop|notebook|gaming|gamer|convertible|2 en 1|2-in-1)\b', '', clean_model, flags=re.IGNORECASE)
            clean_model = clean_model.strip()
            # Eliminar caracteres no alfanuméricos al inicio/final
            clean_model = clean_model.strip(' -.,')
            
            if clean_model and len(clean_model) > 2:
                specs["model"] = clean_model.title()

    # RAM
    ram_match = re.search(r'(\d+)\s*(gb|tb)\s*ram', title_lower)
    if ram_match:
        specs["ram"] = f"{ram_match.group(1)} {ram_match.group(2).upper()}"
        
    # Almacenamiento
    storage_match = re.search(r'(\d+)\s*(gb|tb)\s*(ssd|hdd|emmc)', title_lower)
    if storage_match:
        specs["storage"] = f"{storage_match.group(1)} {storage_match.group(2).upper()} {storage_match.group(3).upper()}"
        
    # Pantalla
    display_match = re.search(r'(\d+(\.\d+)?)\s*("|\'\'|pulgadas)', title_lower)
    if display_match:
        specs["display"] = f"{display_match.group(1)}\""
        
    # Procesador (básico)
    if "intel" in title_lower:
        if "i3" in title_lower: specs["cpu"] = "Intel Core i3"
        elif "i5" in title_lower: specs["cpu"] = "Intel Core i5"
        elif "i7" in title_lower: specs["cpu"] = "Intel Core i7"
        elif "i9" in title_lower: specs["cpu"] = "Intel Core i9"
        elif "celeron" in title_lower: specs["cpu"] = "Intel Celeron"
        elif "pentium" in title_lower: specs["cpu"] = "Intel Pentium"
    elif "amd" in title_lower or "ryzen" in title_lower:
        if "ryzen 3" in title_lower: specs["cpu"] = "AMD Ryzen 3"
        elif "ryzen 5" in title_lower: specs["cpu"] = "AMD Ryzen 5"
        elif "ryzen 7" in title_lower: specs["cpu"] = "AMD Ryzen 7"
        elif "ryzen 9" in title_lower: specs["cpu"] = "AMD Ryzen 9"
        elif "athlon" in title_lower: specs["cpu"] = "AMD Athlon"
        
    return specs

def get_details_from_product_page(product_url):
    print(f"  Scraping detalles: {product_url}")
    try:
        time.sleep(random.uniform(0.5, 1.5)) 
        response = requests.get(product_url, headers=headers_scraping)
        if response.status_code != 200:
            return {}
            
        soup = BeautifulSoup(response.text, 'html.parser')
        details = {}
        
        # Intentar obtener precio de la página de detalles
        price_elem = None
        
        # DEBUG: Buscar scripts con precio
        scripts = soup.find_all('script')
        for script in scripts:
            if script.string:
                # Buscar skuJson o similar
                if 'skuJson' in script.string:
                    # print(f"DEBUG: Script skuJson encontrado")
                    try:
                        json_text = re.search(r'skuJson\s*:\s*({.*})', script.string)
                        if json_text:
                            data = json.loads(json_text.group(1))
                            if 'skus' in data and len(data['skus']) > 0:
                                sku = data['skus'][0]
                                if 'bestPrice' in sku:
                                    details['price'] = float(sku['bestPrice']) / 100 # A veces viene en centavos
                                    break
                                if 'listPrice' in sku:
                                    details['price'] = float(sku['listPrice']) / 100
                                    break
                    except: pass

                if '"Price"' in script.string or '"sellingPrice"' in script.string:
                    # print(f"DEBUG: Script con precio encontrado: {script.string[:100]}...")
                    price_match = re.search(r'"sellingPrice":(\d+\.?\d*)', script.string)
                    if price_match:
                        try:
                            details['price'] = float(price_match.group(1))
                            break
                        except: pass
                    
                    price_match = re.search(r'"Price":(\d+\.?\d*)', script.string)
                    if price_match:
                        try:
                            details['price'] = float(price_match.group(1))
                            break
                        except: pass

        if 'price' not in details:
            price_classes = [
                re.compile(r'elektra-elektra-components-.*-x-currencyContainer'),
                re.compile(r'vtex-product-price-1-x-sellingPriceValue'),
                re.compile(r'vtex-product-price-1-x-sellingPrice'),
                re.compile(r'elektra-elektra-components-.*-x-price'),
                re.compile(r'.*sellingPrice.*'),
                re.compile(r'.*textRealPrice.*'),
            ]
            for p_class in price_classes:
                price_elem = soup.find(class_=p_class)
                if price_elem: break
                
            if price_elem:
                price_text = price_elem.get_text(strip=True).replace('$', '').replace(',', '')
                if '-' in price_text: price_text = price_text.split('-')[0].strip()
                try:
                    details['price'] = float(price_text)
                except:
                    pass

        # Buscar tabla de características
        # Clase proporcionada por el usuario: elektra-elektra-compone
        # Usamos regex para ser flexibles pero priorizando la sugerencia
        table_div = soup.find(class_=re.compile(r'elektra-elektra-components-.*-x-tableCaracteristicas'))
        if not table_div:
             table_div = soup.find(class_=re.compile(r'elektra-elektra-components-.*'))

        if table_div:
            rows = table_div.find_all('tr')
            for row in rows:
                cols = row.find_all('td')
                if len(cols) >= 2:
                    label = cols[0].get_text(strip=True).replace(':', '')
                    value = cols[1].get_text(strip=True)
                    
                    # Mapeo de campos
                    if "Procesador" in label or "Modelo del procesador" in label: details['cpu_model'] = value
                    elif "Memoria RAM" in label: details['ram'] = value
                    elif "Disco duro" in label or "Almacenamiento" in label or "Capacidad de disco duro" in label: details['storage_raw'] = value
                    elif "Tarjeta gráfica" in label or "Gráficos" in label: details['gpu'] = value
                    elif "Sistema operativo" in label: details['os'] = value
                    elif "Tamaño de pantalla" in label or "Pulgadas" in label: details['display_size'] = value
                    elif "Resolución" in label: details['display_res'] = value
                    elif "Pantalla táctil" in label: details['touch'] = value
                    elif "Modelo" in label: details['model'] = value
        
        return details
    except Exception as e:
        print(f"  Error scraping detalles: {e}")
        return {}

def fetch_data(url):
    print(f"Conectando a {url}...")
    try:
        response = requests.get(url, headers=headers_scraping)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Buscar items usando la clase sugerida por el usuario
            # elektra-search-result-3-x-galleryIte -> galleryItem
            items = soup.find_all(class_=re.compile(r'elektra-search-result-.*-x-galleryItem'))
            
            if not items:
                print("No se encontraron productos con la clase galleryItem. Intentando búsqueda general...")
                items = soup.find_all('div', class_=re.compile(r'galleryItem'))

            print(f"Encontrados {len(items)} productos (HTML)")
            
            laptops_batch = []
            
            for i, item in enumerate(items):
                if i == 0:
                    print("DEBUG: Texto del primer item:")
                    print(item.get_text(separator=' | ', strip=True))
                try:
                    # Título
                    title_elem = item.find('h3') or item.find(class_=re.compile(r'vtex-product-summary-.*-x-productNameContainer'))
                    if not title_elem: continue
                    title = title_elem.get_text(strip=True)
                    
                    # Link (puede no existir para productos Outlet/Reacondicionados)
                    link_elem = item.find('a', href=True)
                    if not link_elem:
                        # For Outlet products without links, try to extract data from listing
                        print(f"Producto sin enlace (Outlet/Reacondicionado): {title[:50]}...")
                        # Skip for now as we can't get detailed info
                        continue
                    
                    link_path = link_elem['href']
                    product_url = f"https://www.elektra.mx{link_path}" if not link_path.startswith('http') else link_path
                    
                    # Precio - Estrategia Mejorada
                    price = 0
                    
                    # 1. Buscar por clases conocidas de precio
                    price_classes = [
                        re.compile(r'elektra-elektra-components-.*-x-currencyContainer'),
                        re.compile(r'vtex-product-price-1-x-sellingPriceValue'),
                        re.compile(r'vtex-product-price-1-x-sellingPrice'),
                        re.compile(r'elektra-elektra-components-.*-x-price'),
                        re.compile(r'.*textRealPrice.*'),
                    ]
                    
                    price_elem = None
                    for p_class in price_classes:
                        price_elem = item.find(class_=p_class)
                        if price_elem: break
                    
                    # 2. Si no encuentra por clase, buscar por texto '$'
                    if not price_elem:
                        price_candidates = item.find_all(string=re.compile(r'\$'))
                        for candidate in price_candidates:
                            parent = candidate.parent
                            # Evitar precios tachados (list price) si es posible
                            if 'listPrice' not in str(parent.get('class', '')):
                                price_elem = parent
                                break

                    if price_elem:
                        price_text = price_elem.get_text(strip=True).replace('$', '').replace(',', '')
                        if '-' in price_text: price_text = price_text.split('-')[0].strip()
                        try:
                            price = float(price_text)
                        except:
                            pass
                    
                    # Imagen
                    image_url = ""
                    img_elem = item.find('img')
                    if img_elem:
                        image_url = img_elem.get('src', '')
                    
                    # 1. Specs básicas del título
                    specs = extract_specs(title)
                    
                    # 2. Specs detalladas de la página
                    detailed_specs = get_details_from_product_page(product_url)
                    
                    # Si el precio es 0, intentar obtenerlo de los detalles
                    if price == 0 and 'price' in detailed_specs:
                        price = detailed_specs['price']
                        
                    if price == 0:
                        print(f"⚠️ Precio 0 para: {title[:30]}... (ni en lista ni en detalles)")
                        continue # Saltamos productos sin precio válido
                    
                    # 3. Mezclar datos
                    final_cpu = detailed_specs.get('cpu_model', specs["cpu"])
                    final_ram = detailed_specs.get('ram', specs["ram"])
                    
                    # Storage
                    storage_raw = detailed_specs.get('storage_raw', '')
                    final_storage = storage_raw if storage_raw else specs["storage"]
                    
                    final_display = specs["display"]
                    if 'display_size' in detailed_specs:
                        final_display = f"{detailed_specs['display_size']} {detailed_specs.get('display_res', '')}".strip()
                        
                    final_gpu = detailed_specs.get('gpu', specs["gpu"])
                    final_os = detailed_specs.get('os', specs["os"])
                    final_model = detailed_specs.get('model', specs["model"])
                    
                    # Si encontramos imagen mejor en detalles, usarla
                    if 'image_url' in detailed_specs and detailed_specs['image_url']:
                        image_url = detailed_specs['image_url']

                    laptop_data = {
                        "brand": specs["brand"],
                        "model": final_model,
                        "cpu": final_cpu,
                        "ram": final_ram,
                        "storage": final_storage,
                        "display": final_display,
                        "gpu": final_gpu,
                        "os": final_os,
                        "price": price,
                        "image_url": image_url,
                        "description": title,
                        "product_url": product_url,
                        "store_name": "Elektra",
                        # Extras
                        "display_res": detailed_specs.get('display_res', ''),
                        "touch": detailed_specs.get('touch', ''),
                    }
                    
                    laptops_batch.append(laptop_data)
                    print(f"Procesado: {specs['brand']} - ${price}")
                    
                except Exception as e:
                    print(f"Error procesando item: {e}")
                    continue

            if laptops_batch:
                print(f"\nEnviando {len(laptops_batch)} laptops a Laravel...")
                payload = {"laptops": laptops_batch}
                
                try:
                    response_api = requests.post(url_api, json=payload, headers=headers_laravel)
                    print(f"Respuesta API: {response_api.status_code}")
                    print(response_api.json())
                except requests.exceptions.ConnectionError:
                    print("❌ Error: No se pudo conectar con Laravel.")
            else:
                print("No se encontraron laptops válidas para enviar.")
                
            return laptops_batch
            
        else:
            print("Error al acceder a Elektra")
            return None
            
    except Exception as e:
        print(f"Error general: {e}")
        return None

if __name__ == "__main__":
    # Scrapear múltiples páginas
    base_url = 'https://www.elektra.mx/laptop?_q=laptop&map=ft&page='
    
    for page in range(1, 16): # Scrapear 15 páginas
        print(f"\n--- Scraping Página {page} ---")
        url = f"{base_url}{page}"
        fetch_data(url)
        time.sleep(2) # Esperar entre páginas

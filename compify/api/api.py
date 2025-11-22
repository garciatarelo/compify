import requests
from bs4 import BeautifulSoup
import re
import time
import random

# URL del endpoint público para carga masiva de laptops
url_api = "http://127.0.0.1:8000/api/laptops/bulk"

headers_scraping = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

headers_laravel = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
}

def get_details_from_product_page(product_url):
    print(f"  Scraping detalles: {product_url}")
    try:
        time.sleep(random.uniform(0.5, 1.5)) 
        response = requests.get(product_url, headers=headers_scraping)
        if response.status_code != 200:
            return {}
            
        soup = BeautifulSoup(response.text, 'html.parser')
        details = {}
        
        # Estrategia 0: Extraer imagen de alta calidad
        image_link = soup.find('a', id='emzoommainpic')
        if image_link:
            img_tag = image_link.find('img')
            if img_tag:
                details['image_url'] = img_tag.get('src')

        # Estrategia 1: Buscar en la lista de atributos 
        # Busca en la clase que salió en la página de Cyberpuerta
        more_attr_div = soup.find('div', class_='detailsInfo_right_more_attribute')
        if more_attr_div:
            lis = more_attr_div.find_all('li')
            for li in lis:
                text = li.get_text(strip=True)
                if ':' in text:
                    parts = text.split(':', 1)
                    label = parts[0].strip()
                    value = parts[1].strip()
                    
                    if "Familia de procesador" in label: details['cpu_family'] = value
                    elif "Modelo del procesador" in label: details['cpu_model'] = value
                    elif "Modelo de gráficos en tarjeta" in label: details['gpu'] = value
                    elif "Tarjeta de Video" in label: details['gpu'] = value
                    elif "Modelo de adaptador de gráficos discretos" in label: details['gpu_discrete'] = value
                    elif "Memoria interna" in label or "Memoria RAM" in label or "Capacidad de memoria RAM" in label: details['ram'] = value
                    elif "Capacidad total SSD" in label or "Almacenamiento SSD" in label: details['ssd'] = value
                    elif "Capacidad total HDD" in label or "HDD" in label: details['hdd'] = value
                    elif "Tarjeta de lectura integrada" in label: pass
                    elif "Resolución de la pantalla" in label: details['display_res'] = value
                    elif "Pantalla táctil" in label or "Táctil" in label: details['touch'] = value
                    elif "Idioma del teclado" in label: details['keyboard'] = value
                    elif "Sistema operativo instalado" in label or "Sistema Operativo" in label: details['os'] = value
                    elif "Diagonal de la pantalla" in label: details['display_size'] = value
                    elif "Unidad de almacenamiento" in label and "eMMC" in value: details['emmc'] = value

        # Estrategia 2: Tabla de especificaciones 
        # Ejecutamos esto SIEMPRE para buscar datos que no se hayan encontrado en la Estrategia 1
        #Busca en tr
        rows = soup.find_all('tr')
        for row in rows:
            cols = row.find_all('td')
            if len(cols) >= 2:
                label = cols[0].get_text(strip=True).replace(':', '')
                value = cols[1].get_text(strip=True)

                def set_if_missing(key, val):
                    if key not in details or not details[key] or details[key] == "No disponible":
                        details[key] = val

                if "Capacidad de memoria RAM" in label: set_if_missing('ram', value)
                elif ("Capacidad total SSD" in label or "Almacenamiento SSD" in label) and value != "No disponible": set_if_missing('ssd', value)
                elif ("Capacidad total HDD" in label or "HDD" in label) and value != "No disponible": set_if_missing('hdd', value)
                elif "Diagonal de la pantalla" in label: set_if_missing('display_size', value)
                elif "Resolución de la pantalla" in label or "Resolucion" in label: set_if_missing('display_res', value)
                elif "Familia de procesador" in label: set_if_missing('cpu_family', value)
                elif "Modelo del procesador" in label: set_if_missing('cpu_model', value)
                elif "Modelo de gráficos en tarjeta" in label and value != "No disponible": set_if_missing('gpu', value)
                elif "Modelo de adaptador de gráficos discretos" in label and value != "No disponible": set_if_missing('gpu_discrete', value)
                elif "Sistema operativo instalado" in label: set_if_missing('os', value)
                elif "Idioma del teclado" in label: set_if_missing('keyboard', value)
                elif "Pantalla táctil" in label: set_if_missing('touch', value)
                elif "Modelo" == label or "Modelo del producto" in label: set_if_missing('model', value)
                    
        return details
    except Exception as e:
        print(f"  Error scraping detalles: {e}")
        return {}

def extract_specs(title):
    specs = {
        "cpu": "N/A",
        "ram": "N/A",
        "storage": "N/A",
        "display": "N/A",
        "brand": "Genérica",
        "model": "Modelo Desconocido"
    }
    
    title_lower = title.lower()
    
    # Marcas
    brands = ["hp", "dell", "lenovo", "asus", "acer", "apple", "msi", "samsung", "huawei", "gigabyte"]
    for brand in brands:
        if brand in title_lower:
            specs["brand"] = brand.capitalize()
            break
            
    # Modelo (heurística básica)
    if specs["brand"] != "Genérica":
        # Intentar extraer texto entre Marca y (Procesador o RAM o Pulgadas)
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

    # CPU
    # Intel
    if "intel" in title_lower:
        if "core i" in title_lower:
            match = re.search(r'core\s+i\d[- ]\w+', title_lower)
            if match: specs["cpu"] = "Intel " + match.group(0).title()
        else:
            specs["cpu"] = "Intel Processor"

    # AMD
    elif "amd" in title_lower or "ryzen" in title_lower:
        match = re.search(r'ryzen\s+\d\s+\w+', title_lower)
        if match: 
            specs["cpu"] = "AMD " + match.group(0).title()
        else:
            specs["cpu"] = "AMD Processor"
            
    # Apple
    elif "apple m" in title_lower or " m1" in title_lower or " m2" in title_lower or " m3" in title_lower:
        match = re.search(r'apple\s+m\d(\s+(pro|max|ultra))?', title_lower)
        if match:
            specs["cpu"] = match.group(0).title()
        else:
            match = re.search(r'm\d(\s+(pro|max|ultra))?', title_lower)
            if match:
                specs["cpu"] = "Apple " + match.group(0).title()

    # RAM
    ram_match = re.search(r'(\d+)\s*gb', title_lower)
    if ram_match:
        specs["ram"] = f"{ram_match.group(1)}GB"
        
    # Storage
    storage_match = re.search(r'(\d+)\s*(gb|tb)\s*(ssd|hdd|emmc)', title_lower)
    if storage_match:
        specs["storage"] = f"{storage_match.group(1)}{storage_match.group(2).upper()} {storage_match.group(3).upper()}"
        
    # Display
    display_match = re.search(r'(\d+(\.\d+)?)"', title_lower)
    if display_match:
        specs["display"] = f"{display_match.group(1)}\""

    # Graphics
    gpu_match = re.search(r'(rtx|gtx|radeon|iris|uhd|geforce|arc)\s*[\w\d-]*', title_lower)
    if gpu_match:
        specs["gpu"] = gpu_match.group(0).upper()
    else:
        specs["gpu"] = "Integrada"
        
    # Modelo 
    specs["model"] = title[:50] + "..." if len(title) > 50 else title
    
    return specs

def fetch_data(url):
    print(f"Scraping {url}...")
    try:
        response = requests.get(url, headers=headers_scraping)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            divs = soup.find_all('li', class_="productData")
            print(f"Encontrados {len(divs)} productos")
            
            laptops_batch = []
            
            for div in divs:
                titulo_elem = div.find('a', class_="emproduct_right_title")
                price_elem = div.find('label', class_="price")
                image_elem = div.find('div', class_="catProdImage").find('img') if div.find('div', class_="catProdImage") else None
                
                if titulo_elem and price_elem:
                    title = titulo_elem.text.strip()
                    price_text = price_elem.text.strip().replace('$', '').replace(',', '')
                    product_url = titulo_elem.get('href', '')
                    image_url = image_elem.get('data-src', '') if image_elem else ''
                    
                    try:
                        price = float(price_text)
                    except ValueError:
                        continue
                        
                    # 1. Extraer specs básicas del título (fallback)
                    specs = extract_specs(title)
                    
                    # 2. Obtener specs detalladas de la página del producto
                    detailed_specs = get_details_from_product_page(product_url)
                    
                    # 3. Mezclar datos (prioridad a los detallados)
                    final_cpu = f"{detailed_specs.get('cpu_family', '')} {detailed_specs.get('cpu_model', '')}".strip()
                    if not final_cpu: final_cpu = specs["cpu"]
                    
                    final_ram = detailed_specs.get('ram', specs["ram"])
                    
                    # Storage logic
                    ssd = detailed_specs.get('ssd', '')
                    hdd = detailed_specs.get('hdd', '')
                    storage_parts = []
                    if ssd and ssd != "No disponible": storage_parts.append(f"{ssd} SSD")
                    if hdd and hdd != "No disponible": storage_parts.append(f"{hdd} HDD")
                    final_storage = " + ".join(storage_parts) if storage_parts else specs["storage"]
                    
                    final_display = specs["display"]
                    if 'display_size' in detailed_specs:
                        final_display = f"{detailed_specs['display_size']} {detailed_specs.get('display_res', '')}".strip()
                        
                    final_gpu = detailed_specs.get('gpu_discrete', detailed_specs.get('gpu', specs["gpu"]))
                    final_os = detailed_specs.get('os', 'No especificado')
                    
                    # Jalar imagen  
                    final_image_url = detailed_specs.get('image_url', image_url)
                    
                    final_model = detailed_specs.get('model', specs["model"])

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
                        "image_url": final_image_url,
                        "description": title,
                        "product_url": product_url,
                        "store_name": "Cyberpuerta",
                        # Extras
                        "cpu_family": detailed_specs.get('cpu_family', ''),
                        "cpu_model": detailed_specs.get('cpu_model', ''),
                        "ssd": detailed_specs.get('ssd', 'No disponible'),
                        "hdd": detailed_specs.get('hdd', 'No disponible'),
                        "emmc": detailed_specs.get('emmc', 'No disponible'),
                        "display_res": detailed_specs.get('display_res', ''),
                        "touch": detailed_specs.get('touch', ''),
                        "keyboard": detailed_specs.get('keyboard', ''),
                    }
                    
                    laptops_batch.append(laptop_data)
                    print(f"Procesado: {specs['brand']} - ${price}")

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
            print("Error al acceder a la página de Cyberpuerta")
            return None
            
    except Exception as e:
        print(f"Error general: {e}")
        return None
    
#Pagina de uso 1   
if __name__ == "__main__":
    base_url = 'https://www.cyberpuerta.mx/Computadoras/Laptops'
    
    # Página 1
    print("\n--- Scraping Página 1 ---")
    fetch_data(base_url)
    
    # Páginas 2 a 15
    for page in range(2, 16):
        print(f"\n--- Scraping Página {page} ---")
        url = f"{base_url}/{page}/"
        fetch_data(url)
        time.sleep(3) # Esperar entre páginas
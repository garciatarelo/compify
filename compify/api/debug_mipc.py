import requests
from bs4 import BeautifulSoup

url = "https://mipc.com.mx/catalogsearch/result/?q=laptop+gamer"
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

response = requests.get(url, headers=headers)
soup = BeautifulSoup(response.text, 'html.parser')

# Intentar encontrar el contenedor de productos
# Magento suele usar 'product-item' o 'item'
products = soup.find_all(class_='product-item')

if products:
    print(f"Encontrados {len(products)} productos.")
    first_item = products[0]
    print(first_item.prettify())
else:
    print("No se encontraron productos con la clase 'product-item'. Imprimiendo body...")
    print(soup.body.prettify()[:2000])

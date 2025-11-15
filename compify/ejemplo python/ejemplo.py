import requests
from bs4 import BeautifulSoup
url_api="http://127.0.0.1:8000/api/products"
headership = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'}
token='eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vMTI3LjAuMC4xOjgwMDAvYXBpL2xvZ2luIiwiaWF0IjoxNzYzMTYwNTQyLCJleHAiOjE3NjMxNjQxNDIsIm5iZiI6MTc2MzE2MDU0MiwianRpIjoicThtcVo2cVdLWDFhSm81cCIsInN1YiI6IjEiLCJwcnYiOiIyM2JkNWM4OTQ5ZjYwMGFkYjM5ZTcwMWM0MDA4NzJkYjdhNTk3NmY3In0.D6kwOs0ZIh7ElifnKLo7UgSKcoW-kSvbNd5Zi0a8CBk'

headers_laravel={
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': f'Bearer {token}',
}

def fetch_data(url):
    response = requests.get(url, headers=headership)
    print(response.status_code)
    if response.status_code == 200:
        #print(response.text)
        with open("ejemplo.html", "w", encoding='utf-8') as f:
            f.write(response.text)
        soup = BeautifulSoup(response.text, 'html.parser')
        divs=soup.find_all('li', class_="productData")
        print(len(divs))
        for div in divs:
           titulo=div.find('a', class_="emproduct_right_title")
           price=div.find('label', class_="price")
           if titulo:
               print(titulo.text.strip())
               print(price.text.strip() if price else "No price found")
               data={
                    "brand": "Marca1",
                    "model": "Modelo1",
                    "cpu": "cpu1",
                    "ram": "ram1",
                    "storage": "storage1",
                    "display": "display1",
                    "image_url": "youtube.com",
                    "description": titulo.text.strip(),
                    "category_id":"1"
                }
               response_api=requests.post(url_api, json=data, headers=headers_laravel)
               print(response_api.json())

        return []
    else:
        return None
    
data = fetch_data('https://www.cyberpuerta.mx/Computadoras/Laptops')
import requests
from bs4 import BeautifulSoup
import re
import json

headers_scraping = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

def debug_product():
    # Search in Outlet category
    url = "https://www.elektra.mx/outlet/laptop"
    print(f"Scanning {url}...")
    response = requests.get(url, headers=headers_scraping)
    soup = BeautifulSoup(response.text, 'html.parser')
    
    items = soup.find_all(class_=re.compile(r'vtex-product-summary-2-x-element'))
    print(f"  Found {len(items)} items in Outlet")
    
    for idx, item in enumerate(items[:3]):  # First 3 items only
        print(f"\n--- Item {idx+1} ---")
        print(f"Text: {item.get_text()[:100]}")
        print(f"Classes: {item.get('class')}")
        
        # Try to find link
        link = item.find('a', href=True)
        if link:
            print(f"FOUND LINK: {link['href']}")
        else:
            print("NO LINK FOUND")
            
        # Check if it has onclick or data attributes that might contain product ID
        if item.get('onclick'):
            print(f"onclick: {item.get('onclick')}")
        if item.get('data-product-id'):
            print(f"Product ID: {item.get('data-product-id')}")
            
        # Look for product URL in nested elements
        all_links = item.find_all('a', href=True)
        if all_links:
            print(f"Found {len(all_links)} nested links:")
            for a in all_links:
                print(f"  - {a['href']}")


def analyze_url(url):
    print(f"Analyzing Product Page: {url}")
    response = requests.get(url, headers=headers_scraping)
    soup = BeautifulSoup(response.text, 'html.parser')
    analyze_page(soup)

def analyze_page(soup):
    print(f"Page Title: {soup.title.string if soup.title else 'No Title'}")
    
    # Print some body content to check if we are blocked or empty
    body = soup.body
    if body:
        print(f"Body start: {body.get_text()[:200]}")
    else:
        print("No body tag found")

    print("\n--- Price Analysis ---")
    
    # 1. Check Scripts
    scripts = soup.find_all('script')
    for script in scripts:
        if script.string:
            if 'skuJson' in script.string:
                print("Found skuJson script")
                match = re.search(r'skuJson\s*:\s*({.*})', script.string)
                if match:
                    print(f"skuJson content snippet: {match.group(1)[:200]}...")
            if '"Price"' in script.string or '"sellingPrice"' in script.string:
                print("Found Price/sellingPrice in script")
                # print(script.string[:200])

    # 2. Check HTML Classes
    print("\nSearching for elements with 'price' in class:")
    price_elements = soup.find_all(class_=re.compile(r'price', re.IGNORECASE))
    for el in price_elements:
        text = el.get_text(strip=True)
        if text and '$' in text:
            print(f"Class: {el.get('class')} | Text: {text}")

    print("\n--- Advanced Analysis ---")
    
    # Check JSON-LD
    json_ld = soup.find_all('script', type='application/ld+json')
    for script in json_ld:
        print("Found JSON-LD:")
        try:
            data = json.loads(script.string)
            print(json.dumps(data, indent=2)[:500])
        except:
            print("Invalid JSON")

    # Check for text with $
    print("\nSearching for text containing '$':")
    dollar_elements = soup.find_all(string=re.compile(r'\$'))
    for text in dollar_elements:
        parent = text.parent
        if parent.name in ['script', 'style']: continue
        clean_text = text.strip()
        if len(clean_text) < 20: # Only short price-like strings
            print(f"Found '$': '{clean_text}' in <{parent.name} class='{parent.get('class')}'>")

    # Check for specific user mentioned class again but looser
    print("\nSearching for 'textRealPrice' (loose):")
    loose_match = soup.find_all(class_=lambda x: x and 'textRealPrice' in x)
    for el in loose_match:
        print(f"Found element with class {el.get('class')}: {el.get_text()}")


if __name__ == "__main__":
    debug_product()

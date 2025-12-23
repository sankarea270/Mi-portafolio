import urllib.request, urllib.parse, json, sys

url = 'https://formspree.io/f/xeejpvbv'
form = {'name':'test','email':'test@example.com','message':'Prueba desde check_formspree.py'}
data = urllib.parse.urlencode(form).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={'Accept':'application/json'})
try:
    with urllib.request.urlopen(req, timeout=15) as resp:
        code = resp.getcode()
        body = resp.read().decode('utf-8', errors='replace')
        print('Status:', code)
        try:
            j = json.loads(body)
            print('JSON:', json.dumps(j, ensure_ascii=False, indent=2))
        except Exception:
            print('Body:', body[:2000])
except urllib.error.HTTPError as e:
    body = e.read().decode('utf-8', errors='replace')
    print('HTTPError', e.code)
    try:
        print('Body JSON:', json.dumps(json.loads(body), ensure_ascii=False, indent=2))
    except Exception:
        print('Body:', body[:2000])
except Exception as ex:
    print('Error:', ex)

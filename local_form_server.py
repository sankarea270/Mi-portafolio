#!/usr/bin/env python3
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import parse_qs
import json
import time

SUB_FILE = 'submissions.jsonl'

class Handler(BaseHTTPRequestHandler):
    def _set_headers(self, status=200):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers(204)

    def do_POST(self):
        if self.path not in ('/local-form', '/submit'):
            self._set_headers(404)
            self.wfile.write(json.dumps({'error':'not found'}).encode())
            return
        length = int(self.headers.get('Content-Length', 0))
        raw = self.rfile.read(length).decode('utf-8')
        # try to parse as form-encoded
        try:
            data = parse_qs(raw)
            # flatten values
            clean = {k: v[0] if isinstance(v, list) and len(v) else '' for k,v in data.items()}
        except Exception:
            clean = {'raw_body': raw}
        entry = {
            'time': time.strftime('%Y-%m-%d %H:%M:%S'),
            'path': self.path,
            'client': self.client_address[0],
            'data': clean
        }
        with open(SUB_FILE, 'a', encoding='utf-8') as f:
            f.write(json.dumps(entry, ensure_ascii=False) + '\n')
        self._set_headers(200)
        self.wfile.write(json.dumps({'ok': True, 'received': clean}).encode('utf-8'))

if __name__ == '__main__':
    port = 5000
    server_address = ('', port)
    httpd = HTTPServer(server_address, Handler)
    print(f'Local form server listening on http://localhost:{port}/local-form')
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print('\nShutting down')
        httpd.server_close()

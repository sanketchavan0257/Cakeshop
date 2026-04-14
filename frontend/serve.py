#!/usr/bin/env python3
"""Simple static file server for the vanilla HTML/CSS/JS frontend."""
import http.server
import os

PORT = 3000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class CakeHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        # Serve index.html for the root path
        if self.path == '/':
            self.path = '/index.html'
        # For paths without extension that aren't files, try .html
        elif '.' not in self.path.split('/')[-1] and not self.path.startswith('/api'):
            html_path = self.path.rstrip('/') + '.html'
            full_path = os.path.join(DIRECTORY, html_path.lstrip('/'))
            if os.path.isfile(full_path):
                self.path = html_path
        super().do_GET()

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

if __name__ == '__main__':
    with http.server.HTTPServer(('0.0.0.0', PORT), CakeHandler) as httpd:
        print(f'Serving frontend at http://0.0.0.0:{PORT}')
        httpd.serve_forever()

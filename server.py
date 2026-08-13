import http.server
import socketserver

PORT = 8000

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Redirect or serve /dashboard.html on root request
        if self.path == '/' or self.path == '/index.html':
            self.path = '/dashboard.html'
        return super().do_GET()

if __name__ == '__main__':
    # Allow port reuse immediately upon restart
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), CustomHandler) as httpd:
        print(f"Server running at http://localhost:{PORT}/ (serving dashboard.html by default)")
        httpd.serve_forever()

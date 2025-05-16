from web_macro_mech  import create_app
app = create_app()

# if __name__ == "__main__":
#     app.run(debug=True, host='0.0.0.0', port=5000)  # on development server

### on waitress server
from waitress import serve 
if __name__ == "__main__":
    serve(
        app,
        host='85.209.88.57',
        port=5000,
        url_scheme='http',
        # ssl_certificate='/path/to/fullchain.pem',
        # ssl_private_key='/path/to/privkey.pem'
    )

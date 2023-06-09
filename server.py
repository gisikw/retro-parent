from flask import Flask, request, make_response, send_from_directory
import os
import subprocess
import threading
import time

ENFORCER_POLLING_TIME = 2
GAMING_CMD = ['/opt/retropie/supplementary/emulationstation/emulationstation.sh']
WALLPAPER_CMD = ['fim','-a','-q','wallpaper.png']
WALLPAPER = "Wallpaper"
GAMING = "Gaming"

app = Flask(__name__, static_folder='public')
expiry_lock = threading.Lock()
current_process_type = None

if os.path.exists("expiry.txt"):
    f = open("expiry.txt", "r")
    expiry = float(f.read())
    f.close()
else:
    expiry = None

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_file(path):
    if not path:
        return app.send_static_file('index.html')
    else:
        return send_from_directory(app.static_folder, path)

@app.route('/set-expiry', methods=['POST'])
def set_expiry():
    global expiry
    with expiry_lock:
        expiry = request.get_json()['expiry']
        f = open("expiry.txt", "w")
        f.write(f"{expiry}")
        f.close()
    return 'Expiry set'

@app.route('/get-expiry', methods=['GET'])
def get_expiry():
    global expiry
    with expiry_lock:
        response = make_response(f"{expiry}", 200)
        response.mimetype = "text/plain"
        return response

def enforce_expiry():
    while True:
        with expiry_lock:
            void_stale_expiry()
            check_for_parity()
        time.sleep(ENFORCER_POLLING_TIME)

def void_stale_expiry():
    global expiry
    if expiry is not None and time.time() > expiry: 
        expiry = None

def check_for_parity():
    if expiry is None and current_process_type is not WALLPAPER:
        start_wallpaper()
    elif expiry is not None and current_process_type is not GAMING:
        start_gaming()

def start_wallpaper():
    global current_process_type
    kill_process_by_name('emulationstation')
    kill_process_by_name('retroarch')
    subprocess.Popen(WALLPAPER_CMD)
    current_process_type = WALLPAPER

def start_gaming():
    global current_process_type
    kill_process_by_name('fim')
    subprocess.Popen(GAMING_CMD)
    current_process_type = GAMING

def kill_process_by_name(name):
    pgrep_process = subprocess.Popen(['pgrep', '-f', name], stdout=subprocess.PIPE)
    pgrep_output, _ = pgrep_process.communicate()
    if pgrep_output:
        pids = pgrep_output.decode().split()
        subprocess.Popen(['kill'] + pids)

if __name__ == '__main__':
    expiry_thread = threading.Thread(target=enforce_expiry, daemon=True)
    expiry_thread.start()
    app.run(host='0.0.0.0',port='80')

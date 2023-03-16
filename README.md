# RetroParent - WIP

Allow setting access restrictions to EmulationStation based on a web UI, showing a splash screen when the user does not have access

# Install
Edit /opt/retropie/configs/all/autostart.sh
Comment out emulationstation #auto
Add python3 /home/pi/retro-parent/server.py
- FIXME: fim can't find the right image, so hack right now is to (cd /home/pi/retro-parent && python3 server.py)
- FIXME: Enumerate non-python dependencies (fim, authbind)
- FIXME: Put an actual image in there for fim
- https://gist.github.com/justinmklam/f13bb53be9bb15ec182b4877c9e9958d

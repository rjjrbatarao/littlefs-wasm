Mkittlefs in browser
Why in browser? i want to make on the fly littlefs configuration and esptool flashing anywhere on a static website.

Requirements:
wsl, git in windows
```
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
git pull
./emsdk install latest
./emsdk activate latest
source ./emsdk_env.sh
```
Before compiling:
We need littlefs v2.9.3 to make it work with mklittlefs
```
git clone this repo
cd and do
git submodule update --remote --merge
finally
make
```
Serve this under a webserver enable serving the application/wasm
![image](https://github.com/user-attachments/assets/6e9c7bc9-af79-4dc2-81a4-32e4b036c752)
now you will get a download button served over the webserver
you can edit `test.js` try changing the payload

Sample config.json generated in browser openned on mkspiffs, note this is customized to my needs.
![image](https://github.com/user-attachments/assets/3223e210-52b5-4cc9-9bbf-f8c50c597d82)


References:
* https://github.com/wokwi/littlefs-wasm
* https://github.com/earlephilhower/mklittlefs/tree/master
* https://emscripten.org/docs/getting_started/downloads.html#installation-instructions-using-the-emsdk-recommended



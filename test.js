/** Quick test program for creating a littlefs filesystem with a main.py file */

//const createLittleFS = require(['littlefs']);
const createLittleFS = littlefs;
/*
 sources:
 https://github.com/Jason2866/mklittlefs_esp32
*/
/*
 issues:
 https://github.com/littlefs-project/littlefs/issues/964
*/
/*
	littlefs size in esp32 default 4MB 1.5MB spiffs 0x160000 ~ 1441792
	littlefs_create -b 4096 -c 512 -s fs_content/ -i fs.bin
	LittleFS operates on blocks, and blocks have a size of 4096 bytes on the ESP32.
	A freshly formatted LittleFS will have 2 blocks in use, making it seem like 8KB are in use.
	#define CONFIG_LITTLEFS_MAX_PARTITIONS 3
	#define CONFIG_LITTLEFS_PAGE_SIZE 256
	#define CONFIG_LITTLEFS_OBJ_NAME_LEN 64
	#define CONFIG_LITTLEFS_READ_SIZE 128
	#define CONFIG_LITTLEFS_WRITE_SIZE 128
	#define CONFIG_LITTLEFS_LOOKAHEAD_SIZE 128
	#define CONFIG_LITTLEFS_CACHE_SIZE 512     // Old value was 128 
	#define CONFIG_LITTLEFS_BLOCK_CYCLES 512	
	
	        // block device configuration
        efs->cfg.read_size = CONFIG_LITTLEFS_READ_SIZE;
        efs->cfg.prog_size = CONFIG_LITTLEFS_WRITE_SIZE;
        efs->cfg.block_size = CONFIG_LITTLEFS_BLOCK_SIZE;; 
        efs->cfg.block_count = efs->partition->size / efs->cfg.block_size;
        efs->cfg.cache_size = CONFIG_LITTLEFS_CACHE_SIZE;
        efs->cfg.lookahead_size = CONFIG_LITTLEFS_LOOKAHEAD_SIZE;
        efs->cfg.block_cycles = CONFIG_LITTLEFS_BLOCK_CYCLES;
	
	
*/


const BLOCK_SIZE = 4096;
const BLOCK_COUNT = 1441792 / BLOCK_SIZE; // try 512 

const flash = new Uint8Array(BLOCK_COUNT * BLOCK_SIZE);

(async function () {
  const littlefs = await createLittleFS();
  function flashRead(cfg, block, off, buffer, size) {
    const start = block * BLOCK_SIZE + off;
    littlefs.HEAPU8.set(flash.subarray(start, start + size), buffer);
  }
  function flashProg(cfg, block, off, buffer, size) {
    const start = block * BLOCK_SIZE + off;
    console.log(
      'write',
      start,
      littlefs.HEAPU8.subarray(buffer, buffer + size)
    );
    flash.set(littlefs.HEAPU8.subarray(buffer, buffer + size), start);
  }
  const read = littlefs.addFunction(flashRead, 'iiiiii');
  const prog = littlefs.addFunction(flashProg, 'iiiiii');
  const erase = littlefs.addFunction(
    (cfg, block) => console.log('erase', block),
    'iii'
  );
  const sync = littlefs.addFunction(() => console.log('sync'), 'ii');

  const writeFile = littlefs.cwrap(
    'lfs_write_file',
    ['number'],
    ['number', 'string', 'string', 'number']
  );


  const writeDir = littlefs.cwrap(
    'lfs_write_dir',
    ['number'],
    ['number', 'string', 'string']
  );

  const config = littlefs._new_lfs_config(
    read,
    prog,
    erase,
    sync,
    BLOCK_COUNT,
    BLOCK_SIZE
  );
  const lfs = littlefs._new_lfs();
  littlefs._lfs_format(lfs, config);
  littlefs._lfs_mount(lfs, config);
  littlefs._lfs_unmount(lfs);
  
  const fileData = JSON.stringify({success:true});
  writeDir(lfs, 'data', 'data/config.json');
  writeFile(lfs, 'data/config.json', fileData, fileData.length);
  console.log("flash content: ",flash);
  littlefs._free(lfs);
  littlefs._free(config);
})();



var downloadBlob, downloadURL;

downloadBlob = function(data, fileName, mimeType) {
  var blob, url;
  blob = new Blob([data], {
    type: mimeType
  });
  url = window.URL.createObjectURL(blob);
  downloadURL(url, fileName);
  setTimeout(function() {
    return window.URL.revokeObjectURL(url);
  }, 1000);
};

downloadURL = function(data, fileName) {
  var a;
  a = document.createElement('a');
  a.href = data;
  a.download = fileName;
  document.body.appendChild(a);
  a.style = 'display: none';
  a.click();
  a.remove();
};

function handleDownload(){
	downloadBlob(flash, 'config.bin', 'application/octet-stream');
}
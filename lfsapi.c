/**
 * A bunch of helper methods / glue code for using littlefs from JavaScript
 */
#include <sys/stat.h>
#include "lfs.h"

lfs_t *new_lfs() {
    return malloc(sizeof(lfs_t));
}

const struct lfs_config *new_lfs_config(void *read, void *prog, void *erase, void *sync, size_t block_count, size_t block_size) {
    const struct lfs_config cfg = {
        // block device operations
        .read = read,
        .prog = prog,
        .erase = erase,
        .sync = sync,

        // block device configuration
		/*
        .read_size = 256,
        .prog_size = 32,
        .block_size = block_size,
        .block_count = block_count,
        .cache_size = 256 * 4,
        .lookahead_size = 32,
        .block_cycles = 100,
		*/
		// derived from https://github.com/earlephilhower/mklittlefs/blob/master/main.cpp
        .read_size = 64,
        .prog_size = 64,
        .block_size = block_size,
        .block_count = block_count,
        .cache_size = 64,
        .lookahead_size = 64,
        .block_cycles = 16,
		//.read_buffer = nullptr,
		//.prog_buffer = nullptr,
		//.lookahead_buffer = nullptr,
		.name_max = 0,
		.file_max = 0,
		.attr_max = 0,		
    };
    struct lfs_config *result = malloc(sizeof(cfg));
    memcpy(result, &cfg, sizeof(cfg));
    return result;
}

void lfs_write_file(lfs_t *lfs, char *name, void *data, size_t size) {
    lfs_file_t file;
	struct stat sbuf;
    lfs_file_open(lfs, &file, name, LFS_O_RDWR | LFS_O_CREAT);
    lfs_file_write(lfs, &file, data, size);
    lfs_file_close(lfs, &file);
	uint32_t ftime = sbuf.st_mtime;
	lfs_setattr(lfs, name, 't', (const void *)&ftime, sizeof(ftime));
	lfs_setattr(lfs, name, 'c', (const void *)&ftime, sizeof(ftime));
	
}

void lfs_write_dir(lfs_t *lfs, char *name, char *path){
	lfs_dir_t dir;
	struct stat sbuf;	
	lfs_dir_open(lfs, &dir, name);
	lfs_mkdir(lfs, name);
	if (!stat(path, &sbuf)) {
		uint32_t ftime = sbuf.st_mtime;
		lfs_setattr(lfs, path, 't', (const void *)&ftime, sizeof(ftime));
		lfs_setattr(lfs, path, 'c', (const void *)&ftime, sizeof(ftime));
	}
	lfs_dir_close(lfs, &dir);
}


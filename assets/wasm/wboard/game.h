#ifndef GAME_H

#define GAME_H

#include "boardutils.h"

#define MAX_GAMENODES 500

#define MAX_HEADER_KEY_SIZE 50
#define MAX_HEADER_VALUE_SIZE 250
#define MAX_HEADERS 50

typedef struct{
	uint8_t key[MAX_HEADER_KEY_SIZE];
	uint8_t value[MAX_HEADER_VALUE_SIZE];
} Header;

typedef struct{
	Header headers[MAX_HEADERS];
	uint8_t key[MAX_HEADER_KEY_SIZE];
	uint8_t value[MAX_HEADER_VALUE_SIZE];
	int hi;
	str parsestart;
	str parseend;
} Headers;

extern Headers headers;

extern uint8_t game_initialized;

extern GameNode root_gamenode;
extern GameNode gamenodes[MAX_GAMENODES];
extern GameNode* gamenodeslist[MAX_GAMENODES+1];

extern void clear_headers();
extern void init_game();
extern GameNode* allocate_gamenode();
extern GameNode* getmovenode(GameNode* gn,Move m);
extern GameNode* getlastsibling(GameNode* gn);
extern GameNode** allchilds(GameNode* gn);
extern void freeallchilds(GameNode* gn);

extern void allocateHeader();
extern void lookUpHeader();
extern void setHeader();
extern void getHeader();

extern void parseHeaders();
extern str reportHeaders(str ptr);

#endif
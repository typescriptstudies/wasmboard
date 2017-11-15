#ifndef TYPES_H

#define TYPES_H

#include <stdint.h>

typedef uint8_t* str;
typedef uint8_t chr;
typedef uint64_t ptr;
typedef uint64_t size;

#define MAX_FILES 14
#define MAX_RANKS 14

#define MAX_PLAYERS 4
#define MAX_CASTLING_SIDES 2

#define MAX_STRUCT_SIZE 10000

#define MAX_SAN_LENGTH 20

#define SPLIT_MAX_CHUNKS 10
#define SPLIT_MAX_CHUNKS_SIZE 500

// piece

typedef struct{
	uint8_t kind;
	uint8_t color;
} Piece;

// square

typedef struct{
	int8_t f;
	int8_t r;
} Square;

// epsquare

typedef struct{
	Square epsq;
	Square epclsq;
	uint8_t cnt;
} EpSquare;

// move

typedef struct{
	// all fields default to 0
	uint8_t invalid; // 1 for an invalid move to signal the end of a movelist
	Square fsq; // from square	
	Square tsq; // to square
	Piece prompiece; // promotion piece
	uint8_t capture; // 1 for capture move
	uint8_t pawnmove; // 1 for pawn move
	uint8_t pawnpush; // 1 for pawn push ( forward )
	uint8_t pawnpushbytwo; // 1 for double pawn advance
	uint8_t epcapture; // 1 for ep capture
	uint8_t promotion; // 1 for promotion
	uint8_t castling; // 1 for castling
	Square epsq; // ep square
	Square epclsq; // ep clear square
} Move;

// extended move

typedef struct{
	Move m;
	uint8_t san[MAX_SAN_LENGTH+1];
} ExtendedMove;

// castling registry

typedef struct
{
	uint8_t right;
	Square kingsq;
	Square rooksq;
	Square emptysqs[MAX_FILES+1];
	Square passingsqs[MAX_FILES+1];
} CastlingRegistry;

typedef struct GameNode GameNodeT;

// board

typedef Piece rep_t[MAX_RANKS][MAX_FILES];

typedef struct{	
	rep_t rep;
	EpSquare epsqs[MAX_PLAYERS]; // ep squares
	Move* mptr;
	uint8_t turn;
	int fullmove_number;
	int halfmove_clock;
	uint8_t checkattack;	
	uint8_t isattack;
	uint8_t excludechecks;
	uint8_t test;
	//////////////////
	Move tempmove;
	//////////////////
	uint8_t tosan;
	uint8_t same;
	uint8_t samefile;
	uint8_t samerank;
	Square fsq;
	Piece frompiece;
	//////////////////
	uint8_t santomove;
	uint8_t kind;
	Move m;
	Move rm;
	//////////////////
	CastlingRegistry castregs[MAX_PLAYERS][MAX_CASTLING_SIDES];
	struct GameNode *root;
	struct GameNode *current;
} Board;

// game node

typedef struct GameNode{
	Board b;
	uint8_t free;	
	Move genmove;
	uint8_t gensan[MAX_SAN_LENGTH+1];
	struct GameNode* parent;
	struct GameNode* child;
	struct GameNode* prevsibling;
	struct GameNode* nextsibling;	
} GameNode;

// split result

typedef struct {
	int numchunks;
	uint8_t chunks[SPLIT_MAX_CHUNKS][SPLIT_MAX_CHUNKS_SIZE];
} SplitResult;

// parse int result

typedef struct {
	int num;
	str ptr;
} ParseResult;

// has ep square result

typedef struct {
	uint8_t has;
	uint8_t color;
} HasEpSquareResult;

#endif
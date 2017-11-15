#ifndef BOARDUTILS_H

#define BOARDUTILS_H

#include "types.h"
#include "utils.h"
#include "game.h"

//////////////////////////////////////////////////////////////////////////

#define VARIANT_STANDARD 201
#define VARIANT_ATOMIC 202
#define VARIANT_FOUR_PLAYER 401

#define FOUR_PLAYER_BASE 400

#define STANDARD_NUM_FILES 8
#define STANDARD_NUM_RANKS 8

#define FOUR_PLAYER_NUM_FILES 14
#define FOUR_PLAYER_NUM_RANKS 14

#define MAX_MOVES 500

#define MAX_PIECES 10

#define STANDARD_PROMOTION_PIECE_KINDS (uint8_t[]){'n','b','r','q',0}

#define FOUR_PLAYER_VOID_SQUARES 3

#define MAX_FEN_LENGTH 250

#define P(C) *ptr++ = C

//////////////////////////////////////////////////////////////////////////

extern Move legalmovebuff[MAX_MOVES];
extern ExtendedMove extendedmovebuff[MAX_MOVES];

extern rep_t startpos;

extern Board b;

extern int variant;

extern uint8_t numfiles;
extern uint8_t lastfile;
extern uint8_t numranks;
extern uint8_t lastrank;

extern uint8_t numplayers;
extern uint8_t lastplayer;

//////////////////////////////////////////////////////////////////////////

extern void setVariant(int v);

extern void createRegistries();

extern void resetBoardOnly(Board* b);

extern void resetBoard(Board* b);

extern void resetMain();

extern void initVariant(int v);

//////////////////////////////////////////////////////////////////////////

extern void setStartPos(int v);

extern void setFromRawFen(Board* b);
extern str reportBoardRep(Board* b,str ptr);

extern uint8_t fileOk(Board *b,uint8_t f);
extern uint8_t rankOk(Board *b,uint8_t f);

extern uint8_t fileRankOk(Board *b,uint8_t f,uint8_t r);
extern uint8_t isSquareValid(Board *b,Square sq);

extern Square plusSquare(Square sq1,Square sq2);
extern Square minusSquare(Square sq1,Square sq2);
extern Square rotateSquare(Square sq,int rot);
extern Square normalizeSquare(Square sq);

extern uint8_t isSquareEqualTo(Square sq1,Square sq2);
extern uint8_t isSquareRoughlyEqualTo(Square sq1,Square sq2);
extern Piece pieceAtSquare(Board* b,Square sq);
extern uint8_t isSquareEmpty(Board* b,Square sq);

extern int colorOfPieceAtSquare(Board* b,Square sq);
extern uint8_t isSameColorAtSquare(Board* b,Square sq,uint8_t color);
extern uint8_t isDifferentColorAtSquare(Board* b,Square sq,uint8_t color);

extern str squareToAlgeb(Board *b,Square sq,str ptr);
extern str moveToAlgeb(Board *b,Move m,uint8_t detail,str ptr);

extern Square pawnDirection(Board *b,uint8_t color);
extern Square effectiveDirection(Square template,int dc);

extern void setDefaultsOnMove(Move* mptr);

extern uint8_t defaultMove(Board *b);

extern uint8_t isMoveChecked(Board* b,Move m);

extern uint8_t* promotionPieceKinds(Board* b);

extern uint8_t recordMove(Board* b);
extern uint8_t recordPromotionMove(Board* b);

extern HasEpSquareResult hasEpSquare(Board* b,Square sq);

extern void resetEpSquares(Board* b);

extern uint8_t nextTurn(Board* b,uint8_t t);
extern void advanceTurnOnce(Board* b);
extern void advanceTurn(Board* b);

extern void advanceClocks(Board* b,Move m);

extern void copyRep(rep_t r1,rep_t r2);

extern void resetCastlingRegistries(Board* b);

extern void setNumFiles(uint8_t nf);
extern void setNumRanks(uint8_t nr);
extern uint8_t getNumFiles();
extern uint8_t getNumRanks();
extern uint8_t getNumPlayers();

extern uint8_t isMoveRoughlyEqualTo(Move m1,Move m2);

extern uint8_t* allPieceKinds(Board* b);

extern Square whereIsKing(Board* b,uint8_t color);

extern void pseudoLegalVectorMovesForPieceAt(Board *b,int df,int dr,uint8_t single,Piece p,uint8_t f,uint8_t r);

extern void pseudoLegalMovesForPieceAt(Board *b,Piece p,uint8_t f,uint8_t r);

extern uint8_t isSquareAttacked(Board* b,Square sq,uint8_t color);

extern uint8_t isInCheck(Board* b,uint8_t color);

extern void makeMove(Board* b,Move m);

extern Move toRichMove(Board* b,Move m);

extern void pseudoLegalMovesForColor(Board *b,uint8_t color);

extern void legalMovesForColor(Board* b,uint8_t color);

extern str reportGame(str ptr);

extern void back();
extern void forward();
extern void delete();
extern void tobegin();
extern void toend();
extern void tonode(GameNode* gn);

extern uint8_t castleSideLetterToIndex(Board* b,uint8_t color,uint8_t sideletter);
extern uint8_t castleIndexToSideLetter(Board* b,uint8_t ci,uint8_t cs);
extern Square longCastlingDirection(Board* b,uint8_t color);
extern Square sideCastlingDirection(Board* b,uint8_t color,uint8_t cs);

extern str moveToSan(Board* b,Move m,str ptr);

extern uint8_t* sanToMoveEndPtr;

extern Move sanToMove(Board* b,str san);

typedef struct{
	Board* b;
	uint8_t* cptr;
	uint8_t kind;
	int f;
	int r;
	int ci;
	Square sq;
	uint8_t castling;
} Tokenizer;

extern void pullKind(Tokenizer* t);
extern void pullFile(Tokenizer *t);
extern void pullRank(Tokenizer *t);
extern void pullColorIndex(Tokenizer *t);
extern void pullSquare(Tokenizer *t);
extern void pullPromPiece(Tokenizer *t);
extern void pullCastling(Tokenizer *t);

extern void createCastlingRegistries(Board* b);

extern void sortedLegalSanList(Board* b);

extern uint8_t colorToChar(uint8_t color);
extern uint8_t charToColor(uint8_t c);

extern uint8_t kindToAltKind(uint8_t kind);
extern uint8_t altKindToKind(uint8_t kind);
extern uint8_t pieceToChar(Piece p);
extern Piece charToPiece(uint8_t c);

extern str reportPosFen(Board* b,str ptr);
extern str reportTurnFen(Board* b,str ptr);
extern str reportCastleFen(Board* b,str ptr);
extern str reportEpFen(Board* b,str ptr);
extern str reportHalfmoveFen(Board* b,str ptr);
extern str reportFullmoveFen(Board* b,str ptr);

extern uint8_t setFromPosFen(Board* b,str ptr);
extern uint8_t setFromTurnFen(Board* b,str ptr);
extern uint8_t setFromCastleFen(Board* b,str ptr);
extern uint8_t setFromEpFen(Board* b,str ptr);
extern uint8_t setFromHalfmoveFen(Board* b,str ptr);
extern uint8_t setFromFullmoveFen(Board* b,str ptr);

extern str reportFen(Board* b,str ptr);

extern uint8_t setFromFen(Board* b,str fen);

extern uint8_t isMovePromotion(Board* b,Move m);

extern str flushPgn(str ptr);
extern str flushSpace(str ptr);

extern str codeToVariantName(int v);

extern uint8_t invColor(uint8_t color);
extern uint8_t kingsAdjacent(Board* b);
extern uint8_t isExploded(Board* b,uint8_t color);

extern void positionChanged(Board* b);

#endif
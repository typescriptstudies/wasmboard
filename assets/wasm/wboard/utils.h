#ifndef UTILS_H

#define UTILS_H

#include "types.h"

#define LOGBUFF_SIZE 10000
#define INBUFF_SIZE 10000
#define OUTBUFF_SIZE 10000

extern const uint8_t ZERO;

extern uint8_t logbuff[LOGBUFF_SIZE];
extern uint8_t inbuff[INBUFF_SIZE];
extern uint8_t inbuff2[INBUFF_SIZE];
extern uint8_t outbuff[OUTBUFF_SIZE];

extern str logptr;

extern ptr logbuffaddr();
extern size logbuffsize();
extern ptr inbuffaddr();
extern ptr inbuff2addr();
extern size inbuffsize();
extern ptr outbuffaddr();
extern size outbuffsize();

extern str printNumber(int number,str ptr);
extern str printString(str content,str ptr);

extern void startlog();
extern void logchar(chr c);
extern void logstr(str ptr);
extern void lognum(int num);
extern void conslog(); // Javascript import

extern void _memcpy(uint8_t* from,uint8_t* to,int size);
extern void _memset(const uint8_t* from,uint8_t* to,int size);
extern str _strcpys(str from,str to,int size);
extern uint8_t _strcmp(str from,str to);
extern void _swap(uint8_t* p1,uint8_t* p2,int size);

extern int absv(int x);

extern SplitResult* split(str ptr,uint8_t splitchar);

extern ParseResult parseInt(str ptr);

extern uint8_t isSmallCap(uint8_t c);
extern uint8_t isBigCap(uint8_t c);
extern uint8_t isLetter(uint8_t c);

#endif
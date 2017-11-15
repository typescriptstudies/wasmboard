#include "utils.h"

const uint8_t ZERO=0;

uint8_t logbuff[LOGBUFF_SIZE];
uint8_t inbuff[INBUFF_SIZE];
uint8_t inbuff2[INBUFF_SIZE];
uint8_t outbuff[OUTBUFF_SIZE];

str logptr;

ptr logbuffaddr(){return (ptr)logbuff;}
size logbuffsize(){return (size)LOGBUFF_SIZE;}
ptr inbuffaddr(){return (ptr)inbuff;}
ptr inbuff2addr(){return (ptr)inbuff2;}
size inbuffsize(){return (size)INBUFF_SIZE;}
ptr outbuffaddr(){return (ptr)outbuff;}
size outbuffsize(){return (size)OUTBUFF_SIZE;}

str printNumber(int number,str ptr){
	uint8_t digits[50];
	int di=0;
	if(number<0){
		*ptr++='-';
		number=-number;
	}
	do{
		int digit=number%10;
		digits[di++]='0'+digit;
		number=number/10;
	} while(number>0);
	while(di-->0){
		*ptr++=digits[di];
	}
	*ptr=0;
	return ptr;
}

str printString(str content,str ptr){
	while(*content!=0){
		*ptr++=*content++;
	}

	*ptr=0;
	return ptr;
}

void startlog(){
	logptr=logbuff;
	*logptr=0;
}

void logchar(chr c){
	*logptr++=c;
	*logptr=0;
}

void logstr(str ptr){
	while(*ptr!=0){
		*logptr++=*ptr++;
	}
	*logptr=0;
}

void lognum(int num){
	logptr=printNumber(num,logptr);
}

void _memcpy(uint8_t* from,uint8_t* to,int size){
	for(int i=0;i<size;i++){
		*(to+i)=*(from+i);
	}
}

void _memset(const uint8_t* from,uint8_t* to,int size){
	for(int i=0;i<size;i++){
		*(to+i)=*(from);
	}
}

str _strcpys(str from,str to,int size){
	int i;
	for(i=0;i<size;i++){
		*(to+i)=*(from+i);
		if(*(from+i)==0) return to+i;
	}	
	*(to+i)=0;
	return to+i;
}

uint8_t _strcmp(str from,str to){
	while(*from!=0){
		if(*from++!=*to++) return 0;
	}
	return *to==0;
}

uint8_t swapbuff[MAX_STRUCT_SIZE];

void _swap(uint8_t* p1,uint8_t* p2,int size){
	_memcpy(p1,(uint8_t*)&swapbuff,size);
	_memcpy(p2,p1,size);
	_memcpy((uint8_t*)&swapbuff,p2,size);
}

int absv(int x){
	if(x>=0) return x;
	return -x;
}

SplitResult sr;

SplitResult* split(str ptr,uint8_t splitchar){	
	uint8_t chunki=0;	
	str cptr=sr.chunks[chunki];
	*cptr=0;
	while(*ptr!=0){
		if(*ptr==splitchar){
			chunki++;
			cptr=sr.chunks[chunki];
			*cptr=0;
		} else {
			*cptr=*ptr;
			cptr++;
			*cptr=0;
		}
		ptr++;
	}
	sr.numchunks=chunki+1;
	return &sr;
}

ParseResult parseInt(str ptr){
	int sign=1;
	if(*ptr=='-'){
		sign=-1;
		ptr++;
	}
	int num=0;
	while(*ptr!=0){
		num = ( *ptr - '0' ) + ( 10 * num );
		ptr++;
	}
	return (ParseResult){num,ptr};
}

uint8_t isSmallCap(uint8_t c){
	return ( c >= 'a' ) && ( c <= 'z' );
}

uint8_t isBigCap(uint8_t c){
	return ( c >= 'A' ) && ( c <= 'Z' );
}

uint8_t isLetter(uint8_t c){
	return isSmallCap(c) || isBigCap(c);
}

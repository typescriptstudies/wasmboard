#include "boardutils.h"

void setFromRawFenMain(){
	setFromRawFen(&b);
}

void reportBoardRepMain(){
	reportBoardRep(&b,outbuff);
}

void makeMoveMain(uint8_t ff,uint8_t fr,uint8_t tf,uint8_t tr,uint8_t promkind){
	Move m;
	m.fsq=(Square){ff,fr};
	m.tsq=(Square){tf,tr};
	m.prompiece=(Piece){promkind,b.turn};
	m.invalid=0;

	makeMove(&b,m);
}

void makeSanMove(Board* b,str san){
	Move m=sanToMove(b,san);

	if(m.invalid) return;

	makeMove(b,m);
}

void makeSanMoveMain(){
	makeSanMove(&b,inbuff);
}

str reportMoveList(Board* b,str ptr,uint8_t detail){
	uint8_t first=1;

	b->mptr=(Move*)&legalmovebuff;	

	while(!(b->mptr->invalid)){		
		Move m=*b->mptr;
		if(first){			
			first=0;
		} else {
			*ptr++=' ';
		}
		ptr=moveToAlgeb(b,m,1,ptr);
		*ptr++=' ';*ptr++='(';*ptr++=' ';
		ptr=moveToSan(b,m,ptr);
		*ptr++=' ';*ptr++=')';*ptr++=' ';
		*ptr++=';';
		b->mptr++;
	}

	*ptr=0;
	return ptr;
}

str reportCastlingRegistries(Board* b,str ptr){
	for(uint8_t ci=0;ci<numplayers;ci++)
	for(uint8_t cs=0;cs<MAX_CASTLING_SIDES;cs++)
	{
		CastlingRegistry cr=b->castregs[ci][cs];
		if(cr.right){
			*ptr++=ci+'0';*ptr++=':';
			ptr=squareToAlgeb(b,cr.kingsq,ptr);*ptr++='-';
			ptr=squareToAlgeb(b,cr.rooksq,ptr);*ptr++=';';
		}
	}
	*ptr=0;
	return ptr;
}

str reportEpSquares(Board* b,str ptr){
	for(uint8_t ci=0;ci<numplayers;ci++)	
	{
		if(b->epsqs[ci].cnt>0){
			*ptr++=ci+'0';*ptr++='e';*ptr++=':';
			ptr=squareToAlgeb(b,b->epsqs[ci].epsq,ptr);
			*ptr++=';';
		}
	}
	*ptr=0;
	return ptr;
}

void reportBoardState(){
	str ptr=outbuff;

	/*legalMovesForColor(&b,b.turn);

	ptr=reportMoveList(&b,ptr,1);

	*ptr++='\n';*/

	*ptr++='t';*ptr++='=';*ptr++=b.turn;*ptr++=';';
	*ptr++='f';*ptr++='=';ptr=printNumber(b.fullmove_number,ptr);*ptr++=';';
	*ptr++='h';*ptr++='=';ptr=printNumber(b.halfmove_clock,ptr);*ptr++=';';

	ptr=reportEpSquares(&b,ptr);

	ptr=reportCastlingRegistries(&b,ptr);*ptr++='\n';

	*ptr++='g';*ptr++=':';
	ptr=reportGame(ptr);	

	*ptr=0;
}

void sortedLegalSanListMain(){
	sortedLegalSanList(&b);
}

void reportFenMain(){
	reportFen(&b,outbuff);
}

uint8_t isMovePromotionMain(uint8_t ff,uint8_t fr,uint8_t tf,uint8_t tr){
	Move m;
	m.fsq=(Square){ff,fr};
	m.tsq=(Square){tf,tr};
	return isMovePromotion(&b,m);
}

void setFromFenMain(){
	setFromFen(&b,inbuff);
}

uint8_t fileRankOkMain(uint8_t f,uint8_t r){
	return fileRankOk(&b,f,r);
}

void reportPgnMain(){
	str ptr=outbuff;

	headers.key[0]='V';headers.key[1]='a';headers.key[2]='r';headers.key[3]='i';headers.key[4]='a';headers.key[5]='n';headers.key[6]='t';headers.key[7]=0;
	_strcpys(codeToVariantName(variant),headers.value,MAX_HEADER_VALUE_SIZE);

	setHeader();

	GameNode* oldcurrent=b.current;
	uint8_t torootneeded=(b.current!=b.root);

	if(torootneeded) tonode(b.root);

	headers.key[0]='F';headers.key[1]='E';headers.key[2]='N';headers.key[3]=0;
	reportFen(&b,headers.value);

	if(torootneeded) tonode(oldcurrent);

	setHeader();

	ptr=reportHeaders(ptr);

	GameNode* current=b.root;

	uint8_t first=1;

	while(getlastsibling(current)){
		if(first){
			first=0;
			if(current->b.turn=='1'){			
				ptr=printNumber(current->b.fullmove_number,ptr);
				*ptr++='.';*ptr++=' ';
			}
		} else {
			*ptr++=' ';
			if(current->b.turn=='1'){			
				ptr=printNumber(current->b.fullmove_number,ptr);
				*ptr++='.';*ptr++=' ';
			}
		}

		current=getlastsibling(current);		

		ptr=printString(current->gensan,ptr);

		if(current==b.current){
			*ptr++=' ';*ptr++='{';*ptr++='*';*ptr++='}';
		}
	}

	*ptr=0;
}

void setFromPgnMain(){
	resetMain();

	str ptr=inbuff;

	headers.parsestart=ptr;

	parseHeaders(ptr);

	ptr=headers.parseend;

	Move rm;

	GameNode* current=0;

	do{
		ptr=flushPgn(ptr);
		if(*ptr==0) {
			if(current) tonode(current);
			else if(b.current!=b.root) tobegin();
			return;
		}
		rm=sanToMove(&b,ptr);
		if(!rm.invalid){
			makeMove(&b,rm);
			ptr=sanToMoveEndPtr;

			ptr=flushSpace(ptr);
			if((*ptr=='{')&&(*(ptr+1)=='*')&&(*(ptr+2)=='}')){
				current=b.current;
			}
		}
	} while(!rm.invalid);

	if(current) tonode(current);
	else if(b.current!=b.root) tobegin();
}

void editPgn(){
	_strcpys(inbuff,headers.key,MAX_HEADER_KEY_SIZE);
	_strcpys(inbuff2,headers.value,MAX_HEADER_VALUE_SIZE);

	setHeader();	
}

void reportLastMove(){
	outbuff[0]=1;
	if(b.current==b.root){
		outbuff[0]=0;
		return;
	}
	Move m=b.current->genmove;
	outbuff[1]=m.fsq.f;
	outbuff[2]=m.fsq.r;
	outbuff[3]=m.tsq.f;
	outbuff[4]=m.tsq.r;
}

void reportLastMoveSan(){		
	if(b.current==b.root){
		outbuff[0]=0;
		return;
	}
	_strcpys(b.current->gensan,outbuff,MAX_SAN_LENGTH);
}

void getPgnHeader(){
	_strcpys(inbuff,headers.key,MAX_HEADER_KEY_SIZE);
	getHeader();
	_strcpys(headers.value,outbuff,MAX_HEADER_VALUE_SIZE);
}
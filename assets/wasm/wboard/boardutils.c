#include "boardutils.h"

//////////////////////////////////////////////////////////////////////////

Board b;

int variant;

uint8_t numfiles;
uint8_t lastfile;
uint8_t numranks;
uint8_t lastrank;

uint8_t numplayers;
uint8_t lastplayer;

Move legalmovebuff[MAX_MOVES];
ExtendedMove extendedmovebuff[MAX_MOVES];

rep_t startpos;

//////////////////////////////////////////////////////////////////////////

uint8_t STANDARD_STARTPOS[MAX_FEN_LENGTH];
//"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
uint8_t FOUR_PLAYER_STARTPOS[MAX_FEN_LENGTH];
//"3rnbqkbnr3/3pppppppp3/>/SO:os/MO:om/AO:oa/LO:ot/TO:ol/AO:oa/MO:om/SO:os/>/3PPPPPPPP3/3RNBKQBNR3 w LTltKQkq - 0 1";

//////////////////////////////////////////////////////////////////////////

void initModule(){
	str ptr=(str)&STANDARD_STARTPOS;

	P('r');P('n');P('b');P('q');P('k');P('b');P('n');P('r');P('/');
	P('p');P('p');P('p');P('p');P('p');P('p');P('p');P('p');P('/');
	P('8');P('/');P('8');P('/');P('8');P('/');P('8');P('/');
	P('P');P('P');P('P');P('P');P('P');P('P');P('P');P('P');P('/');
	P('R');P('N');P('B');P('Q');P('K');P('B');P('N');P('R');P(' ');
	P('w');P(' ');P('K');P('Q');P('k');P('Q');P(' ');P('-');P(' ');P('0');P(' ');P('1');P(0);

	ptr=(str)&FOUR_PLAYER_STARTPOS;

	P('3');P('r');P('n');P('b');P('q');P('k');P('b');P('n');P('r');P('3');P('/');
	P('3');P('p');P('p');P('p');P('p');P('p');P('p');P('p');P('p');P('3');P('/');
	P('>');P('/');
	P('S');P('O');P(':');P('o');P('s');P('/');
	P('M');P('O');P(':');P('o');P('m');P('/');
	P('A');P('O');P(':');P('o');P('a');P('/');
	P('L');P('O');P(':');P('o');P('t');P('/');
	P('T');P('O');P(':');P('o');P('l');P('/');
	P('A');P('O');P(':');P('o');P('a');P('/');
	P('M');P('O');P(':');P('o');P('m');P('/');
	P('S');P('O');P(':');P('o');P('s');P('/');
	P('>');P('/');
	P('3');P('P');P('P');P('P');P('P');P('P');P('P');P('P');P('P');P('3');P('/');
	P('3');P('R');P('N');P('B');P('K');P('Q');P('B');P('N');P('R');P('3');P(' ');
	P('w');P(' ');P('L');P('T');P('l');P('t');P('K');P('Q');P('k');P('Q');P(' ');P('-');P(' ');P('0');P(' ');P('1');P(0);
}

//////////////////////////////////////////////////////////////////////////

void setVariant(int v){
	variant=v;
	setNumFiles(STANDARD_NUM_FILES);
	setNumRanks(STANDARD_NUM_RANKS);

	numplayers=2;

	if(v>FOUR_PLAYER_BASE){
		setNumFiles(FOUR_PLAYER_NUM_FILES);
		setNumRanks(FOUR_PLAYER_NUM_RANKS);
		numplayers=4;
	}

	lastplayer=numplayers-1;
}

void createRegistries(){
	copyRep(b.rep,startpos);
}

void resetBoardOnly(Board* b){
	///////////////////////////////////////////

	_memset(&ZERO,(uint8_t*)b,sizeof(Board));

	///////////////////////////////////////////

	b->turn='1';

	b->fullmove_number=1;
	b->halfmove_clock=0;

	///////////////////////////////////////////

	resetEpSquares(b);	

	copyRep(startpos,b->rep);

	createCastlingRegistries(b);

	///////////////////////////////////////////

	b->root=&root_gamenode;
	b->current=b->root;

	b->root->parent=0;
	b->root->child=0;
	b->root->prevsibling=0;
	b->root->nextsibling=0;

	///////////////////////////////////////////

	b->tosan=0;
	b->santomove=0;

	///////////////////////////////////////////

	positionChanged(b);
}

void resetBoard(Board* b){
	///////////////////////////////////////////

	init_game();

	///////////////////////////////////////////

	resetBoardOnly(b);

	///////////////////////////////////////////
}

void resetMain(){
	resetBoard(&b);

	b.test=0;
}

//////////////////////////////////////////////////////////////////////////

void initVariant(int v){
	setVariant(v);

	setStartPos(v);

	resetMain();

	startlog();	
	logstr(codeToVariantName(v));
	logchar('\n');
	reportBoardRep(&b,logptr);
	conslog();
}

//////////////////////////////////////////////////////////////////////////

void setStartPos(int v){
	Board testb;

	if(v<FOUR_PLAYER_BASE){
		setFromFen(&testb,(str)STANDARD_STARTPOS);
	} else {
		setFromFen(&testb,(str)FOUR_PLAYER_STARTPOS);
	}
	copyRep(testb.rep,startpos);
}

void setFromRawFen(Board* b){
	str ptr=inbuff;

	startlog();

	for(uint8_t r=0;r<numranks;r++)
	for(uint8_t f=0;f<numfiles;f++)
	{
		uint8_t kind=*ptr++;
		uint8_t color=*ptr++;		
		b->rep[r][f]=(Piece){kind,color};
	}
}

str reportBoardRep(Board* b,str ptr){
	for(uint8_t r=0;r<numranks;r++){
		for(uint8_t f=0;f<numfiles;f++){
			Piece p=b->rep[r][f];
			*ptr++=p.kind;
			*ptr++=p.color;
		}
		if(r<lastrank) *ptr++='\n';
	}	
	*ptr=0;
	return ptr;
}

uint8_t fileOk(Board *b,uint8_t f){
	return ((f>=0)&&(f<numfiles));
}

uint8_t rankOk(Board *b,uint8_t r){
	return ((r>=0)&&(r<numranks));
}

uint8_t fileRankOk(Board *b,uint8_t f,uint8_t r){
	if(variant>FOUR_PLAYER_BASE){
		if((f<FOUR_PLAYER_VOID_SQUARES)&&(r<FOUR_PLAYER_VOID_SQUARES)) return 0;
		if((f<FOUR_PLAYER_VOID_SQUARES)&&(r>(lastrank-FOUR_PLAYER_VOID_SQUARES))) return 0;
		if((f>(lastfile-FOUR_PLAYER_VOID_SQUARES))&&(r<FOUR_PLAYER_VOID_SQUARES)) return 0;
		if((f>(lastfile-FOUR_PLAYER_VOID_SQUARES))&&(r>(lastrank-FOUR_PLAYER_VOID_SQUARES))) return 0;
	}
	return (fileOk(b,f)&&rankOk(b,r));
}

uint8_t isSquareValid(Board *b,Square sq){	
	return fileRankOk(b,sq.f,sq.r);
}

Square plusSquare(Square sq1,Square sq2){
	return (Square){ sq1.f + sq2.f , sq1.r + sq2.r };
}

Square minusSquare(Square sq1,Square sq2){
	return (Square){ sq1.f - sq2.f , sq1.r - sq2.r };
}

Square rotateSquare(Square sq,int rot){
	switch(rot){
		case 1:return (Square){sq.r,-sq.f};
		case -1:return (Square){-sq.r,sq.f};
		default:return sq;
	}
}

extern Square normalizeSquare(Square sq){
	if(sq.f>0) sq.f=1; else if(sq.f<0) sq.f=-1;
	if(sq.r>0) sq.r=1; else if(sq.r<0) sq.r=-1;
	return sq;
}

uint8_t isSquareEqualTo(Square sq1,Square sq2){
	if(sq1.f!=sq2.f) return 0;
	return sq1.r==sq2.r;
}

uint8_t isSquareRoughlyEqualTo(Square sq1,Square sq2){
	if((sq2.f<0)&&(sq2.r<0)) return 1;
	if(sq2.f<0) return (sq1.r==sq2.r);
	if(sq2.r<0) return (sq1.f==sq2.f);
	return 1;
}

Piece pieceAtSquare(Board* b,Square sq){	
	return b->rep[sq.r][sq.f];
}

uint8_t isSquareEmpty(Board* b,Square sq){
	return b->rep[sq.r][sq.f].kind=='-';
}

int colorOfPieceAtSquare(Board* b,Square sq){
	if(!isSquareValid(b,sq)) return -1;
	if(isSquareEmpty(b,sq)) return -1;
	return b->rep[sq.r][sq.f].color;
}

uint8_t isSameColorAtSquare(Board* b,Square sq,uint8_t color){
	int test=colorOfPieceAtSquare(b,sq);
	if(test<0) return 0;
	return test==color;
}

uint8_t isDifferentColorAtSquare(Board* b,Square sq,uint8_t color){
	int test=colorOfPieceAtSquare(b,sq);
	if(test<0) return 0;
	return test!=color;
}

str squareToAlgeb(Board *b,Square sq,str ptr){			
	int f=sq.f;
	int r=sq.r;
	if(f>=0){
		*ptr++=f+'a';
	} else *ptr++='?';
	if(r>=0){
		ptr=printNumber(lastrank-r+1,ptr);
	} else *ptr++='?';
	*ptr=0;
	return ptr;
}

str moveToAlgeb(Board *b,Move m,uint8_t detail,str ptr){	
	if(m.invalid){
		*ptr++='#';
		*ptr=0;
		return ptr;
	}
	if(detail) *ptr++=b->rep[m.fsq.r][m.fsq.f].kind+'A'-'a';
	ptr=squareToAlgeb(b,m.fsq,ptr);
	if((detail)&&(m.capture)) *ptr++='x';
	ptr=squareToAlgeb(b,m.tsq,ptr);
	if(m.promotion){
		if(detail){
			*ptr++='=';
			*ptr++=m.prompiece.kind+'A'-'a';
		} else {
			*ptr++=m.prompiece.kind;
		}
	}
	*ptr=0;
	return ptr;
}

Square pawnDirection(Board *b,uint8_t color){
	Square dir;
	if(variant<FOUR_PLAYER_BASE){
		dir.f=0;
		dir.r=(color=='0'?1:-1);
		return dir;
	} else {
		switch(color){
			case '0':return (Square){0,1};
			case '1':return (Square){0,-1};
			case '2':return (Square){-1,0};			
			default:return (Square){1,0};
		}
	}
}

// fill in zero file / rank with dc
Square effectiveDirection(Square template,int dc){
	if(template.f==0) template.f=dc;
	if(template.r==0) template.r=dc;
	return template;
}

void setDefaultsOnMove(Move* mptr){
	mptr->capture=0;
	mptr->pawnmove=0;
	mptr->pawnpush=0;
	mptr->pawnpushbytwo=0;
	mptr->epcapture=0;
	mptr->promotion=0;
	mptr->castling=0;
	mptr->prompiece.kind='-';
}

uint8_t defaultMove(Board *b){	
	setDefaultsOnMove(&b->tempmove);
	return 1;
}

uint8_t isMoveChecked(Board* b,Move m){
	Board testb;
	_memcpy((uint8_t*)b,(uint8_t*)&testb,sizeof(Board));
	testb.test=1;
	makeMove(&testb,m);
	return isInCheck(&testb,b->turn);
}

uint8_t recordMove(Board* b){	
	if(b->excludechecks){		
		if(isMoveChecked(b,b->tempmove)) return 0;
	}
	if(b->tosan){
		Piece topiece=pieceAtSquare(b,b->tempmove.tsq);						
		if((topiece.kind==b->frompiece.kind)&&(topiece.color==b->frompiece.color)){
			b->same++;
			if(b->tempmove.tsq.f==b->fsq.f){
				b->samefile++;					
			}
			if(b->tempmove.tsq.r==b->fsq.r){
				b->samerank++;
			}
		}
		return 0;
	}
	if(b->santomove){		
		Piece p=pieceAtSquare(b,b->tempmove.fsq);
		if(
			( p.kind == b->kind ) &&
			isSquareEqualTo(b->tempmove.tsq,b->m.tsq) &&
			isSquareRoughlyEqualTo(b->tempmove.fsq,b->m.fsq)			
		){			
			b->rm=b->tempmove;
			b->rm.invalid=0;
		}
		return 0;
	}
	*b->mptr=b->tempmove;
	b->mptr->invalid=0;
	b->mptr++;
	b->mptr->invalid=1;
	return 1;
}

uint8_t recordPromotionMove(Board* b){	
	uint8_t* promkinds=promotionPieceKinds(b);
	uint8_t* promkind=(uint8_t*)promkinds;	
	while(*promkind!=0){		
		if(b->excludechecks){		
			if(isMoveChecked(b,b->tempmove)) return 0;
		}
		if(b->santomove){		
			Piece p=pieceAtSquare(b,b->tempmove.fsq);			
			if(
				( p.kind == b->kind ) &&
				isSquareEqualTo(b->tempmove.tsq,b->m.tsq) &&
				isSquareRoughlyEqualTo(b->tempmove.fsq,b->m.fsq) &&
				( *promkind == b->m.prompiece.kind )
			){
				b->rm=b->tempmove;
				b->rm.prompiece.kind=*promkind;
				b->rm.invalid=0;
			}			
		} else {
			*b->mptr=b->tempmove;				
			b->mptr->prompiece.kind=*promkind;
			b->mptr->invalid=0;			
			b->mptr++;
			b->mptr->invalid=1;
		}
		promkind++;
	}
	return 1;
}

uint8_t promotionPieceKinds_buff[MAX_PIECES];
uint8_t* promotionPieceKinds(Board* b){
	uint8_t* kptr0;
	kptr0=STANDARD_PROMOTION_PIECE_KINDS;
	uint8_t* kptr=kptr0;
	do {
		promotionPieceKinds_buff[kptr-kptr0]=*kptr;
	} while(*kptr++!=0);
	return promotionPieceKinds_buff;
}

HasEpSquareResult hasEpSquare(Board* b,Square sq){
	for(int ei=0;ei<numplayers;ei++){
		if(isSquareEqualTo(b->epsqs[ei].epsq,sq)) return (HasEpSquareResult){1,ei+'0'};
	}
	return (HasEpSquareResult){0,0};
}

void resetEpSquares(Board* b){
	for(int color=0;color<numplayers;color++){
		b->epsqs[color].cnt=0;
	}
}

uint8_t nextTurn(Board* b,uint8_t t){
	if(variant<FOUR_PLAYER_BASE){
		return t=='1'?'0':'1';
	} else {
		switch(t){
			case '1':return '2';
			case '2':return '0';
			case '0':return '3';
			case '3':return '1';
			default: return 0;
		}
	}
}

void advanceTurnOnce(Board* b){
	b->turn=nextTurn(b,b->turn);
}

void advanceTurn(Board* b){
	advanceTurnOnce(b);
}

void advanceClocks(Board* b,Move m){
	if(m.capture||m.pawnmove) b->halfmove_clock=0; else b->halfmove_clock++;
	if(b->turn=='1') b->fullmove_number++;
}

void copyRep(rep_t r1,rep_t r2){
	for(uint8_t f=0;f<numfiles;f++)
	for(uint8_t r=0;r<numranks;r++)
	{
		r2[r][f]=r1[r][f];
	}
}

void resetCastlingRegistries(Board* b){
	for(int ci=0;ci<numplayers;ci++){
		for(int cs=0;cs<MAX_CASTLING_SIDES;cs++){
			b->castregs[ci][cs].right=0;
			for(int si=0;si<(MAX_FILES+1);si++){
				b->castregs[ci][cs].emptysqs[si].f=-1;
				b->castregs[ci][cs].emptysqs[si].r=-1;
				b->castregs[ci][cs].passingsqs[si].f=-1;
				b->castregs[ci][cs].passingsqs[si].r=-1;
			}
		}		
	}
}

void setNumFiles(uint8_t nf){
	numfiles=nf;
	lastfile=nf-1;
}

void setNumRanks(uint8_t nr){
	numranks=nr;
	lastrank=nr-1;
}

uint8_t getNumFiles(){return numfiles;}

uint8_t getNumRanks(){return numranks;}

uint8_t getNumPlayers(){return numplayers;}

uint8_t isMoveRoughlyEqualTo(Move m1,Move m2){
	return (
		isSquareEqualTo(m1.fsq,m2.fsq) &&
		isSquareEqualTo(m1.tsq,m2.tsq) &&
		( m1.prompiece.kind == m2.prompiece.kind )
	);
}

uint8_t piece_kind_buff[MAX_PIECES+1];

uint8_t* allPieceKinds(Board* b){
	uint8_t* pptr=(uint8_t*)&piece_kind_buff;
	*pptr++='p';
	*pptr++='n';
	*pptr++='b';
	*pptr++='r';
	*pptr++='q';
	*pptr++='k';
	*pptr++=0;
	return (uint8_t*)&piece_kind_buff;
}

Square whereIsKing(Board* b,uint8_t color){
	for(uint8_t f=0;f<numfiles;f++) for(uint8_t r=0;r<numranks;r++)
		if((b->rep[r][f].kind=='k')&&(b->rep[r][f].color==color)) return (Square){f,r};
	return (Square){-1,-1};
}

void pseudoLegalVectorMovesForPieceAt(Board *b,int df,int dr,uint8_t single,Piece p,uint8_t f,uint8_t r){	
	int cf=f+df;
	int cr=r+dr;

	while(fileRankOk(b,cf,cr)){		
		Piece topiece=b->rep[cr][cf];		
		uint8_t toempty=(topiece.kind=='-');
		uint8_t tosamecolor=(topiece.color==p.color);		
		if((!toempty)&&(tosamecolor)){			
			// bumped into own piece						
			return;
		} else {
			if(!b->checkattack){
				defaultMove(b);
				b->tempmove.fsq.f=f;
				b->tempmove.fsq.r=r;
				b->tempmove.tsq.f=cf;
				b->tempmove.tsq.r=cr;
			}
			if(toempty){
				if(!b->checkattack){
					recordMove(b);	
				}				
			} else {
				// capture											
				if(b->checkattack){
					if(b->rep[cr][cf].kind==p.kind){
						b->isattack=1;						
					}
					return;
				} else {
					b->tempmove.capture=1;
					recordMove(b);				
					return;
				}
			}
		}		
		if(single){
			return;
		}
		cf+=df;
		cr+=dr;		
	}
}

void pseudoLegalMovesForPieceAt(Board *b,Piece p,uint8_t f,uint8_t r){	
	if(p.kind=='p'){
		Square sq=(Square){f,r};
		Square pdir=pawnDirection(b,p.color);
		Square advanceOneSq=plusSquare(sq,pdir);
		Square advanceTwoSq=plusSquare(advanceOneSq,pdir);
		// pawn pushes
		if((!b->checkattack)&&isSquareValid(b,advanceOneSq)){
			if(isSquareEmpty(b,advanceOneSq)){
				// pawn push by one
				defaultMove(b);
				b->tempmove.fsq=sq;
				b->tempmove.tsq=advanceOneSq;
				b->tempmove.pawnmove=1;
				b->tempmove.pawnpush=1;
				if(isSquareValid(b,advanceTwoSq)){
					// normal push
					recordMove(b);	
				} else {
					// promotion push
					b->tempmove.promotion=1;
					recordPromotionMove(b);
				}				
				Square backonesquare=minusSquare(sq,pdir);
				if(isSquareValid(b,backonesquare)){
					Square backtwosquares=minusSquare(backonesquare,pdir);
					if(!isSquareValid(b,backtwosquares)){						
						if(isSquareValid(b,advanceTwoSq)){
							if(isSquareEmpty(b,advanceTwoSq)){
								// pawn push by two
								defaultMove(b);
								b->tempmove.fsq=sq;
								b->tempmove.tsq=advanceTwoSq;
								b->tempmove.pawnmove=1;
								b->tempmove.pawnpush=1;
								b->tempmove.pawnpushbytwo=1;
								b->tempmove.epsq=advanceOneSq;
								b->tempmove.epclsq=advanceTwoSq;
								recordMove(b);	
							}
						}
					}
				}
			}
		}
		// pawn captures
		for(int dc=-1;dc<=1;dc+=2){
			for(uint8_t ci=0;ci<numplayers;ci++) if(
				( b->checkattack && ((ci+'0')!=p.color) )
				||
				( (!b->checkattack) && ((ci+'0')==p.color) )
			)
			{
				uint8_t effcolor=ci+'0';
				pdir=pawnDirection(b,effcolor);
				Square epdir=effectiveDirection(pdir,dc);
				Square capsq=((b->checkattack)?minusSquare(sq,epdir):plusSquare(sq,epdir));
				if(
					(b->checkattack && isSameColorAtSquare(b,capsq,effcolor))
					||
					((!b->checkattack)&&isDifferentColorAtSquare(b,capsq,p.color))
				){
					// pawn capture
					if((b->checkattack)&&(pieceAtSquare(b,capsq).kind=='p')){
						b->isattack=1;
						return;
					}
					if(!b->checkattack){
						defaultMove(b);
						b->tempmove.fsq=sq;
						b->tempmove.tsq=capsq;
						b->tempmove.pawnmove=1;
						b->tempmove.capture=1;
						Square capaheadsq=plusSquare(capsq,pdir);
						if(isSquareValid(b,capaheadsq)){
							// normal capture
							recordMove(b);		
						} else {
							// promotion capture
							b->tempmove.promotion=1;
							recordPromotionMove(b);
						}				
					}
				} else if((!b->checkattack)&&hasEpSquare(b,capsq).has){
					// ep capture
					Square eppdir=pawnDirection(b,hasEpSquare(b,capsq).color);
					Square epclsq=plusSquare(capsq,eppdir);
					if(isDifferentColorAtSquare(b,epclsq,p.color)){
						defaultMove(b);
						b->tempmove.fsq=sq;
						b->tempmove.tsq=capsq;
						b->tempmove.pawnmove=1;
						b->tempmove.capture=1;
						b->tempmove.epcapture=1;
						b->tempmove.epsq=capsq;
						b->tempmove.epclsq=epclsq;
						recordMove(b);
					}
				}
			}
		}
	} else {
		if(p.kind=='n'){			
			for(int df=-2;df<=2;df++){
				for(int dr=-2;dr<=2;dr++){
					if(absv(df*dr)==2){												
						pseudoLegalVectorMovesForPieceAt(b,df,dr,1,p,f,r);
						if((b->checkattack)&&(b->isattack)){
							return;
						}						
					}
				}
			}
		} else {
			for(int df=-1;df<=1;df++){
				for(int dr=-1;dr<=1;dr++){
					uint8_t vectdiagonal=(absv(df*dr)==1);
					uint8_t vectstraight=((absv(df)+absv(dr))==1);
					uint8_t single=(p.kind=='k')?1:0;
					uint8_t kind=p.kind;
					uint8_t straight=((kind=='k')||(kind=='r')||(kind=='q'));
					uint8_t diagonal=((kind=='k')||(kind=='b')||(kind=='q'));
					if((straight && vectstraight)||(diagonal && vectdiagonal)){
						pseudoLegalVectorMovesForPieceAt(b,df,dr,single,p,f,r);
						if((b->checkattack)&&(b->isattack)){
							return;
						}
					}
				}
			}
		}
	}
}

uint8_t isSquareAttacked(Board* b,Square sq,uint8_t color){
	uint8_t* pptr=allPieceKinds(b);
	while(*pptr!=0){
		Piece testpiece=(Piece){*pptr,color};
		b->isattack=0;		
		b->checkattack=1;
		pseudoLegalMovesForPieceAt(b,testpiece,sq.f,sq.r);
		b->checkattack=0;
		if(b->isattack) return 1;
		pptr++;
	}
	return 0;
}

uint8_t isInCheck(Board* b,uint8_t color){
	if(variant==VARIANT_ATOMIC){
		if(kingsAdjacent(b)) return 0;
		if(isExploded(b,color)) return 1;
		if(isExploded(b,invColor(color))) return 0;
	}

	Square wk=whereIsKing(b,color);
	if((wk.f<0)||(wk.r<0)) return 1;	
	return isSquareAttacked(b,wk,color);
}

uint8_t sanbuff[MAX_SAN_LENGTH+1];

void makeMove(Board* b,Move m){
	if(!b->test){
	/////////////////////////////////////////////////////////////////
	// save board state before making move
	_memcpy((uint8_t*)b,(uint8_t*)&b->current->b,sizeof(Board));	
	/////////////////////////////////////////////////////////////////
	}

	if(!b->test){
		m=toRichMove(b,m);

		if(m.invalid) return;

		moveToSan(b,m,sanbuff);
	}

	uint8_t ff=m.fsq.f;
	uint8_t fr=m.fsq.r;
	uint8_t tf=m.tsq.f;
	uint8_t tr=m.tsq.r;

	Piece frompiece=b->rep[fr][ff];
	Piece topiece=b->rep[tr][tf];

	b->rep[fr][ff].kind='-';
	b->rep[fr][ff].color='0';

	if(m.epcapture){
		Square clsq=m.epclsq;
		b->rep[clsq.r][clsq.f].kind='-';
		b->rep[clsq.r][clsq.f].color='0';
	}

	if(m.castling){				
		for(int cs=0;cs<MAX_CASTLING_SIDES;cs++){
			CastlingRegistry cr=b->castregs[b->turn-'0'][cs];						
			if(isSquareEqualTo(m.tsq,cr.rooksq)){
				b->rep[cr.rooksq.r][cr.rooksq.f]=(Piece){'-','0'};
				Square pdir=pawnDirection(b,b->turn);
				Square cdir=rotateSquare(pdir,cs==0?1:-1);
				Square rookto=plusSquare(m.fsq,cdir);
				Square kingto=plusSquare(rookto,cdir);
				b->rep[rookto.r][rookto.f]=(Piece){'r',b->turn};
				b->rep[kingto.r][kingto.f]=(Piece){'k',b->turn};
				break;
			}
		}
	} else {
		if((variant==VARIANT_ATOMIC)&&(m.capture)){
			b->rep[tr][tf].kind='-';
			b->rep[tr][tf].color='0';
		} else {
			b->rep[tr][tf].kind=frompiece.kind;
			b->rep[tr][tf].color=frompiece.color;
		}
	}

	if((variant==VARIANT_ATOMIC)&&(m.capture)){
		for(int df=-1;df<=1;df++)
		for(int dr=-1;dr<=1;dr++)
		{
			Square testsq=plusSquare(m.tsq,(Square){df,dr});
			if(isSquareValid(b,testsq)){
				if(pieceAtSquare(b,testsq).kind!='p'){
					b->rep[testsq.r][testsq.f].kind='-';
					b->rep[testsq.r][testsq.f].color='0';
				}
			}
		}
	}

	for(int ci=0;ci<numplayers;ci++)
	for(int cs=0;cs<MAX_CASTLING_SIDES;cs++){
		CastlingRegistry cr=b->castregs[ci][cs];
		if(cr.right){
			Piece kp=pieceAtSquare(b,cr.kingsq);
			Piece rp=pieceAtSquare(b,cr.rooksq);
			uint8_t color=ci+'0';
			if(
				kp.kind!='k' ||
				kp.color!=color ||
				rp.kind!='r' ||
				rp.color!=color
			) b->castregs[ci][cs].right=0;
		}
	}

	if(m.promotion){
		b->rep[tr][tf].kind=m.prompiece.kind;
		b->rep[tr][tf].color=b->turn;
	}

	if(m.pawnpushbytwo){
		int colindex=frompiece.color-'0';
		b->epsqs[colindex].epsq=m.epsq;
		b->epsqs[colindex].epclsq=m.epclsq;
		b->epsqs[colindex].cnt=numplayers;
	}

	for(int ei=0;ei<numplayers;ei++){
		if(b->epsqs[ei].cnt>0) b->epsqs[ei].cnt--;
	}

	advanceTurn(b);

	advanceClocks(b,m);

	if(!b->test){
	/////////////////////////////////////////////////////////////////
	// create gamenode
	GameNode* movenode=getmovenode(b->current,m);
	if(movenode==0){				
		if(b->current->child!=0) freeallchilds(b->current->child);
		b->current->child=0;

		GameNode* child=allocate_gamenode();
		if(child==0) return; // out of memory

		GameNode* ls=getlastsibling(b->current);

		if(b->current->child==0){
			b->current->child=child;
		}

		child->genmove=m;
		_strcpys(sanbuff,child->gensan,MAX_SAN_LENGTH);
		child->parent=b->current;
		child->child=0;		

		child->prevsibling=ls;
		if(ls!=0){
			ls->nextsibling=child;
		}
		child->nextsibling=0;

		b->current=child;

		// save board state in new node
		_memcpy((uint8_t*)b,(uint8_t*)&child->b,sizeof(Board));		
	} else {
		b->current=movenode;
	}
	/////////////////////////////////////////////////////////////////
	}

	positionChanged(b);
}

Move toRichMove(Board* b,Move m){
	if(b->test){
		legalMovesForColor(b,b->turn);
	}

	b->mptr=legalmovebuff;

	while(!b->mptr->invalid){
		if(isMoveRoughlyEqualTo(m,*b->mptr)) return *b->mptr;
		b->mptr++;
	}

	m.invalid=1;
	return m;
}

void pseudoLegalMovesForColor(Board *b,uint8_t color){	
	if(!b->santomove){
		b->mptr=legalmovebuff;
	}

	for(uint8_t f=0;f<numfiles;f++){
		for(uint8_t r=0;r<numranks;r++){
			Piece p=b->rep[r][f];						
			if((p.kind!='-')&&(p.color==color)){				
				pseudoLegalMovesForPieceAt(b,p,f,r);				
			}
		}
	}

	if(!b->santomove){
		b->mptr->invalid=1;
	}
}

void legalMovesForColor(Board* b,uint8_t color){
	b->santomove=0;
	b->excludechecks=1;
	pseudoLegalMovesForColor(b,b->turn);

	for(int cs=0;cs<MAX_CASTLING_SIDES;cs++){
		CastlingRegistry cr=b->castregs[color-'0'][cs];
		if(cr.right){			
			uint8_t rightok=1;
			int ei=0;
			while((cr.emptysqs[ei].f>=0)&&(cr.emptysqs[ei].r>=0)){				
				if(!isSquareEmpty(b,cr.emptysqs[ei])){
					rightok=0;
					break;
				}
				ei++;
			}			
			int pi=0;
			if(rightok) while((cr.passingsqs[pi].f>=0)&&(cr.passingsqs[pi].r>=0)){
				if(isSquareAttacked(b,cr.passingsqs[pi],color)){
					rightok=0;
					break;
				}
				pi++;
			}
			if(rightok){				
				Move m;
				setDefaultsOnMove(&m);				
				m.fsq=cr.kingsq;
				m.tsq=cr.rooksq;
				m.castling=1;
				m.invalid=0;
				*b->mptr++=m;				
				(*b->mptr).invalid=1;
			}
		}
	}
}

str reportGame(str ptr){
	GameNode* current=b.root;

	do{
		current=getlastsibling(current);
		if(current!=0){
			ptr=moveToAlgeb(&b,current->genmove,0,ptr);
			if(current==b.current){
				*ptr++='*';
			}
			*ptr++=' ';
			*ptr++='>';
			*ptr++=' ';
		}
	} while(current!=0);

	return ptr;
}

void back(){
	GameNode* parent=b.current->parent;
	if(parent!=0){
		b.current=parent;		
		_memcpy((uint8_t*)&b.current->b,(uint8_t*)&b,sizeof(Board));		
		positionChanged(&b);
	}
}

void forward(){
	GameNode* lastsibling=getlastsibling(b.current);
	if(lastsibling!=0){
		b.current=lastsibling;
		_memcpy((uint8_t*)&b.current->b,(uint8_t*)&b,sizeof(Board));
		positionChanged(&b);
	}
}

void delete(){
	freeallchilds(b.current);
	back();
	b.current->child=0;	
}

void tobegin(){
	b.current=b.root;
	_memcpy((uint8_t*)&b.current->b,(uint8_t*)&b,sizeof(Board));		
	positionChanged(&b);
}

void toend(){	
	while(getlastsibling(b.current)!=0){
		b.current=getlastsibling(b.current);
	}
	_memcpy((uint8_t*)&b.current->b,(uint8_t*)&b,sizeof(Board));	
	positionChanged(&b);
}

void tonode(GameNode* gn){
	b.current=gn;
	_memcpy((uint8_t*)&b.current->b,(uint8_t*)&b,sizeof(Board));	
	positionChanged(&b);
}

uint8_t castleSideLetterToIndex(Board* b,uint8_t color,uint8_t sideletter){
	if(variant<FOUR_PLAYER_BASE){
		if(color=='0') return (sideletter=='s')?0:1;
		else return (sideletter=='s')?1:0;
	} else {
		return (sideletter=='s')?0:1;
	}	
}

uint8_t castleIndexToSideLetter(Board* b,uint8_t ci,uint8_t cs){
	if(variant<FOUR_PLAYER_BASE){
		if(ci==0) return (cs==0)?'s':'l';
		return (cs==1)?'s':'l';
	} else {
		return (cs==0)?'s':'l';
	}
}

Square longCastlingDirection(Board* b,uint8_t color){
	Square pdir=pawnDirection(b,color);
	Square cdir=rotateSquare(pdir,1);				
	if(variant<FOUR_PLAYER_BASE){
		if(color=='0') cdir=rotateSquare(pdir,-1);
	} else cdir=rotateSquare(pdir,-1);
	return cdir;
}

Square sideCastlingDirection(Board* b,uint8_t color,uint8_t cs){
	Square pdir=pawnDirection(b,color);
	Square cdir=rotateSquare(pdir,cs==0?1:-1);				
	return cdir;
}

str moveToSan(Board* b,Move m,str ptr){
	m=toRichMove(b,m);
	if(m.invalid){
		*ptr++='-';
		*ptr=0;
		return ptr;
	}
	Piece frompiece=pieceAtSquare(b,m.fsq);
	if(frompiece.kind=='p'){
		if(m.capture){
			// pawn capture
			Square pdir=pawnDirection(b,frompiece.color);
			if(pdir.r!=0){
				// identify by file
				*ptr++=m.fsq.f+'a';
			} else {
				// identify by rank
				*ptr++=lastrank-m.fsq.r+'1';
			}
			*ptr++='x';			
		} else {
			// pawn push, no specifier needed
		}
		// add target square anyhow
		ptr=squareToAlgeb(b,m.tsq,ptr);		
	} else if(m.castling) {
		// castling
		*ptr++='O';*ptr++='-';*ptr++='O';
		Square cdir=longCastlingDirection(b,frompiece.color);
		Square cvect=normalizeSquare(minusSquare(m.tsq,m.fsq));
		if(isSquareEqualTo(cvect,cdir)){
			*ptr++='-';*ptr++='O';
		}
	} else {
		// normal piece move		
		Piece testpiece=(Piece){frompiece.kind,'z'};										

		b->same=0;
		b->samefile=0;
		b->samerank=0;
		b->fsq=m.fsq;
		b->frompiece=frompiece;
		b->tosan=1;
		pseudoLegalMovesForPieceAt(b,testpiece,m.tsq.f,m.tsq.r);		
		b->tosan=0;
		
		*ptr++=frompiece.kind+'A'-'a';
		if(b->same>1){
			if(b->samefile<=1){
				*ptr++=m.fsq.f+'a';
			} else if(b->samerank<=1){
				*ptr++=lastrank-m.fsq.r+'1';
			} else {
				*ptr++=m.fsq.f+'a';
				*ptr++=lastrank-m.fsq.r+'1';
			}
		}
		if(m.capture){
			*ptr++='x';
		}
		ptr=squareToAlgeb(b,m.tsq,ptr);		
	}
	if(m.promotion){
		*ptr++='=';
		*ptr++=m.prompiece.kind+'A'-'a';
	}
	*ptr=0;
	return ptr;
}

uint8_t* sanToMoveEndPtr;

Move sanToMove(Board* b,str san){	
	Move m;
	setDefaultsOnMove(&m);
	m.invalid=1;

	Tokenizer tinst;
	Tokenizer* t=&tinst;
	t->b=b;
	t->cptr=san;

	pullCastling(t);
	if(t->castling!='-'){
		int cs=castleSideLetterToIndex(b,b->turn,t->castling);
		CastlingRegistry cr=b->castregs[b->turn-'0'][cs];
		m.fsq=cr.kingsq;
		m.tsq=cr.rooksq;
		m.invalid=0;

		sanToMoveEndPtr=t->cptr;

		return m;
	}

	pullKind(t);
	uint8_t kind=t->kind;
	if(kind=='-') kind='p';
	pullSquare(t);
	Square sq1=t->sq;
	pullSquare(t);
	Square sq2=t->sq;
	pullPromPiece(t);
	uint8_t promkind=t->kind;	
	Square fsq=sq1;
	Square tsq=sq2;
	if((tsq.f<0)&&(tsq.r<0)){
		tsq=sq1;
		fsq.f=-1;
		fsq.r=-1;
	}	
	if(!isSquareValid(b,tsq)){
		return m;
	}
	m.tsq=tsq;
	m.fsq=fsq;
	if(promkind!='-'){		
		m.prompiece=(Piece){promkind,b->turn};
	}	

	b->kind=kind;
	b->m=m;
	b->rm.invalid=1;
	b->santomove=1;
	pseudoLegalMovesForColor(b,b->turn);
	b->santomove=0;

	sanToMoveEndPtr=t->cptr;

	return b->rm;
}

uint8_t nextChar(Tokenizer* t){
	while(*t->cptr!=0){
		uint8_t c=*t->cptr;		
		if(c=='x'){
			// ignore
			t->cptr++;
		} else {
			return c;
		}
	}
	return 0;
}

void pullKind(Tokenizer* t){
	t->kind='-';
	uint8_t c=nextChar(t);
	if((c>='A')&&(c<='Z')){
		t->kind=c+'a'-'A';
		t->cptr++;
	}
}

void pullFile(Tokenizer* t){
	t->f=-1;
	uint8_t c=nextChar(t);
	if((c>='a')&&(c<='z')){
		t->f=c-'a';
		t->cptr++;
	}
}

void pullRank(Tokenizer* t){
	t->r=-1;
	uint8_t c=nextChar(t);
	if((c>='0')&&(c<='9')){
		uint8_t num=0;
		while((c>='0')&&(c<='9')){
			num=num*10+c-'0';		
			t->cptr++;
			c=nextChar(t);
		}
		t->r=lastrank-(num-1);
	}
}

void pullColorIndex(Tokenizer* t){
	t->ci=-1;
	uint8_t c=nextChar(t);
	if((c>='0')&&(c<='9')){
		uint8_t num=0;
		while((c>='0')&&(c<='9')){
			num=num*10+c-'0';		
			t->cptr++;
			c=nextChar(t);
		}
		t->ci=num;
	}
}

void pullSquare(Tokenizer* t){
	pullFile(t);
	pullRank(t);
	t->sq=(Square){t->f,t->r};
}

void pullPromPiece(Tokenizer* t){
	t->kind='-';
	uint8_t c=nextChar(t);
	if(c=='='){
		t->cptr++;
		c=nextChar(t);
		if(c!=0){			
			if((c>='A')&&(c<='Z')){
				t->kind=c+'a'-'A';
				t->cptr++;
			}
			if((c>='a')&&(c<='z')){
				t->kind=c;
				t->cptr++;
			}
		}
	}
}

void pullCastling(Tokenizer *t){
	t->castling='-';
	uint8_t c=nextChar(t);
	if(c=='O'){
		t->cptr++;
		c=nextChar(t);
		if(c=='-'){
			t->cptr++;
			c=nextChar(t);
			{
				if(c=='O'){
					t->cptr++;
					c=nextChar(t);
					if(c=='-'){
						t->cptr++;
						c=nextChar(t);
						if(c=='O'){
							t->cptr++;
							t->castling='l';
							return;
						}
					} else {
						t->castling='s';
						return;
					}
				}
			}
		}
	}
}

void createCastlingRegistries(Board* b){
	for(uint8_t ci=0;ci<numplayers;ci++)	
	for(uint8_t cs=0;cs<MAX_CASTLING_SIDES;cs++)
	{
		b->castregs[ci][cs].right=1;
		uint8_t color=ci+'0';		
		Square wk=whereIsKing(b,color);
		// check if there is a king
		if(isSquareValid(b,wk)){
			Square cdir=sideCastlingDirection(b,color,cs);
			Square pass1=plusSquare(wk,cdir);
			Square pass2=plusSquare(pass1,cdir);
			// check whether king is able to move two squares in the castling direction
			if((!isSquareValid(b,pass1))||(!isSquareValid(b,pass2))){
				b->castregs[ci][cs].right=0;	
			} else {
				b->castregs[ci][cs].kingsq=wk;
				b->castregs[ci][cs].passingsqs[0]=wk;
				b->castregs[ci][cs].passingsqs[1]=pass1;
				b->castregs[ci][cs].passingsqs[2]=pass2;
				b->castregs[ci][cs].passingsqs[3]=(Square){-1,-1};
				Square lastrooksq=(Square){-1,-1};
				Square rooktest=pass1;
				while(isSquareValid(b,rooktest)){
					Piece p=pieceAtSquare(b,rooktest);
					if((p.kind=='r')&&(p.color==color)){
						lastrooksq=rooktest;
					}
					rooktest=plusSquare(rooktest,cdir);
				}
				// check if there is a rook
				if(isSquareValid(b,lastrooksq)){
					b->castregs[ci][cs].rooksq=lastrooksq;
					// register empty squares between rook and king
					rooktest=minusSquare(lastrooksq,cdir);
					uint8_t ei=0;
					while(!isSquareEqualTo(rooktest,wk)){
						b->castregs[ci][cs].emptysqs[ei++]=rooktest;
						rooktest=minusSquare(rooktest,cdir);
					}
					b->castregs[ci][cs].emptysqs[ei]=(Square){-1,-1};
				} else {
					b->castregs[ci][cs].right=0;
				}
			}
		} else {
			b->castregs[ci][cs].right=0;
		}
	}
}

void sortedLegalSanList(Board* b){
	str ptr=outbuff;

	if(b->test){
		legalMovesForColor(b,b->turn);
	}

	b->mptr=legalmovebuff;	

	ExtendedMove* emptr0=extendedmovebuff;

	ExtendedMove* emptr=emptr0;

	while(!(b->mptr->invalid)){
		_memcpy((uint8_t*)b->mptr,(uint8_t*)&emptr->m,sizeof(Move));		
		moveToSan(b,*b->mptr,(uint8_t*)&emptr->san);		
		b->mptr++;
		emptr++;
	}	

	emptr->m.invalid=1;

	int sortstart=0;	
	
	while(!((emptr0+sortstart)->m.invalid)){		
		int ci=0;		
		while(!((emptr0+ci+sortstart+1)->m.invalid)){
			ExtendedMove* em1=emptr0+ci;
			ExtendedMove* em2=emptr0+ci+1;						
			if(
				(em1->san[0]>em2->san[0])
				||
				((em1->san[0]!='O')&&(em2->san[0]=='O'))
			){
				_swap((uint8_t*)em1,(uint8_t*)em2,sizeof(ExtendedMove));
			} else if(
				(em1->san[0]==em2->san[0])
				&&
				(em1->m.capture>em2->m.capture)
				){
				_swap((uint8_t*)em1,(uint8_t*)em2,sizeof(ExtendedMove));
			}
			ci++;
		}
		sortstart++;
	}

	emptr=emptr0;	

	uint8_t first=1;

	while(!(emptr->m.invalid)){
		if(first){first=0;}else{*ptr++='\n';}
		ptr=_strcpys((str)&emptr->san,ptr,MAX_SAN_LENGTH);		
		emptr++;		
	}

	*ptr=0;
}

uint8_t colorToChar(uint8_t color){
	switch(color){
		case '0':return 'b';
		case '1':return 'w';
		case '2':return 'y';
		case '3':return 'r';
		default:return '-';
	}
}

uint8_t charToColor(uint8_t c){
	switch(c){
		case 'b':return '0';
		case 'w':return '1';
		case 'y':return '2';
		case 'r':return '3';
		default:return '0';
	}
}

uint8_t kindToAltKind(uint8_t kind){
	switch(kind){
		case 'p':return 'o';
		case 'n':return 'm';
		case 'b':return 'a';
		case 'r':return 's';
		case 'q':return 't';
		case 'k':return 'l';
		default:return '-';
	}
}

uint8_t altKindToKind(uint8_t kind){
	switch(kind){
		case 'o':return 'p';
		case 'm':return 'n';
		case 'a':return 'b';
		case 's':return 'r';
		case 't':return 'q';
		case 'l':return 'k';
		default:return '-';
	}
}

uint8_t pieceToChar(Piece p){
	switch(p.color){
		case '0':return p.kind;
		case '1':return p.kind+'A'-'a';
		case '2':return kindToAltKind(p.kind);
		case '3':return kindToAltKind(p.kind)+'A'-'a';
		default:return '-';
	}	
}

Piece charToPiece(uint8_t c){
	if(c=='-') return (Piece){'-','0'};
	if((c>='1')&&(c<=('1'+MAX_FILES-1))) return (Piece){'#',c-'0'};
	uint8_t isbigcap=0;
	if((c>='A')&&(c<='Z')){
		isbigcap=1;
		c=c+'a'-'A';
	}
	uint8_t isaltkind=0;
	uint8_t altkind=altKindToKind(c);
	if(altkind!='-') isaltkind=1;
	if(!isaltkind){
		return (Piece){c,isbigcap?'1':'0'};
	}
	return (Piece){altkind,isbigcap?'3':'2'};
}

str reportPosFen(Board* b,str ptr){
	uint8_t acc=0;
	for(uint8_t r=0;r<numranks;r++){
		for(uint8_t f=0;f<numfiles;f++){
			Piece p=b->rep[r][f];
			if(p.kind=='-'){
				acc++;
			} else {
				if(acc>0) *ptr++=acc+'0';
				acc=0;
				*ptr++=pieceToChar(p);				
			}
		}
		if(acc>0) *ptr++=acc+'0';
		acc=0;
		*ptr++='/';
	}

	ptr--;

	*ptr=0;
	return ptr;
}

str reportTurnFen(Board* b,str ptr){
	*ptr++=colorToChar(b->turn);

	*ptr=0;
	return ptr;	
}

str reportCastleFen(Board* b,str ptr){
	uint8_t hascastle=0;

	for(uint8_t nci=0;nci<numplayers;nci++){
		uint8_t ci=lastplayer-nci;
		for(uint8_t cs=0;cs<MAX_CASTLING_SIDES;cs++){
			uint8_t sideletter=(cs==0)?'s':'l';
			uint8_t color=ci+'0';
			uint8_t truecs=castleSideLetterToIndex(b,color,sideletter);
			if(b->castregs[ci][truecs].right){
				hascastle=1;
				uint8_t kind=(sideletter=='s')?'k':'q';
				Piece p=(Piece){kind,color};
				*ptr++=pieceToChar(p);
			}
		}
	}

	if(!hascastle) *ptr++='-';

	*ptr=0;
	return ptr;
}

str reportEpFen(Board* b,str ptr){
	uint8_t hasep=0;
	for(uint8_t ci=0;ci<numplayers;ci++){
		if(b->epsqs[ci].cnt>0){
			hasep=1;
			if(variant<FOUR_PLAYER_BASE){
				ptr=squareToAlgeb(b,b->epsqs[ci].epsq,ptr);
			} else {
				*ptr++=ci+'0';*ptr++=':';
				ptr=squareToAlgeb(b,b->epsqs[ci].epsq,ptr);
				*ptr++='#';
				ptr=printNumber(b->epsqs[ci].cnt,ptr);
				*ptr++=';';
			}
		}
	}

	if(!hasep) *ptr++='-';

	*ptr=0;
	return ptr;
}

str reportHalfmoveFen(Board* b,str ptr){
	ptr=printNumber(b->halfmove_clock,ptr);

	*ptr=0;
	return ptr;
}

str reportFullmoveFen(Board* b,str ptr){
	ptr=printNumber(b->fullmove_number,ptr);

	*ptr=0;
	return ptr;
}

str reportFen(Board* b,str ptr){
	ptr=reportPosFen(b,ptr);*ptr++=' ';
	ptr=reportTurnFen(b,ptr);*ptr++=' ';
	ptr=reportCastleFen(b,ptr);*ptr++=' ';
	ptr=reportEpFen(b,ptr);*ptr++=' ';		
	ptr=reportHalfmoveFen(b,ptr);*ptr++=' ';
	ptr=reportFullmoveFen(b,ptr);

	return ptr;
}

uint8_t setFromPosFen(Board* b,str ptr){
	uint8_t r=0;
	uint8_t f=0;

	while(*ptr!=0){
		if(*ptr=='/'){
		} else {
			Piece p=charToPiece(*ptr);
			if(p.kind=='#'){
				for(uint8_t cnt=0;cnt<p.color;cnt++){
					if(f>lastfile) return 1;
					b->rep[r][f]=(Piece){'-','0'};
					f++;
				}				
				if(f>lastfile){
					f=0;
					r++;
					if(r>lastrank){
						return 1;
					}
				}
			} else {
				b->rep[r][f]=p;
				f++;
				if(f>lastfile){
					f=0;
					r++;
					if(r>lastrank){
						return 1;
					}
				}
			}
		}
		ptr++;
	}

	return 1;
}

uint8_t setFromTurnFen(Board* b,str ptr){
	b->turn=charToColor(*ptr);

	return 1;
}

uint8_t setFromCastleFen(Board* b,str ptr){
	Board testb;
	resetCastlingRegistries(&testb);

	if(*ptr!='-'){
		while(*ptr!=0){
			Piece p=charToPiece(*ptr);		
			uint8_t sideletter=(p.kind=='k')?'s':'l';
			uint8_t ci=p.color-'0';
			uint8_t cs=castleSideLetterToIndex(b,p.color,sideletter);
			testb.castregs[ci][cs].right=1;
			ptr++;
		}
	}

	for(uint8_t ci=0;ci<numplayers;ci++)
	for(uint8_t cs=0;cs<MAX_CASTLING_SIDES;cs++)
	{
		if(!testb.castregs[ci][cs].right) b->castregs[ci][cs].right=0;
	}

	return 1;
}

uint8_t setFromEpFen(Board* b,str ptr){
	if(*ptr=='-') return 1;

	Tokenizer tinst;
	Tokenizer* t=&tinst;
	t->b=b;
	t->cptr=ptr;

	if(variant<FOUR_PLAYER_BASE){
		pullSquare(t);

		if(isSquareValid(b,t->sq)){
			uint8_t ci='1'-b->turn;
			EpSquare epsq;
			epsq.epsq=t->sq;
			Square pdir=pawnDirection(b,b->turn);
			epsq.epclsq=minusSquare(t->sq,pdir);
			epsq.cnt=1;
			b->epsqs[ci]=epsq;
		}

		return 1;
	}

	do{
		pullColorIndex(t);

		if(t->r<0) return 1;

		uint8_t ci=t->ci;
		uint8_t color=ci+'0';

		t->cptr++;

		pullSquare(t);

		if(isSquareValid(b,t->sq)){			
			EpSquare epsq;			
			epsq.epsq=t->sq;
			Square pdir=pawnDirection(b,color);
			epsq.epclsq=plusSquare(t->sq,pdir);

			t->cptr++;

			pullColorIndex(t);

			if(t->r<0) return 1;

			epsq.cnt=t->ci;

			b->epsqs[ci]=epsq;
		} else {
			return 1;
		}

		t->cptr++;
	}while(1);

	return 1;
}

uint8_t setFromHalfmoveFen(Board* b,str ptr){
	ParseResult pr=parseInt(ptr);

	b->halfmove_clock=pr.num;

	return 1;
}

uint8_t setFromFullmoveFen(Board* b,str ptr){
	ParseResult pr=parseInt(ptr);

	b->fullmove_number=pr.num;

	return 1;
}

uint8_t setFromFen(Board* b,str fen){
	SplitResult* sr=split(fen,' ');
	if(sr->numchunks!=6) return 0;	
	uint8_t test=b->test;
	Board testb;	
	resetBoardOnly(&testb);
	if(!setFromPosFen(&testb,sr->chunks[0])) return 0;
	if(!setFromTurnFen(&testb,sr->chunks[1])) return 0;
	if(!setFromCastleFen(&testb,sr->chunks[2])) return 0;
	if(!setFromEpFen(&testb,sr->chunks[3])) return 0;
	if(!setFromHalfmoveFen(&testb,sr->chunks[4])) return 0;
	if(!setFromFullmoveFen(&testb,sr->chunks[5])) return 0;
	_memcpy((uint8_t*)&testb,(uint8_t*)b,sizeof(Board));
	b->test=test;
	positionChanged(b);
	return 1;
}

uint8_t isMovePromotion(Board* b,Move m){
	m.prompiece.kind='q';
	Move rm=toRichMove(b,m);
	return !rm.invalid;
}

str flushPgn(str ptr){
	uint8_t commenton=0;

	while(*ptr!=0){
		if(commenton){
			if(*ptr=='}') commenton=0;
		} else {
			if(*ptr=='{') commenton=1;
			else if(isLetter(*ptr)) return ptr;
		}
		ptr++;
	}

	return ptr;
}

str flushSpace(str ptr){
	while(*ptr!=0){
		if(*ptr!=' ') return ptr;
		ptr++;
	}
	
	return ptr;
}

uint8_t vnb[100];

str codeToVariantName(int v){	
	switch(v){
		case VARIANT_STANDARD:
			vnb[0]='S';vnb[1]='t';vnb[2]='a';vnb[3]='n';vnb[4]='d';vnb[5]='a';vnb[6]='r';vnb[7]='d';vnb[8]=0;break;
		case VARIANT_ATOMIC:
			vnb[0]='A';vnb[1]='t';vnb[2]='o';vnb[3]='m';vnb[4]='i';vnb[5]='c';vnb[6]=0;break;
		case VARIANT_FOUR_PLAYER:
			vnb[0]='F';vnb[1]='o';vnb[2]='u';vnb[3]='r';vnb[4]=' ';vnb[5]='P';vnb[6]='l';vnb[7]='a';vnb[8]='y';vnb[9]='e';vnb[10]='r';vnb[11]=0;break;
		default:vnb[0]='-';vnb[1]=0;
	}
	return vnb;
}

uint8_t kingsAdjacent(Board* b){
	Square wkw=whereIsKing(b,'1');
	if(!isSquareValid(b,wkw)) return 0;
	Square wkb=whereIsKing(b,'0');
	if(!isSquareValid(b,wkb)) return 0;
	int dfa=absv(wkw.f-wkb.f);
	int dra=absv(wkw.r-wkb.r);
	return (dfa<=1)&&(dra<=1);
}

uint8_t invColor(uint8_t color){
	return 1 + 2 * '0' - color;
}

uint8_t isExploded(Board* b,uint8_t color){
	return !isSquareValid(b,whereIsKing(b,color));
}

void positionChanged(Board* b){
	if(!b->test){
		legalMovesForColor(b,b->turn);	
	}
}
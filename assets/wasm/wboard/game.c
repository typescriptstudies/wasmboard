#include "game.h"

uint8_t game_initialized=0;

GameNode root_gamenode;
GameNode gamenodes[MAX_GAMENODES];
GameNode* gamenodeslist[MAX_GAMENODES+1];

Headers headers;

void clear_headers(){
	for(int hi=0;hi<MAX_HEADERS;hi++){
		headers.headers[hi].key[0]=0;
	}
}

void init_game(){
	for(int i=0;i<MAX_GAMENODES;i++){
		gamenodes[i].free=1;
	}
	clear_headers();
	game_initialized=1;
}

extern GameNode* allocate_gamenode(){
	for(int i=0;i<MAX_GAMENODES;i++){
		if(gamenodes[i].free){
			gamenodes[i].free=0;
			return &gamenodes[i];
		}
	}
	return 0;
}

GameNode* getmovenode(GameNode* gn,Move m){
	if(gn->child==0) return 0;
	GameNode* search=gn->child;
	while(search!=0){
		if(isMoveRoughlyEqualTo(search->genmove,m)){
			return search;
		}
		search=search->nextsibling;
	}
	return 0;
}

GameNode* getlastsibling(GameNode* gn){	
	if(gn->child==0) return 0;
	GameNode* search=gn->child;
	while(search->nextsibling!=0){		
		search=search->nextsibling;
	};
	return search;
}

GameNode** allchildsrecursive(GameNode* gn,GameNode** gptr){			
	if(gn==0) return gptr;
	do{	
		*gptr++=gn;				
		gptr=allchildsrecursive(gn->child,gptr);
		gn=gn->nextsibling;			
	} while(gn!=0);
	return gptr;
}

GameNode** allchilds(GameNode* gn){
	GameNode** gptr=allchildsrecursive(gn,gamenodeslist);

	*gptr=0;

	return gamenodeslist;
}

void freeallchilds(GameNode* gn){
	GameNode** gptr=allchilds(gn);

	while(*gptr!=0){
		(*gptr)->free=1;

		gptr++;
	}
}

void allocateHeader(){
	for(int hi=0;hi<MAX_HEADERS;hi++){
		if(headers.headers[hi].key[0]==0){
			headers.hi=hi;
			return;
		}
	}
	headers.hi=-1;
}

void lookUpHeader(){
	for(int hi=0;hi<MAX_HEADERS;hi++){
		if(_strcmp(headers.headers[hi].key,headers.key)){
			headers.hi=hi;
			return;
		}
	}
	headers.hi=-1;
}

void setHeader(){
	lookUpHeader();
	if(headers.hi<0) allocateHeader();
	if(headers.hi>=0){
		if(headers.value[0]==0){
			headers.headers[headers.hi].key[0]=0;
		} else {
			_strcpys(headers.key,headers.headers[headers.hi].key,MAX_HEADER_KEY_SIZE);
			_strcpys(headers.value,headers.headers[headers.hi].value,MAX_HEADER_VALUE_SIZE);
		}
	}
}

void getHeader(){
	lookUpHeader();
	if(headers.hi>=0){
		_strcpys(headers.headers[headers.hi].key,headers.key,MAX_HEADER_KEY_SIZE);
		_strcpys(headers.headers[headers.hi].value,headers.value,MAX_HEADER_VALUE_SIZE);	
	} else {
		headers.key[0]=0;
		headers.value[0]=0;
	}
}

void parseHeaders(){
	headers.parseend=headers.parsestart;

	str parse=headers.parsestart;

	uint8_t headeron=0;
	uint8_t nameon=0;
	uint8_t valueon=0;

	str namestart;
	str valuestart;

	while(*parse!=0){
		if(headeron){
			if(nameon){
				if(!isLetter(*parse)){
					uint8_t temp=*parse;
					*parse=0;
					_strcpys(namestart,headers.key,MAX_HEADER_KEY_SIZE);
					*parse=temp;
					nameon=0;
				}
			} else if(valueon){
				if(*parse=='"'){
					*parse=0;
					_strcpys(valuestart,headers.value,MAX_HEADER_VALUE_SIZE);
					setHeader();
					*parse='"';
					valueon=0;
				}
			}
			else if(*parse==']'){
				headeron=0;				
				headers.parseend=parse+1;
			} else if(isLetter(*parse)){
				namestart=parse;
				nameon=1;
			} else if(*parse=='"'){
				valueon=1;
				valuestart=parse+1;
			}
		} else {
			if(*parse=='[') headeron=1;
		}
		parse++;
	}
}

str reportHeaders(str ptr){
	for(int hi=0;hi<MAX_HEADERS;hi++){
		if(headers.headers[hi].key[0]){
			*ptr++='[';
			ptr=printString(headers.headers[hi].key,ptr);
			*ptr++=' ';*ptr++='"';
			ptr=printString(headers.headers[hi].value,ptr);
			*ptr++='"';*ptr++=']';
			*ptr++='\n';
		}
	}

	*ptr++='\n';

	*ptr=0;
	return ptr;
}
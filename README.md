	 __ __   __              
	|__|  |_|  |_.-----.----.
	|  |   _|   _|  -__|   _|
	|__|____|____|_____|__|  


# MISSION

Twitter-like network.  
Decentralized.  
S-I-M-P-L-E.  
A user is a `domain/itterUsername`.  
If by any change you need to change domain, notify about the change in a post and optionally redirect the endpoint to the new location.


# PROS AND CONS

as long as the server you're hosted at holds, everyone can peek in (no quotas)  
host your own node, your school's, your work...  
search isn't part of the solution (not yet at least. you know Twitter just searches the past week now?)  
no followers inward arcs (because we just can't measure that)


# DRAFT

any server can serve one or more itter users

all endpoints are GET, stateless, with CORS headers  

public endpoints are arrays of objects,
new items get appended to the back of the array and should never be erased (just marked irrelevant later on)

public endpoints should support ranged requests


	/<itterUsername>
		
		PUBLIC ENDPOINTS

		/own.json
		/wall.json
		/following.json


		REQUIRES AUTH (secret string in query string)

		/post
		/delete


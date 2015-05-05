	 __ __   __              
	|__|  |_|  |_.-----.----.
	|  |   _|   _|  -__|   _|
	|__|____|____|_____|__|  


# MISSION

Twitter-like network.  
Decentralized.  
S-I-M-P-L-E.  
Everyone can read everything, no private parts.  
A user is a `domain/itterUsername`.  
If by any change you need to change domain, notify about the change in a post and optionally redirect the endpoint to the new location.


# PROS AND CONS

as long as the server you're hosted at holds, everyone can peek in (no quotas)  
host your own node, your school's, your work...  
search isn't part of the solution (not yet at least. you know Twitter just searches the past week now?)  
no followers inward arcs (because we just can't measure that)


# PRINCIPLES AND EXAMPLE API CALLS

any server can serve one or more itter users

all endpoints are GET, stateless, with CORS headers  

public endpoints are arrays of objects,
new items get appended to the back of the array and should never be erased (just marked irrelevant later on)

public endpoints should support ranged requests


	/<itterUsername>
	
	    CREATE USER
	    
	    /new?secret=my_secret
	    
		
		PUBLIC ENDPOINTS (return JSON)
		
		/profile.json
		/posts.json
		/timeline.json
		/following.json
		/post.json?created_at=1430755086024 TODO


		REQUIRES AUTH (secret string in query string; return text such as OK or the error description)

		/post?content=hello%20world
		/delete?post_created_at=1430755086024
		/follow?target_user=http%3A%2F%2F127.0.0.1%3A9999%2Fuser
		/unfollow?target_user=http%3A%2F%2F127.0.0.1%3A9999%2Fuser
		/profile?name=User%203&description=things%20and%20stuff
		/secret?new_secret=my_new_secret


# PROJECT STRUCTURE

As you can see, this is a melting pot of everything.  
If this becomes consistent/useful I promise to refactor/divide things.  
Currently having everything in the same repos makes evolving easier. 

* server implementation in node.js - `serve.js`
* client implementation for browsers in JS - `client.js`
* browser widget (not working yet) - `ux.html` and `ux.js`
* example data for the server implementation - `secrets.json` and files in user folders


# DISCUSSION TOPICS

* who builds each timeline?
    * the server can do it (available now)
    * the client can too
    
* how to reduce traffic and complexity on updates?
    * if we assume each user's `posts.json` endpoint to be **append-only**,
     one can track the response length and in the following refresh request using byte-range header.
     
* how to track followers?
    * so far I'm not even attempting since there's no obvious solution to do so
    * requests for posts could arrive with header telling who's requesting, but this is voluntary/tentative

* how to track favourites?
    * I'm not (can I? should I?)

* RT mechanism
    * a RT may be just a regular post with a field `original`, pointing out to the original post


## TEST MESSY DRAFT

    python -m SimpleHTTPServer 7777 &
    node serve.js
    
visit endpoints such as: <http://127.0.0.1:9999/user1/posts.json>

visit ux <http://127.0.0.1:6666/ux.html>

var CoreysChatApp = CoreysChatApp || {};

CoreysChatApp.Authentication = function() {
	var database = firebase.database();
	var databaseRef = database.ref();
	var databaseUsersRef = database.ref("Users");
	var databaseMessageRef = database.ref("Messages");
	
	/**Set event listeners**/
	function eventListeners() {
		var signIn_btn = document.getElementsByClassName("signIn_btn")[0];
		var loader_gif = document.getElementsByClassName("loader_gif")[0];
		
		// When user clicks the "Sign In" button, log them in as an anonymous user
		signIn_btn.onclick = function() {
			signupOrLogin.style.display = "none";
			loader_gif.style.display = "block";
			
			firebase.auth().signInAnonymously().catch(function(error) {
				// Handle Errors here.
				var errorCode = error.code;
				var errorMessage = error.message;
				console.log("Error on Sign-In!: " + errorCode + " " + errorMessage);
			});
		}
		
		// When user authorization state has changed
		firebase.auth().onAuthStateChanged(function(currentUser) {
			if (currentUser) {
				// User is signed in.
				var chat_application_div = document.getElementById("chat_application");
				var chat_authentication_div = document.getElementById("chat_authentication");
				var isUserInDatabase = false;
				var usersArray = [];
				var userValue = "";
				var users = {};
				
				chat_application.removeChild(chat_authentication_div);
				removeMessagesFromDatabase();
				CoreysChatApp.ChatMenuWindow();
				CoreysChatApp.ChatWindow();
				CoreysChatApp.ChatUsersWindow();
				CoreysChatApp.ChatBox();
				
				// Loops through the database of users (There should only be 2 users)
				databaseUsersRef.on('child_added', function(data) {
					users[data.key] = data.val();
					
					if(Object.keys(users).length == 2){
						
						// Check if user id is already in database for online users
						for (var key in users){
							userValue = users[key];
							if(userValue == currentUser.uid){
								isUserInDatabase = true;
								break;
							}
						}
						
						// If user is not in database, add them to an 'offline' slot
						if(isUserInDatabase == false){ 

							for (var key in users){
								userValue = users[key];
								
								// Update the user database with the uid of the current user
								if(userValue == "offline" ){
									databaseUsersRef.update({
										[key]: currentUser.uid
									});
									var dbUserRef = database.ref("Users/" + key);
									dbUserRef.onDisconnect().set("offline");
									break;
								}
							}	
						}
					}	
				});
			} else {
				// User is signed out.
				console.log("not logged in");
			}
		});
	}
	
	function removeMessagesFromDatabase() {
		databaseMessageRef.remove();
	}
	
	function limitUsers() {
		
	}
	
	eventListeners();
}
CoreysChatApp.ChatMenuWindow = function() {
	var database = firebase.database();
	var databaseRef = database.ref();
	var databaseUsersRef = database.ref("Users");
	var databaseMessageRef = database.ref("Messages");
	var currentUser = firebase.auth().currentUser;
	var users = {};
	var chat_app_div = document.getElementById("chat_application");
	
	// Create HTML for the page
	function render() {
		var HTML = "";
		var chat_app_div = document.getElementById("chat_application");
		
		HTML += '<div id="chat_menu">' +
				'	<button class="logout_btn">Logout</button>' + 
				'	<button class="clear_msgs_btn" >Clear messages</button>' +
				'</div>';
		
		chat_app_div.insertAdjacentHTML('beforeend', HTML);
	}
	
	// Deletes messages from the screeen
	function removeMessages() {
		var chat_window_td = document.getElementById("chat_window_td");
		
		databaseMessageRef.remove();
		chat_window_td.innerHTML = "";
	}
	
	// Logs out of the anonymous user
	function logout() {
		// Loops through the database of users (There should only be 2 users)
		databaseUsersRef.on('child_added', function(data) {
			users[data.key] = data.val();

			if(Object.keys(users).length == 2){
				// Check if user id is already in database for online users
				for (var key in users){
					userValue = users[key];
					if(userValue == currentUser.uid){
						databaseUsersRef.update({
								[key]: "offline"
							});
						break;
					}
				}	
			}
		});
		
		// Sign out
		firebase.auth().signOut().then(function() {
			// Sign-out successful.
			chat_app_div.innerHTML = "";
			renderChatAuthDiv();
			CoreysChatApp.Authentication();
			alert("You have signed out!");
			}, function(error) {
				// An error happened.
				console.log("error signing out");
		});
	}
	
	// Create HTML for login screen
	function renderChatAuthDiv() {
		var HTML = "";
		
		HTML = '<div id="chat_authentication">' +
				'	<fieldset>' +
				'		<legend>Corey\'s Chat App</legend>' +
				'		<img class="loader_gif" src="images/loader.gif" />' +
				'		<div id="signupOrLogin">' +
				'			<button class="signIn_btn auth_btn" >Sign In</button>' +
				'		</div>' +
				'	</fieldset>' +
				'</div>'
				
		chat_app_div.insertAdjacentHTML('beforeend', HTML);
	}
	
	// Set event listeners
	function eventListeners() {
		var clear_msgs_btn = document.getElementsByClassName("clear_msgs_btn")[0];
		var logout_btn = document.getElementsByClassName("logout_btn")[0];
		
		clear_msgs_btn.onclick = function() {	
			removeMessages();
		}
		
		logout_btn.onclick = function() {
			logout();
		}
	}
	
	render();
	eventListeners();
}
CoreysChatApp.ChatWindow = function() {
	
	// Create HTML for the page
	function render() {
		var HTML = "";
		var chat_app_div = document.getElementById("chat_application");
		
		HTML += '<div id="chat_window">' +
				'	<table id="chat_window_table">' +
				'		<tr>' +
				'			<td id="chat_window_td">' +
				'			</td>' +
				'		</tr>' +
				'	</table>' +
				'</div>';
		
		chat_app_div.insertAdjacentHTML('beforeend', HTML);
	}
	
	render();
}
CoreysChatApp.ChatUsersWindow = function() {
	var database = firebase.database();
	var databaseRef = database.ref();
	var databaseUsersRef = database.ref("Users");
	var currentUser = firebase.auth().currentUser;
	
	// Create HTML for the page
	function render() {
		var HTML = "";
		var chat_app_div = document.getElementById("chat_application");
		
		HTML += '<div id="chat_users_window">' +
				'	<div id="chat_users_window_title">Users Window</div>' + 
				'</div>';
		
		chat_app_div.insertAdjacentHTML('beforeend', HTML);
	}
	
	function eventListeners() {
		// When the value of a user changes in the database
		databaseUsersRef.on('value', function(data){
			var users = data.val();
			var userValue = "";
			var userInWindow;
			
			// Loop through database users
			for (var key in users){
				userValue = users[key];
					
				if(userValue == "offline"){ // Remove user from window if they are offline
					removeUserFromWindow(key);
				}
				else if(!userIsInWindow(key)){ // Add user to window if they are offline
					addUserToWindow(key);	
				}
			}
		});
	}
	
	// Adds user to window
		function addUserToWindow(name) {
			this.name = name;
			var chat_users_window_title_div = document.getElementById("chat_users_window_title");
			var chat_user_divs = document.getElementsByClassName("chat_user_div");
			
			chat_users_window_title_div.insertAdjacentHTML('afterend', '<div class="chat_user_div" >' + this.name + '</div>');
		}
		
		// Removes user from window
		function removeUserFromWindow(name) {
			var chat_users_window_div = document.getElementById("chat_users_window");
			var chat_user_divs = document.getElementsByClassName("chat_user_div");
			
			for(i=0; i < chat_user_divs.length; i++){
				userInWindow = chat_user_divs[i].innerHTML;
				if(name == userInWindow){
					chat_users_window_div.removeChild(chat_user_divs[i]);
				}
			}
		}
		
		// Returns true if user is in the window
		function userIsInWindow(name) {
			var chat_user_divs = document.getElementsByClassName("chat_user_div");
			
			for(i=0; i < chat_user_divs.length; i++){
				userInWindow = chat_user_divs[i].innerHTML;
				if(name == userInWindow){
					return true;
				}
			}
		}
	
	render();
	eventListeners();
}
CoreysChatApp.ChatBox = function() {
	var userId = firebase.auth().currentUser.uid;
	var database = firebase.database();
	var databaseRef = database.ref();
	var databaseMessageRef = database.ref("Messages");
	
	function render() {
		var HTML = "";
		var chat_app_div = document.getElementById("chat_application");
		var chat_window = document.getElementById("chat_window");
		
		HTML += '<div id="chat_box">' +
				'	<input id="chat_tb" type="text" placeholder="Enter message..." />' +
				'	<button id="chat_send_btn">Send</button>' +
				'	<button id="chat_img_btn" ><img src="images/img_attach1.png" /></button>' +
				'	<input type="file" id="img_file" />' +
				'</div>'
				
		chat_app_div.insertAdjacentHTML('beforeend', HTML);
		chat_window.scrollTop = chat_window.scrollHeight;
	}
	
	/**Set event listeners**/
	function eventListeners() {
		var send_btn = document.getElementById("chat_send_btn");
		var chat_textBox = document.getElementById("chat_tb");
		var chat_img_btn = document.getElementById("chat_img_btn");
		var hidden_img_btn = document.getElementById("img_file");
		var messages_array = [];
	
		send_btn.onclick = function() {
			sendMessage();
		}
		chat_textBox.onkeydown = function(e) {
			if(e.keyCode === 13)
				sendMessage();
		}
		chat_img_btn.onclick = function(e) {
			console.log(e);
			hidden_img_btn.click();
		}
		hidden_img_btn.onchange = function() {
			alert("Sorry, this feature is not available yet. :(");
		}
		databaseMessageRef.on('child_added', function(data) {
			if(data.val().userId != userId){
				receiveMessage(data.val().message);
			}
		});
	}
	
	function sendMessage() {
		var chat_textBox = document.getElementById("chat_tb");
		var chat_window_td = document.getElementById("chat_window_td");
		var chat_window = document.getElementById("chat_window");
		var HTML = "";

		
		HTML += '<div class="sent_msg_div"><div class="chat_msg sent_msg">' + 
				chat_textBox.value + 
				'</div></div>';
		if(chat_textBox.value !== ""){
			databaseMessageRef.remove();
			// Add message to database
			databaseMessageRef.push().set({
				"message": chat_textBox.value,
				"userId": userId,
				"timeStamp": "null"
			});
			chat_window_td.insertAdjacentHTML('beforeend', HTML);
			chat_textBox.value = "";
			chat_window.scrollTop = chat_window.scrollHeight;
		}
	}
	
	function receiveMessage(message) {
		var chat_window_td = document.getElementById("chat_window_td");
		var chat_window = document.getElementById("chat_window");
		var HTML = "";

		HTML += '<div class="receive_msg_div"><div class="chat_msg receive_msg">' + 
				message + 
				'</div></div>';
		chat_window_td.insertAdjacentHTML('beforeend', HTML);
		chat_window.scrollTop = chat_window.scrollHeight;
	}

	function addImage() {
		
	}
	
	render();
	eventListeners();
	
}

CoreysChatApp.Authentication();

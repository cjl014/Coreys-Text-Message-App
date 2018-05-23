//////      ====    ==     ====    ====  \\   //    //////
//////    //      //  \\  || _//  ||___   \\ //     //////
//////	  \\      \\  //  || //   ||       | |      //////
//////	    ====    ==    || \\    ====    | |      //////
//////==============================================//////



/** Namespace closure - CoreysChatApp **/
var CoreysChatApp = (function() {
	var database = firebase.database();
	var databaseRef = database.ref();
	var databaseUsersRef = database.ref("Users");
	var databaseMessageRef = database.ref("Messages");
	var chatAppContainer;
	var settings = {};
	
	/** Class/Constructor - CoreysChatApp **/
	function CoreysChatApp(elementId, userSettings){
		this.defaultSettings = {
			'color': '',
			'buttonColor': ''
		};
		chatAppContainer = document.getElementById(elementId);
		
		this.addSettings(userSettings);
		this.initialize();
	}
	
	// Adds the users settings to the default settings
	CoreysChatApp.prototype.addSettings = function(userSettings){
		for (var defaultProp in this.defaultSettings){
				for (var userProp in userSettings){
					if(defaultProp == userProp){
						this.defaultSettings[defaultProp] = userSettings[userProp];
					}
				}
			}
		settings = this.defaultSettings;
	}
	
	// Creates the initial page and starts the chat app
	CoreysChatApp.prototype.initialize = function(){
		var chatLoginPage = new ChatLoginPage();
		
		chatLoginPage.render();
		chatLoginPage.authentication();
	};
	
	/** Class/Constructor - ChatLoginPage **/
	function ChatLoginPage(){
	}
	
	// Creates the login page
	ChatLoginPage.prototype.render = function(){
		var HTML =  '<div class="chat_authentication">' +
					'	<fieldset>' +
					'		<legend>Corey\'s Chat App</legend>	' +
					'			<img class="loader_gif" src="images/loader.gif" />' +
					'			<div class="signupOrLogin">' +
					'			<button class="signIn_btn" >Sign In</button>' +
					'		</div>' +
					'	</fieldset>' +
					'</div>';
			
		chatAppContainer.insertAdjacentHTML('beforeend', HTML);	
		var buttons = document.querySelectorAll("#" + chatAppContainer.id + " button");
		
		if(settings.color != "")
			document.querySelector("#" + chatAppContainer.id + " .chat_authentication").style.backgroundColor = settings.color;
		if(settings.buttonColor != ""){
			for(var i = 0; i < buttons.length; i++){
				buttons[i].style.backgroundColor = settings.buttonColor;
			}
		}
	}
	
	ChatLoginPage.prototype.authentication = function(){
		var supportClass = new SupportClass();
		
		/**Set event listeners**/
		function eventListeners() {
			var signIn_btn = document.querySelector("#" + chatAppContainer.id + " .signIn_btn");
			var signupOrLogin = document.querySelector("#" + chatAppContainer.id + " .signupOrLogin");
			var loader_gif = document.querySelector("#" + chatAppContainer.id + " .loader_gif");
			
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
			
			var onAuthFunction = function(currentUser) {
				if (currentUser) {
					var users;
					var userValue = "";
					var limit = 2;
					var userCount = 0;
					// User is signed in.
					databaseUsersRef.once('value').then(function(data) {
						users = data.val();
						
						// Check if user id is already in database for online users
						for (var key in users){
							userValue = users[key];
							if(userValue != "offline"){
								userCount++;
							}
						}
						// Check if user limit is reached
						if(userCount == limit){
							var chatLoginPage = new ChatLoginPage();
							alert("The maximum amount of users have been reached. Please wait for a user to logout, refresh, and try again.");
							
							chatAppContainer.innerHTML = "";
							chatLoginPage.render();
						}
						else{
							var chat_authentication_div = document.querySelector("#" + chatAppContainer.id + " .chat_authentication");
							var isUserInDatabase = false;
							var usersArray = [];
							var userValue = "";
							var users = {};
							var chatMenuWindow = new ChatMenuWindow(chatAppContainer);
							var chatWindow = new ChatWindow(chatAppContainer);
							var chatUsersWindow = new ChatUsersWindow(chatAppContainer);
							var chatBox = new ChatBox(chatAppContainer);
							
							chatAppContainer.removeChild(chat_authentication_div);
							
							supportClass.removeMessagesFromDatabase();
							chatMenuWindow.render()
							chatWindow.render();
							chatUsersWindow.render();
							chatBox.render();
							
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
						}
					});
				} else {
					// User is signed out.
					console.log("not logged in");
				}
			};
			
			if(firebase.auth().hasListener() == false)
				firebase.auth().onAuthStateChanged(onAuthFunction);  // When user authorization state has changed..
		}
		
		eventListeners();
	}
	
	/** Class/Constructor - ChatMenuWindow **/
	function ChatMenuWindow() {
	}
	
	// Create chat menu window
	ChatMenuWindow.prototype.render = function(){
		var HTML = '<div class="chat_menu">' +
				'	<button class="logout_btn">Logout</button>' + 
				'	<button class="clear_msgs_btn" >Clear messages</button>' +
				'</div>';
		
		chatAppContainer.insertAdjacentHTML('beforeend', HTML);
		var buttons = document.querySelectorAll("#" + chatAppContainer.id + " button");
		
		if(settings.color != "")
				document.querySelector("#" + chatAppContainer.id + " .chat_menu").style.backgroundColor = settings.color;
		if(settings.buttonColor != ""){
			for(var i = 0; i < buttons.length; i++){
				buttons[i].style.backgroundColor = settings.buttonColor;
			}
		}
		this.eventListeners();
	};
	
	// Deletes messages from the chat screeen
	ChatMenuWindow.prototype.removeMessages = function(){
			var chat_window_td = document.querySelector("#" + chatAppContainer.id + " .chat_window_td");
			
			databaseMessageRef.remove();
			chat_window_td.innerHTML = "";
	};
	
	// Logs out of the anonymous user
	ChatMenuWindow.prototype.logout = function(){
		var users = {};
		var userValue;
		var currentUser = firebase.auth().currentUser;
		
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
			var chatLoginPage = new ChatLoginPage();
			
			// Sign-out successful.
			chatAppContainer.innerHTML = "";
			chatLoginPage.render();
			chatLoginPage.authentication();
			setTimeout(function(){ alert("You have signed out!"); }, 100); //sometimes the alert shows before showing the logged out page. This helps.
		}, function(error) {
				// An error happened.
				console.log("error signing out");
				alert("error signing out");
			});
	};
	
	// Create HTML for login screen
	ChatMenuWindow.prototype.renderChatAuthDiv = function(){
		var HTML = '<div class="chat_authentication">' +
				'	<fieldset>' +
				'		<legend>Corey\'s Chat App</legend>' +
				'		<img class="loader_gif" src="images/loader.gif" />' +
				'		<div class="signupOrLogin">' +
				'			<button class="signIn_btn" >Sign In</button>' +
				'		</div>' +
				'	</fieldset>' +
				'</div>'
				
		chatAppContainer.insertAdjacentHTML('beforeend', HTML);
	};
	
	// Sets event listeners for chat menu window
	ChatMenuWindow.prototype.eventListeners = function(){
		var that = this;
		var clear_msgs_btn = document.querySelector("#" + chatAppContainer.id + " .clear_msgs_btn");
		var logout_btn = document.querySelector("#" + chatAppContainer.id + " .logout_btn");
		
		clear_msgs_btn.onclick = function(){
			that.removeMessages();
		}
		logout_btn.onclick = function(){
			that.logout();
		}
	};
	
	/** Class/Constructor - ChatWindow **/
	function ChatWindow() {
	}
	
	// Create HTML for the page
	ChatWindow.prototype.render = function(){
		var HTML = '<div class="chat_window">' +
				'	<table id="chat_window_table">' +
				'		<tr>' +
				'			<td class="chat_window_td">' +
				'			</td>' +
				'		</tr>' +
				'	</table>' +
				'</div>';
		
		chatAppContainer.insertAdjacentHTML('beforeend', HTML);
	};
	
	/** Class/Constructor - ChatUsersWindow **/
	function ChatUsersWindow() {
	}
	
	// Create HTML for the page
	ChatUsersWindow.prototype.render = function(){
		var HTML = '<div class="chat_users_window">' +
				'	<div class="chat_users_window_title">Users Window <span style="font-size:13px; color: lime"></span></div>' + 
				'</div>';
		
		chatAppContainer.insertAdjacentHTML('beforeend', HTML);
		if(settings.color != "")
				document.querySelector("#" + chatAppContainer.id + " .chat_users_window_title").style.backgroundColor = settings.color;
		this.eventListeners();
	}
	
	// Adds user to winow
	ChatUsersWindow.prototype.addUserToWindow = function(name){
		this.name = name;
		var chat_users_window_title_div = document.querySelector("#" + chatAppContainer.id + " .chat_users_window_title");
		var chat_user_divs = document.querySelector("#" + chatAppContainer.id + " .chat_user_div");
		
		chat_users_window_title_div.insertAdjacentHTML('afterend', '<div class="chat_user_div" >' + this.name + '</div>');
	}
	
	// Removes user from window
	ChatUsersWindow.prototype.removeUserFromWindow = function(name){
		var chat_users_window_div = document.querySelector("#" + chatAppContainer.id + " .chat_users_window");
		var chat_user_divs = document.querySelectorAll("#" + chatAppContainer.id + " .chat_user_div");
		var userInWindow = "";
		
		for(i=0; i < chat_user_divs.length; i++){
			userInWindow = chat_user_divs[i].innerHTML;
			if(name == userInWindow){
				chat_users_window_div.removeChild(chat_user_divs[i]);
			}
		}
	}
	
	// Returns true if user is in the window
	ChatUsersWindow.prototype.userIsInWindow = function(name){
		var chat_user_divs = document.querySelectorAll("#" + chatAppContainer.id + " .chat_user_div");
		var userInWindow = "";
		
		for(i=0; i < chat_user_divs.length; i++){
			userInWindow = chat_user_divs[i].innerHTML;
			if(name == userInWindow){
				return true;
			}
		}
	}
	
	// Sets event listeners for chat window
	ChatUsersWindow.prototype.eventListeners = function(){
		var that = this;
		// When the value of a user changes in the database
		databaseUsersRef.on('value', function(data){
			var users = data.val();
			var userValue = "";
			// Loop through database users
			for (var key in users){
				userValue = users[key];
				if(userValue == "offline"){ // Remove user from window if they are offline
					that.removeUserFromWindow(key);
				}
				else if(!that.userIsInWindow(key)){ // Add user to window if they are offline
					that.addUserToWindow(key);	
				}
			}
		});
	}
	
	
	/** Class/Constructor- ChatBox **/
	function ChatBox() {
	}
	
	ChatBox.prototype.render = function(){
		var chat_window = document.querySelector("#" + chatAppContainer.id + " .chat_window");
		var HTML = '<div class="chat_box">' +
				'	<input class="chat_tb" type="text" placeholder="Enter message..." />' +
				'	<button class="chat_send_btn">Send</button>' +
				'	<button class="chat_img_btn" ><img src="images/img_attach1.png" /></button>' +
				'	<input type="file" class="img_file" />' +
				'</div>'
				
		chatAppContainer.insertAdjacentHTML('beforeend', HTML);
		var buttons = document.querySelectorAll("#" + chatAppContainer.id + " .chat_box button");
		chat_window.scrollTop = chat_window.scrollHeight;
		if(settings.buttonColor != ""){
			for(var i = 0; i < buttons.length; i++){
				buttons[i].style.backgroundColor = settings.buttonColor;
			}
		}
		this.eventListeners();
	}
	
	ChatBox.prototype.sendMessage = function(){
		var userId = firebase.auth().currentUser.uid;
		var chat_textBox = document.querySelector("#" + chatAppContainer.id + " .chat_tb");
		var chat_window_td = document.querySelector("#" + chatAppContainer.id + " .chat_window_td");
		var chat_window = document.querySelector("#" + chatAppContainer.id + " .chat_window");
		var HTML = '<div class="sent_msg_div"><div class="chat_msg sent_msg">' + 
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
	
	ChatBox.prototype.receiveMessage = function(message){
		var chat_window_td = document.querySelector("#" + chatAppContainer.id + " .chat_window_td");
		var chat_window = document.querySelector("#" + chatAppContainer.id + " .chat_window");
		var HTML = '<div class="receive_msg_div"><div class="chat_msg receive_msg">' + 
				message + 
				'</div></div>';
		chat_window_td.insertAdjacentHTML('beforeend', HTML);
		chat_window.scrollTop = chat_window.scrollHeight;
	}
	
	ChatBox.prototype.addImage = function(){
		// TODO:
	}
	
	ChatBox.prototype.eventListeners = function(){
		var that = this;
		var userId = firebase.auth().currentUser.uid;
		var send_btn = document.querySelector("#" + chatAppContainer.id + " .chat_send_btn");
		var chat_textBox = document.querySelector("#" + chatAppContainer.id + " .chat_tb");
		var chat_img_btn = document.querySelector("#" + chatAppContainer.id + " .chat_img_btn");
		var hidden_img_btn = document.querySelector("#" + chatAppContainer.id + " .img_file");
		var messages_array = [];
	
		send_btn.onclick = function() {
			that.sendMessage();
		}
		chat_textBox.onkeydown = function(e) {
			if(e.keyCode === 13)
				that.sendMessage();
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
				that.receiveMessage(data.val().message);
			}
		});
	}
	
	/** Class/Constructor - SupportClass **/
	function SupportClass() {

	}
	
	// removes messages from database
	SupportClass.prototype.removeMessagesFromDatabase = function(){
		databaseMessageRef.remove();
	};
	
	return CoreysChatApp;
}());

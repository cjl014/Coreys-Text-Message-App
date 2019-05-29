'use strict'

/**
//////      ====    ==     ====    ====  \\   //    //////
//////    //      //  \\  || _//  ||___   \\ //     //////
//////	  \\      \\  //  || //   ||       | |      //////
//////	    ====    ==    || \\    ====    | |      //////
//////==============================================//////

App Name: Corey's Chat App
App Nickname: CCA
Version:
**/

// Initialize Firebase
firebase.initializeApp({
	apiKey: "AIzaSyATMX8ijfGapT3xF2v_jo4iRhpCEehOMk0",
	authDomain: "web-chat-application-corey.firebaseapp.com",
	databaseURL: "https://web-chat-application-corey.firebaseio.com/",
	storageBucket: "gs://web-chat-application-corey.appspot.com/"
});

/** Namespace closure - CoreysChatApp **/
var CoreysChatApp = (function() {
	
	/** Global Variables **/
	var storage = firebase.storage();
	var storageRef = storage.ref();
	var chatImageRef = storageRef.child("images/test.png");
	var database = firebase.database();
	var dbRef = database.ref();
	var dbUsersRef = database.ref("Users");
	var dbMessageRef = database.ref("Messages");
	var chatAppContainer;
	var settings = {};
	var chatLoginPage;
	var chatMenuWindow;
	var chatWindow;
	var chatUsersWindow;
	var chatBox;
	var supportClass;
	var roboticResponseCount = 1;
	var isLoggedIn = false;

	
	/** Class - CoreysChatApp **/
	class CoreysChatApp{
		constructor(elementId, userSettings){
			this.defaultSettings = {
				'mainColor': 'lightslategrey',
				'buttonColor': '',
				'appWidth': '100%',
				'appHeight': '100%',
				'chatWindowColor': '#f2f2f2',
				'loaderImage': '',
				'sendMessageSound': '',
				'receiveMessageSound': '',
				'attachmentImage': 'https://www.w3.org/TR/WWWicn/camera.gif',
			}
			chatAppContainer = document.getElementById(elementId);
			
			this.addSettings(userSettings);
			this.initialize();
		}
		
		
		// Adds the users settings to the default settings
		addSettings(userSettings){
			for (var defaultProp in this.defaultSettings){
				for (var userProp in userSettings){
					if(userSettings[userProp] != "" && userSettings[userProp] != undefined){
						if(defaultProp == userProp)
							this.defaultSettings[defaultProp] = userSettings[userProp];
					}
				}
			}
			settings = this.defaultSettings;
		}
		
		
		// Creates the initial page and starts the chat app
		initialize(){
			chatLoginPage.render();
			chatLoginPage.authentication();
		}
	}
	
	
	
	/** Class/Constructor - ChatLoginPage **/
	class ChatLoginPage{
		constructor(){
			this.container = document.createElement("div");
			this.fieldset = document.createElement("fieldset");
			this.legend = document.createElement("legend");
			this.loader_img = document.createElement("img");
			this.login_div = document.createElement("div");
			this.login_btn = document.createElement("button");
		}
		
		// Creates the login page
		render(){
			this.container.className = "cca_auth";
			this.container.style.background = settings.mainColor;
			this.container.style.width = settings.appWidth;
			this.container.style.height = settings.appHeight;
			
			this.legend.innerHTML = "Corey's Chat App";
			
			this.loader_img.className = "cca_loader_gif";
			this.loader_img.src = settings.loaderImage;
			this.loader_img.style.display = "none";
			
			this.login_div.className = "cca_signupOrLogin";
			this.login_div.style.backgroundColor = settings.mainColor;
			
			this.login_btn.className = "cca_signIn_btn";
			this.login_btn.innerHTML = "Sign In";
			this.login_btn.style.backgroundColor = settings.buttonColor;
			
			// Append HTML
			this.container.appendChild(this.fieldset);
			this.fieldset.appendChild(this.legend);
			this.fieldset.appendChild(this.loader_img);
			this.fieldset.appendChild(this.login_div);
			this.login_div.appendChild(this.login_btn);
			chatAppContainer.appendChild(this.container);		
			
			/** --- View of how the HTML should look like ---
				<div class="cca_auth">
					<fieldset>
						<legend>Corey's Chat App</legend>
						<img class="cca_loader_gif" src="images/loader.gif" >
						<div class="cca_signupOrLogin">
							<button class="cca_signIn_btn" >Sign In</button>
						</div>
					</fieldset>
				</div>'
			**/	
			
			this.eventListeners();
		}
		
		authentication(){
			
			var that = this;
			var users;
			var userValue = "";
			var limit;
			var userCount;
			var isUserInDatabase = false;
			var objUpdate = {};
			var dbUserRef;
			
			var onAuthFunction = function(currentUser) {
				if (currentUser) {
					limit = 2;
					userCount = 0;
					// User is signed in.
					dbUsersRef.once('value').then(function(data) {
						isLoggedIn = true;
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
							alert("The maximum amount of users have been reached. Please wait for a user to logout, refresh, and try again.");
							
							chatAppContainer.innerHTML = "";
							chatLoginPage.render();
						}
						else{
							users = {};
							
							chatAppContainer.removeChild(that.container);
							supportClass.removeMessagesFromDatabase();
							chatMenuWindow.render()
							chatWindow.render();
							chatUsersWindow.render();
							chatBox.render();
							
							// Loops through the database of users (There should only be 2 users)
							dbUsersRef.on('child_added', function(data) {
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
												objUpdate[key] = currentUser.uid; //tip: use this instead of computed property because IE doesn't support
												dbUsersRef.update(objUpdate);
												dbUserRef = database.ref("Users/" + key);
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
		
		
		// Set event listeners
		eventListeners() {
			var that = this;
			
			// When user clicks the "Sign In" button, log them in as an anonymous user
			this.login_btn.onclick = function() {
				that.login_div.remove();
				that.loader_img.style.display = "block";
				
				firebase.auth().signInAnonymously().catch(function(error) {
					// Handle Errors here.
					let errorCode = error.code;
					let errorMessage = error.message;
					console.log("Error on Sign-In!: " + errorCode + " " + errorMessage);
				});
			}
		}
	}
	
	
	
	/** Class - ChatMenuWindow **/
	class ChatMenuWindow{
		constructor() {
			this.container = document.createElement("div");
			this.logout_btn = document.createElement("button");
			this.clear_btn = document.createElement("button");
		}
		
		// Create chat menu window
		render(){
			this.container.className = "cca_menu";
			this.container.style.background = settings.mainColor;
			this.container.style.height = settings.appHeight;
			
			this.logout_btn.className = "cca_logout_btn";
			this.logout_btn.style.backgroundColor = settings.buttonColor;
			this.logout_btn.innerHTML = "Logout";
			
			this.clear_btn.className = "cca_clear_msgs_btn";
			this.clear_btn.style.backgroundColor = settings.buttonColor;
			this.clear_btn.innerHTML = "Clear messages";
			
			// Append to HTML
			this.container.appendChild(this.logout_btn);
			this.container.appendChild(this.clear_btn);
			chatAppContainer.appendChild(this.container);
			
			/** --- View of how the HTML should look like ---
				<div class="cca_menu">
					<button class="cca_logout_btn">Logout</button>'
					<button class="cca_clear_msgs_btn" >Clear messages</button>
				</div>
			**/
			
			this.eventListeners();
		}
		
		
		
		// Deletes messages from the chat screeen
		removeMessages(){
			
			dbMessageRef.remove();
			chatWindow.td.innerHTML = "";
		}
		
		
		// Logs out of the anonymous user
		logout(){
			var users = {};
			var userValue;
			var currentUser = firebase.auth().currentUser;
			var objUpdate = {};
			
			// Loops through the database of users (There should only be 2 users)
			dbUsersRef.on('child_added', function(data) {
				users[data.key] = data.val();

				if(Object.keys(users).length == 2){
					// Check if user id is already in database for online users
					for (var key in users){
						userValue = users[key];
						if(userValue == currentUser.uid){
							objUpdate[key] = "offline"; //tip: use this instead of computed property because IE doesn't support
							dbUsersRef.update(objUpdate);
							break;
						}
					}
				}
			});
			
			// Sign out
			firebase.auth().signOut().then(function() {
				
				// Sign-out successful.
				isLoggedIn = false;
				chatAppContainer.innerHTML = "";
				chatLoginPage.render();
				chatLoginPage.authentication();
				setTimeout(function(){ alert("You have signed out!"); }, 100); //sometimes the alert shows before showing the logged out page. This helps.
			}, 
			function(error) {
					// An error happened.
					console.log("error signing out");
					alert("error signing out");
			});
		}
		
		// Sets event listeners for chat menu window
		eventListeners(){
			var that = this;
		
			this.clear_btn.onclick = function(){
				that.removeMessages();
			}
			this.logout_btn.onclick = function(){
				that.logout();
			}
		}
	}
	
	
	
	/** Class - ChatWindow **/
	class ChatWindow {
		constructor() {
			this.container = document.createElement("div");
			this.table = document.createElement("table");
			this.tr = document.createElement("tr");
			this.td = document.createElement("td");
		}
		
	
		// Create HTML for the page
		render() {			
			this.container.className = "cca_window";
			this.container.style.backgroundColor = settings.chatWindowColor;
			
			this.table.className = "cca_window_table";
			
			this.td.className = "cca_window_td";
			
			// Append to html
			this.container.appendChild(this.table);
			this.table.appendChild(this.tr);
			this.tr.appendChild(this.td);
			chatAppContainer.appendChild(this.container);
			
			/** --- View of how the HTML should look like ---
				<div class="chat_window">
					<table id="chat_window_table">
						<tr>
							<td class="chat_window_td">
							</td>
						</tr>
					</table>
				</div>
			**/	
		}
		
		adjustHeight() {
			this.container.style.height = (chatAppContainer.clientHeight - chatBox.textBox.clientHeight - 4) + "px";
		}
	}
	
	
	
	/** Class - ChatUsersWindow **/
	class ChatUsersWindow {
		constructor() {
			this.container = document.createElement("div");
			this.titleDiv = document.createElement("div");
			this.titleSpan = document.createElement("span");
			
		}
		
		// Create HTML for the page
		render(){
			this.container.className = "cca_users_window";
			this.container.style.height = settings.appHeight;
			
			this.titleDiv.className = "cca_users_window_title";
			this.titleDiv.style.background = settings.mainColor;
			this.titleDiv.innerHTML = "Users Window";
			
			this.titleSpan.style.fontSize = "13px";
			this.titleSpan.style.color = "lime";
			
			// Append to HTML
			this.container.appendChild(this.titleDiv);
			this.titleDiv.appendChild(this.titleSpan);
			
			chatAppContainer.appendChild(this.container);
			
			
			/** --- View of how the HTML should look like ---
				<div class="cca_users_window">
					<div class="cca_users_window_title">
						Users Window 
						<span></span>
					</div>
				</div>
			**/

			this.eventListeners();
		}
		
		// Adds user to window
		addUserToWindow(name){
			let user_div = document.createElement("div");
			user_div.innerHTML = name;
			user_div.className = "cca_user_div";
			this.container.appendChild(user_div);
			
			let user_divs = document.querySelectorAll("#" + chatAppContainer.id + " .cca_user_div");
			
			for(let i = 0; i < user_divs.length; i++){
				this.container.appendChild(user_divs[i]);
			}
			
			
			
		}
		
		// Removes user from window
		removeUserFromWindow(name){
			var cca_user_divs = document.querySelectorAll("#" + chatAppContainer.id + " .cca_user_div");
			var userInWindow = "";
			
			for(var i=0; i < cca_user_divs.length; i++){
				userInWindow = cca_user_divs[i].innerHTML;
				
				if(name == userInWindow){
					this.container.removeChild(cca_user_divs[i]);
				}
			}
		}
		
		// Returns true if user is in the window
		userIsInWindow(name){
			var chat_user_divs = document.querySelectorAll("#" + chatAppContainer.id + " .cca_user_div");
			var userInWindow = "";
			
			for(var i=0; i < chat_user_divs.length; i++){
				userInWindow = chat_user_divs[i].innerHTML;
				if(name == userInWindow){
					return true;
				}
			}
		}
		
		// Sets event listeners for chat window
		eventListeners(){
			var that = this;

			// When the value of a user changes in the database
			dbUsersRef.on('value', function(data){
				var users = data.val();
				var userValue = "";
				
				// Loop through database users
				for (var key in users){
					userValue = users[key];
					if(userValue == "offline"){ // Remove user from window if they are offline
						that.removeUserFromWindow(key);
					}
					else if(!that.userIsInWindow(key)){ // Add user to window if they are online
						that.addUserToWindow(key);	
					}
				}
			});
		}
	}
	
	
	
	
	/** Class/Constructor- ChatBox **/
	class ChatBox {
		constructor() {
			this.container = document.createElement("div");
			this.textBox = document.createElement("input");
			this.sendBtn = document.createElement("button");
			this.imageBtn = document.createElement("button");
			this.imageBtnImg = document.createElement("img");
			this.fileInput = document.createElement("input");
			this.receiveSound = document.createElement("audio");
			this.sendSound = document.createElement("audio");
			
		}
		
		render() {
			var buttonHeight = "50px";
			var buttonWidth = "10%";
	
			this.container.className = "cca_chatbox";
			
			this.textBox.className = "cca_chat_textbox";
			this.textBox.type = "text";
			this.textBox.placeholder = "Enter message...";
			
			this.sendBtn.className = "cca_send_btn";
			this.sendBtn.innerHTML = "Send";
			this.sendBtn.style.backgroundColor = settings.buttonColor;
			
			this.imageBtn.className = "cca_img_btn";
			this.imageBtn.style.backgroundColor = settings.buttonColor;
			
			this.imageBtnImg.src = settings.attachmentImage;
			
			this.fileInput.className = "cca_img_file";
			this.fileInput.type = "file";
			this.fileInput.accept = "image/*";
			
			this.receiveSound.src = settings.sendMessageSound;
			this.receiveSound.setAttribute("preload", "auto");
			this.receiveSound.setAttribute("controls", "none");
			this.receiveSound.style.display = "none";
			
			this.sendSound.src = settings.receiveMessageSound;
			this.sendSound.setAttribute("preload", "auto");
			this.sendSound.setAttribute("controls", "none");
			this.sendSound.style.display = "none";
			
			//append to HTML
			this.container.appendChild(this.textBox);
			this.container.appendChild(this.sendBtn);
			this.container.appendChild(this.imageBtn);
			this.imageBtn.appendChild(this.imageBtnImg);
			this.container.appendChild(this.fileInput);
			document.body.appendChild(this.receiveSound);
			document.body.appendChild(this.receiveSound);
			chatAppContainer.appendChild(this.container);
			
			/** --- View of how the HTML should look like ---
			<div class="cca_chatbox">
				<input class="cca_chat_textbox" type="text" placeholder="Enter message..." />
				<button class="cca_send_btn">Send</button>
				<button class="cca_img_btn" ><img src="images/img_attach1.png" /></button>
				<input type="file" class="cca_img_file" />
			</div>
			**/		

			chatWindow.adjustHeight();
			chatWindow.container.scrollTop = chatWindow.container.scrollHeight;

			this.eventListeners();
		}
	
		sendMessage(type, imgURL){
			var that = this;
			var userId = firebase.auth().currentUser.uid;
			var HTML = '';
			
			if(type == "text"){
				HTML = '<div class="sent_msg_div"><div class="chat_msg sent_msg">' + 
						this.textBox.value + 
						'</div></div>';
				if (this.textBox.value !== ""){
					dbMessageRef.remove();
					// Add message to database
					dbMessageRef.push().set({
						"type": "text",
						"message": this.textBox.value,
						"userId": userId,
						"timeStamp": "null"
					});
					chatWindow.td.insertAdjacentHTML('beforeend', HTML);
					this.textBox.value = "";
					chatWindow.container.scrollTop = chatWindow.container.scrollHeight;
					
					if(settings.sendMessageSound != ""){
						this.sendSound.play();
					}
				}
			}
			if(type == "image"){
				HTML = '<div class="sent_msg_div"><div class="chat_msg sent_msg"><img src="' + 
						imgURL + 
						'" style="max-width: 300px" /></div></div>';
				dbMessageRef.remove();
					// Add message to database
					dbMessageRef.push().set({
						"type": "image",
						"message": "",
						"userId": userId,
						"timeStamp": "null"
					});
				
				chatWindow.td.insertAdjacentHTML('beforeend', HTML);
				chatWindow.container.scrollTop = chatWindow.container.scrollHeight;
				
				if(settings.sendMessageSound != ""){
					this.sendSound.play();
				}
			}
			
			// Check how many users
			dbUsersRef.once('value').then(function(data) {
				var users = data.val();
				var userCount = 0;
				var robotMsg1, robotMsg2, robotMsg3, robotMsg4;
				
				
				for (var key in users){
					if(users[key] != "offline"){
						userCount++;
					}
				}
				if (userCount <= 1 && roboticResponseCount >= 1){
					robotMsg1 = setTimeout(function(){
						if(isLoggedIn){
							that.roboticResponse('Hi! How are you?');
						}else{
							clearTimeout(robotMsg2);
							clearTimeout(robotMsg3);
							clearTimeout(robotMsg4);
						}
					}, 1500);
					
					robotMsg2 = setTimeout(function(){
						if(isLoggedIn){
							that.roboticResponse('This is a robotic response because you are the only user.');
						}else{
							clearTimeout(robotMsg3);
							clearTimeout(robotMsg4);
						}
					}, 6000);
					
					robotMsg3 = setTimeout(function(){
						if(isLoggedIn){
							that.roboticResponse('Want to try 2 users? Open it in a new browser.')
						}else{
							clearTimeout(robotMsg4);
						}
					}, 12000);
						
						
					robotMsg4 = setTimeout(function(){
						if(isLoggedIn){
							that.roboticResponse('The limit is 2 users. So try to login with 3 to see what happens.');
						}
					}, 20000);
					
					roboticResponseCount--;
				}
			});
		}
		
		receiveMessage(message){
			var HTML = '<div class="receive_msg_div"><div class="chat_msg receive_msg">' + 
					message + 
					'</div></div>';
			chatWindow.td.insertAdjacentHTML('beforeend', HTML);
			chatWindow.container.scrollTop = chatWindow.container.scrollHeight;
			
			if(settings.receiveMessageSound != ""){
				this.receiveSound.play();
			}
				
			
		}
		
		roboticResponse(message){
			var HTML = '<div class="receive_msg_div"><div class="chat_msg receive_msg">' + 
					message + 
					'</div></div>';

				chatWindow.td.insertAdjacentHTML('beforeend', HTML);
				chatWindow.container.scrollTop = chatWindow.container.scrollHeight;
				
				if(settings.receiveMessageSound != ""){
					this.receiveSound.play();
				}
		}
		
		addImage(){
			// TODO:
			var that = this;
			var file = this.fileInput.files[0];
			chatImageRef.put(file).then(function(snapshot){
				console.log('uploaded a blob or file');
				
				chatImageRef.getDownloadURL().then(function(url) {
					that.sendMessage("image", url);
				}).catch(function(error) {

				  // A full list of error codes is available at
				  // https://firebase.google.com/docs/storage/web/handle-errors
				  switch (error.code) {
					case 'storage/object-not-found':
					  // File doesn't exist
					  alert("File does not exist");
					  break;

					case 'storage/unauthorized':
					  // User doesn't have permission to access the object
					  alert("You do not have permission :(");
					  break;

					case 'storage/canceled':
					  // User canceled the upload
					  break;

					case 'storage/unknown':
						alert("unknown error");
					  // Unknown error occurred, inspect the server response
					  break;
				  }
				});
			});
			
		}
		
		eventListeners(){
			var that = this;
			var userId = firebase.auth().currentUser.uid;
			var messages_array = [];
		
			this.sendBtn.onclick = function() {
				if (that.textBox.value !== ""){
					that.sendMessage("text");
				}
			}
			this.textBox.onkeydown = function(e) {
				if(e.keyCode === 13)
					if (that.textBox.value !== ""){
						that.sendMessage("text");
					}
			}
			this.imageBtn.onclick = function(e) {
				console.log(e);
				that.fileInput.click();
			}
			this.fileInput.onchange = function() {
				//alert("Sorry, this feature is not available yet. :(");
				that.addImage();
			}
			dbMessageRef.on('child_added', function(data) {
				if(data.val().userId != userId){
					if(data.val().type == "image"){
						
						chatImageRef.getDownloadURL().then(function(url) {
							that.receiveMessage("<img src='" + url + "' style='max-width: 300px' />");
						}).catch(function(error) {

						  // A full list of error codes is available at
						  // https://firebase.google.com/docs/storage/web/handle-errors
						  switch (error.code) {
							case 'storage/object-not-found':
							  // File doesn't exist
							  alert("Failed to retrieve image from other user. File does not exist");
							  break;

							case 'storage/unauthorized':
							  // User doesn't have permission to access the object
							  alert("You do not have permission :(");
							  break;

							case 'storage/canceled':
							  // User canceled the upload
							  break;

							case 'storage/unknown':
								alert("unknown error after retreiving image");
							  // Unknown error occurred, inspect the server response
							  break;
						  }
						});
					}
					else if(data.val().type == "text"){
						that.receiveMessage(data.val().message);
					}
				}
			});
		}
	}
	

	
	/** Class - SupportClass **/
	class SupportClass{
		constructor() {
			
		}
		
		// removes messages from database
		removeMessagesFromDatabase(){
			dbMessageRef.remove();
		}
	}
	
	
	
	chatMenuWindow = new ChatMenuWindow();
	chatWindow = new ChatWindow();
	chatUsersWindow = new ChatUsersWindow();
	chatBox = new ChatBox();
	chatLoginPage = new ChatLoginPage();	
	supportClass = new SupportClass();	
							
	return CoreysChatApp;
}());

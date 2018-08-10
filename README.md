<span style="color: red">Prototype - (Not finished)</span>
# Coreys-Text-Message-App
<b>Chat application</b>
<br><br>
Demo link: https://web-chat-application-corey.firebaseapp.com/
<br><br>
<h3>How To Use</h3><br>
- Add the Firebase script: <script src='https://www.gstatic.com/firebasejs/4.2.0/firebase.js'></script> <br>
- Add the JS file below the script above to your HTML: CoreysChatApp.js <br>
- Add the CSS file to your HTML: cca_main.css <br>
- Add a DIV tag with an id associated with it. <br>
- Initialize the chat app by adding this Javascript. Add the id to the first parameter. <br>
var CoreysChatApp1 = new CoreysChatApp('chat_application',  <br>
			{  //add settings   <br>
				'mainColor' : 'lightslategrey', <br>
				'buttonColor': '',  <br>
				'chatWindowColor': '#f2f2f2'  <br>
			});
 <br>
 - And that is it!
<br><br>
<h3>More Details</h3>
-Uses Firebase <br>
-Allows anonymous login for now <br>
-Limt is 2 users signed-in at a time <br>
-Uses Vanilla JavaScript (pure javascript) <br>
-Uses OOP style (Object Oriented programming) <br>


<b>Classes</b>
  -
-CoreysChatApp
  -
-ChatLoginPage
  -
-ChatMenuWindow
  -
-ChatWindow
  -
-ChatUsersWindow
  -
-ChatBox
  -
-SupportClass
  -

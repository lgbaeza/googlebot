function scrollDownChat(){
	var objDiv = document.getElementById("watson_chatbot");
	objDiv.scrollTop = objDiv.scrollHeight;
}

function SendMessage()
{
	var msg = document.getElementById('watson_input').value;
	var chatbot = document.getElementById('watson_chatbot');
	var watsonResponse = "";

	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			/*var newMsg = "<div class=\"cb_vtt\">" +
				"<div class=\"cb_vtt_title\">@Visitante</div>" +
				msg + 
			"</div>";
			chatbot.innerHTML = chatbot.innerHTML + newMsg;
			var newMsg = "<div class=\"cb_att\">" +
				"<div class=\"cb_att_title\">@Watson</div>" +
				this.responseText + 
			"</div>";*/
			chatbot.innerHTML = chatbot.innerHTML + this.responseText;

			document.getElementById('watson_input').value = "";
			scrollDownChat();
		}
	};
	xhttp.open("GET", "/sendMessage?message=" + msg, true);
	xhttp.send();
	
}

function RestartChat(userName){
	document.location = "/";
}

function InitializeConversation()
{
	var chatbot = document.getElementById('watson_chatbot');
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var newMsg = "<div class=\"cb_att\">" +
				"<div class=\"cb_att_title\">@Watson</div>" +
				this.responseText + 
			"</div>";
			chatbot.innerHTML = chatbot.innerHTML + newMsg;

			scrollDownChat();
		}
	};
	xhttp.open("GET", "/sendMessage?restart=true&message=" + "", true);
	xhttp.send();
}
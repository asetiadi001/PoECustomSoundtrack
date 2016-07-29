// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const {ipcRenderer} = require('electron');
const {dialog} = require('electron').remote;
PlayerController = require('./player.js').PlayerController

App = {}

App.playerController = new PlayerController() 
App.playerController.register("YoutubePlayer", 'youtube')


//handle file select dialog
loadLogFile = function(){
	dialog.showOpenDialog({title: "Locate PoE Directory", properties: ["openDirectory"] }, function(fileNames){
  	ipcRenderer.send("setPoePath", fileNames)
  })
}


//backend will tell us to play a new track based on zone changes
ipcRenderer.on('changeTrack', function(event,data){
	App.playerController.playTrack(data,0)
})

//backend will send us state values, use it to stupidly update frontend
ipcRenderer.on('updateState', function(event,data){
	document.getElementById('poe-path').innerText = data.path.replace(/\\/g, "/")
	document.getElementById('poe-path-valid').style.display = data.valid ? "inline" : "none"
	document.getElementById('poe-path-invalid').style.display = data.valid ? "none" : "inline"
	document.getElementById('volume-valid').style.display = data.volume === 0 ? "inline" : "none"
	document.getElementById('volume-invalid').style.display = data.volume === 0 ? "none" : "inline"
})

//tell backend we'd like to update our state
ipcRenderer.send("updateState")

//ask for new state values every second, ya dumb, whatever.
setInterval(function(){
	ipcRenderer.send("updateState")	
}, 1000)
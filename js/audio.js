function SpectrumAnalyser() {
  this.frequencyData = new Uint8Array(1024);

  // Create visualisation
  this.view = new SpectrumAnalyserView();

  this.init();
}

// Initialise
SpectrumAnalyser.prototype.init = function() {
  var AudioContext = window.AudioContext || window.webkitAudioContext;

  if (!AudioContext) {
    throw new Error('Your browser doesn\'t support the Web Audio API, try Chrome!');
  }

  this.context = new AudioContext();
};

// Load audio (xhr)
SpectrumAnalyser.prototype.loadAudio = function(pathToAudioFile) {
  var _this = this;
  var button = document.getElementById('toggle'); //TODO: Remove
  var request = new XMLHttpRequest();

  button.disabled = true;

  request.open('GET', pathToAudioFile, true);
  request.responseType = 'arraybuffer';

  request.onload = function() {
    var audioData = request.response;

    _this.context.decodeAudioData(audioData, function(buffer) {
      _this.buffer = buffer;
      button.disabled = false;
    });
  };

  request.send();
};

// Create analyser & source node
SpectrumAnalyser.prototype.createNodes = function() {
  // Create analyser node
  this.analyser = this.context.createAnalyser();
  this.analyser.fftSize = 2048;

  // Create source node
  this.source = this.context.createBufferSource();
  this.source.buffer = this.buffer;
};

SpectrumAnalyser.prototype.connectNodes = function() {
  // Connect nodes
  this.source.connect(this.analyser);
  this.analyser.connect(this.context.destination);
};

// Start audio
SpectrumAnalyser.prototype.play = function() {
  // Create nodes
  this.createNodes();
  // Connect nodes
  this.connectNodes();

  // Play
  this.playing = true;
  this.paused = false;

  if (this.pausedTime) {
    this.startedTime = Date.now() - this.pausedTime;
    this.source.start(0, this.pausedTime / 1000);
  } else {
    this.startedTime = Date.now();
    this.source.start(0);
  }

  this.update();
};

// Stop audio
SpectrumAnalyser.prototype.stop = function() {
  this.source.stop();
  this.playing = false;
  this.paused = true;
  this.pausedTime = Date.now() - this.startedTime;
  cancelAnimationFrame(this.rAF);
  this.rAF = null;

  var emptyData = new Uint8Array(1024);
  for (var i = 0, len = emptyData.length; i < len; i++) {
    emptyData[i] = 0;
  }

  this.view.draw(emptyData);
};

// Update with new data and refresh view
SpectrumAnalyser.prototype.update = function() {
  // Store animation frame for cancelling later
  this.rAF = requestAnimationFrame(this.update.bind(this));
  
  // Get audio data
  this.analyser.getByteFrequencyData(this.frequencyData);

  // Pass data off to visualisation
  this.view.draw(this.frequencyData);
};
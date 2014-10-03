define(['d3', 'visual'], function(d3, Visual) {

  function AudioVisualiser() {
    // Create visualisation
    this.views = [];
    this.views.push(new Visual({ type: 'frequency' }));
    //this.views.push(new Visual({ type: 'timeDomain' }));

    this.init();
  }

  // Initialise
  AudioVisualiser.prototype.init = function() {
    var AudioContext = window.AudioContext || window.webkitAudioContext;

    if (!AudioContext) {
      throw new Error('Uh-oh, your browser doesn\'t support the Web Audio API, try Chrome instead!');
    }

    this.context = new AudioContext();
  };

  // Load audio (xhr)
  AudioVisualiser.prototype.loadAudio = function(pathToAudioFile) {
    var _this = this;
    var button = document.getElementById('toggle'); //TODO: Remove, use eventemitter or something
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
  AudioVisualiser.prototype.createNodes = function() {
    // Create analyser node
    this.analyser = this.context.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.5;
    this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
    this.timeDomainData = new Uint8Array(this.analyser.frequencyBinCount);

    // Create source node
    this.source = this.context.createBufferSource();
    this.source.buffer = this.buffer;
  };

  AudioVisualiser.prototype.connectNodes = function() {
    // Connect nodes
    this.source.connect(this.analyser);
    this.analyser.connect(this.context.destination);
  };

  // Start audio
  AudioVisualiser.prototype.play = function() {
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
  AudioVisualiser.prototype.stop = function() {
    this.source.stop();
    this.playing = false;
    this.paused = true;
    this.pausedTime = Date.now() - this.startedTime;
    cancelAnimationFrame(this.rAF);
    this.rAF = null;

    this.views.forEach(function(view) {
      view.draw(new Uint8Array(this.analyser.frequencyBinCount), true);
    }.bind(this));
  };

  // Update with new data and refresh view
  AudioVisualiser.prototype.update = function() {
    // Store animation frame for cancelling later
    this.rAF = requestAnimationFrame(this.update.bind(this));
    
    // Get audio data
    this.views.forEach(function(view) {
      var method = 'getByte' + (view.type.charAt(0).toUpperCase() + view.type.slice(1)) + 'Data';
      var data = view.type + 'Data';
      
      this.analyser[method](this[data]);

      // Pass data off to visualisation
      view.draw(this[data]);
    }.bind(this));
  };

  return AudioVisualiser;

});
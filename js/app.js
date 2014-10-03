define(['audiovisualiser'], function(AudioVisualiser) {
  var av = new AudioVisualiser();
  av.loadAudio('audio/test.mp3');

  var toggle = document.getElementById('toggle');

  document.addEventListener('click', function(e) {
    if (e.target == toggle) {
      if (!av.playing) {
        av.play();
        toggle.innerText = 'Stop';
      } else {
        av.stop();
        toggle.innerText = 'Play';
      }
    }
  }, false);
});
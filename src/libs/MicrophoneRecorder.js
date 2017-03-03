let analyser;
let audioCtx;
let mediaRecorder;
let chunks = [];
let startTime;
let stream;
let blobObject;
let onStopCallback;

const constraints = { audio: true, video: false }; // constraints - only audio needed

navigator.getUserMedia = (navigator.getUserMedia ||
                          navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia ||
                          navigator.msGetUserMedia);

export class MicrophoneRecorder {
  constructor(callback) {
    const self = this;

    if (navigator.mediaDevices) {
     console.log('getUserMedia supported.');

      navigator.mediaDevices.getUserMedia(constraints).then((str) => {
        stream = str;
        mediaRecorder = new MediaRecorder(str);
        mediaRecorder.onstop = this.onStop;
        onStopCallback = callback;
        mediaRecorder.ondataavailable = (event) => {
          chunks.push(event.data);
        }
      });
    }
    return this;
  }

  startRecording=(actx, anal) => {
    const self = this;

    audioCtx = actx;
    analyser = anal;
    startTime = Date.now();

    if(audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    if(mediaRecorder && mediaRecorder.state === 'paused') {
      mediaRecorder.resume();
      return;
    }

    const source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyser);

    mediaRecorder.start(10);
  }

  stopRecording() {
    if(mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      audioCtx.suspend();
    }
  }

  onStop(evt) {
    const blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
    chunks = [];

    const blobObject =  {
      blob      : blob,
      startTime : startTime,
      stopTime  : Date.now(),
      blobURL   : window.URL.createObjectURL(blob)
    }

    onStopCallback(blobObject);

  }

}
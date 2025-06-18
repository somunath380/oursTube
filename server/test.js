const ffmpeg = require('fluent-ffmpeg');
const path = require('path');


ffmpeg.ffprobe('/home/lonewolf/Videos/Screencasts/test.webm', (err, metadata) => {
    if (err) throw err;

    const videoStream = metadata.streams.find(s => s.codec_type === 'video');
    const audioStream = metadata.streams.find(s => s.codec_type === 'audio');

    console.log('Width:', videoStream.width);
    console.log('Height:', videoStream.height);
    console.log('Has Audio:', !!audioStream);
});


const inputPath = '/home/lonewolf/Videos/Screencasts/test.mp4'
const outputPath = path.join('/home/lonewolf/Videos/Screencasts', 'hls', 'out1.mpd');
const scaleOptions = ['scale=1280:720', 'scale=640:320'];
const videoCodec = 'libx264';
const x264Options = 'keyint=24:min-keyint=24:no-scenecut';
const videoBitrates = ['1000k', '2000k', '4000k'];

// Start the FFmpeg command
ffmpeg()
.input(inputPath)
  .videoFilters(scaleOptions)
  .videoCodec(videoCodec)
  .addOption('-x264opts', x264Options)
  .outputOptions('-b:v', videoBitrates[0])
  .format('dash')
  .output(outputPath)
  .on('start', commandLine => {
    console.log('Spawned FFmpeg with command: ' + commandLine);
  })
  .on('error', (err, stdout, stderr) => {
    console.error('Error:', err.message);
    console.error('stderr:', stderr);
  })
  .on('end', () => {
    console.log('Transcoding finished successfully');
  })
  .run();

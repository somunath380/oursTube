
import './App.css'

import VideoPlayer from './components/videoPlayer'

function App() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">DASH Video Player</h1>
      <VideoPlayer src="http://localhost:3000/hls/out.mpd" />
    </div>
  );
}

export default App

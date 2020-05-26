import React, {
  useState,
  createContext,
  useContext,
  useEffect,
  useRef,
} from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';

const API_KEY = 'm91i3eb05usl1nmkk3fcdk5i64';
const API_SECRET = 'q38s6vu0gsm9go0843tlat6as5';
//should be in env files ^^

const CAPTURE_OPTIONS = {
  audio: false,
  video: { facingMode: 'environment' },
};

const readURL = file => {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = e => res(e.target.result);
    reader.onerror = e => rej(e);
    reader.readAsDataURL(file);
  });
};

const AppContext = createContext(null);

const initialAppData = {
  type: undefined,
  value: undefined,
  detectDate: undefined,
};

function App() {
  const [appData, setAppDate] = useState(initialAppData);

  return (
    <AppContext.Provider value={{ appData, setAppDate }}>
      <Router>
        <>
          <header>
            <h1>How you feel today App</h1>
          </header>

          <main className="main">
            <nav>
              <ul>
                <li>
                  <Link to="/">Home</Link>
                </li>
                <li>
                  <Link to="/upload">New photo</Link>
                </li>
              </ul>
            </nav>

            <Switch className="main">
              <Route path="/upload" exact={true}>
                <UploadSelector />
              </Route>
              <Route path="/upload/camera">
                <UploadCamera />
              </Route>
              <Route path="/upload/file">
                <UploadFile />
              </Route>
              <Route path="/upload/url">
                <UploadUrl />
              </Route>
              <Route path="/display">
                <Display />
              </Route>
              <Route path="/" exact={true}>
                <Home />
              </Route>
            </Switch>
          </main>

          <footer>
            <h4>Created by Rafał Białek</h4>
          </footer>
        </>
      </Router>
    </AppContext.Provider>
  );
}

export default App;

async function detectByURlRequest(url) {
  const response = await fetch(
    `http://api.skybiometry.com/fc/faces/detect.json?api_key=${API_KEY}&api_secret=${API_SECRET}&urls=${url}&attributes=all`
  );
  const data = await response.json();
  return data;
}

async function detectByFileRequest(file) {
  const data = new FormData();

  data.append(file.name, file);

  const post = await fetch(
    `http://api.skybiometry.com/fc/faces/detect.json?api_key=${API_KEY}&api_secret=${API_SECRET}&attributes=all`,
    {
      method: 'POST',
      headers: {
        accept: '*/*',
        'accept-language': 'en,pl-PL;q=0.9,pl;q=0.8,en-US;q=0.7',
        'content-type':
          'multipart/form-data; boundary=----WebKitFormBoundaryLt6uRXWisasam5wO',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
      },
      body: data,
    }
  );
  const response = await post.json();
  return response;
}

function Home() {
  return (
    <div>
      <b>Upload your photo and discover how you feel today</b>
      <div>
        <Link to="/upload">Upload new photo</Link>
      </div>
    </div>
  );
}

function UploadSelector() {
  const { appData, setAppDate } = useContext(AppContext);

  setAppDate(initialAppData);

  return (
    <div>
      <b>How you want upload photo?</b>
      <div className="col-3">
        <Link to="/upload/camera">Camera</Link>
        <Link to="/upload/file">File</Link>
        <Link to="/upload/url">URL</Link>
      </div>
    </div>
  );
}

function UploadCamera() {
  const { appData, setAppDate } = useContext(AppContext);
  const [mediaStream, setMediaStream] = useState(null);

  useEffect(() => {
    async function enableStream() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(
          CAPTURE_OPTIONS
        );
        setMediaStream(stream);
      } catch (err) {
        console.log(err);
      }
    }

    if (mediaStream === null) {
      enableStream();
    } else {
      return mediaStream.getTracks().forEach(track => {
        track.stop();
      });
    }
  }, [mediaStream]);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  if (mediaStream && videoRef.current && !videoRef.current.srcObject) {
    videoRef.current.srcObject = mediaStream;
  }

  function handleCanPlay() {
    videoRef.current.play();
  }

  function handleCapture() {
    const context = canvasRef.current.getContext('2d');

    context.drawImage(videoRef.current, 10, 10);

    canvasRef.current.toBlob(blob => setAppDate({ type: 'file', value: blob }));
  }

  return (
    <div>
      <video ref={videoRef} onCanPlay={handleCanPlay} autoPlay muted />
      <canvas ref={canvasRef} />
      <button onClick={handleCapture}>Submit</button>
    </div>
  );
}
function UploadFile() {
  const { appData, setAppDate } = useContext(AppContext);

  return (
    <div>
      <b>select your photo files</b>
      <input
        type="file"
        onChange={e => setAppDate({ type: 'file', value: e.target.files[0] })}
      />
      <Link to="/display">Submit</Link>
    </div>
  );
}
function UploadUrl() {
  const { appData, setAppDate } = useContext(AppContext);
  return (
    <div>
      <b>input url with http/https your photo</b>
      <input
        value={appData && appData.type === 'url' ? appData.value : ''}
        type="text"
        onChange={e => setAppDate({ type: 'url', value: e.target.value })}
      />
      <Link to="/display">Submit</Link>
    </div>
  );
}

function Display() {
  const { appData, setAppDate } = useContext(AppContext);
  const [img, setImg] = useState(undefined);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (
      appData &&
      appData.value &&
      appData.detectDate === undefined &&
      !isLoading
    ) {
      setIsLoading(true);
      if (appData.type === 'url') {
        setImg(appData.value);
        detectByURlRequest(appData.value).then(value => {
          setAppDate({ ...appData, detectDate: value });
          setIsLoading(false);
        });
      }
      if (appData.type === 'file') {
        console.log(appData.value);
        console.log(readURL(appData.value));
        readURL(appData.value).then(value => setImg(value));

        detectByFileRequest(appData.value).then(value => {
          setAppDate({ ...appData, detectDate: value });
          setIsLoading(false);
        });
      }
    }
  }, [appData, setAppDate]);

  return (
    <>
      <div className="display">
        <img src={img} alt="yourFace" />
      </div>

      {appData && appData.detectDate !== undefined ? (
        <DetectedInfo />
      ) : (
        <div>
          <b>Error!</b>
        </div>
      )}
    </>
  );
}

function DetectedInfo() {
  const { appData, setAppDate } = useContext(AppContext);
  console.log(appData.detectDate);

  return (
    <div>
      <div>appData.</div>
    </div>
  );
}

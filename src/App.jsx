import React, {
  useState,
  createContext,
  useContext,
  useEffect,
  useRef,
} from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useHistory,
} from 'react-router-dom';

import 'font-awesome/css/font-awesome.css';

const API_KEY = 'm91i3eb05usl1nmkk3fcdk5i64';
const API_SECRET = 'q38s6vu0gsm9go0843tlat6as5';
//should be in env files ^^

const CAPTURE_OPTIONS = {
  audio: false,
  video: {
    facingMode: 'environment',
    width: { ideal: 1280 },
    height: { ideal: 720 },
  },
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <AppContext.Provider value={{ appData, setAppDate }}>
      <Router>
        <>
          <header>
            <nav
              className="navbar is-primary"
              role="navigation"
              aria-label="main navigation">
              <div className="navbar-brand">
                <img
                  className="logo"
                  src={process.env.PUBLIC_URL + '/logo.png'}
                  alt="logo"
                />

                <div
                  className={`navbar-burger burger ${
                    isMobileMenuOpen ? 'is-active' : ''
                  } `}
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                  <span aria-hidden="true"></span>
                  <span aria-hidden="true"></span>
                  <span aria-hidden="true"></span>
                </div>
              </div>

              <div
                className={`navbar-menu ${
                  isMobileMenuOpen ? 'is-active' : ''
                }`}>
                <div className="navbar-start">
                  <Link to="/" className="navbar-item">
                    Home
                  </Link>

                  <Link to="/upload" className="navbar-item">
                    New photo
                  </Link>
                </div>
              </div>
            </nav>
          </header>

          <section className="section">
            <div className="container">
              <Switch>
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
            </div>
          </section>

          <footer className="footer">
            <div className="content has-text-centered">
              <h4>Created by Rafał Białek</h4>
            </div>
          </footer>
        </>
      </Router>
    </AppContext.Provider>
  );
}

export default App;

async function detectByURlRequest(url) {
  const response = await fetch(
    `https://api.skybiometry.com/fc/faces/detect.json?api_key=${API_KEY}&api_secret=${API_SECRET}&urls=${url}&attributes=all`
  );
  const data = await response.json();
  return data;
}

async function detectByFileRequest(file) {
  const data = new FormData();

  data.append(file.name, file);

  const post = await fetch(
    `https://api.skybiometry.com/fc/faces/detect.json?api_key=${API_KEY}&api_secret=${API_SECRET}&attributes=all`,
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
  const { appData, setAppDate } = useContext(AppContext);

  useEffect(() => {
    if (appData && appData.type !== undefined) {
      setAppDate(initialAppData);
    }
  }, []);

  return (
    <div>
      <h1 className="title is-1 has-text-centered">Upload your photo</h1>
      <h1 className="subtitle is-1 has-text-centered">
        let me guess who you are and how you feel today
      </h1>
      <div className="has-text-centered">
        <Link className="button is-primary is-large" to="/upload">
          Upload new photo
        </Link>
      </div>
    </div>
  );
}

function UploadSelector() {
  const { appData, setAppDate } = useContext(AppContext);

  useEffect(() => {
    if (appData && appData.type !== undefined) {
      setAppDate(initialAppData);
    }
  }, []);

  return (
    <div>
      <div className="content has-text-centered">
        <h3 className="title is-3">How you want upload photo?</h3>
      </div>
      <div className="columns is-desktop">
        <div className="column has-text-centered">
          <Link className="button is-medium is-primary" to="/upload/camera">
            Camera
            <i className="fa fa-video-camera" aria-hidden="true"></i>
          </Link>
        </div>

        <div className="column has-text-centered">
          <Link className="button is-medium is-link" to="/upload/file">
            File
            <i className="fa fa-file-o" aria-hidden="true"></i>
          </Link>
        </div>

        <div className="column has-text-centered">
          <Link className="button is-medium is-success" to="/upload/url">
            URL
            <i className="fa fa-link" aria-hidden="true"></i>
          </Link>
        </div>
      </div>
    </div>
  );
}

function UploadCamera() {
  const { appData, setAppDate } = useContext(AppContext);
  const [mediaStream, setMediaStream] = useState(null);

  const history = useHistory();

  function cleanup() {
    mediaStream.getTracks().forEach(track => {
      track.stop();
    });
  }

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

    if (!mediaStream) {
      enableStream();
    } else {
      return () => cleanup();
    }
  }, [mediaStream]);

  useEffect(() => {
    if (appData && appData.type !== undefined) {
      history.push('/display');
    }
  }, [appData]);

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

    context.drawImage(videoRef.current, 0, 0, 1280, 720);

    canvasRef.current.toBlob(blob =>
      setAppDate({ type: 'camera', value: blob })
    );
    cleanup();
  }

  return (
    <div className="content has-text-centered">
      <h3 className="title is-3">Take a photo by your camera</h3>
      <div className="video-container">
        <video ref={videoRef} onCanPlay={handleCanPlay} autoPlay muted />
        <canvas ref={canvasRef} width="1280" height="720 " />
      </div>

      <div className=" has-text-right">
        <button className="button is-medium is-primary" onClick={handleCapture}>
          Submit
        </button>
      </div>
    </div>
  );
}

function UploadFile() {
  const { appData, setAppDate } = useContext(AppContext);

  return (
    <div>
      <div className="content has-text-centered">
        <h3 className="title is-3">Select your photo files</h3>
      </div>

      <div className="columns is-desktop">
        <div className="column">
          <div className="field">
            <div className="file is-primary has-name is-boxed">
              <label className="file-label">
                <input
                  className="file-input"
                  type="file"
                  name="resume"
                  onChange={e =>
                    setAppDate({ type: 'file', value: e.target.files[0] })
                  }
                />
                <span className="file-cta">
                  <span className="file-icon">
                    <i className="fa fa-cloud-upload" aria-hidden="true"></i>
                  </span>
                  <span className="file-label">Select file…</span>
                </span>
                <span className="file-name">
                  {appData.type === 'file' ? appData.value.name : 'File name'}
                </span>
              </label>
            </div>
          </div>
        </div>
        <div className="column ">
          <Link className="button is-primary is-medium" to="/display">
            Submit
          </Link>
        </div>
      </div>
    </div>
  );
}

function UploadUrl() {
  const { appData, setAppDate } = useContext(AppContext);
  return (
    <div>
      <div className="content has-text-centered">
        <h3 className="title is-3">Input url with http/https your photo</h3>
      </div>

      <div className="field">
        <div className="control">
          <input
            className="input is-medium"
            value={appData && appData.type === 'url' ? appData.value : ''}
            type="text"
            onChange={e => setAppDate({ type: 'url', value: e.target.value })}
            placeholder="Input URL..."
          />
        </div>
      </div>
      <div className="has-text-right">
        <Link className="button is-primary is-medium" to="/display">
          Submit
        </Link>
      </div>
    </div>
  );
}

function Display() {
  const { appData, setAppDate } = useContext(AppContext);
  const [img, setImg] = useState(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const history = useHistory();

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
        detectByURlRequest(appData.value).then(response => {
          if (
            response &&
            response.photos[0] &&
            response.photos[0].tags.lenght !== 0
          ) {
            setAppDate({ ...appData, detectDate: response.photos[0].tags[0] });
          }
          setIsLoading(false);
        });
      }
      if (appData.type === 'file') {
        readURL(appData.value).then(value => setImg(value));

        detectByFileRequest(appData.value).then(response => {
          if (
            response &&
            response.photos[0] &&
            response.photos[0].tags.lenght !== 0
          ) {
            setAppDate({ ...appData, detectDate: response.photos[0].tags[0] });
          }
          setIsLoading(false);
        });
      }
      if (appData.type === 'camera') {
        setImg(URL.createObjectURL(appData.value));

        detectByFileRequest(appData.value).then(response => {
          if (
            response &&
            response.photos[0] &&
            response.photos[0].tags.lenght !== 0
          ) {
            setAppDate({ ...appData, detectDate: response.photos[0].tags[0] });
          }
          setIsLoading(false);
        });
      }
    }
    if (appData && appData.type === undefined) {
      history.push('/');
    }
  }, [appData]);

  return (
    <div>
      <div className="content has-text-centered">
        <h3 className="title is-3">I thing you are</h3>
      </div>
      <div className="columns is-desktop">
        <div className="column">
          <img src={img} alt="yourFace" />
        </div>

        <div className="column is-relative">
          {!isLoading ? (
            <DetectedInfo />
          ) : (
            <div className="loader-wrapper is-active">
              <div className="loader is-loading"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetectedInfo() {
  const { appData, setAppDate } = useContext(AppContext);

  let data = {};

  if (appData.detectDate !== undefined) {
    const attributes = appData.detectDate.attributes;
    data.age = attributes.age_est && attributes.age_est.value;

    const foundEthnicity =
      attributes.ethnicity &&
      Object.entries(attributes.ethnicity).find(
        item => item[1].value === 'true'
      );
    if (foundEthnicity !== undefined) {
      data.ethnicity = foundEthnicity[0];
    }

    data.gender = attributes.gender && attributes.gender.value;

    data.eyesOpened = attributes.eyes && attributes.eyes.value === 'open';

    data.feeling = attributes.mood.value;

    if (data.gender === 'female') {
      data.element =
        (attributes.glasses && attributes.glasses.value === 'true') ||
        (attributes.dark_glasses && attributes.dark_glasses.value === 'true')
          ? 'glasses'
          : attributes.hat && attributes.hat.value === 'true' && 'hat';
    }

    if (data.gender === 'male') {
      data.element =
        attributes.mustache && attributes.mustache.value === 'true'
          ? 'mustache'
          : attributes.beard && attributes.beard.value === 'true'
          ? 'beard'
          : attributes.hat && attributes.hat.value === 'true' && 'hat';
    }
  }

  return (
    <div>
      {appData.detectDate === undefined && (
        <h3 className="subtitle is-3">Error!</h3>
      )}
      {data.age && <span>{`You're about ${data.age} years old. `}</span>}
      {data.ethnicity && data.gender && (
        <span>{`I think you're a  ${data.ethnicity} ${
          data.gender === 'female' ? 'women' : 'men'
        }. `}</span>
      )}
      {data.eyesOpened === true && (
        <span>The picture came out well, your eyes are open. </span>
      )}
      {data.element && <span>{`You have awasome ${data.menElement}. `}</span>}
      {data.feeling && (
        <span>{`In the picture, you look  ${data.feeling}. `}</span>
      )}
    </div>
  );
}

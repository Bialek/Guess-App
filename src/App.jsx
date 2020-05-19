import React, { useState, createContext, useContext } from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';

const AppContext = createContext(null);

const initialAppData = {
  type: undefined,
  value: undefined,
  photoData: undefined,
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
  return <h2>Camera</h2>;
}
function UploadFile() {
  return <h2>File</h2>;
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

  console.log(appData);

  return <div></div>;
}

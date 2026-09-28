import "../styles/globals.css";

const App = ({ Component, pageProps }) => (
  <>
    <a href="#main-content" className="skip-link">
      Skip to main content
    </a>
    <Component {...pageProps} />
  </>
);



// import Maintenance from "./Maintenance";

// function App() {
//   return <Maintenance />;
// }

export default App;

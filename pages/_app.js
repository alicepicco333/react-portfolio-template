import "../styles/globals.css";
import { ThemeProvider } from "next-themes";

const App = ({ Component, pageProps }) => {
  return (
    <Component {...pageProps} />
  );
}



// import Maintenance from "./Maintenance";

// function App() {
//   return <Maintenance />;
// }

export default App;

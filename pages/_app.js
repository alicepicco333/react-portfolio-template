import "../styles/globals.css";
import { ThemeProvider } from "next-themes";

const App = ({ Component, pageProps }) => {
  return (
    <ThemeProvider>
     <Component {...pageProps} />
    </ThemeProvider>
 );
};



// import Maintenance from "./Maintenance";

// function App() {
//   return <Maintenance />;
// }

export default App;

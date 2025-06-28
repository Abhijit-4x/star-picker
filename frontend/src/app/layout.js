import Navbar from './components/navbar';
import './globals.css';

export const metadata = {
  title: 'Star Picker',
  description: 'Let us pick the star for ya!',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />  
        {children}
      </body>
    </html>
  );
}
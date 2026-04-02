import './globals.css';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';

export const metadata = {
  title: 'BoardPrep AI — Smart Learning for Board Exams',
  description: 'AI-Powered Learning Management System for 10th & 12th Board Exam preparation. Get instant doubt resolution, one-page summaries, mock tests, and AI grading.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <div className="animated-bg"></div>
          <Navbar />
          <main style={{ minHeight: 'calc(100vh - 64px)' }}>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}

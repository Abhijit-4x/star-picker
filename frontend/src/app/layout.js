export const metadata = {
  title: 'Star Picker',
  description: 'Pick a random star from MongoDB',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
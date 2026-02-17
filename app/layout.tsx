import "../styles/global.css";

export default async function RootLayout({ children }: any) {
  return (
    <html>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, minimum-scale=1.0, user-scalable=yes"
        />
      </head>
      <body className="dark:bg-gray-gray13 dark:text-gray-gray1">
        {children}
      </body>
    </html>
  );
}

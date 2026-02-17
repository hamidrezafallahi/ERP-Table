import {
  useEffect,
  useState,
} from 'react';

const LastUpdate = () => {
  const [text, setText] = useState("");

  useEffect(() => {
    const fetchText = async () => {
      try {
        const response = await fetch("/Update.txt");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.text();
        setText(data);
      } catch (error) {
        console.error("Error fetching the text file:", error);
      }
    };

    fetchText();
  }, []);

  return (
    <div>
      <h1>اخرین تغییرات</h1>
      <div>{text}</div>
    </div>
  );
};

export default LastUpdate;

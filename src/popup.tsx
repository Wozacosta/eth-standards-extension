import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

const Popup = () => {
  const [count, setCount] = useState(0);
  const [standards, setStandards] = useState<string[]>([]);
  const [currentURL, setCurrentURL] = useState<string>();

  // useEffect(() => {
  //   chrome.action.setBadgeText({ text: count.toString() });
  // }, [count]);

  useEffect(() => {
    const messageListener = (message: any) => {
      if (message.elements) {
        const uniqueElements = new Set<string>(message.elements);
        setStandards(Array.from(uniqueElements));
        setCount(uniqueElements.size);
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);

    // Cleanup listener on component unmount
    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      console.log(`getting info for tab ${tabs[0].id}, url=${tabs[0].url}`);
      setCurrentURL(tabs[0].url);
      setTimeout(() => {
      chrome.tabs.sendMessage(tabs[0].id!, { action: "getElements" }, (response) => {
        if (response && response.elements) {
          const uniqueElements = new Set<string>(response.elements);
          setStandards(Array.from(uniqueElements));
          console.log({uniqueElements})
          setCount(uniqueElements.size);
        }
      });
      }, 1000)
    });
    // console.log("ADDING LISTENER");
    // const inPage = JSON.parse(
    //   localStorage.getItem("ethStandards-itemsInPage") || "[]"
    // );
    // console.log({ inPage });
  }, []);

  return (
    <>
      <h2>ERC/EIP Elements: {count}</h2>
      <ul style={{ minWidth: "700px" }}>
        {standards.map((standard, index) => (
          <li key={index}>{standard}</li>
        ))}
      </ul>
    </>
  );
};

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);

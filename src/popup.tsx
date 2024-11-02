import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";


const Popup = () => {
  const [count, setCount] = useState(0);
  const [currentURL, setCurrentURL] = useState<string>();
  
//   const textElements = document.querySelectorAll("*");
// const ercEipElements = Array.from(textElements).filter((el) => {
//   return (
//     el.children.length === 0 && el.textContent?.match(/(ERC|EIP)-?\d{1,6}/)
//   );
// });
// console.log({ ercEipElements });


  useEffect(() => {
    chrome.action.setBadgeText({ text: count.toString() });
  }, [count]);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      setCurrentURL(tabs[0].url);
      console.log({tab: tabs[0]})
      if (tabs[0]?.id) {
        chrome.scripting?.executeScript(
          {
            target: { tabId: tabs[0].id },
            func: () => {
              const textElements = document.querySelectorAll("*");
              const elements =  Array.from(textElements).filter((el) => {
                return (
                  el.children.length === 0 &&
                  el.textContent?.match(/(ERC|EIP)-?\d{1,6}/i)
                );
              }).map((el) => {
              const match = el.textContent?.match(/(ERC|EIP)-?(\d{1,6})/i);
                if (match) {
                  const [fullMatch, type, number] = match;
                  console.log({ match, fullMatch, type, number });
                  const capitalizedType = type.toUpperCase();
                  return `${capitalizedType}-${number}`;
                }
              })
              console.log({elements})
              return elements;//new Set(elements)
            },
          },
          (results) => {
            console.log({results})

            if (results && results[0] && results[0].result) {
              const resSet = new Set(results[0].result);
              // console.log({ELEMEN : results[0].result})
              setCount(resSet.size);
            }
          }
        );
      }
    });
  }, []);

  const changeBackground = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const tab = tabs[0];
      if (tab.id) {
        chrome.tabs.sendMessage(
          tab.id,
          {
            color: "#555555",
          },
          (msg) => {
            console.log("result message:", msg);
          }
        );
      }
    });
  };

  return (
    <>
      <ul style={{ minWidth: "700px" }}>
        <li>Current URL: {currentURL}</li>
        <li>Current Time: {new Date().toLocaleTimeString()}</li>
      </ul>
      <button
        onClick={() => setCount(count + 1)}
        style={{ marginRight: "5px" }}
      >
        count up
      </button>
      <button onClick={changeBackground}>change background</button>
    </>
  );
};

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);

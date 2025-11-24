"use client";

import { Toaster } from "react-hot-toast";

export default function ToasterProvider() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      toastOptions={{
        style: {
          background: '#333',
          color: '#fff',
          zIndex: 9999,
        },
        success: {
          duration: 4000,
          style: {
            background: 'white',
            color: '#319c2dff',
          },
        },
        error: {
          duration: 4000,
          style: {
            background: 'red',
            color: 'white',
          },
        },
      }}
    />
  );
}

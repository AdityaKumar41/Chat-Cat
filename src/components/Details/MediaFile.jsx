import React from "react";
import { IconDownload } from "@tabler/icons-react";

const MediaDisplay = ({ mediaFiles }) => {
  const renderMedia = (file, index) => {
    if (!file || !file.url || !file.type) {
      return null; // Return null if file or its properties are undefined/null
    }

    const { url, type, name } = file;

    if (type.startsWith("image/")) {
      return (
        <div className="photoItem" key={index}>
          <div className="photoDetail">
            <img src={url} alt={name} />
            <span>{name}</span>
          </div>
          <div className="mainImg">
            <a href={url} download>
              <IconDownload className="img" />
            </a>
          </div>
        </div>
      );
    } else if (type.startsWith("video/")) {
      return (
        <div className="photoItem" key={index}>
          <div className="videoDetail">
            <video controls>
              <source src={url} type={type} />
              Your browser does not support the video tag.
            </video>
            <span>{name}</span>
          </div>
          <div className="mainImg">
            <a href={url} download>
              <IconDownload className="img" />
            </a>
          </div>
        </div>
      );
    } else if (type.startsWith("audio/")) {
      return (
        <div className="photoItem" key={index}>
          <div className="audioDetail">
            <audio controls>
              <source src={url} type={type} />
              Your browser does not support the audio element.
            </audio>
            <span>{name}</span>
          </div>
          <div className="mainImg">
            <a href={url} download>
              <IconDownload className="img" />
            </a>
          </div>
        </div>
      );
    } else if (type === "application/pdf") {
      return (
        <div className="photoItem" key={index}>
          <div className="pdfDetail">
            <a href={url} target="_blank" rel="noopener noreferrer">
              <IconDownload className="pdf" />
              <span>{name}</span>
            </a>
          </div>
        </div>
      );
    } else {
      // Default case for unsupported file types
      return (
        <div className="photoItem" key={index}>
          <div className="fileDetail">
            <IconDownload className="file" />
            <span>{name}</span>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="photos">
      {mediaFiles.map((file, index) => renderMedia(file, index))}
    </div>
  );
};

export default MediaDisplay;

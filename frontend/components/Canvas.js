import React, { useRef, useEffect, useState } from "react";
import { useRecordById, Button } from "@airtable/blocks/ui";

/* Before release checklist: 
4. Read UI guidelines
6. Release
3. Save to airtable feature
5. Look out for possible exception scenarios : like checking for permissions before save to airtable
*/

const Canvas = ({
  table,
  selectedRecordId,
  fontColor,
  fontSize,
  font,
  text1,
  text2,
}) => {
  const canvasRef = useRef(null);
  const [textObj1, setTextObj1] = useState({
    id: "text1",
    isSelected: false,
    startX: 0,
    startY: 0,
    x: 10,
    y: 50,
  });
  const [textObj2, setTextObj2] = useState({
    id: "text2",
    isSelected: false,
    startX: 0,
    startY: 0,
    x: 100,
    y: 300,
  });

  //HANDLE WHEN THIS BREAKS ON TABLE CHANGE
  let selectedRecord = useRecordById(
    table,
    selectedRecordId ? selectedRecordId : "",
    {
      fields: ["Base Image", "Logo", "Event Name", "Poster"],
    }
  );

  const baseImg = new Image();
  const logo = new Image();

  //Setting cross origin to anonymous to prevent canvas from getting tainted:
  // https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image
  baseImg.crossOrigin = "Anonymous";
  logo.crossOrigin = "Anonymous";

  const drawBackgroundAndLogoOnCanvas = () => {
    let baseImageData = "";
    let logoData = "";

    //This block only supports one image so choose the 1st record from the field
    if (
      selectedRecord &&
      selectedRecord.getCellValue("Base Image") !== null &&
      selectedRecord.getCellValue("Logo") !== null
    ) {
      baseImageData = selectedRecord.getCellValue("Base Image")[0].url;
      logoData = selectedRecord.getCellValue("Logo")[0].url;
    } else {
      // load onBoarding Image
      baseImageData =
        "https://qpostgen.s3.us-east-2.amazonaws.com/onboarding.png";
      logoData = "";
    }

    const context = canvasRef.current.getContext("2d");
    context.font = `${fontSize + " " + font}`;
    context.fillStyle = fontColor;

    baseImg.onload = function () {
      const imgWidth = baseImg.width;
      const imgHeight = baseImg.height;
      context.drawImage(
        baseImg,
        0,
        0,
        imgWidth,
        imgHeight, // source rectangle
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
      context.fillText(text1, textObj1.x, textObj1.y);
      context.fillText(text2, textObj2.x, textObj2.y);
    };
    baseImg.src = baseImageData;
    logo.onload = function () {
      const logoWidth = logo.width;
      const logoHeight = logo.height;
      const isRectangleLogo = logo.width - logo.height > 100 ? true : false;
      if (isRectangleLogo) {
        context.drawImage(
          logo,
          0,
          0,
          logoWidth,
          logoHeight,
          canvasRef.current.width - 100,
          0,
          100, //scaling logo according to canvas
          50
        );
      } else {
        context.drawImage(
          logo,
          0,
          0,
          logoWidth,
          logoHeight,
          canvasRef.current.width - 100,
          0,
          100, //scaling logo according to canvas
          100
        );
      }
      context.fillText(text1, textObj1.x, textObj1.y);
      context.fillText(text2, textObj2.x, textObj2.y);
    };
    logo.src = logoData;
    // context.fillText(text1, textObj1.x, textObj1.y);
    // context.fillText(text2, textObj2.x, textObj2.y);
  };

  useEffect(() => {
    if (canvasRef.current !== null) {
      drawBackgroundAndLogoOnCanvas();
    }
  });

  const downloadCanvasAsImage = () => {
    if (canvasRef.current !== null) {
      var link = document.createElement("a");
      link.download =
        selectedRecord && selectedRecord.getCellValue("Base Image") !== null
          ? selectedRecord.getCellValue("Base Image")[0].filename
          : "posterGenerator.png";
      const canvas = document.getElementsByTagName("canvas");
      link.href = canvas[0].toDataURL("image/png");
      link.click();
    }
  };

  //handles drag and drop feature
  const handleMouseDown = (x, y) => {
    if (canvasRef.current !== null) {
      const context = canvasRef.current.getContext("2d");
      const startX = parseInt(x - context.canvas.offsetLeft);
      const startY = parseInt(y - context.canvas.offsetTop);
      const text = [textObj1, textObj2];
      for (let i = 0; i <= 1; i++) {
        const check =
          startX >= text[i].x &&
          startX <= text[i].x + context.measureText(`text${i + 1}`).width &&
          startY <= text[i].y &&
          startY >= text[i].y - parseInt(fontSize);
        if (check && i == 0) {
          setTextObj1({ ...textObj1, isSelected: true, startX, startY });
          setTextObj2({ ...textObj2, isSelected: false, startX: 0, startY: 0 });
        } else if (check && i == 1) {
          setTextObj2({ ...textObj2, isSelected: true, startX, startY });
          setTextObj1({ ...textObj1, isSelected: false, startX: 0, startY: 0 });
        }
      }
    }
  };

  const handleMouseMove = (e) => {
    if (
      canvasRef.current !== null &&
      (textObj1.isSelected || textObj2.isSelected)
    ) {
      e.preventDefault();
      const context = canvasRef.current.getContext("2d");
      const currentMouseX = parseInt(e.clientX - context.canvas.offsetLeft);
      const currentMouseY = parseInt(e.clientY - context.canvas.offsetTop);
      if (textObj1.isSelected) {
        const dx = currentMouseX - textObj1.startX;
        const dy = currentMouseY - textObj1.startY;
        setTextObj1({
          ...textObj1,
          isSelected: true,
          startX: currentMouseX,
          startY: currentMouseY,
          x: (textObj1.x += dx),
          y: (textObj1.y += dy),
        });
      } else if (textObj2.isSelected) {
        const dx = currentMouseX - textObj2.startX;
        const dy = currentMouseY - textObj2.startY;
        setTextObj2({
          ...textObj2,
          isSelected: true,
          startX: currentMouseX,
          startY: currentMouseY,
          x: (textObj2.x += dx),
          y: (textObj2.y += dy),
        });
      }
    }
  };

  const handleMouseUp = (e) => {
    e.preventDefault();
    console.log("mouseup #########");
    if (textObj1.isSelected || textObj2.isSelected) {
      setTextObj1({ ...textObj1, isSelected: false, startX: 0, startY: 0 });
      setTextObj2({ ...textObj2, isSelected: false, startX: 0, startY: 0 });
    }
  };
  //};

  const handleMouseOut = (e) => {
    e.preventDefault();
    console.log("mouseout #########");
    setTextObj1({
      ...textObj1,
      isSelected: false,
      startX: 0,
      startY: 0,
    });
    setTextObj2({
      ...textObj2,
      isSelected: false,
      startX: 0,
      startY: 0,
    });
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        width={"450"}
        height={"350"}
        style={{
          border: "0.4em solid rgb(45,127,249)",
          padding: "0.5em",
        }}
        onMouseDown={(e) => {
          handleMouseDown(e.clientX, e.clientY);
        }}
        onMouseMove={(e) => {
          handleMouseMove(e);
        }}
        onMouseUp={(e) => {
          handleMouseUp(e);
        }}
        onMouseOut={(e) => {
          handleMouseOut(e);
        }}
      ></canvas>
      <div className="m-2">
        <div className="m-2 grid-2">
          <Button
            id="saveToAirtable"
            // onClick={addPhotoToAirtable}
            variant="primary"
            icon="publish"
            width="100%"
            disabled
          >
            Save to Airtable
          </Button>
          <Button
            id="download"
            onClick={downloadCanvasAsImage}
            variant="primary"
            icon="download"
            width="100%"
          >
            Download
          </Button>
        </div>
      </div>
    </>
  );
};

export default Canvas;

//1. Get an instruction image made

// const savePosterToSelectedRecordField = async () => {
//   if (canvasRef.current !== null) {
//     const canvas = document.getElementsByTagName("canvas");
//     const newAttachmentUrl = canvas[0].toDataURL("image/png");
//     table.updateRecord(selectedRecordId, {
//       Poster: [{ url: newAttachmentUrl }],
//     });
//   }
// };

// const srcToFile = (src, fileName, mimeType) => {
//   return fetch(src)
//     .then(function (res) {
//       return res.arrayBuffer();
//     })
//     .then(function (buf) {
//       return new File([buf], fileName, { type: mimeType });
//     });
// };

// const addPhotoToAirtable = async () => {
//   if (canvasRef.current !== null) {
//     const canvas = document.getElementsByTagName("canvas");
//     const dataUrl = canvas[0].toDataURL("image/png");
//     const file = await srcToFile(dataUrl, "test", "image/png");
//     console.log("file-->", file);
//     const albumBucketName = "qpostgen";
//     const albumName = "airtable-poster-block";
//     const fileName = "testFile.png";

//     // const fileName = file.name;
//     const albumPhotosKey = encodeURIComponent(albumName) + "/";
//     const photoKey = albumPhotosKey + fileName;
//     const upload = new AWS.S3.ManagedUpload({
//       params: {
//         Bucket: albumBucketName,
//         Key: photoKey,
//         Body: file,
//         ACL: "public-read",
//       },
//     });
//     const promise = upload.promise();

//     promise.then(
//       function (data) {
//         console.log("Successfully uploaded photo.");
//         // viewAlbum(albumName);
//       },
//       function (err) {
//         return console.log(
//           "There was an error uploading your photo: ",
//           err.message
//         );
//       }
//     );
//   }
// };

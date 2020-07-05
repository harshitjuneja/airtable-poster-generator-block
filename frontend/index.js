import React, { useState } from "react";
import { cursor } from "@airtable/blocks";
import AWS from "aws-sdk/global";
import S3 from "aws-sdk/clients/s3";
import cssString from "./styles";
import {
  initializeBlock,
  useBase,
  useLoadable,
  useWatchable,
  loadCSSFromString,
  Input,
} from "@airtable/blocks/ui";
import Canvas from "./components/Canvas";
import TextColorPalette from "./components/ColorPallete";
import FontSizeSelector from "./components/FontSizeSelector";
import FontSelector from "./components/FontSelector";

loadCSSFromString(cssString);

const albumBucketName = "qpostgen";
const bucketRegion = "us-east-2";
const IdentityPoolId = "";

AWS.config.update({
  region: bucketRegion,
  credentials: new AWS.CognitoIdentityCredentials({
    IdentityPoolId: IdentityPoolId,
  }),
});

const s3 = new S3({
  apiVersion: "2006-03-01",
  params: { Bucket: albumBucketName },
});

const ImageEditorApp = () => {
  const [selectedRecordId, setSelectedRecordId] = useState(null);
  const [selectedFieldId, setSelectedFieldId] = useState(null);

  const [fontColor, setFontColor] = useState("#1283da");
  const [fontSize, setFontSize] = useState("30px");
  const [font, setFont] = useState("Georgia");
  const [text1, setText1] = useState("");
  const [text2, setText2] = useState("");

  useLoadable(cursor);

  useWatchable(cursor, ["selectedRecordIds", "selectedFieldIds"], () => {
    //caches desected airtable record for use post update

    if (cursor.selectedRecordIds.length > 0) {
      //Use first record in case of multiple selected records
      setSelectedRecordId(cursor.selectedRecordIds[0]);
    }
    if (cursor.selectedFieldIds.length > 0) {
      //Use first field in case of multiple selected records
      setSelectedFieldId(cursor.selectedFieldIds[0]);
    }
  });

  useWatchable(cursor, ["activeTableId", "activeViewId"], () => {
    setSelectedRecordId(null);
    setSelectedFieldId(null);
  });

  const base = useBase();
  const table = base.getTableByIdIfExists(cursor.activeTableId);

  // `table` is briefly null when switching to a newly created table.
  if (!table) {
    return null;
  }

  const parentCallback = (value, component) => {
    if (component === "color") {
      setFontColor(value);
    } else if (component === "fontSize") {
      setFontSize(value);
    } else if (component === "font") {
      setFont(value);
    }
  };

  return (
    <div className="container">
      <Canvas
        table={table}
        selectedRecordId={selectedRecordId}
        selectedFieldId={selectedFieldId}
        fontColor={fontColor}
        fontSize={fontSize}
        font={font}
        text1={text1}
        text2={text2}
      />
      <div className="m-2">
        <b>Select Text Color:</b>
      </div>
      <TextColorPalette parentCallback={parentCallback} />
      <div className="m-2">
        <b>Select Font:</b>
      </div>
      <div className="m-2">
        <FontSelector parentCallback={parentCallback} />
      </div>
      <div className="m-2">
        <b>Select Text Size:</b>
      </div>
      <div className="m-2">
        <FontSizeSelector parentCallback={parentCallback} />
      </div>
      <div className="m-2">
        <b>Add Text on Poster:</b>
      </div>
      <div className="m-2">
        <Input
          value={text1}
          onChange={(e) => {
            setText1(e.target.value);
          }}
          placeholder="Add text here and see it appear on your poster"
          width="100%"
        />
      </div>
      <div className="m-2">
        <Input
          value={text2}
          onChange={(e) => {
            setText2(e.target.value);
          }}
          placeholder="Add text here and see it appear on your poster"
          width="100%"
        />
      </div>
    </div>
  );
};

initializeBlock(() => <ImageEditorApp />);

{
  /* Image downloador features:
        3. An option to select image and drag and drop image around on the canvas
        4. An option to insert text and fonts and drag and drop text around the canvas
   * Tasks:
   *
   * 1. Preload images, so that browser picks up from cache the next time
   * 2. Add Text with an option of font selection
   * 3. Drag and drop text placement
   * 4. Drag and drop logo placement all over the screen
   */
}

// const listAlbums = () => {
//   s3.listObjects({ Delimiter: "/" }, function (err, data) {
//     if (err) {
//       return console.log(
//         "There was an error listing your albums: " + err.message
//       );
//     } else {
//       const albums = data.CommonPrefixes.map(function (commonPrefix) {
//         const prefix = commonPrefix.Prefix;
//         const albumName = decodeURIComponent(prefix.replace("/", ""));
//         console.log("albumName-->", albumName);
//       });
//       const message = albums.length;
//       console.log("no of albums--->", message);
//     }
//   });
// };

// const addAlbum = () => {
//   const albumName = "qpostgen";
//   const albumKey = encodeURIComponent(albumName) + "/";
//   s3.headObject({ Key: albumKey }, function (err, data) {
//     if (!err) {
//       return console.log("Album already exists.");
//     }
//     if (err.code !== "NotFound") {
//       return console.log(
//         "There was an error creating your album: " + err.message
//       );
//     }
//     s3.putObject({ Key: albumKey }, function (err, data) {
//       if (err) {
//         return console.log(
//           "There was an error creating your album: " + err.message
//         );
//       }
//       console.log("Successfully created album.");
//     });
//   });
// };

// const records = useRecords(table, {
//   fields: ["Base Image", "Logo"],
// });

// const baseImageUrlsToPreload = records.map((record) => {
//   const baseImgField = record.getCellValue("Base Image");
//   return baseImgField[0].url;
// });

// const logoImageUrlsToPreload = records.map((record) => {
//   const logoField = record.getCellValue("Logo");
//   return logoField[0].url;
// });

// const imageUrls = [...baseImageUrlsToPreload, ...logoImageUrlsToPreload];

// const preloadImage = (src) => {
//   return new Promise(() => {
//     const image = new Image();
//     image.src = src;
//   });
// };
// // Preload a bunch of images in parallel

// (async () => {
//   await Promise.all(imageUrls.map((url) => preloadImage(url)));
// })();

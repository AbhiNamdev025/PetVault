import React, { useState } from "react";
import styles from "./fileViewer.module.css";
import { X, ZoomIn, ZoomOut, Download } from "lucide-react";
import { BASE_URL as IMG_URL } from "../../../utils/constants";
import { Button } from "..";
const FileViewerModal = ({
  file,
  onClose
}) => {
  const [scale, setScale] = useState(1);
  let fileUrl = file?.file?.url;
  if (fileUrl && !fileUrl.startsWith("http")) {
    fileUrl = `${IMG_URL}${fileUrl.startsWith("/") ? "" : "/"}${fileUrl}`;
  }
  const isPdf = file?.file?.url?.toLowerCase().endsWith(".pdf") || file?.file?.fileType === "pdf";
  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));
  const handleDownload = () => {
    if (!fileUrl) return;
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = file.file.fileName || `document-${file._id}`; // Suggest filename
    link.target = "_blank"; // Fallback to open tab if download blocked
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  if (!fileUrl) return null;
  return <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.toolbar} onClick={e => e.stopPropagation()}>
        <span className={styles.fileName}>
          {file.title || file.file.fileName || "Document Viewer"}
        </span>

        <div className={styles.actions}>
          {/* Zoom controls usually for Images only, as PDF has native controls */}
          {!isPdf && <div className={styles.zoomControls}>
              <Button onClick={handleZoomOut} title="Zoom Out" variant="ghost" size="sm">
                <ZoomOut size={18} />
              </Button>
              <span className={styles.zoomLevel}>
                {Math.round(scale * 100)}%
              </span>
              <Button onClick={handleZoomIn} title="Zoom In" variant="ghost" size="sm">
                <ZoomIn size={18} />
              </Button>
            </div>}

          <div className={styles.separator} />

          <Button onClick={handleDownload} title="Download Original" variant="ghost" size="sm">
            <Download size={20} />
          </Button>

          <Button onClick={onClose} title="Close" className={styles.closeBtn} variant="ghost" size="sm">
            <X size={24} />
          </Button>
        </div>
      </div>

      <div className={styles.contentArea} onClick={e => e.target === e.currentTarget && onClose()}>
        <div className={styles.contentWrapper} style={{
        transform: !isPdf ? `scale(${scale})` : "none",
        width: isPdf ? "100%" : "auto",
        height: isPdf ? "100%" : "auto"
      }}>
          {isPdf ? <iframe src={fileUrl} title="Document Viewer" className={styles.pdfFrame} /> : <img src={fileUrl} alt={file.title} className={styles.image} onWheel={e => {
          if (e.ctrlKey) {
            e.preventDefault();
            if (e.deltaY < 0) handleZoomIn();else handleZoomOut();
          }
        }} />}
        </div>
      </div>
    </div>;
};
export default FileViewerModal;

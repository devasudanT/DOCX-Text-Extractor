import React, { useState, useCallback, useRef } from 'react';
import { createRoot } from 'react-dom/client';

// Let TypeScript know that 'mammoth' is available on the window object
declare const mammoth: any;

const App: React.FC = () => {
    const [extractedHtml, setExtractedHtml] = useState<string>('');
    const [isSkippingFirstPage, setIsSkippingFirstPage] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const [copyButtonText, setCopyButtonText] = useState<string>('Copy Text');
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const resetState = () => {
        setExtractedHtml('');
        setIsLoading(false);
        setError(null);
        setFileName(null);
        setCopyButtonText('Copy Text');
    };

    const handleFile = useCallback(async (file: File) => {
        if (!file || !file.name.endsWith('.docx')) {
            setError('Please upload a valid .docx file.');
            return;
        }

        resetState();
        setIsLoading(true);
        setFileName(file.name);

        const reader = new FileReader();
        reader.onload = async (event) => {
            if (event.target?.result) {
                try {
                    const arrayBuffer = event.target.result;
                    const options = {
                        styleMap: ["br[type='page'] => hr.page-break:fresh"]
                    };
                    const result = await mammoth.convertToHtml({ arrayBuffer }, options);
                    
                    let html = result.value;
                    if (isSkippingFirstPage) {
                        const pageBreakRegex = /<hr class="page-break"[^>]*>/;
                        const match = html.match(pageBreakRegex);
                        if (match && typeof match.index === 'number') {
                            html = html.substring(match.index + match[0].length);
                        }
                    }
                    
                    setExtractedHtml(html);
                } catch (err) {
                    console.error('Error extracting DOCX:', err);
                    setError('Failed to extract text from the document. The file might be corrupted or in an unsupported format.');
                } finally {
                    setIsLoading(false);
                }
            }
        };
        reader.onerror = () => {
             setError('Failed to read the file.');
             setIsLoading(false);
        };
        reader.readAsArrayBuffer(file);
    }, [isSkippingFirstPage]);

    const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
        if (event.dataTransfer.files && event.dataTransfer.files[0]) {
            handleFile(event.dataTransfer.files[0]);
        }
    }, [handleFile]);

    const handleDragEvents = (event: React.DragEvent<HTMLDivElement>, dragging: boolean) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(dragging);
    };

    const handleCopy = () => {
        if (contentRef.current) {
            navigator.clipboard.writeText(contentRef.current.innerText)
                .then(() => {
                    setCopyButtonText('Copied!');
                    setTimeout(() => setCopyButtonText('Copy Text'), 2000);
                })
                .catch(err => {
                    console.error('Failed to copy text:', err);
                    alert('Failed to copy text.');
                });
        }
    };
    
    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            handleFile(event.target.files[0]);
        }
    };

    const renderInitialView = () => (
        <>
            <div className="app-header">
                <h1>DOCX Text Extractor</h1>
                <p>Easily extract and copy text from your .docx files.</p>
            </div>
            <div
                className={`drop-zone ${isDragging ? 'dragging' : ''}`}
                onDrop={handleDrop}
                onDragOver={(e) => handleDragEvents(e, true)}
                onDragEnter={(e) => handleDragEvents(e, true)}
                onDragLeave={(e) => handleDragEvents(e, false)}
                onClick={triggerFileInput}
                role="button"
                aria-label="Upload a DOCX file"
                tabIndex={0}
            >
                <input
                    id="file-input"
                    type="file"
                    accept=".docx"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                />
                <svg className="drop-zone-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l-3.75 3.75M12 9.75l3.75 3.75m-7.5 4.5V8.25c0-1.12.93-2.04 2.08-1.95l.32.03a2.03 2.03 0 011.88 1.88l.03.32c.09 1.15.93 2.04 2.08 1.95l.32-.03a2.03 2.03 0 011.88-1.88l.03-.32c.09-1.15.93-2.04 2.08-1.95l.32.03a2.03 2.03 0 011.88 1.88l.03.32c.09 1.15.93 2.04 2.08 1.95h.28c1.12 0 2.03.91 2.03 2.03v8.51c0 1.12-.91 2.03-2.03 2.03H5.03C3.91 19.28 3 18.37 3 17.25z" />
                </svg>
                <p className="drop-zone-text">Drag & Drop your file or <span>click here</span></p>
                <p className="drop-zone-subtext">Only .docx files are supported</p>
            </div>
            <div className="controls">
                <label className="skip-page-label" htmlFor="skip-page-checkbox">
                    <input
                        id="skip-page-checkbox"
                        type="checkbox"
                        checked={isSkippingFirstPage}
                        onChange={(e) => setIsSkippingFirstPage(e.target.checked)}
                    />
                    Skip first page
                </label>
            </div>
            {error && <p className="error-message">{error}</p>}
        </>
    );

    const renderResultView = () => (
        <div className="result-container">
            <div className="result-header">
                <p className="file-name">{fileName}</p>
                <div className="result-actions">
                    <button className="btn btn-secondary" onClick={resetState} aria-label="Process a new file">
                        <svg className="btn-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.181-3.183m-11.664 0l3.181-3.183a8.25 8.25 0 00-11.664 0l3.181 3.183" />
                        </svg>
                        New File
                    </button>
                    <button className="btn" onClick={handleCopy} aria-label="Copy extracted text to clipboard">
                        <svg className="btn-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a2.25 2.25 0 01-2.25 2.25h-1.5a2.25 2.25 0 01-2.25-2.25V4.5A2.25 2.25 0 019 2.25h1.5a2.25 2.25 0 012.25 2.25v.75" />
                           <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75l3 3m0 0l3-3m-3 3v-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {copyButtonText}
                    </button>
                </div>
            </div>
            <div className="extracted-content" ref={contentRef} dangerouslySetInnerHTML={{ __html: extractedHtml }} />
        </div>
    );

    return (
        <div className="app-container">
            {isLoading ? <div className="loader"></div> : (extractedHtml ? renderResultView() : renderInitialView())}
        </div>
    );
};

const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(<App />);
}
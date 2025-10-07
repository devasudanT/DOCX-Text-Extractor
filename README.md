# DOCX Text Extractor

A simple and efficient web-based tool to extract text content from Microsoft Word (.docx) files. Built with React and `mammoth.js`, it provides a clean user interface for a seamless experience.

## Features

-   **Drag & Drop or Click to Upload:** A user-friendly interface to upload `.docx` files.
-   **Instant Text Extraction:** Utilizes `mammoth.js` to convert `.docx` content into HTML, preserving basic formatting such as headings, lists, bold, and italic text.
-   **Skip First Page Option:** A convenient checkbox to exclude the content of a cover page from the extraction.
-   **One-Click Copy:** Easily copy the entire extracted text to the clipboard with a single button click.
-   **Responsive Design:** The application is fully responsive and works great on desktops, tablets, and mobile devices.
-   **Clear & Process New Files:** A "New File" button allows you to quickly reset the application and process another document.
-   **User Feedback:** Displays loading indicators during processing and provides clear error messages for invalid files or extraction failures.

## How to Use

1.  **Open the App:** Launch the `index.html` file in your web browser.
2.  **Set Options:** (Optional) If your document has a cover page you'd like to skip, ensure the "Skip first page" checkbox is checked.
3.  **Upload File:** Drag and drop your `.docx` file into the designated area, or click the area to open the file selector.
4.  **View Content:** The extracted text will be displayed in a scrollable container.
5.  **Copy Text:** Click the "Copy Text" button to copy the content.
6.  **Start Over:** Click "New File" to return to the upload screen.

## Technology Stack

-   **Frontend Library:** React
-   **DOM Rendering:** React DOM
-   **.DOCX to HTML Conversion:** `mammoth.js`
-   **Styling:** Plain CSS with a modern, clean design system.
-   **Icons:** Heroicons (embedded as SVG)
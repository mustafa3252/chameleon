# Chameleon AI Project Setup Guide

## Project Overview

This is a **Chameleon AI** file processing application that consists of:

1. **Frontend**: React + TypeScript + Vite application with a beautiful UI
2. **Backend**: Langflow AI server for processing files and text
3. **Integration**: File upload and processing through AI analysis

## Current Status

✅ **Frontend**: Running on http://localhost:8080  
✅ **Backend**: Langflow server running on http://localhost:7868  
✅ **API Endpoint**: http://localhost:7868/api/v1/run/5a0f4c4a-eba4-4a11-bdb3-11773506a0a2  

## How to Use

### 1. Access the Application

Open your browser and go to: **http://localhost:8080**

You should see the Chameleon AI interface with:
- Beautiful gradient background
- File upload area (drag & drop or click to browse)
- Processing status indicators

### 2. Upload and Process Files

1. **Drag and drop** a file onto the upload area, or **click to browse**
2. **Supported file types**: 
   - Text files (.txt, .md)
   - COBOL source files
   - JCL scripts
   - Copybook definitions
   - Any text-based files
3. **Click "Process File"** to send it to the AI backend
4. **Wait for processing** - the AI will analyze your file
5. **View results** - the processed output will be displayed

### 3. What the AI Does

The Langflow backend is configured to:
- **Analyze COBOL programs** and extract business logic
- **Parse JCL scripts** and understand workflow
- **Process copybook definitions** and create data dictionaries
- **Generate pseudocode** from legacy mainframe code
- **Provide insights** about file structures and data flow

## Technical Details

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Build Tool**: Vite
- **Port**: 8080

### Backend (Langflow)
- **Framework**: Langflow (AI workflow orchestration)
- **Models**: Anthropic Claude, Mistral AI
- **Port**: 7868
- **Flow ID**: 5a0f4c4a-eba4-4a11-bdb3-11773506a0a2

### API Endpoint
```
POST http://localhost:7868/api/v1/run/5a0f4c4a-eba4-4a11-bdb3-11773506a0a2
```

**Request Format:**
```json
{
  "input_value": "file content or text",
  "input_type": "file|chat|text",
  "output_type": "chat",
  "session_id": "unique_session_id"
}
```

## Troubleshooting

### If the frontend doesn't load:
1. Check if Vite is running: `npm run dev`
2. Verify port 8080 is available
3. Check browser console for errors

### If file upload fails:
1. Ensure Langflow server is running on port 7868
2. Check network tab for API errors
3. Verify file size (should be under 50MB)
4. Try different file types

### If processing times out:
- This is normal for AI processing
- Large files may take 30+ seconds
- The AI is analyzing complex legacy code structures

## Development

### Starting the Frontend:
```bash
cd /Users/mustafax_x/Desktop/chem
npm run dev
```

### Starting the Backend:
The Langflow server should already be running. If not:
```bash
# Check if Langflow is running
ps aux | grep langflow

# If not running, start it (this may require additional setup)
langflow run --port 7868
```

### Making Changes:
- **Frontend**: Edit files in `src/` directory
- **Backend**: The Langflow flow is already configured
- **API**: The endpoint is fixed to the specific flow ID

## Next Steps

1. **Test with sample files**: Try uploading COBOL, JCL, or text files
2. **Monitor processing**: Watch the AI analyze your files
3. **Review results**: See how the AI interprets legacy code
4. **Customize**: Modify the frontend UI or backend processing as needed

## Project Structure

```
chem/
├── src/                    # Frontend React code
│   ├── components/         # UI components
│   ├── pages/             # Page components
│   └── main.tsx           # App entry point
├── backend/               # Backend code (if needed)
├── package.json           # Frontend dependencies
└── README.md             # Project documentation
```

The application is now fully functional and ready to process files through the AI backend! 
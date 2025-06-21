import { useState } from "react";
import { FileUpload } from "@/components/FileUpload";
import { Loader } from "lucide-react";
import { ResultDisplay } from "@/components/ResultDisplay";

const Index = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-white p-4 md:p-8">
      <div className={`relative z-10 w-full ${result ? 'max-w-5xl' : 'max-w-2xl'} transition-all duration-500`}>
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center mb-6">
            <img src="/logo.jpg" alt="Chameleon" className="h-32 w-32" />
            <h1 className="text-6xl font-bold text-gray-800 tracking-tighter ml-4">
              Chameleon
            </h1>
          </div>
          <p className="text-xl text-gray-500 max-w-xl mx-auto">
            Screw that legacy code<br />No one wants to understand or work with it.
          </p>
        </div>

        <div className="w-full">
          {!result && (
            <FileUpload 
              onUploadStart={() => {
                setIsUploading(true);
                setError(null);
              }}
              onUploadComplete={(data) => {
                setIsUploading(false);
                setResult(data);
              }}
              onUploadError={(err) => {
                setIsUploading(false);
                setError(err);
              }}
            />
          )}

          {isUploading && (
            <div className="flex flex-col items-center justify-center space-y-4 animate-fade-in">
              <Loader className="h-12 w-12 animate-spin text-blue-600" />
              <p className="text-lg font-semibold text-gray-700">Analyzing your files...</p>
              <p className="text-gray-500">This may take a moment. Please wait.</p>
            </div>
          )}

          {error && !isUploading && (
            <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center animate-fade-in">
              <h3 className="text-xl font-semibold text-red-700 mb-2">Analysis Failed</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => setError(null)}
                className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg transition-all duration-300 hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          )}

          {result && (
            <div className="animate-fade-in">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                  Processing Complete!
                </h3>
                <p className="text-gray-600">Here's what our AI discovered from your files:</p>
              </div>
              
              <ResultDisplay result={result} />

              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => {
                    setResult(null);
                    setIsUploading(false);
                  }}
                  className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl transition-all duration-300 hover:bg-blue-700 hover:scale-105"
                >
                  Process More Files
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default Index;

import React, { useCallback, useState } from 'react';

interface FileUploaderProps {
  onFileSelected: (file: File) => void;
  isLoading: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelected, isLoading }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelected(e.dataTransfer.files[0]);
    }
  }, [onFileSelected]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onFileSelected(e.target.files[0]);
    }
  }, [onFileSelected]);

  return (
    <div 
      className={`relative w-full max-w-2xl mx-auto h-64 border-2 border-dashed rounded-xl transition-all duration-300 ease-in-out flex flex-col items-center justify-center p-6 text-center
        ${dragActive 
          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' 
          : 'border-slate-300 bg-white hover:border-emerald-400 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-emerald-500'}
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleChange}
        accept="image/*,application/pdf"
        disabled={isLoading}
      />
      
      {isLoading ? (
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 dark:border-emerald-950 dark:border-t-emerald-400 rounded-full animate-spin"></div>
          <p className="text-emerald-800 dark:text-emerald-400 font-medium">Analizando tu factura con IA...</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Esto puede tomar unos segundos mientras pensamos la mejor estrategia.</p>
        </div>
      ) : (
        <>
          <div className="w-16 h-16 mb-4 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Sube o arrastra tu factura aquí</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Soportamos PDF, JPG, PNG. La IA extraerá los datos automáticamente.</p>
          <button className="mt-6 px-6 py-2 bg-emerald-600 dark:bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors pointer-events-none">
            Seleccionar Archivo
          </button>
        </>
      )}
    </div>
  );
};

export default FileUploader;
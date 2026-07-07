import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { AppState, BillAnalysis } from './types';
import FileUploader from './components/FileUploader';
import AnalysisDashboard from './components/AnalysisDashboard';
import ChatAssistant from './components/ChatAssistant';
import { analyzeEnergyBill } from './services/geminiService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [analysisData, setAnalysisData] = useState<BillAnalysis | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleFileSelection = async (file: File) => {
    setAppState(AppState.ANALYZING);
    setErrorMsg(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      const base64Content = base64String.split(',')[1];
      let mimeType = file.type;
      if (!mimeType) {
        if (file.name.toLowerCase().endsWith('.pdf')) {
          mimeType = 'application/pdf';
        } else if (file.name.toLowerCase().endsWith('.png')) {
          mimeType = 'image/png';
        } else if (file.name.toLowerCase().endsWith('.jpg') || file.name.toLowerCase().endsWith('.jpeg')) {
          mimeType = 'image/jpeg';
        } else {
          mimeType = 'application/octet-stream';
        }
      }

      try {
        const data = await analyzeEnergyBill(base64Content, mimeType);
        setAnalysisData(data);
        setAppState(AppState.RESULTS);
      } catch (error: any) {
        console.error("Failed to analyze", error);
        const errorDetails = error.message ? error.message : "Error desconocido";
        setErrorMsg(`No pudimos analizar la factura. Detalle: ${errorDetails}`);
        setAppState(AppState.ERROR);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setAnalysisData(null);
    setErrorMsg(null);
  };

  const handleUpdateAnalysis = (newData: BillAnalysis) => {
    setAnalysisData(newData);
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 overflow-hidden transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex-shrink-0 z-30 transition-colors duration-200">
        <div className="w-full px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                O
            </div>
            <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">OptiLuz IA</span>
          </div>
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
               {appState === AppState.RESULTS && (
                   <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full text-xs font-semibold">
                      Modo Interactivo Activo
                   </span>
               )}
            </nav>
            {/* Theme Selector Button */}
            <button
              onClick={toggleTheme}
              aria-label="Alternar tema"
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-200 flex items-center justify-center"
              id="theme-toggle-btn"
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden relative">
        {appState === AppState.IDLE && (
          <div className="w-full overflow-y-auto">
              <div className="max-w-4xl mx-auto px-4 text-center py-16">
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">
                Ahorra en tu factura de luz con <span className="text-emerald-600 dark:text-emerald-400">Inteligencia Artificial</span>
                </h1>
                <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto">
                Sube tu factura (PDF o Imagen) y deja que nuestra IA multimodal analice tu consumo para encontrar la mejor tarifa del mercado español en segundos.
                </p>
                <div className="mb-12">
                <FileUploader onFileSelected={handleFileSelection} isLoading={false} />
                </div>
                
                <div className="grid md:grid-cols-3 gap-8 text-left mt-20">
                    <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                         {/* Icons same as before */}
                        <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-slate-100">Lectura Inteligente</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Olvídate de introducir datos a mano. Gemini Pro lee tu factura como un experto humano.</p>
                    </div>
                    <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-slate-100">Simulación de Mercado</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Comparamos tu consumo real con las mejores ofertas disponibles actualmente.</p>
                    </div>
                    <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-slate-100">Ahorro Garantizado</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Te explicamos pros y contras de cambiar, y estimamos tu ahorro anual real.</p>
                    </div>
                </div>
            </div>
          </div>
        )}

        {appState === AppState.ANALYZING && (
          <div className="w-full flex items-center justify-center">
            <div className="max-w-2xl w-full px-4">
                <FileUploader onFileSelected={() => {}} isLoading={true} />
                <div className="text-center mt-8">
                    <p className="text-slate-400 text-sm italic">"La energía más barata es la que no se consume, pero la segunda más barata está a un click."</p>
                </div>
            </div>
          </div>
        )}

        {/* SPLIT VIEW FOR RESULTS */}
        {appState === AppState.RESULTS && analysisData && (
          <div className="w-full h-full flex flex-col md:flex-row">
            {/* Left/Top Panel: Dashboard */}
            <div className="flex-1 h-1/2 md:h-full overflow-hidden relative">
                <AnalysisDashboard data={analysisData} onReset={handleReset} />
            </div>
            
            {/* Right/Bottom Panel: Chat */}
            <div className="w-full md:w-[400px] lg:w-[450px] h-1/2 md:h-full border-t md:border-t-0 md:border-l border-slate-200 shadow-xl z-20">
                <ChatAssistant 
                    analysisData={analysisData} 
                    onUpdateAnalysis={handleUpdateAnalysis} 
                />
            </div>
          </div>
        )}

        {appState === AppState.ERROR && (
           <div className="w-full overflow-y-auto">
                <div className="max-w-xl mx-auto px-4 mt-20 text-center">
                    <div className="bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-200 p-6 rounded-xl border border-red-200 dark:border-red-900/40">
                        <h3 className="font-bold text-lg mb-2">Ups, algo salió mal</h3>
                        <p className="text-sm">{errorMsg}</p>
                        <button 
                            onClick={handleReset}
                            className="mt-6 px-6 py-2 bg-white dark:bg-slate-800 border border-red-200 dark:border-slate-700 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-100 dark:hover:bg-slate-700 transition-colors"
                        >
                            Intentar de nuevo
                        </button>
                    </div>
                </div>
           </div>
        )}
      </main>
    </div>
  );
};

export default App;
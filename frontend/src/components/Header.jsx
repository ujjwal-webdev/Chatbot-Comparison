import { Sparkles } from 'lucide-react';

export const Header = () => {
    return (
        <header className="bg-white shadow-sm border-b border-srh-blue/10">
            <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="flex items-center gap-3 justify-center">
                    <div className="h-6 w-px bg-srh-blue/20" />
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-srh-orange" />
                        <h1 className="text-xl font-bold text-srh-blue">AI Chat Comparison</h1>
                    </div>
                </div>
            </div>
        </header>
    );
};

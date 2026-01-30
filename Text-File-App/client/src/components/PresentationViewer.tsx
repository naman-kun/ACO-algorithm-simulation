import { useState } from "react";
import { ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// Placeholder for slide images. 
// USER INSTRUCTION: Upload your exported slide images (slide1.png, slide2.png, etc.) 
// to the public/assets folder (or public/) and update this array with their paths.
// Example: ["/assets/slide1.png", "/assets/slide2.png"]
const SLIDE_IMAGES: string[] = [
    // Example placeholders (will show as empty if not found, or use a default placeholder)
    // "/assets/presentation/slide1.png",
    // "/assets/presentation/slide2.png"
];

export function PresentationViewer() {
    const [currentSlide, setCurrentSlide] = useState(0);

    const hasSlides = SLIDE_IMAGES.length > 0;

    const nextSlide = () => {
        if (currentSlide < SLIDE_IMAGES.length - 1) {
            setCurrentSlide(currentSlide + 1);
        }
    };

    const prevSlide = () => {
        if (currentSlide > 0) {
            setCurrentSlide(currentSlide - 1);
        }
    };

    if (!hasSlides) {
        return (
            <div className="flex flex-col items-center justify-center h-[600px] border border-dashed border-white/20 rounded-lg bg-black/40 text-muted-foreground p-8 text-center">
                <FileText className="w-16 h-16 mb-4 opacity-50" />
                <h3 className="text-xl font-bold text-white mb-2">Presentation Mode</h3>
                <p className="max-w-md">
                    To display your presentation, export your slides as images (PNG/JPG) and update the
                    <code>SLIDE_IMAGES</code> array in <code>client/src/components/PresentationViewer.tsx</code>.
                </p>
                <div className="mt-8 p-4 bg-primary/10 rounded border border-primary/20 text-sm">
                    <strong>Instructions:</strong>
                    <ul className="list-disc list-inside mt-2 text-left space-y-1">
                        <li>Save slides as <code>slide1.png</code>, <code>slide2.png</code>, etc.</li>
                        <li>Place them in <code>client/public/presentation/</code></li>
                        <li>Add the paths to the code.</li>
                    </ul>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-[600px] bg-black/90 flex items-center justify-center rounded-lg border border-white/10 overflow-hidden group">

            {/* Slide Display */}
            <img
                src={SLIDE_IMAGES[currentSlide]}
                alt={`Slide ${currentSlide + 1}`}
                className="max-h-full max-w-full object-contain"
            />

            {/* Navigation Overlay */}
            <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={prevSlide}
                    disabled={currentSlide === 0}
                    className="pointer-events-auto h-16 w-16 rounded-full bg-black/20 hover:bg-black/50 text-white/50 hover:text-white backdrop-blur-sm transition-all disabled:opacity-0"
                >
                    <ChevronLeft className="w-10 h-10" />
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={nextSlide}
                    disabled={currentSlide === SLIDE_IMAGES.length - 1}
                    className="pointer-events-auto h-16 w-16 rounded-full bg-black/20 hover:bg-black/50 text-white/50 hover:text-white backdrop-blur-sm transition-all disabled:opacity-0"
                >
                    <ChevronRight className="w-10 h-10" />
                </Button>
            </div>

            {/* Slide Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 px-4 py-1 rounded-full text-white/80 text-sm font-mono backdrop-blur-sm pointer-events-none">
                Scan {currentSlide + 1} / {SLIDE_IMAGES.length}
            </div>
        </div>
    );
}
